const TOKEN_KEY = 'ophrys-admin-token'
let token = sessionStorage.getItem(TOKEN_KEY) || ''
let state = null
const selectedCandidateIds = new Set()

const loginPanel = document.querySelector('#login-panel')
const adminPanel = document.querySelector('#admin-panel')
const settingsForm = document.querySelector('#settings-form')

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...(options.headers || {}) } })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`)
  return payload
}

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function setForm(settings) {
  for (const [key, value] of Object.entries(settings)) {
    const input = settingsForm.elements.namedItem(key)
    if (!input) continue
    if (input.type === 'checkbox') input.checked = Boolean(value)
    else input.value = String(value)
  }
}

function comparisonField(label, value) {
  const section = element('section', 'comparison-field')
  section.append(element('h4', '', label), element('p', '', value || 'Not recorded'))
  return section
}

async function decideCandidate(work, status, reason) {
  await api(`/api/admin/artworks/${work.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  })
  await load()
}

function comparisonCard(work) {
  const provenance = work.provenance || {}
  const review = provenance.review || {}
  const usage = provenance.response?.usage
  const article = element('article', 'comparison-card')
  const header = element('header')
  header.append(element('span', `status ${work.status}`, work.status), element('h3', '', work.title), element('p', 'medium', work.medium))
  article.append(
    header,
    comparisonField('Proposition', work.proposition),
    comparisonField('Public relation', work.visitorRelation),
    comparisonField('Exhibition form', work.exhibitionForm),
    comparisonField('Learning question', work.learningQuestion),
    comparisonField('Lure hypothesis', work.lureHypothesis),
    comparisonField('Counter-reading', work.counterReading),
    comparisonField('Materials', Array.isArray(work.materials) ? work.materials.join(', ') : String(work.materials || '')),
    comparisonField('Provenance', `${work.model} / ${provenance.promptVersion || 'prompt unrecorded'}${usage ? ` / ${usage.total_tokens ?? 'unknown'} tokens` : ''}`),
    comparisonField('Rights basis', provenance.rightsBasis),
    comparisonField('Current review', review.rationale || review.rejectionReason || review.decision || 'Pending'),
  )

  const form = element('form', 'candidate-decision')
  const label = element('label', '', 'Curatorial rationale')
  const reason = element('textarea')
  reason.name = 'reason'; reason.rows = 4; reason.required = true; reason.maxLength = 2000
  reason.value = review.rationale || review.rejectionReason || ''
  reason.setAttribute('aria-describedby', `decision-help-${work.id}`)
  label.append(reason)
  const help = element('p', 'decision-help', 'Required for approval, rejection, or return for revision. The status update and append-only governance record are written together.')
  help.id = `decision-help-${work.id}`
  const actions = element('div', 'candidate-decision-actions')
  const approve = element('button', 'button signal', 'Approve for publication')
  approve.type = 'submit'; approve.value = 'published'; approve.disabled = work.status === 'published'
  const reject = element('button', 'button', 'Reject and archive')
  reject.type = 'submit'; reject.value = 'archived'; reject.disabled = work.status === 'archived'
  const revise = element('button', 'button', 'Return for revision')
  revise.type = 'submit'; revise.value = 'studio'; revise.disabled = review.decision === 'returned_for_revision'
  actions.append(approve, reject, revise)
  const result = element('p', '', '')
  result.setAttribute('role', 'status'); result.setAttribute('aria-live', 'polite')
  form.append(label, help, actions, result)
  form.addEventListener('submit', async event => {
    event.preventDefault()
    const status = event.submitter?.value
    if (!['published', 'archived', 'studio'].includes(status)) return
    const rationale = reason.value.trim()
    if (!rationale) { result.textContent = 'Enter a curatorial rationale before deciding.'; reason.focus(); return }
    approve.disabled = true; reject.disabled = true; revise.disabled = true; result.textContent = 'Recording decision…'
    try { await decideCandidate(work, status, rationale) }
    catch (error) { result.textContent = error.message; approve.disabled = work.status === 'published'; reject.disabled = work.status === 'archived'; revise.disabled = review.decision === 'returned_for_revision' }
  })
  article.append(form)
  return article
}

