import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { createOphrysStore } from '../src/ophrys-store.mjs'
import { createOphrysServer } from '../src/server.mjs'
import { runOphrysCycle } from '../src/ophrys-cycle.mjs'
import { generateArtwork } from '../src/openai-artwork.mjs'
import { simulatePhysicalBridge, validatePhysicalBridgeScore } from '../src/physical-bridge.mjs'

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
  const pages = ['index.html', 'studio.html', 'admin.html', 'work.html'].map(publicFile)
  for (const page of pages) {
    assert.match(page, /<html lang="en">/)
    assert.match(page, /name="viewport"/)
    assert.match(page, /class="skip-link" href="#main-content"/)
    assert.match(page, /<main id="main-content"/)
    assert.match(page, /href="\/accessibility\.css"/)
  }
  for (const page of ['index.html', 'studio.html', 'admin.html'].map(publicFile)) assert.match(page, /<nav aria-label="Primary">/)

  const accessibility = publicFile('accessibility.css')
  assert.match(accessibility, /:focus-visible/)
  assert.match(accessibility, /\.sr-only[\s\S]*clip: rect/)
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
  assert.match(publicFile('studio.html'), /id="lineage"[\s\S]*Ecosystem topology[\s\S]*id="relation-count"/)
  assert.match(publicFile('studio.html'), /id="runtime"[\s\S]*aria-busy="true"[\s\S]*Runtime continuity[\s\S]*id="runtime-state"[\s\S]*id="runtime-updated"/)
  assert.match(publicFile('studio.js'), /renderRuntime\(state\.runtime\)/)
  assert.match(publicFile('studio.js'), /Runtime record loaded:/)
  assert.match(publicFile('studio.html'), /PROJECTED \/ TOTAL NODES[\s\S]*PROJECTED \/ TOTAL RELATIONS[\s\S]*id="lineage-projection"/)
  assert.match(publicFile('studio.html'), /PROJECTED COUNTER-SIGNALS[\s\S]*id="counter-signal-policy"/)
  assert.match(publicFile('studio.html'), /PROJECTED DECISIONS[\s\S]*id="curatorial-decision-policy"/)
  assert.match(publicFile('studio.html'), /id="lifecycles"[\s\S]*Public trace lifecycle[\s\S]*PROJECTED \/ TOTAL TRACES[\s\S]*id="lifecycle-redaction"/)
  assert.match(publicFile('studio.html'), /id="physical-bridge"[\s\S]*Simulated physical bridge[\s\S]*id="physical-bridge-light"[\s\S]*id="physical-bridge-sound"/)
  assert.match(publicFile('studio.html'), /id="literacy"[\s\S]*Ecosystem literacy protocol[\s\S]*VISITOR RESPONSES STORED[\s\S]*id="literacy-steps"/)
  assert.match(publicFile('studio.js'), /ecosystem\.relations\.map\(relationRow\)/)
  assert.match(publicFile('studio.js'), /renderLiteracy\(state\.literacy\)/)
  assert.match(publicFile('studio.js'), /literacy\.steps\.map\(literacyStep\)/)
  assert.match(publicFile('studio.js'), /renderLifecycles\(state\.lifecycles\)/)
  assert.match(publicFile('studio.js'), /renderPhysicalBridge\(state\.physicalBridge\)/)
  assert.match(publicFile('studio.js'), /lifecycles\.traces\.map\(lifecycleRow\)/)
  assert.doesNotMatch(publicFile('studio.js'), /response\.responseId/)
  assert.match(publicFile('studio.js'), /aggregate: \$\{aggregateTotals\.join/)
  assert.match(publicFile('studio.js'), /projection\.eligibleRelations/)
  assert.match(publicFile('studio.js'), /ecosystem\.counterSignalPolicy\.privacyLimit/)
  assert.match(publicFile('studio.js'), /ecosystem\.curatorialDecisionPolicy\.limit/)
  assert.match(publicFile('admin.html'), /id="login-error"[^>]*role="alert"/)
  assert.match(publicFile('admin.html'), /name="dailyCycleLimit"[\s\S]*name="maxOutputTokens"[\s\S]*id="operator-compute-heading"/)
  assert.match(publicFile('admin.html'), /id="candidate-comparison"/)
  assert.match(publicFile('admin.js'), /selectedCandidateIds\.size < 2/)
  assert.match(publicFile('admin.js'), /Curatorial rationale/)
  assert.match(publicFile('admin.js'), /Return for revision/)
  assert.match(publicFile('comparison.css'), /@media \(max-width: 1050px\)[\s\S]*\.candidate-comparison[\s\S]*grid-template-columns: 1fr/)
  assert.match(publicFile('works.css'), /@media \(prefers-reduced-motion: reduce\)/)
  const studioStyles = publicFile('studio-studies.css')
  assert.match(studioStyles, /\.literacy-steps[\s\S]*grid-template-columns: repeat\(5, 1fr\)/)
  assert.match(studioStyles, /@media \(max-width: 1050px\)[\s\S]*\.literacy-steps[\s\S]*grid-template-columns: 1fr/)
  assert.match(studioStyles, /@media \(max-width: 720px\)[\s\S]*\.telemetry-grid\.literacy-summary[\s\S]*grid-template-columns: 1fr/)
})

