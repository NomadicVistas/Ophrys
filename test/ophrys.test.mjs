import assert from 'node:assert/strict'
import { once } from 'node:events'
import test from 'node:test'
import { createOphrysStore } from '../src/ophrys-store.mjs'
import { createOphrysServer } from '../src/server.mjs'
import { runOphrysCycle } from '../src/ophrys-cycle.mjs'
import { generateArtwork } from '../src/openai-artwork.mjs'

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
  assert.equal((await adminResponse.json()).system.model, 'gpt-5.6-sol')

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
  const result = await generateArtwork({ settings: { model: 'gpt-5.6-sol', reasoningEffort: 'high', systemMode: 'compose', explorationRate: .3, curatorialDirective: 'Keep attraction visible, uncertain, and contestable.' }, metrics: [], recentArtworks: [], apiKey: 'test', fetchImpl })
  assert.equal(result.artwork.title, 'Mimic Field')
  assert.equal(request.model, 'gpt-5.6-sol')
  assert.equal(request.store, false)
  assert.equal(request.reasoning.effort, 'high')
  assert.equal(request.text.format.type, 'json_schema')
  assert.equal(result.usage.total_tokens, 333)
  assert.equal(result.provenance.promptVersion, 'ophrys-composition-v1')
  assert.deepEqual(result.provenance.response.usage.total_tokens, 333)
  assert.match(result.provenance.rightsBasis, /aggregate public events/i)
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
  assert.throws(() => store.setArtworkStatus(work.id, 'archived'), /Rejection reason required/i)
  store.setArtworkStatus(work.id, 'archived', { reason: 'The packet needs a fuller counter-reading before publication.' })
  const archived = store.listArtworks({ limit: 4 }).find(item => item.id === work.id)
  assert.equal(archived.status, 'archived')
  assert.equal(archived.provenance.review.decision, 'rejected')
  assert.equal(archived.provenance.review.rejectionReason, 'The packet needs a fuller counter-reading before publication.')
  store.close()
})
