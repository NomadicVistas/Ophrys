const state = await fetch('/api/public/state').then(response => response.json()).catch(() => null)

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function send(kind, surface = 'public') {
  fetch('/api/public/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, surface }), keepalive: true }).catch(() => {})
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
} else {
  grid.replaceChildren(element('p', 'loading', 'The public field is temporarily quiet. Open Studio to inspect the system state.'))
}

send('arrival')
window.setTimeout(() => send('dwell_short'), 12_000)
window.setTimeout(() => send('dwell_long'), 45_000)
