import assert from 'node:assert/strict'
import { once } from 'node:events'
import { accessSync, mkdtempSync, rmSync } from 'node:fs'
import { createServer as createProbeServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { createOphrysStore } from '../src/ophrys-store.mjs'
import { createOphrysServer } from '../src/server.mjs'

const slugs = ['borrowed-weather', 'choir-of-almost', 'afterimage-commons', 'unchosen-signal']
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function freePort() {
  const probe = createProbeServer()
  probe.listen(0, '127.0.0.1')
  await once(probe, 'listening')
  const { port } = probe.address()
  probe.close()
  await once(probe, 'close')
  return port
}

function chromiumBinary() {
  const candidates = [process.env.CHROMIUM_BIN, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].filter(Boolean)
  for (const candidate of candidates) {
    try {
      accessSync(candidate)
      return candidate
    } catch {}
  }
  throw new Error('Chromium is required for the reduced-motion viewport smoke; set CHROMIUM_BIN to its executable')
}

async function debugPage(port, diagnostics) {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then(response => response.json())
      const page = pages.find(candidate => candidate.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {}
    await delay(50)
  }
  throw new Error(`Chromium debugging endpoint did not become ready: ${diagnostics()}`)
}

class DevTools {
  constructor(url) {
    this.socket = new WebSocket(url)
    this.pending = new Map()
    this.nextId = 1
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (!message.id) return
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`))
      else pending.resolve(message.result)
    })
  }

  async connect() {
    if (this.socket.readyState === WebSocket.OPEN) return
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
  }

  send(method, params = {}) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params }))
    })
  }

  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result.value
  }

  close() {
    this.socket.close()
  }
}

const chromiumPath = chromiumBinary()
const store = createOphrysStore(':memory:')
const app = createOphrysServer({ store })
app.listen(0, '127.0.0.1')
await once(app, 'listening')
const { port: appPort } = app.address()
const debugPort = await freePort()
const profile = mkdtempSync(join(tmpdir(), 'ophrys-accessibility-'))
let chromiumOutput = ''
const chromium = spawn(chromiumPath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] })
chromium.stderr.setEncoding('utf8')
chromium.stderr.on('data', chunk => { chromiumOutput = `${chromiumOutput}${chunk}`.slice(-4000) })
chromium.on('error', error => { chromiumOutput = `${chromiumOutput}\n${error.message}`.slice(-4000) })

let devtools
try {
  devtools = new DevTools(await debugPage(debugPort, () => chromiumOutput))
  await devtools.connect()
  await devtools.send('Page.enable')
  await devtools.send('Runtime.enable')
  await devtools.send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 700,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await devtools.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  })
  await devtools.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__ophrysRafCount = 0;
      const originalRequestAnimationFrame = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => originalRequestAnimationFrame(time => {
        window.__ophrysRafCount += 1;
        return callback(time);
      });`,
  })

  for (const slug of slugs) {
    await devtools.send('Page.navigate', { url: `http://127.0.0.1:${appPort}/works/${slug}` })
    await devtools.evaluate(`new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        if (document.readyState === 'complete' && document.querySelector('#enter-work')?.textContent === 'Enter study') return resolve(true);
        if (Date.now() > deadline) return reject(new Error('study did not become ready'));
        setTimeout(ready, 25);
      };
      ready();
    })`)
    await devtools.evaluate(`document.querySelector('#enter-work').click(); new Promise(resolve => setTimeout(resolve, 400))`)

    const before = await devtools.evaluate('window.__ophrysRafCount')
    const after = await devtools.evaluate('new Promise(resolve => setTimeout(() => resolve(window.__ophrysRafCount), 250))')
    assert.equal(after, before, `${slug}: reduced-motion mode must not run an animation loop`)

    const evidence = await devtools.evaluate(`(() => {
      const visible = selector => {
        const element = document.querySelector(selector);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return !element.hidden && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
          && rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight;
      };
      const moving = [...document.querySelectorAll('*')].filter(element => {
        const style = getComputedStyle(element);
        const durations = (style.animationDuration + ',' + style.transitionDuration).split(',');
        return durations.some(duration => Number.parseFloat(duration) > 0);
      }).map(element => element.id || element.className || element.tagName);
      const canvas = document.querySelector('#work-canvas');
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth - innerWidth,
        moving,
        canvasEvidence: canvas.toDataURL().length,
        instruction: document.querySelector('#work-instruction').textContent,
        counterLabel: document.querySelector('#counter-action').textContent,
        motionLabel: document.querySelector('#work-motion-state').textContent,
        studioVisible: visible('.work-wordmark'),
        counterVisible: visible('#counter-action'),
        notesVisible: visible('#notes-control'),
        controlsAreNative: document.querySelector('#counter-action').tagName === 'BUTTON'
          && document.querySelector('.work-wordmark').tagName === 'A',
      };
    })()`)
    assert.equal(evidence.width, 320, `${slug}: viewport must be exactly 320 CSS pixels wide`)
    assert.ok(evidence.overflow <= 0, `${slug}: page overflowed horizontally by ${evidence.overflow}px`)
    assert.deepEqual(evidence.moving, [], `${slug}: CSS motion remains active`)
    assert.ok(evidence.canvasEvidence > 1000, `${slug}: static visual alternative must render`)
    assert.match(evidence.instruction, /static/i, `${slug}: static lure instruction must remain visible`)
    assert.ok(evidence.counterLabel.length > 10, `${slug}: counter-reading must remain labelled`)
    assert.match(evidence.motionLabel, /Reduced motion: static.+no continuous animation loop.+counter-action remains available.+not stored/i)
    assert.equal(evidence.studioVisible, true, `${slug}: Studio evidence link must remain visible`)
    assert.equal(evidence.counterVisible, true, `${slug}: counter-action must remain in the viewport`)
    assert.equal(evidence.notesVisible, true, `${slug}: artwork notes must remain in the viewport`)
    assert.equal(evidence.controlsAreNative, true, `${slug}: evidence and counter controls must remain keyboard-native`)

    await devtools.evaluate(`document.querySelector('#counter-action').click(); new Promise(resolve => setTimeout(resolve, 100))`)
    const counterState = await devtools.evaluate(`({
      message: document.querySelector('#work-state').textContent,
      raf: window.__ophrysRafCount,
    })`)
    assert.ok(counterState.message.length > 30, `${slug}: counter-action must produce a visible result`)
    const settled = await devtools.evaluate('new Promise(resolve => setTimeout(() => resolve(window.__ophrysRafCount), 250))')
    assert.equal(settled, counterState.raf, `${slug}: counter-action must settle without restarting motion`)

    await devtools.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
    })
    const resumed = await devtools.evaluate(`new Promise(resolve => {
      const before = window.__ophrysRafCount;
      setTimeout(() => resolve({ before, after: window.__ophrysRafCount, label: document.querySelector('#work-motion-state').textContent }), 150);
    })`)
    assert.ok(resumed.after > resumed.before, `${slug}: rendering must resume after motion is re-enabled`)
    assert.match(resumed.label, /Motion mode: responsive field/i)

    await devtools.send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
    const reducedAgain = await devtools.evaluate(`new Promise(resolve => setTimeout(() => resolve({
      count: window.__ophrysRafCount,
      label: document.querySelector('#work-motion-state').textContent,
    }), 100))`)
    const reducedSettled = await devtools.evaluate('new Promise(resolve => setTimeout(() => resolve(window.__ophrysRafCount), 250))')
    assert.equal(reducedSettled, reducedAgain.count, `${slug}: a changed preference must cancel the resumed animation loop`)
    assert.match(reducedAgain.label, /Reduced motion: static/i)
  }

  console.log('Accessibility smoke passed: 4 reduced-motion studies at 320 × 700 CSS pixels; no loop, overflow, hidden control or stored preference.')
} finally {
  devtools?.close()
  chromium.kill('SIGTERM')
  if (chromium.exitCode === null) await Promise.race([once(chromium, 'exit'), delay(2000)])
  if (chromium.exitCode === null) chromium.kill('SIGKILL')
  app.close()
  await once(app, 'close')
  rmSync(profile, { recursive: true, force: true })
}
