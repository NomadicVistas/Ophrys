const TOKEN_KEY = 'ophrys-admin-token'
let token = sessionStorage.getItem(TOKEN_KEY) || ''
let state = null

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

function artworkControl(work) {
  const row = element('article', 'admin-work')
  const body = element('div'); body.append(element('span', `status ${work.status}`, work.status), element('h3', '', work.title), element('p', '', work.proposition))
  const controls = element('div', 'admin-work-actions')
  for (const status of ['published', 'studio', 'archived']) {
    const button = element('button', 'text-button', status)
    button.type = 'button'; button.disabled = status === work.status
    button.addEventListener('click', async () => {
      await api(`/api/admin/artworks/${work.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      await load()
    })
    controls.append(button)
  }
  row.append(body, controls)
  return row
}

async function load() {
  state = await api('/api/admin/state')
  loginPanel.hidden = true; adminPanel.hidden = false
  setForm(state.system)
  document.querySelector('#admin-artworks').replaceChildren(...state.artworks.map(artworkControl))
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
