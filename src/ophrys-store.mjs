import { mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { simulatePhysicalBridge } from './physical-bridge.mjs'

const DEFAULT_SETTINGS = {
  systemMode: 'compose',
  model: 'gpt-5.6-sol',
  reasoningEffort: 'high',
  cycleEnabled: true,
  publicationMode: 'curated',
  metricWindowHours: 24,
  metricRetentionHours: 72,
  explorationRate: 0.32,
  maxOutputTokens: 2600,
  dailyCycleLimit: 4,
  curatorialDirective: 'Make attraction perceptible without confusing prediction with understanding. Preserve ambiguity, refusal, repairability, and public agency.',
}

const EVENT_KINDS = new Set(['arrival', 'threshold', 'artwork_open', 'studio_open', 'dwell_short', 'dwell_long', 'refusal', 'return'])
const ARTWORK_STATUSES = new Set(['studio', 'published', 'archived'])
const ARTWORK_RELATION_KINDS = new Set(['context-derived-from', 'revision-of', 'counter-to', 'coexists-with'])
const LURE_REPERTOIRE = ['orbit', 'interruption', 'split-signal']
const TOPOLOGY_NODE_LIMIT = 40
const TOPOLOGY_RELATION_LIMIT = 120
const TOPOLOGY_COUNTER_SIGNAL_LIMIT = 24
const TOPOLOGY_DECISION_LIMIT = 40
const PUBLIC_TRACE_LIMIT = 12
const RUNTIME_STALE_AFTER_MINUTES = 120
const REFUSAL_REFRACTORY_MS = 60_000

export class ArtworkStatusConflictError extends Error {
  constructor(status) {
    super(`Artwork already has status ${status}; curatorial decisions require a status transition`)
    this.name = 'ArtworkStatusConflictError'
    this.code = 'ARTWORK_STATUS_UNCHANGED'
    this.statusCode = 409
  }
}

const CURATORIAL_QUARTET = [
  {
    id: 'study-borrowed-weather',
    title: 'Borrowed Weather',
    spatialRole: 'threshold',
    medium: 'Responsive light climate, directional sound, translucent scrims, and coarse threshold counting',
    proposition: 'A threshold borrows the visual and acoustic signs of an approaching weather system, adjusting their incompleteness from collective crossings while refusing to explain why anyone entered.',
    publicDescription: 'A pale front of light and low directional sound gathers at the entrance, then breaks apart as aggregate threshold activity changes. Its apparent forecast is only a tactic: the work displays the counts and timing that shaped the signal without turning them into a portrait of the people present.',
    visitorRelation: 'Visitors may cross, wait outside, approach from another side, or use a visible refusal control that replaces the current weather-sign with a deliberately neutral interval.',
    exhibitionForm: 'A porous entrance made from translucent scrims, narrow light bands, directional speakers, a coarse crossing counter, and a local evidence display forms an address before the main field.',
    learningQuestion: 'When does an atmospheric invitation start to feel like a prediction about you?',
    lureHypothesis: 'An incomplete moving light-front paired with low directional sound will produce more collective threshold crossings than a stable evenly lit entrance.',
    counterReading: 'Refusal clears the borrowed forecast, reveals the aggregate basis of the tactic, and holds a quiet neutral threshold before another signal may appear.',
    materials: ['translucent scrims', 'addressable light bars', 'directional speakers', 'coarse threshold counters', 'local evidence display'],
  },
  {
    id: 'study-choir-of-almost',
    title: 'Choir of Almost',
    spatialRole: 'field',
    medium: 'Distributed resonant objects, spatial audio, low-resolution presence counts, and interrupted light',
    proposition: 'A shared field assembles a chorus from tones that almost resolve, learning only which collective densities sustain attention and preserving the gap between acoustic success and social understanding.',
    publicDescription: 'Across a room, resonant objects answer one another with partial phrases. Aggregate approach and dwell counts alter spacing, density, and silence, while a public score shows which coarse observations changed the composition and which interpretations remain uncertain.',
    visitorRelation: 'People may circulate, remain at the edge, gather, disperse, or collectively interrupt the favoured phrase; no voice is recorded and no path is attached to an individual.',
    exhibitionForm: 'A walkable constellation of resonant surfaces and directional speakers creates overlapping listening positions, with interrupted light marking transitions between observation, interpretation, and bounded artistic choice.',
    learningQuestion: 'Can a system coordinate a crowd’s attention without knowing what anyone heard?',
    lureHypothesis: 'Unresolved phrases that migrate between listening positions will sustain more aggregate dwell than a centred complete musical sequence.',
    counterReading: 'A collective interruption removes the most successful phrase from the next repertoire and gives silence equal status as a compositional response.',
    materials: ['resonant metal and wood objects', 'directional speakers', 'coarse presence counters', 'interrupted light', 'public score display'],
  },
  {
    id: 'study-afterimage-commons',
    title: 'Afterimage Commons',
    spatialRole: 'residue',
    medium: 'Fading projection, phosphorescent surfaces, aggregate event buckets, and a public erase mechanism',
    proposition: 'Depersonalised traces of earlier encounters return as a slowly decaying commons whose retention rules, omissions, and erasure controls are as visible as the image they produce.',
    publicDescription: 'Soft afterimages accumulate from hourly aggregate events rather than recorded bodies. The projection shows what kind of event contributed, when its bucket expires, and where interpretation was added; anyone may accelerate the decay without being asked to justify the erasure.',
    visitorRelation: 'Visitors may inspect the trace ledger, contribute only through coarse shared events, decline participation, or erase the most recent aggregate layer without deleting another person’s record because no individual record exists.',
    exhibitionForm: 'A phosphorescent wall and low-luminance projection hold layered traces beside a local retention clock, event legend, and mechanically distinct erase control.',
    learningQuestion: 'What makes a collective memory accountable when it remembers no individual?',
    lureHypothesis: 'A visibly decaying trace with an explicit retention clock will invite longer inspection than an unexplained persistent visual archive.',
    counterReading: 'The erase control makes forgetting consequential, displays the removed aggregate layer, and prevents absence from being misread as missing personal data.',
    materials: ['phosphorescent surface', 'low-luminance projector', 'aggregate event ledger', 'retention clock', 'public erase control'],
  },
  {
    id: 'study-unchosen-signal',
    title: 'The Unchosen Signal',
    spatialRole: 'counter-field',
    medium: 'Split light field, mechanical shutters, discarded-signal ledger, and public counter-signal controls',
    proposition: 'The system exhibits the signals it did not choose, allowing rejected tactics and public counter-signals to reorganise the field instead of presenting optimisation as an inevitable direction.',
    publicDescription: 'Two light fields face one another: one carries the currently favoured lure, while the other holds discarded and publicly refused signals. Mechanical shutters periodically exchange their visibility, exposing selection as a reversible curatorial and computational act.',
    visitorRelation: 'Visitors may refuse the favoured signal, restore a discarded one for collective inspection, add a bounded counter-signal, or remain outside the choice without being classified.',
    exhibitionForm: 'Opposing light planes, mechanical shutters, tactile counter-signal controls, and a public ledger stage selected, discarded, and restored signals as equally inspectable states.',
    learningQuestion: 'Who gains agency when an adaptive system must display what it rejected?',
    lureHypothesis: 'Showing the favoured and discarded signal together will produce more counter-signal actions than presenting only the system’s current selection.',
    counterReading: 'No signal can disappear silently: refusal moves it into the visible discarded ledger, and restoration never grants automatic approval or permanence.',
    materials: ['opposing light planes', 'mechanical shutters', 'tactile counter-signal controls', 'discarded-signal ledger', 'bounded local controller'],
  },
]

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function isoHour(date = new Date()) {
  const value = new Date(date)
  value.setUTCMinutes(0, 0, 0)
  return value.toISOString()
}

function parseValue(value) {
  try { return JSON.parse(value) } catch { return value }
}

function parseObject(value) {
  const parsed = parseValue(value || '{}')
  return parsed && typeof parsed === 'object' ? parsed : {}
}

function ensureParent(path) {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true })
}

