import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createOphrysStore } from '../src/ophrys-store.mjs'
import { createOphrysServer } from '../src/server.mjs'

const operatorToken = 'local-judging-boundary-token'
const store = createOphrysStore(':memory:')
const server = createOphrysServer({ store, adminToken: operatorToken })

server.listen(0, '127.0.0.1')
await once(server, 'listening')
const origin = `http://127.0.0.1:${server.address().port}`

async function json(path, options) {
  const response = await fetch(`${origin}${path}`, options)
  const payload = await response.json()
  return { response, payload }
}

try {
  const ready = await json('/api/health/ready')
  assert.equal(ready.response.status, 200)
  assert.equal(ready.payload.database, 'ready')

  const publicPage = await fetch(`${origin}/`)
  assert.equal(publicPage.status, 200)
  const publicMarkup = await publicPage.text()
  assert.match(publicMarkup, /id="refuse-lure"/)
  assert.match(publicMarkup, /id="encounter"[\s\S]*Lure → Reveal →[\s\S]*Counter-read/)
  assert.match(publicMarkup, /Learning outcome/)

  const initial = await json('/api/public/state')
  assert.equal(initial.response.status, 200)
  assert.match(initial.payload.disclosure, /aggregate event counts only/i)
  assert.equal(initial.payload.artworks.every(work => work.status === 'published'), true)

  const refusal = await json('/api/public/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'refusal', surface: 'judging/counter-control' }),
  })
  assert.equal(refusal.response.status, 202)
  assert.equal(refusal.payload.fieldScore.suppressedLure, initial.payload.fieldScore.activeLure)
  assert.notEqual(refusal.payload.fieldScore.activeLure, initial.payload.fieldScore.activeLure)
  assert.equal(refusal.payload.fieldScore.revision, initial.payload.fieldScore.revision + 1)

  const studio = await json('/api/studio/state')
  assert.equal(studio.response.status, 200)
  assert.equal(studio.payload.metrics.some(metric => metric.kind === 'refusal' && metric.count === 1), true)
  assert.equal(studio.payload.fieldScore.phase, 'counter-read')

  const denied = await json('/api/admin/state')
  assert.equal(denied.response.status, 401)
  assert.equal(denied.payload.error, 'Unauthorized')

  const operator = await json('/api/admin/state', {
    headers: { authorization: `Bearer ${operatorToken}` },
  })
  assert.equal(operator.response.status, 200)
  assert.equal(operator.payload.system.publicationMode, 'curated')

  console.log('Ophrys judging smoke: PASS')
  console.log(`refusal: ${initial.payload.fieldScore.activeLure} -> ${refusal.payload.fieldScore.activeLure}; revision ${refusal.payload.fieldScore.revision}`)
  console.log('boundaries: aggregate public trace; Operator denied by default; publication mode curated')
} finally {
  server.close()
  await once(server, 'close')
}
