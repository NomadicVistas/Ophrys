const RUNTIME_STATES = new Set(['active', 'quiet', 'stale', 'disabled', 'failed'])

function canonicalUtcTimestamp(value) {
  if (typeof value !== 'string') return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value
}

export function runtimeHeaderView(runtime, system = {}) {
  const state = RUNTIME_STATES.has(runtime?.state) ? runtime.state : null
  const assessed = canonicalUtcTimestamp(runtime?.assessedAt)
  const evidenceAt = runtime?.observedAt || runtime?.updatedAt
  const evidence = canonicalUtcTimestamp(evidenceAt)
  const basis = typeof runtime?.basis === 'string' && runtime.basis.trim()
  const limit = typeof runtime?.limit === 'string' && runtime.limit.trim()
  const requiresObservedEvidence = state === 'active' || state === 'stale'
  const observed = canonicalUtcTimestamp(runtime?.observedAt)
  const valid = state && assessed && evidence && basis && limit && (!requiresObservedEvidence || observed)

  if (!valid) {
    return {
      state: 'unavailable',
      label: 'Runtime unavailable',
      detail: 'Runtime evidence is unavailable. No live operation is claimed. Open Studio for the evidence ledger.',
    }
  }

  const model = typeof system?.model === 'string' && system.model.trim()
    ? ` Model configured: ${system.model.trim()}. Configuration does not establish that the model is running.`
    : ''
  const observedDetail = runtime.observedAt
    ? ` Latest stored evidence: ${runtime.observedAt}.`
    : ` Latest runtime record: ${runtime.updatedAt}.`

  return {
    state,
    label: `Runtime ${state}`,
    detail: `${runtime.basis} Evidence assessed at ${runtime.assessedAt}.${observedDetail}${model} ${runtime.limit}`,
  }
}

export function renderRuntimeHeader(container, labelNode, detailNode, runtime, system) {
  const view = runtimeHeaderView(runtime, system)
  container.dataset.runtimeState = view.state
  labelNode.textContent = view.label
  detailNode.textContent = view.detail
  return view
}
