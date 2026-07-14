import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

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

export function createOphrysStore(path = process.env.OPHRYS_DB_PATH || 'var/ophrys.sqlite') {
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
      updated_at TEXT NOT NULL
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
    CREATE INDEX IF NOT EXISTS artwork_relations_to ON artwork_relations(to_artwork_id);
    CREATE UNIQUE INDEX IF NOT EXISTS one_active_cycle ON cycles(status) WHERE status = 'running';
  `)
  const artworkColumns = db.prepare('PRAGMA table_info(artworks)').all().map(row => row.name)
  if (!artworkColumns.includes('provenance')) db.exec("ALTER TABLE artworks ADD COLUMN provenance TEXT NOT NULL DEFAULT '{}'")
  const cycleColumns = db.prepare('PRAGMA table_info(cycles)').all().map(row => row.name)
  if (!cycleColumns.includes('usage')) db.exec("ALTER TABLE cycles ADD COLUMN usage TEXT NOT NULL DEFAULT '{}'")
  if (!cycleColumns.includes('latency_ms')) db.exec('ALTER TABLE cycles ADD COLUMN latency_ms INTEGER')
  if (!cycleColumns.includes('output_token_budget')) db.exec('ALTER TABLE cycles ADD COLUMN output_token_budget INTEGER NOT NULL DEFAULT 2600')
  db.prepare("UPDATE cycles SET status = 'abandoned', summary = 'Cycle expired before completion.', completed_at = ? WHERE status = 'running' AND started_at < ?")
    .run(new Date().toISOString(), new Date(Date.now() - 2 * 3600_000).toISOString())

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES (?, ?, ?)')
  const now = new Date().toISOString()
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) insertSetting.run(key, JSON.stringify(value), now)
  db.prepare('INSERT OR IGNORE INTO field_state (id, active_lure, suppressed_lure, revision, updated_at) VALUES (1, ?, NULL, 0, ?)')
    .run(LURE_REPERTOIRE[0], now)

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
      model: 'curatorial seed', status: 'published', createdAt: now,
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
          reviewedAt: now,
          reviewedBy: 'human baseline',
        },
      },
    })
  }

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
    const timestamp = new Date().toISOString()
    for (const [key, value] of Object.entries(patch || {})) statement.run(key, JSON.stringify(value), timestamp)
    return next
  }

  function insertEvent(kind, surface) {
    if (!EVENT_KINDS.has(kind)) throw new Error('Unsupported aggregate event')
    const cleanSurface = String(surface).replace(/[^a-z0-9_/-]/gi, '').slice(0, 80) || 'public'
    db.prepare(`INSERT INTO visitor_metrics (bucket, surface, kind, count) VALUES (?, ?, ?, 1)
      ON CONFLICT(bucket, surface, kind) DO UPDATE SET count = count + 1`).run(isoHour(), cleanSurface, kind)
    return { bucket: isoHour(), surface: cleanSurface, kind }
  }

  function recordEvent({ kind, surface = 'public' }) {
    if (kind === 'refusal') return refuseLure({ surface })
    const event = insertEvent(kind, surface)
    pruneMetrics()
    return event
  }

  function pruneMetrics() {
    const retention = Number(getSettings().metricRetentionHours || 72)
    return db.prepare('DELETE FROM visitor_metrics WHERE bucket < ?').run(new Date(Date.now() - retention * 3600_000).toISOString()).changes
  }

  function getMetrics(hours = getSettings().metricWindowHours) {
    const since = new Date(Date.now() - Number(hours) * 3600_000).toISOString()
    return db.prepare(`SELECT surface, kind, SUM(count) AS count FROM visitor_metrics
      WHERE bucket >= ? GROUP BY surface, kind ORDER BY count DESC, surface, kind`).all(since)
  }

  function getFieldScore() {
    const metrics = getMetrics()
    const totals = Object.fromEntries([...EVENT_KINDS].map(kind => [kind, 0]))
    for (const metric of metrics) totals[metric.kind] = (totals[metric.kind] || 0) + Number(metric.count)
    const state = db.prepare('SELECT active_lure AS activeLure, suppressed_lure AS suppressedLure, revision, updated_at AS updatedAt FROM field_state WHERE id = 1').get()
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
    }
  }

  function refuseLure({ surface = 'public' } = {}) {
    db.exec('BEGIN IMMEDIATE')
    try {
      const current = db.prepare('SELECT active_lure AS activeLure, revision FROM field_state WHERE id = 1').get()
      const currentIndex = Math.max(0, LURE_REPERTOIRE.indexOf(current.activeLure))
      const nextLure = LURE_REPERTOIRE[(currentIndex + 1) % LURE_REPERTOIRE.length]
      const updatedAt = new Date().toISOString()
      db.prepare('UPDATE field_state SET active_lure = ?, suppressed_lure = ?, revision = ?, updated_at = ? WHERE id = 1')
        .run(nextLure, current.activeLure, Number(current.revision) + 1, updatedAt)
      insertEvent('refusal', surface)
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    pruneMetrics()
    return getFieldScore()
  }

  function createCycle({ id, trigger, status = 'running', model, outputTokenBudget = getSettings().maxOutputTokens, startedAt = new Date().toISOString() }) {
    const dailyCycleLimit = Number(getSettings().dailyCycleLimit)
    const dayStart = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`
    const attemptsToday = Number(db.prepare('SELECT COUNT(*) AS count FROM cycles WHERE started_at >= ?').get(dayStart).count)
    if (attemptsToday >= dailyCycleLimit) throw new Error(`Daily cycle budget exhausted (${dailyCycleLimit} attempts per UTC day)`)
    db.prepare(`INSERT INTO cycles (
      id, trigger, status, model, usage, latency_ms, output_token_budget, started_at
    ) VALUES (?, ?, ?, ?, '{}', NULL, ?, ?)`).run(id, trigger, status, model, outputTokenBudget, startedAt)
    return id
  }

  function completeCycle(id, { status, summary = '', responseId = null, error = null, usage = null, latencyMs = null }) {
    db.prepare('UPDATE cycles SET status = ?, summary = ?, response_id = ?, error = ?, usage = ?, latency_ms = ?, completed_at = ? WHERE id = ?')
      .run(status, summary, responseId, error, JSON.stringify(usage || {}), latencyMs, new Date().toISOString(), id)
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
        JSON.stringify(input.provenance || {}), input.createdAt || new Date().toISOString())
    return input.id
  }

  function createArtworkRelation({ fromArtworkId, toArtworkId, kind, evidence, createdAt = new Date().toISOString() }) {
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

  function setArtworkStatus(id, status, { reason = null, reviewedBy = 'operator' } = {}) {
    if (!ARTWORK_STATUSES.has(status)) throw new Error('Invalid artwork status')
    const current = db.prepare('SELECT provenance FROM artworks WHERE id = ?').get(id)
    if (!current) throw new Error('Artwork not found')
    const provenance = parseObject(current.provenance)
    const normalizedReason = typeof reason === 'string' ? reason.trim() : ''
    if (['published', 'archived'].includes(status) && !normalizedReason) {
      throw new Error('Curatorial rationale required before approving or rejecting a candidate')
    }
    const decision = status === 'published' ? 'approved' : status === 'archived' ? 'rejected' : 'returned_for_revision'
    const reviewedAt = new Date().toISOString()
    const updatedProvenance = {
      ...provenance,
      review: {
        ...(provenance.review || {}),
        status,
        decision,
        rationale: normalizedReason || null,
        rejectionReason: status === 'archived' ? normalizedReason : null,
        reviewedAt,
        reviewedBy,
      },
    }
    const result = db.prepare('UPDATE artworks SET status = ?, provenance = ? WHERE id = ?').run(status, JSON.stringify(updatedProvenance), id)
    if (result.changes !== 1) throw new Error('Artwork not found')
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

  function getEcosystemTopology() {
    const nodes = listArtworks({ limit: 40 }).map(work => ({
      id: work.id,
      title: work.title,
      status: work.status,
      origin: work.cycleId ? 'composition-cycle' : 'human-seed',
      cycleId: work.cycleId,
      createdAt: work.createdAt,
    }))
    const statusCounts = { studio: 0, published: 0, archived: 0 }
    for (const node of nodes) statusCounts[node.status] = (statusCounts[node.status] || 0) + 1
    return {
      schemaVersion: 1,
      nodes,
      relations: listArtworkRelations(),
      statusCounts,
      boundary: 'Relations record explicit system context only. They do not claim aesthetic similarity, authorship, autonomous approval, or knowledge about a visitor.',
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
    const periodStart = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`
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
    return {
      system: { ...settings, curatorialDirective: settings.curatorialDirective },
      fieldScore: getFieldScore(), metrics: getMetrics(), artworks: listArtworks({ limit: 40 }), cycles: listCycles(30), compute: getComputeLedger(), ecosystem: getEcosystemTopology(),
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

  return { db, getSettings, updateSettings, recordEvent, refuseLure, pruneMetrics, getMetrics, getFieldScore, createCycle, completeCycle, createArtwork, createArtworkRelation, commitArtworkCycle, setArtworkStatus, listArtworks, listArtworkRelations, getEcosystemTopology, listCycles, getComputeLedger, publicState, studioState, publicStudioState, close: () => db.close() }
}
