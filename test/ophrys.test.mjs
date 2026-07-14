import assert from 'node:assert/strict'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createOphrysStore } from '../src/ophrys-store.mjs'
import { createOphrysServer } from '../src/server.mjs'
import { runOphrysCycle } from '../src/ophrys-cycle.mjs'
import { generateArtwork } from '../src/openai-artwork.mjs'

const publicFile = name => readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8')

function relativeLuminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map(value => Number.parseInt(value, 16) / 255)
  const [red, green, blue] = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(foreground, background) {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

test('public surfaces preserve keyboard, motion, contrast, mobile and error-state boundaries', () => {
  const pages = ['index.html', 'studio.html', 'admin.html'].map(publicFile)
  for (const page of pages) {
    assert.match(page, /<html lang="en">/)
    assert.match(page, /name="viewport"/)
    assert.match(page, /class="skip-link" href="#main-content"/)
    assert.match(page, /<main id="main-content"/)
    assert.match(page, /<nav aria-label="Primary">/)
    assert.match(page, /href="\/accessibility\.css"/)
  }

  const accessibility = publicFile('accessibility.css')
  assert.match(accessibility, /:focus-visible/)
  assert.match(accessibility, /@media \(max-width: 720px\)[\s\S]*\.site-header nav[\s\S]*display: flex/)
  assert.match(accessibility, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none !important;[\s\S]*transition: none !important;/)
  assert.ok(contrastRatio('666a60', 'edeee7') >= 4.5, 'muted metadata text must meet WCAG AA normal-text contrast')
  assert.ok(contrastRatio('ff705d', '0e110e') >= 4.5, 'Operator error text must meet WCAG AA normal-text contrast')

  const publicScript = publicFile('app.js')
  assert.match(publicScript, /field unavailable/)
  assert.match(publicScript, /aria-busy', 'false'/)
  assert.match(publicScript, /article\.href = '\/studio#works'/)
  assert.doesNotMatch(publicScript, /article\.tabIndex/)
  assert.match(publicFile('studio.js'), /The public trace could not be loaded\. No system state is being claimed\./)
  assert.match(publicFile('studio.html'), /id="compute"[\s\S]*Cost and compute ledger[\s\S]*id="compute-output-limit"/)
  assert.match(publicFile('admin.html'), /id="login-error"[^>]*role="alert"/)
  assert.match(publicFile('admin.html'), /name="dailyCycleLimit"[\s\S]*name="maxOutputTokens"[\s\S]*id="operator-compute-heading"/)
  assert.match(publicFile('admin.html'), /id="candidate-comparison"/)
  assert.match(publicFile('admin.js'), /selectedCandidateIds\.size < 2/)
  assert.match(publicFile('admin.js'), /Curatorial rationale/)
  assert.match(publicFile('comparison.css'), /@media \(max-width: 1050px\)[\s\S]*\.candidate-comparison[\s\S]*grid-template-columns: 1fr/)
})

test('education encounter preserves the Lure, Reveal and consequential Counter-read protocol', () => {
  const page = publicFile('index.html')
  const script = publicFile('app.js')
  const styles = publicFile('field.css')

  assert.match(page, /id="encounter"[\s\S]*01 \/ Lure[\s\S]*02 \/ Reveal[\s\S]*03 \/ Counter-read/)
  assert.match(page, /Learning outcome[\s\S]*distinguish an aggregate observation from a system interpretation/)
  for (const layer of ['Observation', 'Interpretation', 'Uncertainty', 'Artistic choice', 'Human responsibility']) {
    assert.match(page, new RegExp(`<dt>${layer}</dt>`))
  }
  assert.match(script, /score\.aggregateBasis\.approach/)
  assert.match(script, /score\.aggregateBasis\.attention/)
  assert.match(script, /score\.aggregateBasis\.refusal/)
  assert.match(script, /data-encounter-stage="counter-read"/)
  assert.match(script, /collective revision \$\{payload\.fieldScore\.revision\}/)
  assert.match(styles, /\[data-completed="true"\]/)
})

test('aggregate events never create visitor identity records', () => {
  const store = createOphrysStore(':memory:')
  store.recordEvent({ kind: 'arrival', surface: 'public' })
  store.recordEvent({ kind: 'refusal', surface: 'threshold' })
  const metrics = store.getMetrics()
  assert.equal(metrics.length, 2)
  assert.equal(metrics.reduce((sum, item) => sum + Number(item.count), 0), 2)
  const tables = store.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name)
  assert.equal(tables.includes('visitors'), false)
  assert.equal(tables.includes('profiles'), false)
  store.close()
})

test('aggregate conditions bound the field score and refusal rotates its repertoire', () => {
  const store = createOphrysStore(':memory:')
  const initial = store.getFieldScore()
  for (let index = 0; index < 4; index++) store.recordEvent({ kind: 'threshold', surface: 'public' })
  store.recordEvent({ kind: 'dwell_long', surface: 'public' })
  const adapted = store.getFieldScore()
  assert.ok(adapted.density > initial.density)
  assert.ok(adapted.tempoBpm >= 18 && adapted.tempoBpm <= 72)
  assert.ok(adapted.tiltDegrees >= -24 && adapted.tiltDegrees <= 24)

  const refused = store.recordEvent({ kind: 'refusal', surface: 'public/counter-control' })
  assert.equal(refused.revision, initial.revision + 1)
  assert.equal(refused.suppressedLure, initial.activeLure)
  assert.notEqual(refused.activeLure, initial.activeLure)
  assert.equal(refused.phase, 'counter-read')
  assert.equal(refused.aggregateBasis.refusal, 1)
  assert.equal(store.getMetrics().some(item => item.kind === 'refusal' && item.count === 1), true)
  store.close()
})

test('public and protected server surfaces keep their boundary', async () => {
  const store = createOphrysStore(':memory:')
  const server = createOphrysServer({ store, adminToken: 'test-operator-token' })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address()
  const origin = `http://127.0.0.1:${port}`

  const publicResponse = await fetch(`${origin}/api/public/state`)
  assert.equal(publicResponse.status, 200)
  const publicState = await publicResponse.json()
  assert.equal(publicState.artworks[0].status, 'published')
  assert.match(publicState.disclosure, /aggregate event counts only/i)
  const originalLure = publicState.fieldScore.activeLure

  const refusalResponse = await fetch(`${origin}/api/public/event`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'refusal', surface: 'public/counter-control' }),
  })
  assert.equal(refusalResponse.status, 202)
  const refusal = await refusalResponse.json()
  assert.equal(refusal.fieldScore.suppressedLure, originalLure)
  assert.notEqual(refusal.fieldScore.activeLure, originalLure)

  assert.equal((await fetch(`${origin}/api/admin/state`)).status, 401)
  const adminResponse = await fetch(`${origin}/api/admin/state`, { headers: { authorization: 'Bearer test-operator-token' } })
  assert.equal(adminResponse.status, 200)
  const adminState = await adminResponse.json()
  assert.equal(adminState.system.model, 'gpt-5.6-sol')
  assert.equal(adminState.compute.budget.dailyCycleLimit, 4)
  assert.equal(adminState.compute.budget.maxOutputTokensPerCycle, 2600)

  const missingRationale = await fetch(`${origin}/api/admin/artworks/seed-false-spring/status`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer test-operator-token', 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'published', reason: '' }),
  })
  assert.equal(missingRationale.status, 400)
  assert.match((await missingRationale.json()).error, /Curatorial rationale required/i)

  const reasonedApproval = await fetch(`${origin}/api/admin/artworks/seed-false-spring/status`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer test-operator-token', 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'published', reason: 'The seed remains the clearest bounded public baseline.' }),
  })
  assert.equal(reasonedApproval.status, 200)

  server.close()
  await once(server, 'close')
})