function renderComparison() {
  const selected = [...selectedCandidateIds].map(id => state.artworks.find(work => work.id === id)).filter(Boolean)
  const status = document.querySelector('#comparison-selection-status')
  status.textContent = selected.length === 0
    ? 'Select one or two candidates from the queue below.'
    : selected.length === 1
      ? `${selected[0].title} selected. Select one more candidate for side-by-side comparison.`
      : `Comparing ${selected[0].title} with ${selected[1].title}.`
  const workspace = document.querySelector('#candidate-comparison')
  workspace.replaceChildren(...selected.map(comparisonCard))
  if (selected.length === 0) workspace.append(element('p', 'empty', 'No candidates selected.'))
}

function renderComputeLedger(compute) {
  const usageAvailable = compute.usage.recordedCycles > 0
  document.querySelector('#operator-compute-attempts').textContent = `${compute.attempts} / ${compute.budget.dailyCycleLimit}`
  document.querySelector('#operator-compute-remaining').textContent = String(compute.budget.remainingCycles)
  document.querySelector('#operator-input-tokens').textContent = usageAvailable ? String(compute.usage.inputTokens) : 'not returned'
  document.querySelector('#operator-output-tokens').textContent = usageAvailable ? String(compute.usage.outputTokens) : 'not returned'
  document.querySelector('#operator-total-tokens').textContent = usageAvailable ? String(compute.usage.totalTokens) : 'not returned'
  document.querySelector('#operator-compute-latency').textContent = compute.latency.averageMs === null ? 'not recorded' : `${compute.latency.averageMs} ms`
  document.querySelector('#operator-compute-models').textContent = compute.models.length ? compute.models.map(item => `${item.model} × ${item.count}`).join(', ') : state.system.model
  document.querySelector('#operator-output-limit').textContent = `${compute.budget.maxOutputTokensPerCycle} tokens`
  document.querySelector('#operator-compute-basis').textContent = `${compute.costBasis} Maximum ${compute.budget.maxOutputTokensPerCycle} output tokens per attempt.`
}

function labelledList(title, items, describe = item => item) {
  const section = element('section', 'handover-block')
  section.append(element('h3', '', title))
  const list = element('ul')
  for (const item of items) list.append(element('li', '', describe(item)))
  section.append(list)
  return section
}

function renderOperationalHandover(handover) {
  const status = document.querySelector('#operator-handover-status')
  status.textContent = `${handover.record.status.replaceAll('-', ' ')} · ${handover.record.version} · reviewed ${handover.record.reviewedOn}`
  const system = handover.system
  const summary = element('section', 'handover-summary')
  summary.append(
    element('p', 'handover-warning', handover.record.basis),
    element('p', '', `Current configuration: ${system.model} / ${system.reasoningEffort} reasoning / ${system.systemMode} mode / autonomous cycles ${system.cycleEnabled ? 'enabled' : 'disabled'}. Provider request storage is ${system.requestStorage ? 'enabled' : 'disabled (store:false)'}.`),
    element('p', '', handover.record.escalation.instruction),
  )
  const boundaries = labelledList('System boundaries', [
    system.inputBoundary,
    system.outputBoundary,
    system.publicationGate,
    system.physicalBoundary,
    system.refusalBoundary,
  ])
  const roles = labelledList('Responsible roles', handover.roles, item => `${item.role}: ${item.responsibility}`)
  const scenarios = labelledList('Five handover scenarios', handover.scenarios, item => `${item.situation} ${item.expectedAction}`)
  const stops = labelledList('Stop and escalate', handover.stopConditions)
  const review = labelledList('Review this record when', handover.reviewTriggers)
  const privacy = element('p', 'handover-privacy', handover.assessmentBoundary.note)
  document.querySelector('#operator-handover').replaceChildren(summary, boundaries, roles, scenarios, stops, review, privacy)
}

