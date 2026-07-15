import { createHash, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createOphrysStore } from './ophrys-store.mjs'
import { runOphrysCycle } from './ophrys-cycle.mjs'
import { createOperationalHandover } from './operator-handover.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC = join(ROOT, 'public')
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png' }
const WORK_ROUTES = new Set(['borrowed-weather', 'choir-of-almost', 'afterimage-commons', 'unchosen-signal'])

function securityHeaders(type = 'application/json; charset=utf-8') {
  return {
    'content-type': type,
    'cache-control': type.startsWith('text/html') ? 'no-cache' : 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    'content-security-policy': "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  }
}

function json(response, status, payload) {
  response.writeHead(status, securityHeaders())
  response.end(JSON.stringify(payload))
}

async function body(request, limit = 32_768) {
  let text = ''
  for await (const chunk of request) {
    text += chunk
    if (text.length > limit) throw new Error('Request body too large')
  }
  return text ? JSON.parse(text) : {}
}

function sameToken(received, expected) {
  if (!received || !expected) return false
  const a = createHash('sha256').update(received).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

function authorized(request, token) {
  const header = request.headers.authorization || ''
  return header.startsWith('Bearer ') && sameToken(header.slice(7), token)
}

function sameOrigin(request) {
  const fetchSite = request.headers['sec-fetch-site']
  if (fetchSite && !['same-origin', 'none'].includes(fetchSite)) return false
  const origin = request.headers.origin
  if (!origin) return true
  const host = String(request.headers['x-forwarded-host'] || request.headers.host || '').split(',')[0].trim()
  try { return new URL(origin).host === host } catch { return false }
}

function serve(response, path) {
  const routeFiles = { '/': 'index.html', '/studio': 'studio.html', '/admin': 'admin.html' }
  const workSlug = path.match(/^\/works\/([a-z0-9-]+)$/)?.[1]
  const relative = routeFiles[path] || (WORK_ROUTES.has(workSlug) ? 'work.html' : path.replace(/^\/+/, ''))
  const safe = normalize(relative).replace(/^(\.\.[/\\])+/, '')
  const file = join(PUBLIC, safe)
  if (!file.startsWith(PUBLIC) || !existsSync(file)) return false
  const type = MIME[extname(file)] || 'application/octet-stream'
  response.writeHead(200, securityHeaders(type))
  response.end(readFileSync(file))
  return true
}

export function createOphrysServer({ store = createOphrysStore(), adminToken = process.env.OPHRYS_ADMIN_TOKEN || '', cycleRunner = runOphrysCycle } = {}) {
  let aggregateWindow = { minute: Math.floor(Date.now() / 60_000), count: 0 }
  const server = createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://ophrys.local')
    try {
      if (request.method === 'GET' && url.pathname === '/api/health') return json(response, 200, { ok: true, service: 'ophrys', time: new Date().toISOString() })
      if (request.method === 'GET' && url.pathname === '/api/health/live') return json(response, 200, { ok: true })
      if (request.method === 'GET' && url.pathname === '/api/health/ready') {
        store.db.prepare('SELECT 1 AS ready').get()
        return json(response, 200, { ok: true, database: 'ready' })
      }
      if (request.method === 'GET' && url.pathname === '/api/public/state') return json(response, 200, store.publicState())
      if (request.method === 'GET' && url.pathname === '/api/studio/state') return json(response, 200, store.publicStudioState())

      if (request.method === 'POST' && url.pathname === '/api/public/event') {
        if (!sameOrigin(request)) return json(response, 403, { error: 'Cross-origin event rejected' })
        const minute = Math.floor(Date.now() / 60_000)
        if (aggregateWindow.minute !== minute) aggregateWindow = { minute, count: 0 }
        if (++aggregateWindow.count > 300) return json(response, 429, { error: 'Aggregate event capacity reached' })
        const event = await body(request, 4096)
        const result = store.recordEvent({ kind: event.kind, surface: event.surface })
        const refusal = event.kind === 'refusal' ? result : null
        return json(response, 202, {
          accepted: true,
          changed: refusal?.changed,
          deferred: refusal?.deferred,
          counterAction: refusal?.counterAction,
          fieldScore: refusal?.fieldScore,
          disclosure: refusal
            ? refusal.changed
              ? 'The public repertoire advanced once; only aggregate refusal pressure was stored.'
              : 'The refusal was counted in aggregate; repertoire rotation was deferred by the identity-free shared interval.'
            : 'Recorded as an aggregate hourly count; no visitor identifier was stored.',
        })
      }

      if (url.pathname.startsWith('/api/admin/')) {
        if (!sameOrigin(request)) return json(response, 403, { error: 'Cross-origin admin request rejected' })
        if (!adminToken) return json(response, 503, { error: 'Admin is disabled until OPHRYS_ADMIN_TOKEN is configured.' })
        if (!authorized(request, adminToken)) return json(response, 401, { error: 'Unauthorized' })

        if (request.method === 'GET' && url.pathname === '/api/admin/state') {
          const state = store.studioState()
          return json(response, 200, { ...state, operationalHandover: createOperationalHandover(state.system) })
        }
        if (request.method === 'PATCH' && url.pathname === '/api/admin/settings') return json(response, 200, { settings: store.updateSettings(await body(request)) })
        if (request.method === 'POST' && url.pathname === '/api/admin/cycle') {
          const result = await cycleRunner({ store, trigger: 'admin', force: true })
          return json(response, 201, result)
        }
        const artworkMatch = url.pathname.match(/^\/api\/admin\/artworks\/([a-zA-Z0-9-]+)\/status$/)
        if (request.method === 'PATCH' && artworkMatch) {
          const input = await body(request)
          const decision = store.setArtworkStatus(artworkMatch[1], input.status, { reason: input.reason, reviewedBy: 'operator' })
          return json(response, 200, { updated: true, id: artworkMatch[1], status: input.status, decision })
        }
      }

      if (request.method === 'GET' && serve(response, url.pathname)) return
      return json(response, 404, { error: 'Not found' })
    } catch (error) {
      const message = String(error?.message || error).replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]').slice(0, 600)
      const status = message === 'Unauthorized' ? 401 : error?.statusCode === 409 ? 409 : 400
      return json(response, status, { error: message, ...(error?.code ? { code: error.code } : {}) })
    }
  })
  server.on('close', () => store.close())
  return server
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT || 7799)
  const host = process.env.HOST || '127.0.0.1'
  const server = createOphrysServer()
  server.listen(port, host, () => console.log(`Ophrys listening on http://${host}:${port}`))
}