test('GPT-5.6 generation uses Responses structured output without storing the request', async () => {
  let request
  const expected = {
    title: 'Mimic Field', medium: 'Spatial sound and directional light',
    proposition: 'A bounded field changes its signals while exposing uncertainty about why collective movement changed.',
    publicDescription: 'A room-scale proposition in which a changing signal remains inspectable and each successful attraction is published as a provisional tactic.',
    visitorRelation: 'Collective approach and refusal alter later states without producing individual records or psychological claims.',
    exhibitionForm: 'A threshold, responsive field, delayed residue, and public counter-field share one repairable technical body.',
    learningQuestion: 'What does a system actually know when its signal succeeds?',
    lureHypothesis: 'Interrupted light will produce more threshold crossings than a continuous signal.',
    counterReading: 'A refusal input removes the favoured state from the next composition cycle.',
    materials: ['light', 'sound', 'coarse counter'],
  }
  const fetchImpl = async (_url, options) => {
    request = JSON.parse(options.body)
    return { ok: true, status: 200, json: async () => ({ id: 'resp_test', model: 'gpt-5.6-sol', usage: { input_tokens: 111, output_tokens: 222, total_tokens: 333 }, output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(expected) }] }] }) }
  }
  const result = await generateArtwork({ settings: { model: 'gpt-5.6-sol', reasoningEffort: 'high', systemMode: 'compose', explorationRate: .3, maxOutputTokens: 900, curatorialDirective: 'Keep attraction visible, uncertain, and contestable.' }, metrics: [], recentArtworks: [], apiKey: 'test', fetchImpl })
  assert.equal(result.artwork.title, 'Mimic Field')
  assert.equal(request.model, 'gpt-5.6-sol')
  assert.equal(request.store, false)
  assert.equal(request.reasoning.effort, 'high')
  assert.equal(request.max_output_tokens, 900)
  assert.equal(request.text.format.type, 'json_schema')
  assert.equal(result.usage.total_tokens, 333)
  assert.equal(result.provenance.promptVersion, 'ophrys-composition-v1')
  assert.deepEqual(result.provenance.response.usage.total_tokens, 333)
  assert.match(result.provenance.rightsBasis, /aggregate public events/i)
})

