const state = await fetch('/api/public/state').then(response => response.json()).catch(() => null)

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function send(kind, surface = 'public') {
  return fetch('/api/public/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, surface }), keepalive: true })
}

function renderField(score) {
  if (!score) return
  const organism = document.querySelector('.organism')
  organism.dataset.lure = score.activeLure
  organism.dataset.phase = score.phase
  organism.style.setProperty('--score-weight', `${(.75 + score.density * .08).toFixed(2)}px`)
  const duration = Math.round(3600 / score.tempoBpm)
  organism.style.setProperty('--score-duration', `${duration}s`)
  organism.style.setProperty('--score-duration-b', `${Math.round(duration * 1.35)}s`)
  organism.style.setProperty('--score-duration-c', `${Math.round(duration * .75)}s`)
  organism.style.setProperty('--score-tilt', `${score.tiltDegrees}deg`)
  document.querySelector('#active-lure').textContent = score.activeLure.replace('-', ' ')
  document.querySelector('#field-basis').textContent = `revision ${score.revision} / density ${score.density} / ${score.tempoBpm} bpm`
}

function artworkCard(work, index) {
  const article = element('article', 'artwork-card')
  article.tabIndex = 0
  article.style.setProperty('--index', index)
  const visual = element('div', 'artwork-visual')
  visual.append(element('span', 'visual-code', String(index + 1).padStart(2, '0')), element('i', 'visual-ring'), element('i', 'visual-line'))
  const meta = element('div', 'artwork-meta')
  meta.append(element('p', 'eyebrow', work.medium), element('h3', '', work.title), element('p', '', work.publicDescription))
  const relation = element('div', 'artwork-relation')
  relation.append(element('span', '', 'PUBLIC QUESTION'), element('p', '', work.learningQuestion))
  meta.append(relation)
  article.append(visual, meta)
  const register = () => send('artwork_open', `artwork/${work.id}`)
  article.addEventListener('click', register, { once: true })
  article.addEventListener('focus', register, { once: true })
  return article
}

const grid = document.querySelector('#artwork-grid')
if (state?.artworks?.length) {
  grid.replaceChildren(...state.artworks.map(artworkCard))
  document.querySelector('#system-status').textContent = `${state.system.mode} / ${state.system.model}`
  document.querySelector('#disclosure-text').textContent = state.disclosure
  renderField(state.fieldScore)
} else {
  grid.replaceChildren(element('p', 'loading', 'The public field is temporarily quiet. Open Studio to inspect the system state.'))
}

document.querySelector('#refuse-lure').addEventListener('click', async event => {
  const button = event.currentTarget
  const result = document.querySelector('#refusal-result')
  button.disabled = true
  result.textContent = 'Suppressing the current lure…'
  try {
    const response = await send('refusal', 'public/counter-control')
    const payload = await response.json()
    if (!response.ok || !payload.fieldScore) throw new Error(payload.error || 'Refusal was not accepted')
    renderField(payload.fieldScore)
    result.textContent = `${payload.fieldScore.suppressedLure.replace('-', ' ')} was suppressed. The field now uses ${payload.fieldScore.activeLure.replace('-', ' ')}.`
  } catch {
    result.textContent = 'The refusal control could not reach the field. No change was claimed.'
  } finally {
    button.disabled = false
  }
})

send('arrival').catch(() => {})
window.setTimeout(() => send('dwell_short').catch(() => {}), 12_000)
window.setTimeout(() => send('dwell_long').catch(() => {}), 45_000)