function artworkControl(work) {
  const row = element('article', 'admin-work')
  const provenance = work.provenance || {}
  const review = provenance.review || {}
  const body = element('div')
  body.append(
    element('span', `status ${work.status}`, work.status),
    element('h3', '', work.title),
    element('p', '', work.proposition),
    element('p', '', `Prompt ${provenance.promptVersion || 'unrecorded'} / ${review.decision || 'pending'}`),
  )
  if (provenance.rightsBasis) body.append(element('p', '', provenance.rightsBasis))
  if (review.rationale || review.rejectionReason) body.append(element('p', '', review.rationale || review.rejectionReason))
  const controls = element('div', 'admin-work-actions')
  const compare = element('button', 'text-button', selectedCandidateIds.has(work.id) ? 'Remove from comparison' : 'Compare candidate')
  compare.type = 'button'; compare.setAttribute('aria-pressed', String(selectedCandidateIds.has(work.id)))
  compare.addEventListener('click', () => {
    if (selectedCandidateIds.has(work.id)) selectedCandidateIds.delete(work.id)
    else if (selectedCandidateIds.size < 2) selectedCandidateIds.add(work.id)
    else { document.querySelector('#comparison-selection-status').textContent = 'Two candidates are already selected. Remove one before adding another.'; return }
    document.querySelector('#admin-artworks').replaceChildren(...state.artworks.map(artworkControl))
    renderComparison()
  })
  controls.append(compare)
  row.append(body, controls)
  return row
}

async function load() {
  state = await api('/api/admin/state')
  for (const id of selectedCandidateIds) if (!state.artworks.some(work => work.id === id)) selectedCandidateIds.delete(id)
  loginPanel.hidden = true; adminPanel.hidden = false
  setForm(state.system)
  renderComputeLedger(state.compute)
  renderOperationalHandover(state.operationalHandover)
  document.querySelector('#admin-artworks').replaceChildren(...state.artworks.map(artworkControl))
  renderComparison()
}

document.querySelector('#login-form').addEventListener('submit', async event => {
  event.preventDefault(); token = document.querySelector('#token').value
  try { await load(); sessionStorage.setItem(TOKEN_KEY, token); document.querySelector('#login-error').textContent = '' }
  catch (error) { document.querySelector('#login-error').textContent = error.message }
})

settingsForm.addEventListener('submit', async event => {
  event.preventDefault()
  const values = Object.fromEntries(new FormData(settingsForm))
  values.cycleEnabled = settingsForm.elements.cycleEnabled.checked
  values.explorationRate = Number(values.explorationRate); values.metricWindowHours = Number(values.metricWindowHours); values.metricRetentionHours = Number(values.metricRetentionHours)
  values.dailyCycleLimit = Number(values.dailyCycleLimit); values.maxOutputTokens = Number(values.maxOutputTokens)
  const status = document.querySelector('#settings-status')
  try { await api('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(values) }); status.textContent = 'Saved.'; await load() }
  catch (error) { status.textContent = error.message }
})

document.querySelector('#run-cycle').addEventListener('click', async () => {
  const result = document.querySelector('#cycle-result'); result.textContent = 'GPT‑5.6 is composing…'
  try { result.textContent = JSON.stringify(await api('/api/admin/cycle', { method: 'POST', body: '{}' }), null, 2); await load() }
  catch (error) { result.textContent = error.message }
})

document.querySelector('#logout').addEventListener('click', () => { sessionStorage.removeItem(TOKEN_KEY); token = ''; adminPanel.hidden = true; loginPanel.hidden = false })
if (token) load().catch(() => sessionStorage.removeItem(TOKEN_KEY))