test('compute ledger records exact returned usage, latency and enforces the UTC attempt budget', () => {
  const store = createOphrysStore(':memory:')
  store.updateSettings({ dailyCycleLimit: 1, maxOutputTokens: 900 })
  store.createCycle({ id: 'ledger-cycle', trigger: 'test', model: 'gpt-5.6-sol', outputTokenBudget: 900 })
  store.completeCycle('ledger-cycle', {
    status: 'completed',
    summary: 'Ledger fixture completed.',
    responseId: 'resp_ledger',
    usage: { input_tokens: 120, output_tokens: 80, total_tokens: 200 },
    latencyMs: 125,
  })

  const ledger = store.getComputeLedger()
  assert.equal(ledger.attempts, 1)
  assert.equal(ledger.completed, 1)
  assert.deepEqual(ledger.usage, { inputTokens: 120, outputTokens: 80, totalTokens: 200, recordedCycles: 1 })
  assert.equal(ledger.latency.averageMs, 125)
  assert.deepEqual(ledger.budget, { dailyCycleLimit: 1, remainingCycles: 0, maxOutputTokensPerCycle: 900 })
  assert.match(ledger.costBasis, /Currency cost is not estimated/)
  const [cycle] = store.listCycles()
  assert.equal(cycle.usage.total_tokens, 200)
  assert.equal(cycle.latencyMs, 125)
  assert.equal(cycle.outputTokenBudget, 900)
  assert.throws(() => store.createCycle({ id: 'over-budget', trigger: 'test', model: 'gpt-5.6-sol' }), /Daily cycle budget exhausted/)
  store.close()
})