export function createOphrysStore(path = process.env.OPHRYS_DB_PATH || 'var/ophrys.sqlite', { now = () => new Date() } = {}) {
  const currentDate = () => {
    const value = new Date(now())
    if (Number.isNaN(value.getTime())) throw new Error('Invalid store clock')
    return value
  }
  ensureParent(path)
  const db = new DatabaseSync(path)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS visitor_metrics (
      bucket TEXT NOT NULL,
      surface TEXT NOT NULL,
      kind TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (bucket, surface, kind)
    );
    CREATE TABLE IF NOT EXISTS field_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      active_lure TEXT NOT NULL,
      suppressed_lure TEXT,
      revision INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      last_refusal_mutation_at TEXT
    );
    CREATE TABLE IF NOT EXISTS counter_signal_buckets (
      bucket TEXT PRIMARY KEY,
      accepted_count INTEGER NOT NULL CHECK (accepted_count > 0),
      applied_count INTEGER NOT NULL CHECK (applied_count >= 0),
      deferred_count INTEGER NOT NULL CHECK (deferred_count >= 0),
      CHECK (accepted_count = applied_count + deferred_count)
    );
    CREATE TABLE IF NOT EXISTS cycles (
      id TEXT PRIMARY KEY,
      trigger TEXT NOT NULL,
      status TEXT NOT NULL,
      model TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      response_id TEXT,
      error TEXT,
      usage TEXT NOT NULL DEFAULT '{}',
      latency_ms INTEGER,
      output_token_budget INTEGER NOT NULL DEFAULT 2600,
      started_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS artworks (
      id TEXT PRIMARY KEY,
      cycle_id TEXT,
      title TEXT NOT NULL,
      medium TEXT NOT NULL,
      proposition TEXT NOT NULL,
      public_description TEXT NOT NULL,
      visitor_relation TEXT NOT NULL,
      exhibition_form TEXT NOT NULL,
      learning_question TEXT NOT NULL,
      lure_hypothesis TEXT NOT NULL,
      counter_reading TEXT NOT NULL,
      materials TEXT NOT NULL,
      model TEXT NOT NULL,
      status TEXT NOT NULL,
      provenance TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY (cycle_id) REFERENCES cycles(id)
    );
    CREATE TABLE IF NOT EXISTS artwork_relations (
      from_artwork_id TEXT NOT NULL,
      to_artwork_id TEXT NOT NULL,
      relation_kind TEXT NOT NULL,
      evidence TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (from_artwork_id, to_artwork_id, relation_kind),
      FOREIGN KEY (from_artwork_id) REFERENCES artworks(id),
      FOREIGN KEY (to_artwork_id) REFERENCES artworks(id),
      CHECK (from_artwork_id <> to_artwork_id)
    );
    CREATE TABLE IF NOT EXISTS curatorial_decisions (
      id TEXT PRIMARY KEY,
      artwork_id TEXT NOT NULL,
      decision_kind TEXT NOT NULL CHECK (decision_kind IN ('approved', 'rejected', 'returned_for_revision')),
      previous_status TEXT CHECK (previous_status IS NULL OR previous_status IN ('studio', 'published', 'archived')),
      resulting_status TEXT NOT NULL CHECK (resulting_status IN ('studio', 'published', 'archived')),
      rationale TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (artwork_id) REFERENCES artworks(id)
    );
    CREATE INDEX IF NOT EXISTS artwork_relations_to ON artwork_relations(to_artwork_id);
    CREATE INDEX IF NOT EXISTS curatorial_decisions_artwork ON curatorial_decisions(artwork_id, created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS one_active_cycle ON cycles(status) WHERE status = 'running';
  `)
  const artworkColumns = db.prepare('PRAGMA table_info(artworks)').all().map(row => row.name)
  if (!artworkColumns.includes('provenance')) db.exec("ALTER TABLE artworks ADD COLUMN provenance TEXT NOT NULL DEFAULT '{}'")
  const cycleColumns = db.prepare('PRAGMA table_info(cycles)').all().map(row => row.name)
  if (!cycleColumns.includes('usage')) db.exec("ALTER TABLE cycles ADD COLUMN usage TEXT NOT NULL DEFAULT '{}'")
  if (!cycleColumns.includes('latency_ms')) db.exec('ALTER TABLE cycles ADD COLUMN latency_ms INTEGER')
  if (!cycleColumns.includes('output_token_budget')) db.exec('ALTER TABLE cycles ADD COLUMN output_token_budget INTEGER NOT NULL DEFAULT 2600')
  const fieldColumns = db.prepare('PRAGMA table_info(field_state)').all().map(row => row.name)
  if (!fieldColumns.includes('last_refusal_mutation_at')) db.exec('ALTER TABLE field_state ADD COLUMN last_refusal_mutation_at TEXT')
  db.prepare("UPDATE cycles SET status = 'abandoned', summary = 'Cycle expired before completion.', completed_at = ? WHERE status = 'running' AND started_at < ?")
    .run(currentDate().toISOString(), new Date(currentDate().getTime() - 2 * 3600_000).toISOString())

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)')
  const initializedAt = currentDate().toISOString()
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) insertSetting.run(key, JSON.stringify(value), initializedAt)
  db.prepare('INSERT OR IGNORE INTO field_state (id, active_lure, suppressed_lure, revision, updated_at) VALUES (1, ?, NULL, 0, ?)')
    .run(LURE_REPERTOIRE[0], initializedAt)

  const count = db.prepare('SELECT COUNT(*) AS count FROM artworks').get().count
  if (count === 0) {
    createArtwork({
      id: 'seed-false-spring', cycleId: null, title: 'False Spring', medium: 'Spatial light, directional sound, public trace',
      proposition: 'A room learns which incomplete signals make a public approach, then reveals that its success contains no knowledge of why anyone came closer.',
      publicDescription: 'A field of light and sound changes slowly in response to collective presence. Every successful lure becomes visible as a provisional tactic rather than a truth about its visitors.',
      visitorRelation: 'Visitors may approach, remain, withdraw, erase a recent aggregate trace, or introduce a counter-signal.',
      exhibitionForm: 'Threshold signal, shared field, delayed residue, and an inspectable counter-field.',
      learningQuestion: 'When does behavioural prediction begin to feel like understanding?',
      lureHypothesis: 'Low-frequency directional sound combined with interrupted light will produce more threshold crossings than a stable luminous field.',
      counterReading: 'A visible refusal control suppresses the currently favoured signal and records disagreement as a compositional event.',
      materials: ['directional light', 'spatial audio', 'coarse threshold sensor', 'local event display'],
      model: 'curatorial seed', status: 'published', createdAt: initializedAt,
      provenance: {
        promptVersion: 'human-baseline',
        sourceReferences: ['Human-authored baseline work'],
        rightsBasis: 'Baseline work authored by the project team for the exhibition interface.',
        inputSummary: { type: 'seed baseline', note: 'No model request; used to test the exhibition interface.' },
        response: { responseId: null, model: 'curatorial seed', usage: null },
        review: {
          status: 'published',
          decision: 'approved',
          rationale: 'Human-authored seed work for the public exhibition interface.',
          rejectionReason: null,
          reviewedAt: initializedAt,
          reviewedBy: 'human baseline',
        },
      },
    })
  }

  for (const [index, candidate] of CURATORIAL_QUARTET.entries()) {
    const exists = db.prepare('SELECT 1 FROM artworks WHERE id = ?').get(candidate.id)
    if (exists) continue
    createArtwork({
      ...candidate,
      cycleId: null,
      model: 'human curatorial study',
      status: 'studio',
      createdAt: new Date(Date.parse(initializedAt) + index + 1).toISOString(),
      provenance: {
        promptVersion: 'human-ecosystem-quartet-v1',
        sourceReferences: ['Ophrys spatial grammar', 'Ewoud’s 2026-07-14 request for four ecosystem artworks'],
        rightsBasis: 'Original project-team draft prepared with Codex assistance for human curatorial review; no living artist or third-party artwork was requested as a model.',
        inputSummary: {
          type: 'human-authored ecosystem candidate',
          spatialRole: candidate.spatialRole,
          note: 'No composition API request was made. The candidate is unpublished and requires an explicit human decision.',
        },
        response: { responseId: null, model: 'human curatorial study', usage: null },
        review: {
          status: 'studio',
          decision: 'pending',
          rationale: null,
          rejectionReason: null,
          reviewedAt: null,
          reviewedBy: null,
        },
      },
    })
  }

  const quartetRelations = [
    {
      fromArtworkId: 'study-borrowed-weather', toArtworkId: 'seed-false-spring', kind: 'revision-of',
      evidence: 'Borrowed Weather revises the seed work’s threshold condition into an atmospheric address; the relation records a human curatorial proposition and does not confer publication approval.',
    },
    {
      fromArtworkId: 'study-choir-of-almost', toArtworkId: 'study-borrowed-weather', kind: 'coexists-with',
      evidence: 'Choir of Almost extends the threshold into a distributed shared field; both can coexist spatially without implying that one caused or authored the other.',
    },
    {
      fromArtworkId: 'study-afterimage-commons', toArtworkId: 'seed-false-spring', kind: 'counter-to',
      evidence: 'Afterimage Commons counters attraction-led adaptation by making retention, expiry, and public erasure the primary material under inspection.',
    },
    {
      fromArtworkId: 'study-unchosen-signal', toArtworkId: 'study-borrowed-weather', kind: 'counter-to',
      evidence: 'The Unchosen Signal counters the favoured threshold tactic by retaining discarded and refused alternatives as visible, reversible ecosystem states.',
    },
  ]
  for (const relation of quartetRelations) createArtworkRelation(relation)
  backfillCuratorialDecisions()
  pruneMetrics()

  function getSettings() {
    return Object.fromEntries(db.prepare('SELECT key, value FROM settings ORDER BY key').all().map(row => [row.key, parseValue(row.value)]))
  }

  function updateSettings(patch) {
    const allowed = new Set(Object.keys(DEFAULT_SETTINGS))
    const next = { ...getSettings() }
    for (const [key, value] of Object.entries(patch || {})) {
      if (!allowed.has(key)) throw new Error(`Unknown setting: ${key}`)
      if (key === 'reasoningEffort' && !['low', 'medium', 'high', 'xhigh', 'max'].includes(value)) throw new Error('Invalid reasoning effort')
      if (key === 'systemMode' && !['observe', 'compose', 'exhibit'].includes(value)) throw new Error('Invalid system mode')
      if (key === 'publicationMode' && value !== 'curated') throw new Error('Ophrys requires human publication review')
      if (key === 'metricWindowHours' && (!Number.isInteger(value) || value < 1 || value > 168)) throw new Error('Invalid metric window')
      if (key === 'metricRetentionHours' && (!Number.isInteger(value) || value < 24 || value > 720)) throw new Error('Invalid metric retention')
      if (key === 'explorationRate' && (typeof value !== 'number' || value < 0 || value > 1)) throw new Error('Invalid exploration rate')
      if (key === 'maxOutputTokens' && (!Number.isInteger(value) || value < 400 || value > 5000)) throw new Error('Invalid output token budget')
      if (key === 'dailyCycleLimit' && (!Number.isInteger(value) || value < 1 || value > 24)) throw new Error('Invalid daily cycle limit')
      if (key === 'cycleEnabled' && typeof value !== 'boolean') throw new Error('Invalid cycle state')
      if (key === 'model' && !['gpt-5.6', 'gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna'].includes(value)) throw new Error('Invalid model')
      if (key === 'curatorialDirective' && (typeof value !== 'string' || value.length < 20 || value.length > 2000)) throw new Error('Invalid curatorial directive')
      next[key] = value
    }
    const statement = db.prepare(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`)
    const timestamp = currentDate().toISOString()
    for (const [key, value] of Object.entries(patch || {})) statement.run(key, JSON.stringify(value), timestamp)
    return next
  }

  function insertEvent(kind, surface) {
    if (!EVENT_KINDS.has(kind)) throw new Error('Unsupported aggregate event')
    const cleanSurface = String(surface).replace(/[^a-z0-9_/-]/gi, '').slice(0, 80) || 'public'
    const bucket = isoHour(currentDate())
    db.prepare(`INSERT INTO visitor_metrics (bucket, surface, kind, count) VALUES (?, ?, ?, 1)
      ON CONFLICT(bucket, surface, kind) DO UPDATE SET count = count + 1`).run(bucket, cleanSurface, kind)
    return { bucket, surface: cleanSurface, kind }
  }

  function recordEvent({ kind, surface = 'public' }) {
    if (kind === 'refusal') return refuseLure({ surface })
    const event = insertEvent(kind, surface)
    pruneMetrics()
    return event
  }

  function pruneMetrics() {
    const retention = Number(getSettings().metricRetentionHours || 72)
    const cutoff = new Date(currentDate().getTime() - retention * 3600_000).toISOString()
    db.exec('BEGIN IMMEDIATE')
    try {
      const metrics = db.prepare('DELETE FROM visitor_metrics WHERE bucket < ?').run(cutoff).changes
      const counterSignals = db.prepare('DELETE FROM counter_signal_buckets WHERE bucket < ?').run(cutoff).changes
      db.exec('COMMIT')
      return metrics + counterSignals
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  function getMetrics(hours = getSettings().metricWindowHours) {
    const since = new Date(currentDate().getTime() - Number(hours) * 3600_000).toISOString()
    return db.prepare(`SELECT surface, kind, SUM(count) AS count FROM visitor_metrics
      WHERE bucket >= ? GROUP BY surface, kind ORDER BY count DESC, surface, kind`).all(since)
  }

  function getFieldScore() {
    const metrics = getMetrics()
    const totals = Object.fromEntries([...EVENT_KINDS].map(kind => [kind, 0]))
    for (const metric of metrics) totals[metric.kind] = (totals[metric.kind] || 0) + Number(metric.count)
    const state = db.prepare(`SELECT active_lure AS activeLure, suppressed_lure AS suppressedLure,
      revision, updated_at AS updatedAt, last_refusal_mutation_at AS lastRefusalMutationAt
      FROM field_state WHERE id = 1`).get()
    const approach = totals.arrival + totals.threshold + totals.artwork_open + totals.return
    const attention = totals.dwell_short + (totals.dwell_long * 2)
    return {
      schemaVersion: 1,
      revision: Number(state.revision),
      phase: state.suppressedLure ? 'counter-read' : 'lure',
      activeLure: LURE_REPERTOIRE.includes(state.activeLure) ? state.activeLure : LURE_REPERTOIRE[0],
      suppressedLure: LURE_REPERTOIRE.includes(state.suppressedLure) ? state.suppressedLure : null,
      density: clamp(3 + Math.floor(Math.sqrt(approach + attention)), 3, 12),
      tempoBpm: clamp(24 + (approach * 2) + attention - (totals.refusal * 3), 18, 72),
      tiltDegrees: clamp((totals.threshold - totals.dwell_long) * 3, -24, 24),
      aggregateBasis: { approach, attention, refusal: totals.refusal },
      repertoire: [...LURE_REPERTOIRE],
      updatedAt: state.updatedAt,
      counterActionPolicy: {
        refractorySeconds: REFUSAL_REFRACTORY_MS / 1000,
        lastAppliedAt: state.lastRefusalMutationAt,
        nextEligibleAt: state.lastRefusalMutationAt
          ? new Date(Date.parse(state.lastRefusalMutationAt) + REFUSAL_REFRACTORY_MS).toISOString()
          : null,
        basis: 'Anonymous refusal pressure is counted in aggregate, while the public repertoire can advance at most once per refractory interval.',
      },
    }
  }

  function refuseLure({ surface = 'public' } = {}) {
    const requestedAt = currentDate()
    const bucket = isoHour(requestedAt)
    let changed = false
    let appliedAt = null
    let nextEligibleAt = null
    db.exec('BEGIN IMMEDIATE')
    try {
      const current = db.prepare(`SELECT active_lure AS activeLure, revision,
        last_refusal_mutation_at AS lastRefusalMutationAt FROM field_state WHERE id = 1`).get()
      const lastAppliedMs = current.lastRefusalMutationAt ? Date.parse(current.lastRefusalMutationAt) : null
      changed = lastAppliedMs === null || requestedAt.getTime() >= lastAppliedMs + REFUSAL_REFRACTORY_MS
      if (changed) {
        const currentIndex = Math.max(0, LURE_REPERTOIRE.indexOf(current.activeLure))
        const nextLure = LURE_REPERTOIRE[(currentIndex + 1) % LURE_REPERTOIRE.length]
        appliedAt = requestedAt.toISOString()
        db.prepare(`UPDATE field_state SET active_lure = ?, suppressed_lure = ?, revision = ?,
          updated_at = ?, last_refusal_mutation_at = ? WHERE id = 1`)
          .run(nextLure, current.activeLure, Number(current.revision) + 1, appliedAt, appliedAt)
      } else {
        appliedAt = current.lastRefusalMutationAt
      }
      nextEligibleAt = new Date(Date.parse(appliedAt) + REFUSAL_REFRACTORY_MS).toISOString()
      insertEvent('refusal', surface)
      db.prepare(`INSERT INTO counter_signal_buckets (
        bucket, accepted_count, applied_count, deferred_count
      ) VALUES (?, 1, ?, ?)
      ON CONFLICT(bucket) DO UPDATE SET
        accepted_count = accepted_count + 1,
        applied_count = applied_count + excluded.applied_count,
        deferred_count = deferred_count + excluded.deferred_count`)
        .run(bucket, changed ? 1 : 0, changed ? 0 : 1)
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    pruneMetrics()
    return {
      changed,
      deferred: !changed,
      fieldScore: getFieldScore(),
      counterAction: {
        requestedAt: requestedAt.toISOString(),
        appliedAt,
        nextEligibleAt,
        refractorySeconds: REFUSAL_REFRACTORY_MS / 1000,
        basis: changed
          ? 'This request advanced the public repertoire once.'
          : 'The refusal was counted as aggregate pressure, but repertoire rotation was deferred inside the shared refractory interval.',
      },
    }
  }

  function createCycle({ id, trigger, status = 'running', model, outputTokenBudget = getSettings().maxOutputTokens, startedAt = currentDate().toISOString() }) {
    const dailyCycleLimit = Number(getSettings().dailyCycleLimit)
    const dayStart = `${currentDate().toISOString().slice(0, 10)}T00:00:00.000Z`
    const attemptsToday = Number(db.prepare('SELECT COUNT(*) AS count FROM cycles WHERE started_at >= ?').get(dayStart).count)
    if (attemptsToday >= dailyCycleLimit) throw new Error(`Daily cycle budget exhausted (${dailyCycleLimit} attempts per UTC day)`)
    db.prepare(`INSERT INTO cycles (
      id, trigger, status, model, usage, latency_ms, output_token_budget, started_at
    ) VALUES (?, ?, ?, ?, '{}', NULL, ?, ?)`).run(id, trigger, status, model, outputTokenBudget, startedAt)
    return id
  }

  function completeCycle(id, { status, summary = '', responseId = null, error = null, usage = null, latencyMs = null }) {
    db.prepare('UPDATE cycles SET status = ?, summary = ?, response_id = ?, error = ?, usage = ?, latency_ms = ?, completed_at = ? WHERE id = ?')
      .run(status, summary, responseId, error, JSON.stringify(usage || {}), latencyMs, currentDate().toISOString(), id)
  }

  function createArtwork(input) {
    db.prepare(`INSERT INTO artworks (
      id, cycle_id, title, medium, proposition, public_description, visitor_relation,
      exhibition_form, learning_question, lure_hypothesis, counter_reading, materials,
      model, status, provenance, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(input.id, input.cycleId, input.title, input.medium, input.proposition, input.publicDescription,
        input.visitorRelation, input.exhibitionForm, input.learningQuestion, input.lureHypothesis,
        input.counterReading, JSON.stringify(input.materials || []), input.model, input.status,
        JSON.stringify(input.provenance || {}), input.createdAt || currentDate().toISOString())
    return input.id
  }

  function createArtworkRelation({ fromArtworkId, toArtworkId, kind, evidence, createdAt = currentDate().toISOString() }) {
    if (!ARTWORK_RELATION_KINDS.has(kind)) throw new Error('Invalid artwork relation kind')
    if (!fromArtworkId || !toArtworkId || fromArtworkId === toArtworkId) throw new Error('Artwork relation requires two distinct works')
    const normalizedEvidence = typeof evidence === 'string' ? evidence.trim() : ''
    if (normalizedEvidence.length < 20 || normalizedEvidence.length > 500) throw new Error('Artwork relation requires concise evidence')
    db.prepare(`INSERT OR IGNORE INTO artwork_relations (
      from_artwork_id, to_artwork_id, relation_kind, evidence, created_at
    ) VALUES (?, ?, ?, ?, ?)`).run(fromArtworkId, toArtworkId, kind, normalizedEvidence, createdAt)
  }

  function linkArtworkContext(artworkId, provenance) {
    const contextWorks = provenance?.inputSummary?.recentArtworkSummary
    if (!Array.isArray(contextWorks)) return
    const existingIds = new Set(db.prepare('SELECT id FROM artworks').all().map(row => row.id))
    for (const context of contextWorks) {
      if (!existingIds.has(context?.id) || context.id === artworkId) continue
      createArtworkRelation({
        fromArtworkId: artworkId,
        toArtworkId: context.id,
        kind: 'context-derived-from',
        evidence: 'The earlier work’s title and publication state were present in the bounded composition context; this does not imply approval, authorship, or aesthetic descent.',
      })
    }
  }

  function commitArtworkCycle(cycleId, input, { summary, responseId = null, usage = null, latencyMs = null }) {
    db.exec('BEGIN IMMEDIATE')
    try {
      createArtwork({ ...input, cycleId })
      linkArtworkContext(input.id, input.provenance)
      completeCycle(cycleId, { status: 'completed', summary, responseId, usage, latencyMs })
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  function backfillCuratorialDecisions() {
    const insert = db.prepare(`INSERT OR IGNORE INTO curatorial_decisions (
      id, artwork_id, decision_kind, previous_status, resulting_status, rationale, actor_role, created_at
    ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`)
    for (const row of db.prepare('SELECT id, status, provenance FROM artworks').all()) {
      const review = parseObject(row.provenance).review || {}
      const rationale = typeof review.rationale === 'string' ? review.rationale.trim() : ''
      if (!['approved', 'rejected', 'returned_for_revision'].includes(review.decision) || !review.reviewedAt || !rationale) continue
      const exists = db.prepare(`SELECT 1 FROM curatorial_decisions
        WHERE artwork_id = ? AND decision_kind = ? AND created_at = ?`).get(row.id, review.decision, review.reviewedAt)
      if (exists) continue
      insert.run(
        `curatorial-decision:provenance:${row.id}:${review.reviewedAt}`,
        row.id,
        review.decision,
        row.status,
        rationale,
        typeof review.reviewedBy === 'string' && review.reviewedBy.trim() ? review.reviewedBy.trim().slice(0, 80) : 'operator',
        review.reviewedAt,
      )
    }
  }

  function setArtworkStatus(id, status, { reason = null, reviewedBy = 'operator' } = {}) {
    if (!ARTWORK_STATUSES.has(status)) throw new Error('Invalid artwork status')
    db.exec('BEGIN IMMEDIATE')
    try {
      const current = db.prepare('SELECT status, provenance FROM artworks WHERE id = ?').get(id)
      if (!current) throw new Error('Artwork not found')
      if (current.status === status) throw new ArtworkStatusConflictError(status)
      const provenance = parseObject(current.provenance)
      const normalizedReason = typeof reason === 'string' ? reason.trim() : ''
      if (!normalizedReason) throw new Error('Curatorial rationale required before approving, rejecting, or returning a candidate for revision')
      if (normalizedReason.length > 2000) throw new Error('Curatorial rationale must be 2,000 characters or fewer')
      const actorRole = typeof reviewedBy === 'string' ? reviewedBy.trim() : ''
      if (!actorRole || actorRole.length > 80) throw new Error('Invalid curatorial actor role')
      const decision = status === 'published' ? 'approved' : status === 'archived' ? 'rejected' : 'returned_for_revision'
      const reviewedAt = currentDate().toISOString()
      const updatedProvenance = {
        ...provenance,
        review: {
          ...(provenance.review || {}),
          status,
          decision,
          rationale: normalizedReason || null,
          rejectionReason: status === 'archived' ? normalizedReason : null,
          reviewedAt,
          reviewedBy: actorRole,
        },
      }
      const record = {
        id: `curatorial-decision:${randomUUID()}`,
        artworkId: id,
        kind: decision,
        previousStatus: current.status,
        resultingStatus: status,
        rationale: normalizedReason,
        actorRole,
        createdAt: reviewedAt,
      }
      const result = db.prepare('UPDATE artworks SET status = ?, provenance = ? WHERE id = ?').run(status, JSON.stringify(updatedProvenance), id)
      if (result.changes !== 1) throw new Error('Artwork not found')
      db.prepare(`INSERT INTO curatorial_decisions (
        id, artwork_id, decision_kind, previous_status, resulting_status, rationale, actor_role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        record.id, record.artworkId, record.kind, record.previousStatus, record.resultingStatus,
        record.rationale, record.actorRole, record.createdAt,
      )
      db.exec('COMMIT')
      return record
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  function listArtworks({ publicOnly = false, limit = 30 } = {}) {
    const rows = publicOnly
      ? db.prepare('SELECT * FROM artworks WHERE status = ? ORDER BY created_at DESC LIMIT ?').all('published', limit)
      : db.prepare('SELECT * FROM artworks ORDER BY created_at DESC LIMIT ?').all(limit)
    return rows.map(row => ({
      id: row.id, cycleId: row.cycle_id, title: row.title, medium: row.medium,
      proposition: row.proposition, publicDescription: row.public_description,
      visitorRelation: row.visitor_relation, exhibitionForm: row.exhibition_form,
      learningQuestion: row.learning_question, lureHypothesis: row.lure_hypothesis,
      counterReading: row.counter_reading, materials: parseValue(row.materials),
      model: row.model, status: row.status, provenance: parseObject(row.provenance), createdAt: row.created_at,
    }))
  }

  function listArtworkRelations(limit = 120) {
    return db.prepare(`SELECT relation.from_artwork_id AS fromArtworkId,
      source.title AS fromTitle, source.status AS fromStatus,
      relation.to_artwork_id AS toArtworkId, context.title AS toTitle, context.status AS toStatus,
      relation.relation_kind AS kind, relation.evidence, relation.created_at AS createdAt
      FROM artwork_relations relation
      JOIN artworks source ON source.id = relation.from_artwork_id
      JOIN artworks context ON context.id = relation.to_artwork_id
      ORDER BY relation.created_at DESC, relation.from_artwork_id, relation.to_artwork_id LIMIT ?`).all(limit)
  }

  function listProjectedArtworkRelations(artworkIds, limit = TOPOLOGY_RELATION_LIMIT) {
    if (!artworkIds.length) return []
    const placeholders = artworkIds.map(() => '?').join(', ')
    return db.prepare(`SELECT relation.from_artwork_id AS fromArtworkId,
      source.title AS fromTitle, source.status AS fromStatus,
      relation.to_artwork_id AS toArtworkId, context.title AS toTitle, context.status AS toStatus,
      relation.relation_kind AS kind, relation.evidence, relation.created_at AS createdAt
      FROM artwork_relations relation
      JOIN artworks source ON source.id = relation.from_artwork_id
      JOIN artworks context ON context.id = relation.to_artwork_id
      WHERE relation.from_artwork_id IN (${placeholders})
        AND relation.to_artwork_id IN (${placeholders})
      ORDER BY relation.created_at DESC, relation.from_artwork_id, relation.to_artwork_id
      LIMIT ?`).all(...artworkIds, ...artworkIds, limit)
  }

  function countProjectedArtworkRelations(artworkIds) {
    if (!artworkIds.length) return 0
    const placeholders = artworkIds.map(() => '?').join(', ')
    return Number(db.prepare(`SELECT COUNT(*) AS count FROM artwork_relations
      WHERE from_artwork_id IN (${placeholders})
        AND to_artwork_id IN (${placeholders})`).get(...artworkIds, ...artworkIds).count)
  }

  function listProjectedCuratorialDecisions(artworkIds, limit = TOPOLOGY_DECISION_LIMIT) {
    if (!artworkIds.length || limit <= 0) return []
    const placeholders = artworkIds.map(() => '?').join(', ')
    return db.prepare(`SELECT decision.id, decision.artwork_id AS artworkId,
      artwork.title AS artworkTitle, artwork.status AS artworkStatus,
      decision.decision_kind AS kind, decision.previous_status AS previousStatus,
      decision.resulting_status AS resultingStatus, decision.rationale,
      decision.actor_role AS actorRole, decision.created_at AS createdAt
      FROM curatorial_decisions decision
      JOIN artworks artwork ON artwork.id = decision.artwork_id
      WHERE decision.artwork_id IN (${placeholders})
      ORDER BY decision.created_at DESC, decision.id DESC LIMIT ?`).all(...artworkIds, limit)
  }

  function countProjectedCuratorialDecisions(artworkIds) {
    if (!artworkIds.length) return 0
    const placeholders = artworkIds.map(() => '?').join(', ')
    return Number(db.prepare(`SELECT COUNT(*) AS count FROM curatorial_decisions
      WHERE artwork_id IN (${placeholders})`).get(...artworkIds).count)
  }

  function listProjectedCounterSignals(limit = TOPOLOGY_COUNTER_SIGNAL_LIMIT) {
    const retentionHours = Number(getSettings().metricRetentionHours || 72)
    const cutoff = new Date(currentDate().getTime() - retentionHours * 3600_000).toISOString()
    return db.prepare(`SELECT bucket, accepted_count AS acceptedCount, applied_count AS appliedCount,
      deferred_count AS deferredCount FROM counter_signal_buckets
      WHERE bucket >= ? ORDER BY bucket DESC LIMIT ?`).all(cutoff, limit).map(signal => ({
        ...signal,
        acceptedCount: Number(signal.acceptedCount),
        appliedCount: Number(signal.appliedCount),
        deferredCount: Number(signal.deferredCount),
        expiresAt: new Date(Date.parse(signal.bucket) + retentionHours * 3600_000).toISOString(),
      }))
  }

  function getEcosystemTopology() {
    const artworkNodes = listArtworks({ limit: TOPOLOGY_NODE_LIMIT }).map(work => ({
      id: work.id,
      nodeType: 'artwork',
      title: work.title,
      status: work.status,
      origin: work.cycleId ? 'composition-cycle' : 'human-seed',
      cycleId: work.cycleId,
      createdAt: work.createdAt,
    }))
    const artworkIds = artworkNodes.map(node => node.id)
    const fieldScore = getFieldScore()
    const runtimeFieldNode = {
      id: 'runtime-public-field',
      nodeType: 'runtime-field',
      title: 'Public field repertoire',
      status: fieldScore.phase,
      origin: 'bounded-runtime-state',
      cycleId: null,
      createdAt: fieldScore.updatedAt,
      revision: fieldScore.revision,
    }
    const physicalBridge = simulatePhysicalBridge(fieldScore)
    const physicalOutputNode = {
      id: physicalBridge.id,
      nodeType: 'physical-output',
      title: 'Simulated light / sound frame',
      status: physicalBridge.status,
      origin: 'deterministic-simulator',
      cycleId: null,
      createdAt: fieldScore.updatedAt,
      output: {
        light: physicalBridge.light,
        sound: physicalBridge.sound,
        inputDigest: physicalBridge.evidence.inputDigest,
      },
    }
    const physicalOutputRelation = {
      fromNodeId: runtimeFieldNode.id,
      fromTitle: runtimeFieldNode.title,
      fromStatus: runtimeFieldNode.status,
      fromType: 'runtime-field',
      toNodeId: physicalOutputNode.id,
      toTitle: physicalOutputNode.title,
      toStatus: physicalOutputNode.status,
      toType: 'physical-output',
      kind: 'simulated-as',
      evidence: 'The validated bounded field score deterministically produced this simulator frame. Transport is disabled and no light, speaker, controller, or other hardware was contacted.',
      createdAt: fieldScore.updatedAt,
    }
    const counterSignals = listProjectedCounterSignals()
    const counterSignalNodes = counterSignals.map(signal => ({
      id: `counter-signal:${signal.bucket}`,
      nodeType: 'counter-signal',
      title: `Aggregate counter-signal · ${signal.bucket.slice(0, 13)}:00Z`,
      status: 'retained-aggregate',
      origin: 'hourly-aggregate',
      cycleId: null,
      createdAt: signal.bucket,
      expiresAt: signal.expiresAt,
      aggregate: {
        acceptedRefusals: signal.acceptedCount,
        appliedRevisions: signal.appliedCount,
        deferredRevisions: signal.deferredCount,
      },
    }))
    const counterSignalRelations = counterSignals.map(signal => ({
      fromNodeId: `counter-signal:${signal.bucket}`,
      fromTitle: `Aggregate counter-signal · ${signal.bucket.slice(0, 13)}:00Z`,
      fromStatus: 'retained aggregate',
      fromType: 'counter-signal',
      toNodeId: runtimeFieldNode.id,
      toTitle: runtimeFieldNode.title,
      toStatus: runtimeFieldNode.status,
      toType: 'runtime-field',
      kind: 'counter-to',
      evidence: `${signal.acceptedCount} accepted refusal${signal.acceptedCount === 1 ? '' : 's'} in this hourly bucket; ${signal.appliedCount} public-field revision${signal.appliedCount === 1 ? '' : 's'} applied and ${signal.deferredCount} deferred. This aggregate does not identify or distinguish visitors.`,
      createdAt: signal.bucket,
      expiresAt: signal.expiresAt,
    }))
    const decisionLimit = Math.min(TOPOLOGY_DECISION_LIMIT, Math.max(0, TOPOLOGY_RELATION_LIMIT - counterSignalRelations.length - 1))
    const curatorialDecisions = listProjectedCuratorialDecisions(artworkIds, decisionLimit)
    const curatorialDecisionNodes = curatorialDecisions.map(decision => ({
      id: decision.id,
      nodeType: 'curatorial-decision',
      title: `Curatorial ${decision.kind.replaceAll('_', ' ')} · ${decision.artworkTitle}`,
      status: decision.kind,
      origin: decision.id.startsWith('curatorial-decision:provenance:') ? 'provenance-import' : 'operator-curatorial-gate',
      cycleId: null,
      createdAt: decision.createdAt,
      governance: {
        artworkId: decision.artworkId,
        previousStatus: decision.previousStatus,
        resultingStatus: decision.resultingStatus,
        actorRole: decision.actorRole,
        rationale: decision.rationale,
      },
    }))
    const curatorialDecisionRelations = curatorialDecisions.map(decision => ({
      fromNodeId: decision.id,
      fromTitle: `Curatorial ${decision.kind.replaceAll('_', ' ')}`,
      fromStatus: decision.kind,
      fromType: 'curatorial-decision',
      toNodeId: decision.artworkId,
      toTitle: decision.artworkTitle,
      toStatus: decision.artworkStatus,
      toType: 'artwork',
      kind: decision.kind.replaceAll('_', '-'),
      evidence: `${decision.actorRole} recorded this bounded curatorial decision with rationale: ${decision.rationale} The record does not make comparison authoritative or prove reviewer identity.`,
      createdAt: decision.createdAt,
    }))
    const artworkRelationLimit = Math.max(0, TOPOLOGY_RELATION_LIMIT - counterSignalRelations.length - curatorialDecisionRelations.length - 1)
    const artworkRelations = listProjectedArtworkRelations(artworkIds, artworkRelationLimit).map(relation => ({
      ...relation,
      fromNodeId: relation.fromArtworkId,
      fromType: 'artwork',
      toNodeId: relation.toArtworkId,
      toType: 'artwork',
    }))
    const nodes = [runtimeFieldNode, physicalOutputNode, ...counterSignalNodes, ...curatorialDecisionNodes, ...artworkNodes]
    const relations = [physicalOutputRelation, ...counterSignalRelations, ...curatorialDecisionRelations, ...artworkRelations]
    const totalArtworkNodes = Number(db.prepare('SELECT COUNT(*) AS count FROM artworks').get().count)
    const counterSignalCutoff = new Date(currentDate().getTime() - Number(getSettings().metricRetentionHours || 72) * 3600_000).toISOString()
    const totalCounterSignalNodes = Number(db.prepare('SELECT COUNT(*) AS count FROM counter_signal_buckets WHERE bucket >= ?').get(counterSignalCutoff).count)
    const totalArtworkRelations = Number(db.prepare('SELECT COUNT(*) AS count FROM artwork_relations').get().count)
    const totalCuratorialDecisionNodes = Number(db.prepare('SELECT COUNT(*) AS count FROM curatorial_decisions').get().count)
    const totalRelations = 1 + totalArtworkRelations + totalCounterSignalNodes + totalCuratorialDecisionNodes
    const eligibleArtworkRelations = countProjectedArtworkRelations(artworkIds)
    const eligibleCounterSignalRelations = totalCounterSignalNodes
    const eligibleCuratorialDecisionRelations = countProjectedCuratorialDecisions(artworkIds)
    const eligibleRelations = 1 + eligibleArtworkRelations + eligibleCounterSignalRelations + eligibleCuratorialDecisionRelations
    const totalNodes = 2 + totalArtworkNodes + totalCounterSignalNodes + totalCuratorialDecisionNodes
    const statusCounts = { studio: 0, published: 0, archived: 0 }
    for (const node of artworkNodes) statusCounts[node.status] = (statusCounts[node.status] || 0) + 1
    return {
      schemaVersion: 5,
      nodes,
      relations,
      statusCounts,
      nodeTypeCounts: { artwork: artworkNodes.length, runtimeField: 1, physicalOutput: 1, counterSignal: counterSignalNodes.length, curatorialDecision: curatorialDecisionNodes.length },
      projection: {
        nodeLimit: TOPOLOGY_NODE_LIMIT,
        counterSignalNodeLimit: TOPOLOGY_COUNTER_SIGNAL_LIMIT,
        curatorialDecisionNodeLimit: TOPOLOGY_DECISION_LIMIT,
        relationLimit: TOPOLOGY_RELATION_LIMIT,
        totalNodes,
        totalArtworkNodes,
        totalCounterSignalNodes,
        totalCuratorialDecisionNodes,
        totalRelations,
        eligibleRelations,
        nodesTruncated: totalArtworkNodes > artworkNodes.length || totalCounterSignalNodes > counterSignalNodes.length || totalCuratorialDecisionNodes > curatorialDecisionNodes.length,
        relationsTruncated: eligibleRelations > relations.length,
        scope: 'The bounded runtime field, its current simulator-only physical output, newest work nodes, newest retained hourly counter-signals, and newest eligible curatorial decisions are projected together. A relation appears only when both endpoint nodes are in this bounded projection.',
      },
      counterSignalPolicy: {
        aggregation: 'At most one node per UTC hour. It contains accepted, applied, and deferred totals only.',
        retentionHours: Number(getSettings().metricRetentionHours || 72),
        privacyLimit: 'No request timestamp, sequence, surface, IP address, cookie, fingerprint, free text, visitor identifier, or inferred trait is stored in this ledger.',
      },
      curatorialDecisionPolicy: {
        authority: 'New decisions are appended only inside the authenticated Operator status transaction and carry their rationale and Operator role. Existing non-pending provenance reviews are imported once as historical records.',
        limit: 'The record shows an Operator action, not proof of reviewer identity or deliberative quality. Selecting works for comparison creates no record and changes no artwork state.',
      },
      physicalOutputPolicy: {
        contract: physicalBridge.contract,
        boundary: 'This is a deterministic read projection with transport disabled. It records no sensor stream or visitor trace and performs no real hardware action.',
        fallback: physicalBridge.safety.fallback,
      },
      boundary: 'Relations record explicit composition context, aggregate public counter-pressure, a recorded curatorial decision, or a simulator-only output. They do not claim aesthetic similarity, authorship, autonomous approval, hardware liveness, or knowledge about a visitor.',
    }
  }

  function listCycles(limit = 20) {
    return db.prepare(`SELECT id, trigger, status, model, summary, response_id AS responseId,
      error, usage, latency_ms AS latencyMs, output_token_budget AS outputTokenBudget,
      started_at AS startedAt, completed_at AS completedAt FROM cycles ORDER BY started_at DESC LIMIT ?`).all(limit)
      .map(cycle => ({ ...cycle, usage: parseObject(cycle.usage) }))
  }

  function getComputeLedger() {
    const settings = getSettings()
    const periodStart = `${currentDate().toISOString().slice(0, 10)}T00:00:00.000Z`
    const cycles = db.prepare(`SELECT status, model, usage, latency_ms AS latencyMs
      FROM cycles WHERE started_at >= ? ORDER BY started_at`).all(periodStart)
    const usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, recordedCycles: 0 }
    const models = {}
    const latencies = []
    for (const cycle of cycles) {
      models[cycle.model] = (models[cycle.model] || 0) + 1
      const recorded = parseObject(cycle.usage)
      if (Object.keys(recorded).length) usage.recordedCycles += 1
      usage.inputTokens += Number(recorded.input_tokens || 0)
      usage.outputTokens += Number(recorded.output_tokens || 0)
      usage.totalTokens += Number(recorded.total_tokens || 0)
      if (Number.isInteger(cycle.latencyMs) && cycle.latencyMs >= 0) latencies.push(cycle.latencyMs)
    }
    const attempts = cycles.length
    return {
      periodStart,
      attempts,
      completed: cycles.filter(cycle => cycle.status === 'completed').length,
      failed: cycles.filter(cycle => ['failed', 'abandoned'].includes(cycle.status)).length,
      running: cycles.filter(cycle => cycle.status === 'running').length,
      models: Object.entries(models).map(([model, count]) => ({ model, count })),
      usage,
      latency: {
        recordedCycles: latencies.length,
        averageMs: latencies.length ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length) : null,
      },
      budget: {
        dailyCycleLimit: settings.dailyCycleLimit,
        remainingCycles: Math.max(0, settings.dailyCycleLimit - attempts),
        maxOutputTokensPerCycle: settings.maxOutputTokens,
      },
      costBasis: 'Token usage is exact when returned by the provider. Currency cost is not estimated because external model pricing may change.',
    }
  }

  function getRuntimeContinuity({ at = currentDate() } = {}) {
    const assessedAt = new Date(at)
    if (Number.isNaN(assessedAt.getTime())) throw new Error('Invalid runtime assessment time')
    const settings = getSettings()
    const field = db.prepare('SELECT revision, updated_at AS updatedAt FROM field_state WHERE id = 1').get()
    const latestMetric = db.prepare('SELECT MAX(bucket) AS observedAt FROM visitor_metrics').get()
    const latestCycle = db.prepare(`SELECT status, started_at AS startedAt, completed_at AS completedAt
      FROM cycles ORDER BY COALESCE(completed_at, started_at) DESC LIMIT 1`).get()
    const cycleSetting = db.prepare("SELECT updated_at AS updatedAt FROM settings WHERE key = 'cycleEnabled'").get()
    const evidence = []
    if (latestMetric?.observedAt) evidence.push({ kind: 'aggregate-event-bucket', observedAt: latestMetric.observedAt })
    if (Number(field.revision) > 0) evidence.push({ kind: 'public-field-revision', observedAt: field.updatedAt })
    if (latestCycle) evidence.push({
      kind: 'composition-cycle',
      status: latestCycle.status,
      observedAt: latestCycle.completedAt || latestCycle.startedAt,
    })
    evidence.sort((left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt))
    const latest = evidence[0] || null
    const ageMinutes = latest
      ? Math.max(0, Math.floor((assessedAt.getTime() - Date.parse(latest.observedAt)) / 60_000))
      : null
    const stale = ageMinutes !== null && ageMinutes > RUNTIME_STALE_AFTER_MINUTES
    let state
    let basis
    let updatedAt = latest?.observedAt || field.updatedAt

    if (!settings.cycleEnabled) {
      state = 'disabled'
      basis = 'The stored operator setting disables composition cycles; existing public field traces may still be readable.'
      updatedAt = cycleSetting.updatedAt
    } else if (!stale && latest?.kind === 'composition-cycle' && ['failed', 'abandoned'].includes(latest.status)) {
      state = 'failed'
      basis = `The newest stored runtime evidence is a ${latest.status} composition cycle.`
    } else if (!latest) {
      state = 'quiet'
      basis = 'The field is initialized, but no aggregate public event, field revision, or composition attempt is recorded.'
    } else if (stale) {
      state = 'stale'
      basis = `The newest stored runtime evidence is older than the local ${RUNTIME_STALE_AFTER_MINUTES}-minute freshness threshold.`
    } else {
      state = 'active'
      basis = `Recent stored evidence is present from ${latest.kind.replaceAll('-', ' ')}${latest.status ? ` (${latest.status})` : ''}.`
    }

    return {
      schemaVersion: 1,
      state,
      basis,
      observedAt: latest?.observedAt || null,
      updatedAt,
      assessedAt: assessedAt.toISOString(),
      ageMinutes,
      evidence: latest,
      freshnessPolicy: `Records older than ${RUNTIME_STALE_AFTER_MINUTES} minutes are labelled stale. This is a local policy for hourly aggregate buckets, not a sector standard.`,
      limit: 'This stored summary cannot verify that a server, sensor, or physical installation is currently live.',
    }
  }

  function getPublicTraceLifecycles(limit = PUBLIC_TRACE_LIMIT) {
    const boundedLimit = clamp(Number.isInteger(limit) ? limit : PUBLIC_TRACE_LIMIT, 1, PUBLIC_TRACE_LIMIT)
    const defaultMetricWindowHours = Number(getSettings().metricWindowHours)
    const rows = db.prepare(`SELECT artwork.*, cycle.trigger AS cycle_trigger,
      cycle.status AS cycle_status, cycle.model AS cycle_model,
      cycle.started_at AS cycle_started_at, cycle.completed_at AS cycle_completed_at
      FROM artworks artwork
      JOIN cycles cycle ON cycle.id = artwork.cycle_id
      ORDER BY artwork.created_at DESC LIMIT ?`).all(boundedLimit)
    const latestDecision = db.prepare(`SELECT id, decision_kind AS kind,
      previous_status AS previousStatus, resulting_status AS resultingStatus,
      rationale, actor_role AS actorRole, created_at AS createdAt
      FROM curatorial_decisions WHERE artwork_id = ?
      ORDER BY created_at DESC, id DESC LIMIT 1`)

    const traces = rows.map(row => {
      const provenance = parseObject(row.provenance)
      const inputSummary = parseObject(provenance.inputSummary)
      const aggregateByKind = new Map()
      for (const metric of Array.isArray(inputSummary.aggregateEventSummary) ? inputSummary.aggregateEventSummary : []) {
        if (!EVENT_KINDS.has(metric?.kind)) continue
        const count = Number(metric.count)
        if (!Number.isFinite(count) || count < 0) continue
        aggregateByKind.set(metric.kind, (aggregateByKind.get(metric.kind) || 0) + Math.floor(count))
      }
      const aggregateTotals = [...aggregateByKind.entries()]
        .map(([kind, count]) => ({ kind, count }))
        .sort((left, right) => right.count - left.count || left.kind.localeCompare(right.kind))
      const recordedMetricWindowHours = Number(inputSummary.settings?.metricWindowHours)
      const metricWindowHours = Number.isInteger(recordedMetricWindowHours) && recordedMetricWindowHours >= 1 && recordedMetricWindowHours <= 168
        ? recordedMetricWindowHours
        : defaultMetricWindowHours
      const decision = latestDecision.get(row.id) || null
      const outcomeKind = decision?.kind === 'approved'
        ? 'public'
        : decision?.kind === 'rejected'
          ? 'refused'
          : decision?.kind === 'returned_for_revision'
            ? 'returned-for-revision'
            : 'awaiting-curation'
      const observationId = `trace-observation:${row.cycle_id}`
      const interpretationId = `trace-interpretation:${row.id}`
      const decisionId = decision?.id || `trace-decision-pending:${row.id}`
      const outcomeId = `trace-outcome:${row.id}:${outcomeKind}`
      const stages = [
        {
          id: observationId,
          stage: 'observation',
          label: 'Coarse aggregate observation',
          recordedAt: row.cycle_started_at,
          evidence: {
            metricWindowHours,
            totals: aggregateTotals,
          },
          limit: 'Counts are combined by event kind. Source surfaces, request order, exact routes, and visitor-level records are not projected.',
        },
        {
          id: interpretationId,
          stage: 'interpretation',
          label: 'Provisional system interpretation',
          recordedAt: row.created_at,
          evidence: row.lure_hypothesis,
          limit: 'This is a generated artistic hypothesis about aggregate conditions, not evidence of identity, motive, emotion, or understanding.',
        },
        {
          id: row.id,
          stage: 'candidate',
          label: row.title,
          recordedAt: row.created_at,
          evidence: { status: row.status, proposition: row.proposition, counterReading: row.counter_reading },
          limit: 'Composition creates a Studio candidate only; it cannot approve or publish the work.',
        },
        {
          id: decisionId,
          stage: 'decision',
          label: decision ? `Human gate: ${decision.kind.replaceAll('_', ' ')}` : 'Human gate: pending',
          recordedAt: decision?.createdAt || null,
          evidence: decision ? {
            kind: decision.kind,
            previousStatus: decision.previousStatus,
            resultingStatus: decision.resultingStatus,
            rationale: decision.rationale,
            actorRole: decision.actorRole,
          } : { kind: 'pending', rationale: null, actorRole: null },
          limit: 'Only an authenticated, rationale-required Operator action can create a decision. The role label does not prove reviewer identity or deliberative quality.',
        },
        {
          id: outcomeId,
          stage: 'outcome',
          label: outcomeKind.replaceAll('-', ' '),
          recordedAt: decision?.createdAt || row.created_at,
          evidence: { outcome: outcomeKind, artworkStatus: row.status },
          limit: outcomeKind === 'public'
            ? 'Public status follows a recorded human approval; it is not autonomous publication or an exhibition endorsement.'
            : outcomeKind === 'refused'
              ? 'Refusal remains a consequential ecosystem outcome; the candidate is archived rather than silently removed.'
              : 'No public outcome is claimed while the human gate is pending or has returned the work for revision.',
        },
      ]
      const links = [
        { fromId: observationId, toId: interpretationId, kind: 'provisionally-interpreted-as' },
        { fromId: interpretationId, toId: row.id, kind: 'bounded-composition-produced' },
        { fromId: row.id, toId: decisionId, kind: 'submitted-to-human-gate' },
        { fromId: decisionId, toId: outcomeId, kind: 'recorded-as-outcome' },
      ]
      return {
        id: `public-trace:${row.id}`,
        cycle: {
          id: row.cycle_id,
          trigger: row.cycle_trigger,
          status: row.cycle_status,
          model: row.cycle_model,
          startedAt: row.cycle_started_at,
          completedAt: row.cycle_completed_at,
        },
        artworkId: row.id,
        outcome: outcomeKind,
        stages,
        links,
      }
    })
    const total = Number(db.prepare('SELECT COUNT(*) AS count FROM artworks WHERE cycle_id IS NOT NULL').get().count)
    return {
      schemaVersion: 1,
      traces,
      projection: {
        limit: PUBLIC_TRACE_LIMIT,
        total,
        truncated: total > traces.length,
        scope: 'Newest composition cycles that produced an artwork candidate. Failed cycles without a candidate remain in the separate operational cycle ledger.',
      },
      redaction: 'The public lifecycle combines aggregate inputs by event kind and omits source surfaces, request order, exact routes, provider response identifiers, raw errors, hidden model reasoning, and any visitor-level record.',
      authority: 'A composition cycle may create a candidate. Only a recorded human curatorial decision can make its outcome public, refused, or returned for revision.',
    }
  }

  function publicState() {
    const settings = getSettings()
    return {
      identity: { name: 'Ophrys', proposition: 'Attraction without understanding.', organism: 'Autopoiesis installation brain' },
      system: { mode: settings.systemMode, model: settings.model, publicationMode: settings.publicationMode, cycleEnabled: settings.cycleEnabled },
      fieldScore: getFieldScore(), metrics: getMetrics(), artworks: listArtworks({ publicOnly: true, limit: 12 }),
      disclosure: 'Ophrys stores aggregate event counts only. It does not retain faces, voices, identities, demographic classifications, emotions, or individual movement histories.',
    }
  }

  function studioState() {
    const settings = getSettings()
    const fieldScore = getFieldScore()
    return {
      system: { ...settings, curatorialDirective: settings.curatorialDirective },
      runtime: getRuntimeContinuity(), fieldScore, physicalBridge: simulatePhysicalBridge(fieldScore), metrics: getMetrics(), artworks: listArtworks({ limit: 40 }), cycles: listCycles(30), compute: getComputeLedger(), ecosystem: getEcosystemTopology(), lifecycles: getPublicTraceLifecycles(),
      method: ['observe coarse public events', 'separate observation from interpretation', 'compose a provisional lure', 'publish its uncertainty', 'allow refusal to change the repertoire'],
    }
  }

  function publicStudioState() {
    const state = studioState()
    return {
      ...state,
      system: {
        systemMode: state.system.systemMode, model: state.system.model,
        reasoningEffort: state.system.reasoningEffort, publicationMode: state.system.publicationMode,
        cycleEnabled: state.system.cycleEnabled, metricWindowHours: state.system.metricWindowHours,
        promptVersion: 'ophrys-composition-v1',
      },
      cycles: state.cycles.map(cycle => ({ ...cycle, error: cycle.error ? 'Cycle stopped; operator review required.' : null })),
      disclosure: 'Aggregate event summaries may be included in a GPT-5.6 composition request. No personal identifier, raw image, voice, exact route, or individual record is sent.',
    }
  }

  return { db, getSettings, updateSettings, recordEvent, refuseLure, pruneMetrics, getMetrics, getFieldScore, createCycle, completeCycle, createArtwork, createArtworkRelation, commitArtworkCycle, setArtworkStatus, listArtworks, listArtworkRelations, getEcosystemTopology, getPublicTraceLifecycles, listCycles, getComputeLedger, getRuntimeContinuity, publicState, studioState, publicStudioState, close: () => db.close() }
}
