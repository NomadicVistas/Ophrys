function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function date(value) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'open'
}

function metricRow(metric, max) {
  const row = element('div', 'metric-row')
  const name = element('span', '', `${metric.kind.replaceAll('_', ' ')} / ${metric.surface}`)
  const track = element('div', 'metric-track')
  const fill = element('i', 'metric-fill')
  fill.style.width = `${Math.max(3, (Number(metric.count) / max) * 100)}%`
  track.append(fill)
  row.append(name, track, element('strong', '', String(metric.count)))
  return row
}

function cycleRow(cycle) {
  const row = element('article', `cycle-row ${cycle.status}`)
  const index = element('span', 'cycle-state', cycle.status)
  const body = element('div')
  body.append(element('h3', '', cycle.summary || 'Composition in progress'), element('p', '', `${cycle.trigger} / ${cycle.model} / ${date(cycle.startedAt)}`))
  if (cycle.error) body.append(element('p', 'error', cycle.error))
  row.append(index, body)
  return row
}

function artworkRow(work) {
  const article = element('article', 'studio-work')
  const provenance = work.provenance || {}
  const review = provenance.review || {}
  const response = provenance.response || {}
  const head = element('header')
  head.append(element('span', `status ${work.status}`, work.status), element('span', '', date(work.createdAt)))
  article.append(head, element('h3', '', work.title), element('p', 'medium', work.medium), element('p', '', work.proposition))
  const pair = element('div', 'tactic-pair')
  const lure = element('div'); lure.append(element('span', '', 'LURE HYPOTHESIS'), element('p', '', work.lureHypothesis))
  const counter = element('div'); counter.append(element('span', '', 'COUNTER-READING'), element('p', '', work.counterReading))
  pair.append(lure, counter); article.append(pair)
  const provenancePair = element('div', 'tactic-pair')
  const input = element('div')
  const recentTitles = (provenance.inputSummary?.recentArtworkSummary || []).map(item => item.title).filter(Boolean).slice(0, 3)
  const inputPieces = [provenance.promptVersion || 'prompt version unrecorded']
  if (recentTitles.length) inputPieces.push(`recent: ${recentTitles.join(', ')}`)
  if (response.responseId) inputPieces.push(`response: ${response.responseId}`)
  input.append(element('span', '', 'PROMPT / INPUT'), element('p', '', inputPieces.join(' · ')))
  const rights = element('div')
  const usage = response.usage?.total_tokens ?? response.usage?.output_tokens ?? response.usage?.input_tokens ?? null
  const rightsPieces = [provenance.rightsBasis || 'Rights basis unrecorded.']
  if (usage !== null) rightsPieces.push(`usage: ${usage} tokens`)
  rightsPieces.push(`decision: ${review.decision || 'pending'}`)
  if (review.rationale) rightsPieces.push(`rationale: ${review.rationale}`)
  if (review.rejectionReason) rightsPieces.push(`rejection: ${review.rejectionReason}`)
  rights.append(element('span', '', 'RIGHTS / REVIEW'), element('p', '', rightsPieces.join(' · ')))
  provenancePair.append(input, rights)
  article.append(provenancePair)
  return article
}

const status = document.querySelector('#studio-status')

try {
  const response = await fetch('/api/studio/state')
  if (!response.ok) throw new Error(`Studio state failed (${response.status})`)
  const state = await response.json()
  document.querySelector('#mode').textContent = state.system.systemMode
  document.querySelector('#model').textContent = state.system.model
  document.querySelector('#cycle-count').textContent = state.cycles.length
  document.querySelector('#work-count').textContent = state.artworks.length
  document.querySelector('#studio-disclosure').textContent = state.disclosure
  const max = Math.max(1, ...state.metrics.map(item => Number(item.count)))
  document.querySelector('#metrics').replaceChildren(...(state.metrics.length ? state.metrics.map(item => metricRow(item, max)) : [element('p', 'empty', 'No aggregate public events yet.')]))
  document.querySelector('#cycles-list').replaceChildren(...(state.cycles.length ? state.cycles.map(cycleRow) : [element('p', 'empty', 'The first GPT‑5.6 cycle has not run yet.')]))
  document.querySelector('#studio-artworks').replaceChildren(...state.artworks.map(artworkRow))
  document.querySelector('#method-list').replaceChildren(...state.method.map(step => element('li', '', step)))
  status.hidden = true
} catch {
  status.className = 'surface-status error'
  status.textContent = 'The public trace could not be loaded. No system state is being claimed.'
}

fetch('/api/public/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'studio_open', surface: 'studio' }) }).catch(() => {})
