import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createOphrysStore } from '../src/ophrys-store.mjs'
import { createOphrysServer } from '../src/server.mjs'

const operatorToken = 'local-judging-boundary-token'
const store = createOphrysStore(':memory:')
store.createCycle({ id: 'judge-trace-cycle', trigger: 'judge-fixture', model: 'gpt-5.6-sol' })
store.commitArtworkCycle('judge-trace-cycle', {
  id: 'judge-trace-candidate',
  title: 'Judging Trace Study',
  medium: 'Deterministic aggregate trace and bounded light score',
  proposition: 'A deterministic candidate makes the complete aggregate-observation to curatorial-outcome path reproducible without a paid model request.',
  publicDescription: 'This ephemeral judging fixture exists only in the in-memory smoke service.',
  visitorRelation: 'No visitor record or inferred trait is created by this deterministic fixture.',
  exhibitionForm: 'A test-only public lifecycle ledger.',
  learningQuestion: 'Can the complete governance path be inspected without claiming autonomous publication?',
  lureHypothesis: 'One aggregate refusal may provisionally suggest making interruption visible, without explaining a person.',
  counterReading: 'Human refusal archives the candidate as a visible ecosystem outcome.',
  materials: ['in-memory ledger', 'bounded score', 'public trace'],
  model: 'deterministic judging fixture',
  status: 'studio',
  provenance: {
    promptVersion: 'deterministic-judge-fixture-v1',
    inputSummary: {
      settings: { metricWindowHours: 24 },
      aggregateEventSummary: [{ surface: 'redacted/judging-route', kind: 'refusal', count: 1 }],
    },
    response: { responseId: 'redacted-fixture-response', model: 'deterministic fixture', usage: null },
    review: { status: 'studio', decision: 'pending' },
  },
}, { summary: 'Deterministic candidate entered Studio.', responseId: 'redacted-fixture-response' })
store.setArtworkStatus('judge-trace-candidate', 'archived', {
  reason: 'The deterministic fixture records a refused outcome for lifecycle verification.',
  reviewedBy: 'judge fixture operator',
})
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
  assert.equal(refusal.payload.changed, true)
  assert.equal(refusal.payload.deferred, false)
  assert.equal(refusal.payload.fieldScore.suppressedLure, initial.payload.fieldScore.activeLure)
  assert.notEqual(refusal.payload.fieldScore.activeLure, initial.payload.fieldScore.activeLure)
  assert.equal(refusal.payload.fieldScore.revision, initial.payload.fieldScore.revision + 1)

  const studio = await json('/api/studio/state')
  assert.equal(studio.response.status, 200)
  assert.equal(studio.payload.metrics.some(metric => metric.kind === 'refusal' && metric.count === 1), true)
  assert.equal(studio.payload.fieldScore.phase, 'counter-read')
  assert.equal(studio.payload.ecosystem.nodeTypeCounts.counterSignal, 1)
  const counterSignal = studio.payload.ecosystem.nodes.find(node => node.nodeType === 'counter-signal')
  assert.deepEqual(counterSignal.aggregate, { acceptedRefusals: 1, appliedRevisions: 1, deferredRevisions: 0 })
  assert.equal(studio.payload.ecosystem.relations.some(relation => relation.fromNodeId === counterSignal.id && relation.kind === 'counter-to'), true)
  assert.match(studio.payload.ecosystem.counterSignalPolicy.privacyLimit, /No request timestamp/i)
  assert.equal(studio.payload.compute.budget.dailyCycleLimit, 4)
  assert.equal(studio.payload.compute.budget.maxOutputTokensPerCycle, 2600)
  assert.equal(studio.payload.runtime.state, 'active')
  assert.match(studio.payload.runtime.limit, /cannot verify.+currently live/i)
  assert.equal(studio.payload.lifecycles.traces.length, 1)
  assert.equal(studio.payload.lifecycles.traces[0].outcome, 'refused')
  assert.deepEqual(studio.payload.lifecycles.traces[0].stages.map(stage => stage.stage), ['observation', 'interpretation', 'candidate', 'decision', 'outcome'])
  assert.equal(studio.payload.lifecycles.traces[0].links.length, 4)
  assert.doesNotMatch(JSON.stringify(studio.payload.lifecycles), /redacted\/judging-route|redacted-fixture-response/)
  assert.match(studio.payload.lifecycles.authority, /Only a recorded human curatorial decision/i)

  const denied = await json('/api/admin/state')
  assert.equal(denied.response.status, 401)
  assert.equal(denied.payload.error, 'Unauthorized')

  const operator = await json('/api/admin/state', {
    headers: { authorization: `Bearer ${operatorToken}` },
  })
  assert.equal(operator.response.status, 200)
  assert.equal(operator.payload.system.publicationMode, 'curated')
  assert.equal(operator.payload.compute.budget.remainingCycles, 3)

  console.log('Ophrys judging smoke: PASS')
  console.log(`refusal: ${initial.payload.fieldScore.activeLure} -> ${refusal.payload.fieldScore.activeLure}; revision ${refusal.payload.fieldScore.revision}`)
  console.log(`runtime: ${studio.payload.runtime.state}; basis: ${studio.payload.runtime.evidence.kind}`)
  console.log('boundaries: hourly counter-signal only; lifecycle inputs redacted; no request trace or liveness claim; Operator denied by default; publication curated; compute budget visible')
} finally {
  server.close()
  await once(server, 'close')
}