test('the coded quartet couples four original visual sources to bounded counter-actions', () => {
  const page = publicFile('work.html')
  const publicPage = publicFile('index.html')
  const script = publicFile('works.js')
  const studioScript = publicFile('studio.js')
  const slugs = ['borrowed-weather', 'choir-of-almost', 'afterimage-commons', 'unchosen-signal']

  assert.match(page, /Studio study · unpublished/)
  assert.match(page, /id="counter-action"/)
  assert.match(page, /id="work-canvas" role="img"/)
  assert.match(page, /id="work-motion-state"/)
  assert.match(page, /This browser study does not identify you, retain a path, or infer a feeling/)
  for (const slug of slugs) {
    assert.match(script, new RegExp(`'${slug}'`))
    assert.match(script, new RegExp(`/assets/works/${slug}\\.webp`))
    assert.match(publicPage, new RegExp(`href="/works/${slug}"`))
    assert.match(publicPage, new RegExp(`src="/assets/works/${slug}\\.webp"`))
    assert.match(studioScript, new RegExp(`/works/${slug}`))
    assert.match(studioScript, new RegExp(`/assets/works/${slug}\\.webp`))
    const asset = statSync(new URL(`../public/assets/works/${slug}.webp`, import.meta.url))
    assert.ok(asset.size > 50_000, `${slug} should contain a substantive visual source`)
    assert.ok(asset.size < 500_000, `${slug} should stay within the browser artwork budget`)
  }
  assert.match(script, /new ResizeObserver/)
  assert.match(script, /Math\.min\(2, window\.devicePixelRatio/)
  assert.match(script, /prefers-reduced-motion: reduce/)
  assert.match(script, /this\.motionPreference\.addEventListener\('change'/)
  assert.match(script, /this\.entered && !this\.reducedMotion/)
  assert.match(script, /static reduced-motion state/)
  assert.match(script, /kind: 'refusal', surface: `study\/\$\{slug\}`/)
  assert.match(publicPage, /id="studies"[\s\S]*Studio study · review pending/)
  assert.match(studioScript, /Enter coded study ↗/)
  assert.doesNotMatch(script, /localStorage|sessionStorage|getUserMedia|fingerprint/i)
})

test('runtime continuity labels stored evidence with a deterministic clock and no liveness claim', () => {
  const store = createOphrysStore(':memory:')
  const at = new Date('2026-07-14T12:00:00.000Z')
  store.db.prepare("UPDATE field_state SET revision = 0, updated_at = '2026-07-14T11:45:00.000Z' WHERE id = 1").run()

  const quiet = store.getRuntimeContinuity({ at })
  assert.equal(quiet.state, 'quiet')
  assert.equal(quiet.observedAt, null)
  assert.equal(quiet.updatedAt, '2026-07-14T11:45:00.000Z')

  store.db.prepare("INSERT INTO visitor_metrics (bucket, surface, kind, count) VALUES ('2026-07-14T11:00:00.000Z', 'public', 'arrival', 3)").run()
  const active = store.getRuntimeContinuity({ at })
  assert.equal(active.state, 'active')
  assert.equal(active.observedAt, '2026-07-14T11:00:00.000Z')
  assert.equal(active.ageMinutes, 60)

  const threshold = store.getRuntimeContinuity({ at: new Date('2026-07-14T13:00:00.000Z') })
  assert.equal(threshold.state, 'active')
  assert.equal(threshold.ageMinutes, 120)
  const justStale = store.getRuntimeContinuity({ at: new Date('2026-07-14T13:00:00.001Z') })
  assert.equal(justStale.state, 'stale')
  assert.equal(justStale.ageMinutes, 121)

  const stale = store.getRuntimeContinuity({ at: new Date('2026-07-14T14:01:00.000Z') })
  assert.equal(stale.state, 'stale')
  assert.equal(stale.ageMinutes, 181)
  assert.match(stale.freshnessPolicy, /local policy/i)

  store.db.prepare('DELETE FROM visitor_metrics').run()
  store.createCycle({ id: 'failed-runtime', trigger: 'test', model: 'gpt-5.6-sol', startedAt: '2026-07-14T11:30:00.000Z' })
  store.db.prepare("UPDATE cycles SET status = 'failed', summary = 'Stopped safely.', completed_at = '2026-07-14T11:31:00.000Z' WHERE id = 'failed-runtime'").run()
  const failed = store.getRuntimeContinuity({ at })
  assert.equal(failed.state, 'failed')
  assert.equal(failed.evidence.status, 'failed')

  store.updateSettings({ cycleEnabled: false })
  store.db.prepare("UPDATE settings SET updated_at = '2026-07-14T11:50:00.000Z' WHERE key = 'cycleEnabled'").run()
  const disabled = store.getRuntimeContinuity({ at })
  assert.equal(disabled.state, 'disabled')
  assert.equal(disabled.updatedAt, '2026-07-14T11:50:00.000Z')
  assert.match(disabled.limit, /cannot verify.+currently live/i)
  store.close()
})

test('runtime continuity fails closed on malformed or future-dated evidence', () => {
  const now = new Date('2026-07-14T12:00:00.000Z')
  const store = createOphrysStore(':memory:', { now: () => now })

  store.db.prepare("INSERT INTO visitor_metrics (bucket, surface, kind, count) VALUES ('2026-07-14T13:00:00.000Z', 'public', 'arrival', 1)").run()
  const future = store.getRuntimeContinuity({ at: now })
  assert.equal(future.state, 'failed')
  assert.equal(future.observedAt, null)
  assert.equal(future.ageMinutes, null)
  assert.deepEqual(future.evidence, { kind: 'runtime-evidence-integrity', status: 'invalid' })
  assert.match(future.basis, /not treated as active/i)
  assert.doesNotMatch(JSON.stringify(future), /2026-07-14T13:00:00\.000Z/)

  store.db.prepare("UPDATE visitor_metrics SET bucket = '2026-07-14T11:15:00.000Z'").run()
  const nonHourly = store.getRuntimeContinuity({ at: now })
  assert.equal(nonHourly.state, 'failed')
  assert.equal(nonHourly.observedAt, null)
  assert.match(nonHourly.basis, /hourly aggregate boundary/i)

  store.db.prepare("UPDATE visitor_metrics SET bucket = 'not-a-time'").run()
  const malformed = store.getRuntimeContinuity({ at: now })
  assert.equal(malformed.state, 'failed')
  assert.equal(malformed.ageMinutes, null)
  assert.doesNotMatch(JSON.stringify(malformed), /not-a-time/)
  store.close()
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
  assert.match(script, /public field revision \$\{payload\.fieldScore\.revision\}/)
  assert.match(script, /This refusal was counted as anonymous public pressure/)
  assert.match(styles, /\[data-completed="true"\]/)
})

test('ecosystem literacy distinguishes five evidence types without collecting or scoring a visitor', () => {
  const store = createOphrysStore(':memory:')
  const initial = store.getEcosystemLiteracy()
  assert.deepEqual(initial.steps.map(step => step.key), ['node', 'relation', 'interpretation', 'simulated-output', 'human-decision'])
  assert.equal(initial.rubric.supportedChecks, 4)
  assert.equal(initial.rubric.complete, false)
  assert.equal(initial.steps.find(step => step.key === 'interpretation').supported, false)
  assert.match(initial.steps.find(step => step.key === 'interpretation').example, /no generated candidate lifecycle is recorded/i)
  assert.match(initial.rubric.limit, /does not observe, store, or score what a visitor understood/i)
  assert.match(initial.privacyBoundary, /does not collect answers, names, accounts, routes, quiz results, or inferred comprehension/i)

  store.createCycle({ id: 'literacy-cycle', trigger: 'test', model: 'gpt-5.6-sol' })
  store.createArtwork({
    id: 'literacy-candidate',
    cycleId: 'literacy-cycle',
    title: 'Evidence Grammar',
    medium: 'Bounded public trace',
    proposition: 'A test-only candidate makes the distinction between observation and interpretation inspectable.',
    publicDescription: 'This fixture exists only in memory.',
    visitorRelation: 'No visitor response or identity is collected.',
    exhibitionForm: 'A deterministic evidence ledger.',
    learningQuestion: 'Can five evidence types remain distinct?',
    lureHypothesis: 'Aggregate arrival counts may provisionally support a slower signal, without explaining a person.',
    counterReading: 'A visitor may contest the interpretation without becoming a scored learner.',
    materials: ['in-memory ledger'],
    model: 'deterministic fixture',
    status: 'studio',
    provenance: { inputSummary: { aggregateEventSummary: [{ kind: 'arrival', count: 2 }] } },
  })
  const complete = store.getEcosystemLiteracy()
  assert.deepEqual(complete.rubric, {
    supportedChecks: 5,
    totalChecks: 5,
    complete: true,
    limit: complete.rubric.limit,
  })
  assert.match(complete.steps.find(step => step.key === 'interpretation').example, /aggregate arrival counts may provisionally support/i)
  assert.doesNotMatch(JSON.stringify(complete), /visitorId|quizResult|comprehensionScore|individualRoute/)
  store.close()
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

test('the curatorial quartet enters the Studio without bypassing human publication', () => {
  const store = createOphrysStore(':memory:')
  const artworks = store.listArtworks({ limit: 10 })
  const quartetIds = new Set([
    'study-borrowed-weather',
    'study-choir-of-almost',
    'study-afterimage-commons',
    'study-unchosen-signal',
  ])
  const quartet = artworks.filter(work => quartetIds.has(work.id))

  assert.equal(artworks.length, 5)
  assert.equal(quartet.length, 4)
  assert.deepEqual(new Set(quartet.map(work => work.title)), new Set(['Borrowed Weather', 'Choir of Almost', 'Afterimage Commons', 'The Unchosen Signal']))
  for (const work of quartet) {
    assert.equal(work.status, 'studio')
    assert.equal(work.model, 'human curatorial study')
    assert.equal(work.provenance.promptVersion, 'human-ecosystem-quartet-v1')
    assert.equal(work.provenance.response.usage, null)
    assert.equal(work.provenance.review.decision, 'pending')
    assert.match(work.provenance.rightsBasis, /human curatorial review/i)
  }

  assert.deepEqual(store.listArtworks({ publicOnly: true, limit: 10 }).map(work => work.id), ['seed-false-spring'])
  const topology = store.getEcosystemTopology()
  assert.deepEqual(topology.statusCounts, { studio: 4, published: 1, archived: 0 })
  assert.equal(topology.relations.length, 6)
  assert.equal(topology.nodeTypeCounts.curatorialDecision, 1)
  const emptyLifecycles = store.getPublicTraceLifecycles()
  assert.deepEqual(emptyLifecycles.projection, {
    limit: 12,
    total: 0,
    truncated: false,
    scope: emptyLifecycles.projection.scope,
  })
  const nodeIds = new Set(topology.nodes.map(node => node.id))
  for (const relation of topology.relations) {
    assert.ok(nodeIds.has(relation.fromNodeId))
    assert.ok(nodeIds.has(relation.toNodeId))
  }
  store.close()
})

test('curatorial decision migration is idempotent across store restarts', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ophrys-decisions-'))
  const path = join(directory, 'ophrys.sqlite')
  const at = new Date('2026-07-14T17:30:00.000Z')
  try {
    const first = createOphrysStore(path, { now: () => at })
    assert.equal(first.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions').get().count, 1)
    first.setArtworkStatus('study-borrowed-weather', 'archived', {
      reason: 'The atmospheric threshold requires a more explicit public reset before it can enter publication.',
    })
    assert.equal(first.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions').get().count, 2)
    first.close()

    const reopened = createOphrysStore(path, { now: () => at })
    assert.equal(reopened.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions').get().count, 2)
    assert.equal(reopened.getEcosystemTopology().nodeTypeCounts.curatorialDecision, 2)
    reopened.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('store migration rolls back incompatible schemas without partially upgrading them', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ophrys-migration-failure-'))
  const path = join(directory, 'ophrys.sqlite')
  try {
    const legacy = new DatabaseSync(path)
    legacy.exec('CREATE TABLE cycles (id TEXT PRIMARY KEY)')
    legacy.close()

    assert.throws(
      () => createOphrysStore(path),
      error => error?.code === 'STORE_MIGRATION_FAILED' && /no schema changes were committed/i.test(error.message),
    )

    const inspected = new DatabaseSync(path)
    assert.deepEqual(inspected.prepare('PRAGMA table_info(cycles)').all().map(row => row.name), ['id'])
    assert.equal(inspected.prepare('PRAGMA user_version').get().user_version, 0)
    assert.deepEqual(inspected.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map(row => row.name), ['cycles'])
    inspected.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('artwork relations fail closed at insertion and when a stored ledger is malformed', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ophrys-relation-integrity-'))
  const path = join(directory, 'ophrys.sqlite')
  try {
    const store = createOphrysStore(path)
    const relationCount = store.db.prepare('SELECT COUNT(*) AS count FROM artwork_relations').get().count
    assert.throws(
      () => store.createArtworkRelation({
        fromArtworkId: 'study-borrowed-weather',
        toArtworkId: 'missing-work',
        kind: 'counter-to',
        evidence: 'This relation must not enter the ledger without both inspectable endpoint works.',
      }),
      /endpoints must both exist/i,
    )
    assert.throws(
      () => store.createArtworkRelation({
        fromArtworkId: 'study-borrowed-weather',
        toArtworkId: 'seed-false-spring',
        kind: 'counter-to',
        evidence: 'This relation must not enter the ledger with a non-canonical timestamp.',
        createdAt: '14 July 2026',
      }),
      /canonical UTC creation time/i,
    )
    assert.equal(store.db.prepare('SELECT COUNT(*) AS count FROM artwork_relations').get().count, relationCount)
    store.close()

    const corrupted = new DatabaseSync(path)
    corrupted.exec('PRAGMA foreign_keys = OFF')
    corrupted.prepare(`INSERT INTO artwork_relations (
      from_artwork_id, to_artwork_id, relation_kind, evidence, created_at
    ) VALUES (?, ?, ?, ?, ?)`).run(
      'study-borrowed-weather',
      'seed-false-spring',
      'secret-influence',
      'This deliberately malformed fixture must never enter the public topology projection.',
      '2026-07-14T12:00:00.000Z',
    )
    corrupted.close()

    assert.throws(
      () => createOphrysStore(path),
      error => error?.code === 'STORE_INTEGRITY_FAILED' && /initialization stopped before exposing a partial graph/i.test(error.message),
    )

    const inspected = new DatabaseSync(path)
    assert.equal(inspected.prepare("SELECT COUNT(*) AS count FROM artwork_relations WHERE relation_kind = 'secret-influence'").get().count, 1)
    inspected.close()
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('curatorial decisions require an actual artwork status transition', () => {
  const at = new Date('2026-07-14T18:45:00.000Z')
  const store = createOphrysStore(':memory:', { now: () => at })
  const before = store.db.prepare('SELECT status, provenance FROM artworks WHERE id = ?').get('seed-false-spring')
  const decisionCount = store.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions WHERE artwork_id = ?').get('seed-false-spring').count

  assert.throws(
    () => store.setArtworkStatus('seed-false-spring', 'published', {
      reason: 'A reaffirmation must not masquerade as a publication transition.',
    }),
    error => error?.code === 'ARTWORK_STATUS_UNCHANGED' && error?.statusCode === 409,
  )

  const unchanged = store.db.prepare('SELECT status, provenance FROM artworks WHERE id = ?').get('seed-false-spring')
  assert.deepEqual(unchanged, before)
  assert.equal(store.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions WHERE artwork_id = ?').get('seed-false-spring').count, decisionCount)

  const decision = store.setArtworkStatus('seed-false-spring', 'archived', {
    reason: 'The seed is withdrawn in this isolated fixture to prove a real transition writes exactly one decision.',
  })
  assert.deepEqual([decision.previousStatus, decision.resultingStatus], ['published', 'archived'])
  assert.equal(store.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions WHERE artwork_id = ?').get('seed-false-spring').count, decisionCount + 1)
  store.close()
})

test('public trace lifecycles connect redacted aggregate observation to a human-gated outcome', () => {
  let at = new Date('2026-07-14T12:00:00.000Z')
  const store = createOphrysStore(':memory:', { now: () => at })
  store.createCycle({ id: 'trace-cycle', trigger: 'test', model: 'gpt-5.6-sol', startedAt: at.toISOString() })
  store.commitArtworkCycle('trace-cycle', {
    id: 'trace-candidate',
    title: 'Redacted Passage',
    medium: 'Bounded light and public evidence trace',
    proposition: 'A deterministic candidate makes every transition from aggregate input to curatorial outcome inspectable.',
    publicDescription: 'A test-only candidate for the public lifecycle projection.',
    visitorRelation: 'The fixture contains no visitor-level relation.',
    exhibitionForm: 'A bounded test ledger.',
    learningQuestion: 'Can a public trace expose its limits?',
    lureHypothesis: 'Aggregate arrival pressure may support a slower threshold signal, but it cannot explain why anyone approached.',
    counterReading: 'A human rejection remains visible as a consequential refused outcome.',
    materials: ['test ledger'],
    model: 'gpt-5.6-sol',
    status: 'studio',
    createdAt: at.toISOString(),
    provenance: {
      promptVersion: 'ophrys-composition-v1',
      inputSummary: {
        settings: { metricWindowHours: 24 },
        aggregateEventSummary: [
          { surface: 'public/threshold', kind: 'arrival', count: 2 },
          { surface: 'study/private-route', kind: 'arrival', count: 1 },
          { surface: 'studio', kind: 'threshold', count: 4 },
        ],
        hiddenReasoning: 'must never enter the public projection',
      },
      response: { responseId: 'resp_must_not_be_public', usage: { total_tokens: 99 } },
      review: { status: 'studio', decision: 'pending' },
    },
  }, { summary: 'Candidate entered Studio.', responseId: 'resp_must_not_be_public' })

  at = new Date('2026-07-14T12:01:00.000Z')
  store.setArtworkStatus('trace-candidate', 'published', {
    reason: 'The bounded trace is sufficiently clear for public review.',
  })
  const approved = store.getPublicTraceLifecycles()
  assert.equal(approved.traces[0].outcome, 'public')

  at = new Date('2026-07-14T12:02:00.000Z')
  store.setArtworkStatus('trace-candidate', 'archived', {
    reason: 'The candidate is refused until its interpretation is made more contestable.',
  })
  const lifecycles = store.getPublicTraceLifecycles()
  assert.equal(lifecycles.schemaVersion, 1)
  assert.equal(lifecycles.projection.total, 1)
  assert.equal(lifecycles.traces.length, 1)
  const [trace] = lifecycles.traces
  assert.equal(trace.outcome, 'refused')
  assert.deepEqual(trace.stages.map(stage => stage.stage), ['observation', 'interpretation', 'candidate', 'decision', 'outcome'])
  assert.deepEqual(trace.stages[0].evidence.totals, [{ kind: 'threshold', count: 4 }, { kind: 'arrival', count: 3 }])
  assert.equal(trace.stages[3].evidence.kind, 'rejected')
  assert.equal(trace.stages[3].evidence.actorRole, 'operator')
  assert.equal(trace.stages[4].evidence.artworkStatus, 'archived')
  assert.equal(trace.links.length, 4)
  const stageIds = new Set(trace.stages.map(stage => stage.id))
  assert.equal(trace.links.every(link => stageIds.has(link.fromId) && stageIds.has(link.toId)), true)
  const projection = JSON.stringify(lifecycles)
  assert.doesNotMatch(projection, /public\/threshold|study\/private-route|resp_must_not_be_public|must never enter the public projection/)
  assert.match(lifecycles.redaction, /omits source surfaces.+hidden model reasoning.+visitor-level record/i)
  assert.equal(store.publicStudioState().lifecycles.traces[0].outcome, 'refused')
  store.close()
})

test('public Studio allow-lists provenance while Operator retains the complete packet', async () => {
  const store = createOphrysStore(':memory:')
  store.createCycle({ id: 'redaction-boundary-cycle', trigger: 'test', model: 'gpt-5.6-sol' })
  store.commitArtworkCycle('redaction-boundary-cycle', {
    id: 'redaction-boundary-candidate',
    title: 'Allow-listed Passage',
    medium: 'Bounded aggregate evidence and public projection',
    proposition: 'A deterministic candidate proves that a public evidence packet can remain useful without exposing provider or route metadata.',
    publicDescription: 'This in-memory candidate tests the complete unauthenticated payload boundary.',
    visitorRelation: 'No visitor record or inferred trait is created by this fixture.',
    exhibitionForm: 'A deterministic public and protected API comparison.',
    learningQuestion: 'Can useful provenance remain visible after private operational fields are removed?',
    lureHypothesis: 'Aggregate arrival and refusal counts may support a slower threshold signal without explaining any person.',
    counterReading: 'The protected packet remains available to the human Operator while the public projection exposes only declared evidence.',
    materials: ['in-memory ledger', 'public projection', 'protected provenance'],
    model: 'gpt-5.6-sol',
    status: 'studio',
    provenance: {
      promptVersion: 'redaction-boundary-v1',
      rightsBasis: 'Deterministic in-memory fixture.',
      inputSummary: {
        aggregateEventSummary: [
          { surface: 'private/review-route', kind: 'arrival', count: 2 },
          { surface: 'studio', kind: 'arrival', count: 1 },
          { surface: 'studio', kind: 'refusal', count: 1 },
        ],
        hiddenReasoning: 'must-not-be-public',
      },
      response: {
        responseId: 'resp_private_review_marker',
        model: 'gpt-5.6-sol',
        usage: { input_tokens: 12, output_tokens: 8, total_tokens: 20, hidden_usage_marker: 'must-not-be-public' },
      },
      review: { status: 'studio', decision: 'pending' },
      unknownExtra: 'unknown-provenance-marker',
    },
  }, {
    summary: 'Allow-listed Passage entered Studio.',
    responseId: 'resp_private_review_marker',
    usage: { input_tokens: 12, output_tokens: 8, total_tokens: 20, hidden_usage_marker: 'must-not-be-public' },
  })

  const server = createOphrysServer({ store, adminToken: 'redaction-test-token' })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`
  try {
    const publicResponse = await fetch(`${origin}/api/studio/state`)
    assert.equal(publicResponse.status, 200)
    const publicPayload = await publicResponse.json()
    const publicText = JSON.stringify(publicPayload)
    assert.doesNotMatch(publicText, /private\/review-route|resp_private_review_marker|must-not-be-public|unknown-provenance-marker/)
    const candidate = publicPayload.artworks.find(work => work.id === 'redaction-boundary-candidate')
    assert.ok(candidate)
    assert.deepEqual(candidate.provenance.inputSummary.aggregateEventSummary, [
      { kind: 'arrival', count: 3 },
      { kind: 'refusal', count: 1 },
    ])
    assert.deepEqual(candidate.provenance.response, {
      model: 'gpt-5.6-sol',
      usage: { input_tokens: 12, output_tokens: 8, total_tokens: 20 },
    })
    assert.equal(candidate.provenance.review.decision, 'pending')
    assert.equal(Object.hasOwn(publicPayload.cycles[0], 'responseId'), false)

    const adminResponse = await fetch(`${origin}/api/admin/state`, {
      headers: { authorization: 'Bearer redaction-test-token' },
    })
    assert.equal(adminResponse.status, 200)
    const adminText = JSON.stringify(await adminResponse.json())
    assert.match(adminText, /private\/review-route/)
    assert.match(adminText, /resp_private_review_marker/)
    assert.match(adminText, /must-not-be-public/)
    assert.match(adminText, /unknown-provenance-marker/)
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('ecosystem topology projection stays closed when older relation endpoints fall outside its node limit', () => {
  const store = createOphrysStore(':memory:')
  for (let index = 0; index < 41; index++) {
    const id = `projection-work-${String(index).padStart(2, '0')}`
    store.createArtwork({
      id,
      cycleId: null,
      title: `Projection work ${index}`,
      medium: 'Bounded topology fixture',
      proposition: 'A deterministic fixture tests whether a bounded public topology remains internally inspectable.',
      publicDescription: 'This unpublished fixture exists only in memory during the automated test.',
      visitorRelation: 'No visitor event or personal record is involved in this fixture.',
      exhibitionForm: 'A test-only ledger node.',
      learningQuestion: 'Can a projected relation remain valid when the full ledger is larger?',
      lureHypothesis: 'No public lure is tested.',
      counterReading: 'Omitted endpoints must remove their relations from the bounded projection.',
      materials: ['test ledger'],
      model: 'deterministic test',
      status: 'studio',
      provenance: {},
      createdAt: new Date(Date.UTC(2100, 0, 1, 0, 0, index)).toISOString(),
    })
    store.createArtworkRelation({
      fromArtworkId: id,
      toArtworkId: 'seed-false-spring',
      kind: 'revision-of',
      evidence: 'This deterministic relation points to the older seed solely to test closed bounded graph projection.',
    })
    for (let previous = 0; previous < index; previous++) {
      store.createArtworkRelation({
        fromArtworkId: id,
        toArtworkId: `projection-work-${String(previous).padStart(2, '0')}`,
        kind: 'coexists-with',
        evidence: 'This deterministic relation keeps visible endpoints inside the newest bounded node projection.',
      })
    }
  }

  const topology = store.getEcosystemTopology()
  const nodeIds = new Set(topology.nodes.map(node => node.id))
  assert.equal(topology.nodes.length, 42)
  assert.equal(topology.relations.length, 120)
  assert.deepEqual(topology.statusCounts, { studio: 40, published: 0, archived: 0 })
  assert.deepEqual(topology.projection, {
    nodeLimit: 40,
    counterSignalNodeLimit: 24,
    curatorialDecisionNodeLimit: 40,
    relationLimit: 120,
    totalNodes: 49,
    totalArtworkNodes: 46,
    totalCounterSignalNodes: 0,
    totalCuratorialDecisionNodes: 1,
    totalRelations: 867,
    eligibleRelations: 781,
    nodesTruncated: true,
    relationsTruncated: true,
    scope: topology.projection.scope,
  })
  assert.match(topology.projection.scope, /both endpoint nodes are in this bounded projection/i)
  for (const relation of topology.relations) {
    assert.ok(nodeIds.has(relation.fromNodeId), `missing projected source ${relation.fromNodeId}`)
    assert.ok(nodeIds.has(relation.toNodeId), `missing projected target ${relation.toNodeId}`)
  }
  assert.equal(topology.relations.some(relation => relation.toArtworkId === 'seed-false-spring'), false)
  store.close()
})

test('aggregate conditions bound the field score and an anonymous refusal burst rotates once per interval', () => {
  let at = new Date('2026-07-14T12:00:00.000Z')
  const store = createOphrysStore(':memory:', { now: () => at })
  const initial = store.getFieldScore()
  for (let index = 0; index < 4; index++) store.recordEvent({ kind: 'threshold', surface: 'public' })
  store.recordEvent({ kind: 'dwell_long', surface: 'public' })
  const adapted = store.getFieldScore()
  assert.ok(adapted.density > initial.density)
  assert.ok(adapted.tempoBpm >= 18 && adapted.tempoBpm <= 72)
  assert.ok(adapted.tiltDegrees >= -24 && adapted.tiltDegrees <= 24)

  const burst = Array.from({ length: 6 }, () => store.recordEvent({ kind: 'refusal', surface: 'public/counter-control' }))
  const [applied, ...deferred] = burst
  assert.equal(applied.changed, true)
  assert.equal(applied.deferred, false)
  assert.equal(applied.fieldScore.revision, initial.revision + 1)
  assert.equal(applied.fieldScore.suppressedLure, initial.activeLure)
  assert.notEqual(applied.fieldScore.activeLure, initial.activeLure)
  assert.equal(applied.fieldScore.phase, 'counter-read')
  assert.equal(applied.counterAction.refractorySeconds, 60)
  assert.equal(deferred.every(result => !result.changed && result.deferred), true)
  assert.equal(deferred.every(result => result.fieldScore.revision === initial.revision + 1), true)
  assert.equal(deferred.at(-1).fieldScore.activeLure, applied.fieldScore.activeLure)
  assert.equal(deferred.at(-1).fieldScore.aggregateBasis.refusal, 6)
  assert.equal(store.getMetrics().some(item => item.kind === 'refusal' && item.count === 6), true)

  at = new Date('2026-07-14T12:01:00.000Z')
  const nextInterval = store.recordEvent({ kind: 'refusal', surface: 'public/counter-control' })
  assert.equal(nextInterval.changed, true)
  assert.equal(nextInterval.fieldScore.revision, initial.revision + 2)
  assert.notEqual(nextInterval.fieldScore.activeLure, applied.fieldScore.activeLure)
  store.close()
})

test('the physical bridge validates bounded scores and falls quiet without hardware transport', () => {
  const store = createOphrysStore(':memory:')
  const score = store.getFieldScore()
  assert.deepEqual(validatePhysicalBridgeScore(score), { valid: true, errors: [] })

  const first = simulatePhysicalBridge(score)
  const repeated = simulatePhysicalBridge(structuredClone(score))
  assert.deepEqual(repeated, first)
  assert.equal(first.status, 'simulated')
  assert.equal(first.source.revision, score.revision)
  assert.equal(first.light.pulseBpm, score.tempoBpm)
  assert.equal(first.sound.pulseBpm, score.tempoBpm)
  assert.ok(first.light.intensityPercent >= 0 && first.light.intensityPercent <= 66)
  assert.ok(first.sound.gainPercent >= 0 && first.sound.gainPercent <= 24)
  assert.match(first.evidence.inputDigest, /^[a-f0-9]{64}$/)
  assert.equal(first.safety.hardwareAction, false)
  assert.equal(first.safety.transport, 'none')

  const invalidScores = [
    null,
    { ...score, density: 13 },
    { ...score, tempoBpm: 17 },
    { ...score, tiltDegrees: Number.NaN },
    { ...score, repertoire: ['orbit'] },
    { ...score, aggregateBasis: { ...score.aggregateBasis, attention: -1 } },
    { ...score, aggregateBasis: { ...score.aggregateBasis, visitorId: 'must-not-enter-the-contract' } },
    { ...score, phase: 'counter-read', suppressedLure: score.activeLure },
    { ...score, updatedAt: 'not-a-time' },
  ]
  for (const invalid of invalidScores) {
    const fallback = simulatePhysicalBridge(invalid)
    assert.equal(fallback.status, 'quiet-fallback')
    assert.deepEqual(fallback.light, { enabled: false, pattern: 'quiet', intensityPercent: 0, hueDegrees: 0, pulseBpm: 0, tiltDegrees: 0 })
    assert.deepEqual(fallback.sound, { enabled: false, voice: 'silence', gainPercent: 0, toneHz: 0, pulseBpm: 0 })
    assert.equal(fallback.evidence.validation, 'failed')
    assert.ok(fallback.evidence.errors.length >= 1)
    assert.equal(fallback.safety.hardwareAction, false)
    assert.equal(fallback.safety.transport, 'none')
  }

  const topology = store.getEcosystemTopology()
  const output = topology.nodes.find(node => node.nodeType === 'physical-output')
  assert.equal(output.id, first.id)
  assert.equal(output.status, 'simulated')
  assert.equal(topology.relations.some(relation => relation.fromNodeId === 'runtime-public-field' && relation.toNodeId === output.id && relation.kind === 'simulated-as'), true)
  assert.match(topology.physicalOutputPolicy.boundary, /no real hardware action/i)
  assert.equal(store.publicStudioState().physicalBridge.evidence.inputDigest, first.evidence.inputDigest)

  const moduleSource = readFileSync(new URL('../src/physical-bridge.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(moduleSource, /node:(?:http|https|net|dgram|child_process)|fetch\(|serial|gpio|mqtt/i)
  store.close()
})

test('refusals coalesce into retained hourly counter-signal nodes without request-level traces', () => {
  let at = new Date('2026-07-14T12:00:00.000Z')
  const store = createOphrysStore(':memory:', { now: () => at })

  const burst = Array.from({ length: 6 }, () => store.recordEvent({ kind: 'refusal', surface: 'public/counter-control' }))
  assert.equal(burst.filter(result => result.changed).length, 1)
  assert.equal(store.db.prepare('SELECT COUNT(*) AS count FROM counter_signal_buckets').get().count, 1)
  assert.deepEqual({ ...store.db.prepare('SELECT * FROM counter_signal_buckets').get() }, {
    bucket: '2026-07-14T12:00:00.000Z',
    accepted_count: 6,
    applied_count: 1,
    deferred_count: 5,
  })
  assert.deepEqual(
    store.db.prepare('PRAGMA table_info(counter_signal_buckets)').all().map(column => column.name),
    ['bucket', 'accepted_count', 'applied_count', 'deferred_count'],
  )

  const topology = store.getEcosystemTopology()
  const counterSignal = topology.nodes.find(node => node.nodeType === 'counter-signal')
  assert.deepEqual(counterSignal.aggregate, { acceptedRefusals: 6, appliedRevisions: 1, deferredRevisions: 5 })
  assert.equal(counterSignal.createdAt, '2026-07-14T12:00:00.000Z')
  assert.equal(counterSignal.expiresAt, '2026-07-17T12:00:00.000Z')
  const relation = topology.relations.find(item => item.fromNodeId === counterSignal.id)
  assert.equal(relation.kind, 'counter-to')
  assert.equal(relation.toNodeId, 'runtime-public-field')
  assert.equal(relation.toType, 'runtime-field')
  assert.match(relation.evidence, /does not identify or distinguish visitors/i)
  const nodeIds = new Set(topology.nodes.map(node => node.id))
  assert.equal(topology.relations.every(item => nodeIds.has(item.fromNodeId) && nodeIds.has(item.toNodeId)), true)
  assert.match(topology.counterSignalPolicy.privacyLimit, /No request timestamp.+visitor identifier/i)
  assert.doesNotMatch(JSON.stringify({ node: counterSignal, relation }), /requestedAt|sequence|surface|ipAddress|cookie|fingerprint|freeText/i)

  at = new Date('2026-07-14T12:01:00.000Z')
  store.recordEvent({ kind: 'refusal', surface: 'public/counter-control' })
  assert.deepEqual({ ...store.db.prepare('SELECT accepted_count, applied_count, deferred_count FROM counter_signal_buckets').get() }, {
    accepted_count: 7,
    applied_count: 2,
    deferred_count: 5,
  })

  at = new Date('2026-07-14T13:00:00.000Z')
  store.recordEvent({ kind: 'refusal', surface: 'public/counter-control' })
  assert.equal(store.db.prepare('SELECT COUNT(*) AS count FROM counter_signal_buckets').get().count, 2)

  at = new Date('2026-07-17T13:01:00.000Z')
  const expiredProjection = store.getEcosystemTopology()
  assert.equal(expiredProjection.nodeTypeCounts.counterSignal, 0)
  assert.equal(expiredProjection.projection.totalCounterSignalNodes, 0)
  assert.equal(store.db.prepare('SELECT COUNT(*) AS count FROM counter_signal_buckets').get().count, 2)
  store.recordEvent({ kind: 'refusal', surface: 'public/counter-control' })
  assert.deepEqual(store.db.prepare('SELECT bucket FROM counter_signal_buckets ORDER BY bucket').all().map(row => row.bucket), ['2026-07-17T13:00:00.000Z'])
  store.close()
})

test('public refusal responses distinguish one applied revision from deferred aggregate pressure', async () => {
  let at = new Date('2026-07-14T12:00:00.000Z')
  const store = createOphrysStore(':memory:', { now: () => at })
  const server = createOphrysServer({ store })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`
  const initial = store.getFieldScore()

  const refuse = async () => {
    const response = await fetch(`${origin}/api/public/event`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'refusal', surface: 'public/counter-control' }),
    })
    assert.equal(response.status, 202)
    return response.json()
  }

  const burst = []
  for (let index = 0; index < 6; index++) burst.push(await refuse())
  assert.deepEqual(burst.map(result => [result.changed, result.deferred]), [
    [true, false],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
    [false, true],
  ])
  assert.equal(burst.every(result => result.fieldScore.revision === initial.revision + 1), true)
  assert.equal(burst.at(-1).fieldScore.activeLure, burst[0].fieldScore.activeLure)
  assert.equal(burst.at(-1).fieldScore.aggregateBasis.refusal, 6)
  assert.match(burst[0].disclosure, /public repertoire advanced once/i)
  assert.match(burst[1].disclosure, /identity-free shared interval/i)

  at = new Date('2026-07-14T12:01:00.000Z')
  const nextInterval = await refuse()
  assert.equal(nextInterval.changed, true)
  assert.equal(nextInterval.fieldScore.revision, initial.revision + 2)

  const tables = store.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name)
  assert.equal(tables.includes('visitors'), false)
  assert.equal(tables.includes('profiles'), false)
  server.close()
  await once(server, 'close')
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

  const studioResponse = await fetch(`${origin}/api/studio/state`)
  assert.equal(studioResponse.status, 200)
  const studioState = await studioResponse.json()
  assert.equal(Object.hasOwn(studioState, 'operationalHandover'), false)
  assert.equal(studioState.ecosystem.nodes.length, 8)
  assert.equal(studioState.ecosystem.relations.length, 6)
  assert.equal(studioState.physicalBridge.safety.hardwareAction, false)
  assert.match(studioState.ecosystem.boundary, /autonomous approval/i)

  for (const slug of ['borrowed-weather', 'choir-of-almost', 'afterimage-commons', 'unchosen-signal']) {
    const studyResponse = await fetch(`${origin}/works/${slug}`)
    assert.equal(studyResponse.status, 200)
    assert.match(await studyResponse.text(), /Studio study · unpublished/)
  }
  assert.equal((await fetch(`${origin}/works/not-a-study`)).status, 404)

  const refusalResponse = await fetch(`${origin}/api/public/event`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'refusal', surface: 'public/counter-control' }),
  })
  assert.equal(refusalResponse.status, 202)
  const refusal = await refusalResponse.json()
  assert.equal(refusal.changed, true)
  assert.equal(refusal.deferred, false)
  assert.equal(refusal.fieldScore.suppressedLure, originalLure)
  assert.notEqual(refusal.fieldScore.activeLure, originalLure)

  assert.equal((await fetch(`${origin}/api/admin/state`)).status, 401)
  const adminResponse = await fetch(`${origin}/api/admin/state`, { headers: { authorization: 'Bearer test-operator-token' } })
  assert.equal(adminResponse.status, 200)
  const adminState = await adminResponse.json()
  assert.equal(adminState.system.model, 'gpt-5.6-sol')
  assert.equal(adminState.compute.budget.dailyCycleLimit, 4)
  assert.equal(adminState.compute.budget.maxOutputTokensPerCycle, 2600)
  assert.equal(adminState.operationalHandover.record.status, 'draft-pending-human-approval')
  assert.equal(adminState.operationalHandover.record.readiness, 'blocked-pending-human-handover')
  assert.equal(adminState.operationalHandover.record.approval.recorded, false)
  assert.equal(adminState.operationalHandover.record.escalation.status, 'unassigned')
  assert.equal(adminState.operationalHandover.system.model, adminState.system.model)
  assert.equal(adminState.operationalHandover.system.requestStorage, false)
  assert.match(adminState.operationalHandover.system.publicationGate, /human curatorial transition/i)
  assert.match(adminState.operationalHandover.system.physicalBoundary, /transport none/i)
  assert.equal(adminState.operationalHandover.roles.length, 4)
  assert.equal(adminState.operationalHandover.scenarios.length, 5)
  assert.deepEqual(adminState.operationalHandover.assessmentBoundary, {
    acknowledgementsStored: false,
    answersCollected: false,
    peopleScored: false,
    visitorLearningInferred: false,
    note: 'A responsible human must approve and retain the actual handover record outside the public ledger; Ophrys does not turn this briefing into a competency score.',
  })

  const beforeNoOp = store.db.prepare('SELECT status, provenance FROM artworks WHERE id = ?').get('seed-false-spring')
  const beforeNoOpDecisions = store.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions WHERE artwork_id = ?').get('seed-false-spring').count
  const noOpDecision = await fetch(`${origin}/api/admin/artworks/seed-false-spring/status`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer test-operator-token', 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'published', reason: 'The current publication state is unchanged.' }),
  })
  assert.equal(noOpDecision.status, 409)
  assert.deepEqual(await noOpDecision.json(), {
    error: 'Artwork already has status published; curatorial decisions require a status transition',
    code: 'ARTWORK_STATUS_UNCHANGED',
  })
  assert.deepEqual(store.db.prepare('SELECT status, provenance FROM artworks WHERE id = ?').get('seed-false-spring'), beforeNoOp)
  assert.equal(store.db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions WHERE artwork_id = ?').get('seed-false-spring').count, beforeNoOpDecisions)

  const missingRationale = await fetch(`${origin}/api/admin/artworks/study-borrowed-weather/status`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer test-operator-token', 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'published', reason: '' }),
  })
  assert.equal(missingRationale.status, 400)
  assert.match((await missingRationale.json()).error, /Curatorial rationale required/i)

  const reasonedApproval = await fetch(`${origin}/api/admin/artworks/study-borrowed-weather/status`, {
    method: 'PATCH',
    headers: { authorization: 'Bearer test-operator-token', 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'published', reason: 'The threshold study is sufficiently bounded for this isolated governance test.' }),
  })
  assert.equal(reasonedApproval.status, 200)
  const approvalPayload = await reasonedApproval.json()
  assert.equal(approvalPayload.decision.kind, 'approved')
  assert.equal(approvalPayload.decision.actorRole, 'operator')

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

  const artworks = store.listArtworks({ limit: 10 })
  const work = artworks.find(item => item.title === 'Packet Study')
  assert.ok(work)
  assert.equal(work.model, 'gpt-5.6-sol')
  assert.equal(work.provenance.promptVersion, 'ophrys-composition-v1')
  assert.equal(work.provenance.response.usage.total_tokens, 232)
  assert.match(work.provenance.rightsBasis, /aggregate events only/i)
  const topology = store.getEcosystemTopology()
  assert.equal(topology.nodes.length, 9)
  assert.deepEqual(topology.statusCounts, { studio: 5, published: 1, archived: 0 })
  assert.equal(topology.relations.length, 7)
  const generatedRelation = topology.relations.find(relation => relation.fromArtworkId === work.id)
  assert.ok(generatedRelation)
  assert.deepEqual({ ...generatedRelation }, {
    fromArtworkId: work.id,
    fromNodeId: work.id,
    fromTitle: 'Packet Study',
    fromStatus: 'studio',
    fromType: 'artwork',
    toArtworkId: 'seed-false-spring',
    toNodeId: 'seed-false-spring',
    toTitle: 'False Spring',
    toStatus: 'published',
    toType: 'artwork',
    kind: 'context-derived-from',
    evidence: generatedRelation.evidence,
    createdAt: generatedRelation.createdAt,
  })
  assert.match(generatedRelation.evidence, /does not imply approval, authorship, or aesthetic descent/i)
  assert.match(topology.boundary, /do not claim aesthetic similarity/i)
  const [cycle] = store.listCycles()
  assert.equal(cycle.usage.total_tokens, 232)
  assert.ok(Number.isInteger(cycle.latencyMs) && cycle.latencyMs >= 0)
  assert.equal(cycle.outputTokenBudget, 2600)
  assert.throws(() => store.setArtworkStatus(work.id, 'published'), /Curatorial rationale required/i)
  assert.throws(() => store.setArtworkStatus(work.id, 'archived'), /Curatorial rationale required/i)
  store.setArtworkStatus(work.id, 'published', { reason: 'The proposition and counter-reading are sufficiently precise for public review.' })
  const approved = store.listArtworks({ limit: 10 }).find(item => item.id === work.id)
  assert.equal(approved.provenance.review.decision, 'approved')
  assert.equal(approved.provenance.review.rationale, 'The proposition and counter-reading are sufficiently precise for public review.')
  store.setArtworkStatus(work.id, 'archived', { reason: 'The packet needs a fuller counter-reading before publication.' })
  const archived = store.listArtworks({ limit: 10 }).find(item => item.id === work.id)
  assert.equal(archived.status, 'archived')
  assert.equal(archived.provenance.review.decision, 'rejected')
  assert.equal(archived.provenance.review.rejectionReason, 'The packet needs a fuller counter-reading before publication.')
  store.setArtworkStatus(work.id, 'studio', { reason: 'Return the material study for a clearer account of how its public trace can be refused.' })
  const revised = store.listArtworks({ limit: 10 }).find(item => item.id === work.id)
  assert.equal(revised.status, 'studio')
  assert.equal(revised.provenance.review.decision, 'returned_for_revision')
  const decisions = store.db.prepare(`SELECT decision_kind AS kind, previous_status AS previousStatus,
    resulting_status AS resultingStatus, rationale, actor_role AS actorRole
    FROM curatorial_decisions WHERE artwork_id = ? ORDER BY rowid`).all(work.id)
  assert.deepEqual(decisions.map(decision => decision.kind), ['approved', 'rejected', 'returned_for_revision'])
  assert.deepEqual(decisions.map(decision => [decision.previousStatus, decision.resultingStatus]), [
    ['studio', 'published'], ['published', 'archived'], ['archived', 'studio'],
  ])
  assert.equal(decisions.every(decision => decision.actorRole === 'operator' && decision.rationale.length > 20), true)
  const governedTopology = store.getEcosystemTopology()
  const governedNodeIds = new Set(governedTopology.nodes.map(node => node.id))
  const decisionNodes = governedTopology.nodes.filter(node => node.nodeType === 'curatorial-decision' && node.governance?.artworkId === work.id)
  assert.equal(decisionNodes.length, 3)
  assert.deepEqual(new Set(decisionNodes.map(node => node.status)), new Set(['approved', 'rejected', 'returned_for_revision']))
  for (const relation of governedTopology.relations.filter(relation => relation.toNodeId === work.id && relation.fromType === 'curatorial-decision')) {
    assert.ok(governedNodeIds.has(relation.fromNodeId))
    assert.match(relation.evidence, /does not make comparison authoritative/i)
  }
  assert.match(governedTopology.curatorialDecisionPolicy.limit, /Selecting works for comparison creates no record/i)
  store.close()
})