test('artwork provenance packets store the composition packet and curator decision', async () => {
  const store = createOphrysStore(':memory:')
  const generated = {
    title: 'Packet Study',
    medium: 'Spatial light and public trace',
    proposition: 'A bounded field reveals its own recordkeeping and makes the curatorial packet inspectable before approval.',
    publicDescription: 'A compact artwork proposition that shows how a candidate can remain provisional while its provenance packet is still legible.',
    visitorRelation: 'Visitors can inspect the candidate, its counter-reading and its review packet without yielding personal data.',
    exhibitionForm: 'Threshold field, explicit residue and a review surface share one bounded technical body.',
    learningQuestion: 'What does a public artwork owe to its own record of becoming?',
    lureHypothesis: 'A visible packet makes the difference between a candidate and a decision harder to ignore.',
    counterReading: 'A refusal to approve becomes part of the packet rather than a hidden operator note.',
    materials: ['light', 'trace', 'review surface'],
  }
  await runOphrysCycle({
    store,
    trigger: 'test',
    force: true,
    generator: async () => ({
      artwork: generated,
      model: 'gpt-5.6-sol',
      responseId: 'resp_packet',
      usage: { input_tokens: 88, output_tokens: 144, total_tokens: 232 },
      provenance: {
        promptVersion: 'ophrys-composition-v1',
        sourceReferences: ['Aggregate public metrics', 'Recent candidate titles'],
        rightsBasis: 'Generated from aggregate events only.',
        inputSummary: {
          promptVersion: 'ophrys-composition-v1',
          settings: { systemMode: 'compose', model: 'gpt-5.6-sol', reasoningEffort: 'high', explorationRate: 0.3, metricWindowHours: 24 },
          aggregateEventSummary: [{ surface: 'public', kind: 'arrival', count: 3 }],
          recentArtworkSummary: [{ id: 'seed-false-spring', title: 'False Spring', status: 'published', createdAt: new Date().toISOString() }],
          requiredSpatialGrammar: ['threshold', 'field', 'residue', 'counter-field'],
          desiredAudience: ['curious general public'],
        },
        response: { responseId: 'resp_packet', model: 'gpt-5.6-sol', usage: { input_tokens: 88, output_tokens: 144, total_tokens: 232 } },
        review: { status: 'studio', decision: 'pending', rationale: null, rejectionReason: null, reviewedAt: null, reviewedBy: null },
      },
    }),
  })

  const artworks = store.listArtworks({ limit: 4 })
  const work = artworks.find(item => item.title === 'Packet Study')
  assert.ok(work)
  assert.equal(work.model, 'gpt-5.6-sol')
  assert.equal(work.provenance.promptVersion, 'ophrys-composition-v1')
  assert.equal(work.provenance.response.usage.total_tokens, 232)
  assert.match(work.provenance.rightsBasis, /aggregate events only/i)
  const [cycle] = store.listCycles()
  assert.equal(cycle.usage.total_tokens, 232)
  assert.ok(Number.isInteger(cycle.latencyMs) && cycle.latencyMs >= 0)
  assert.equal(cycle.outputTokenBudget, 2600)
  assert.throws(() => store.setArtworkStatus(work.id, 'published'), /Curatorial rationale required/i)
  assert.throws(() => store.setArtworkStatus(work.id, 'archived'), /Curatorial rationale required/i)
  store.setArtworkStatus(work.id, 'published', { reason: 'The proposition and counter-reading are sufficiently precise for public review.' })
  const approved = store.listArtworks({ limit: 4 }).find(item => item.id === work.id)
  assert.equal(approved.provenance.review.decision, 'approved')
  assert.equal(approved.provenance.review.rationale, 'The proposition and counter-reading are sufficiently precise for public review.')
  store.setArtworkStatus(work.id, 'archived', { reason: 'The packet needs a fuller counter-reading before publication.' })
  const archived = store.listArtworks({ limit: 4 }).find(item => item.id === work.id)
  assert.equal(archived.status, 'archived')
  assert.equal(archived.provenance.review.decision, 'rejected')
  assert.equal(archived.provenance.review.rejectionReason, 'The packet needs a fuller counter-reading before publication.')
  store.close()
})
