const TAU = Math.PI * 2

const WORKS = {
  'borrowed-weather': {
    id: 'study-borrowed-weather',
    index: 1,
    role: '01 / Threshold / Responsive light climate',
    title: 'Borrowed Weather',
    image: '/assets/works/borrowed-weather.webp',
    accent: '#dfff52',
    proposition: 'A luminous weather-front learns how to invite a crossing, then admits that its apparent forecast contains no knowledge of you.',
    instruction: 'Move sideways to bend the invitation. Approach the opening to intensify it.',
    description: 'A pale front of translucent light gathers at an entrance and breaks apart under collective pressure. In this browser study, movement changes the aperture and density of the front without creating a visitor record.',
    question: 'When does an atmospheric invitation start to feel like a prediction about you?',
    counter: 'Clearing the forecast removes the seductive colour field for a neutral interval. Refusal changes the work instead of being counted as failed attention.',
    counterLabel: 'Clear the forecast',
    alt: 'A dark architectural threshold filled by a luminous torn membrane, pale mist, spectral chartreuse light and narrow vertical beams. Responsive contours gather around an incomplete central opening.',
    previous: 'unchosen-signal',
    next: 'choir-of-almost',
  },
  'choir-of-almost': {
    id: 'study-choir-of-almost',
    index: 2,
    role: '02 / Field / Distributed resonant objects',
    title: 'Choir of Almost',
    image: '/assets/works/choir-of-almost.webp',
    accent: '#ff765d',
    proposition: 'A dispersed chorus nearly resolves around your position, coordinating attention without ever knowing what anyone heard.',
    instruction: 'Move across the constellation. Press within the field to release an unfinished phrase.',
    description: 'Suspended resonant forms exchange incomplete phrases across a dark room. Position changes spacing, light and—only when explicitly enabled—locally synthesised sound. No voice or microphone enters the work.',
    question: 'Can a system coordinate a crowd’s attention without knowing what anyone heard?',
    counter: 'Giving silence equal status interrupts the favoured phrase and holds the field quiet before any new resolution can be attempted.',
    counterLabel: 'Give silence equal status',
    alt: 'A black gallery holds a dispersed constellation of suspended metal, dark wood and translucent acoustic planes, illuminated by migrating coral, violet-blue and pearl fragments.',
    previous: 'borrowed-weather',
    next: 'afterimage-commons',
    sound: true,
  },
  'afterimage-commons': {
    id: 'study-afterimage-commons',
    index: 3,
    role: '03 / Residue / Fading public trace',
    title: 'Afterimage Commons',
    image: '/assets/works/afterimage-commons.webp',
    accent: '#8feaff',
    proposition: 'A shared image accumulates from expiring traces, making its retention and its right to disappear part of what can be seen.',
    instruction: 'Move slowly to leave a sixty-second trace. Every layer expires in this view.',
    description: 'A phosphorescent wall carries anonymous afterimages as short-lived rings and stains. They are held only in this page’s working memory and decay visibly; nothing is written to browser storage.',
    question: 'What makes a collective memory accountable when it remembers no individual?',
    counter: 'Erasing the newest layer makes forgetting consequential and visible. It removes recent local traces without pretending that an individual record ever existed.',
    counterLabel: 'Erase the newest layer',
    alt: 'A near-black phosphorescent wall carries mineral-cyan, bruised-violet and bone-white light traces. Dense luminous residue decays into a large calm area of erased darkness.',
    previous: 'choir-of-almost',
    next: 'unchosen-signal',
  },
  'unchosen-signal': {
    id: 'study-unchosen-signal',
    index: 4,
    role: '04 / Counter-field / Reversible selection',
    title: 'The Unchosen Signal',
    image: '/assets/works/unchosen-signal.webp',
    accent: '#ff4f36',
    proposition: 'The signal selected to attract you is forced to share the room with everything the system discarded.',
    instruction: 'Move the selection boundary. Press the field to interrupt its current certainty.',
    description: 'Opposing luminous planes hold a favoured signal and its occluded alternatives. Moving mechanical slats exchange fragments between them so optimisation appears as a reversible choice, not an inevitable direction.',
    question: 'Who gains agency when an adaptive system must display what it rejected?',
    counter: 'Restoration gives the discarded field temporary priority without granting it approval or permanence. No signal disappears silently.',
    counterLabel: 'Restore discarded signal',
    alt: 'Two opposing luminous fields face each other across a black mechanical seam. Vermilion and hot white confront ultraviolet blue and acidic chartreuse behind shifting shutters.',
    previous: 'afterimage-commons',
    next: 'borrowed-weather',
  },
}

const slug = window.location.pathname.split('/').filter(Boolean).at(-1)
const work = WORKS[slug]

if (!work) {
  document.title = 'Ophrys — Study not found'
  document.querySelector('#work-title').textContent = 'Study not found'
  document.querySelector('#work-proposition').textContent = 'This route is not part of the bounded Ophrys quartet.'
  const button = document.querySelector('#enter-work')
  button.textContent = 'Return to Studio'
  button.addEventListener('click', () => { window.location.href = '/studio#works' })
  throw new Error('Unknown bounded artwork route')
}

document.documentElement.style.setProperty('--work-accent', work.accent)
document.title = `${work.title} — Ophrys study`
document.querySelector('meta[name="description"]').content = work.proposition
document.querySelector('#work-position').textContent = `${String(work.index).padStart(2, '0')} / 04`
document.querySelector('#work-role').textContent = work.role
document.querySelector('#work-title').textContent = work.title
document.querySelector('#work-proposition').textContent = work.proposition
document.querySelector('#work-instruction').textContent = work.instruction
document.querySelector('#counter-action').textContent = work.counterLabel
document.querySelector('#notes-title').textContent = work.title
document.querySelector('#notes-description').textContent = work.description
document.querySelector('#notes-question').textContent = work.question
document.querySelector('#notes-counter').textContent = work.counter

const route = name => `/works/${name}`
const previous = document.querySelector('#previous-work')
const next = document.querySelector('#next-work')
previous.href = route(work.previous)
previous.querySelector('strong').textContent = WORKS[work.previous].title
next.href = route(work.next)
next.querySelector('strong').textContent = WORKS[work.next].title

function seededSequence(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let nextValue = value
    nextValue = Math.imul(nextValue ^ (nextValue >>> 15), nextValue | 1)
    nextValue ^= nextValue + Math.imul(nextValue ^ (nextValue >>> 7), nextValue | 61)
    return ((nextValue ^ (nextValue >>> 14)) >>> 0) / 4294967296
  }
}

class LocalChoir {
  constructor() {
    this.context = null
    this.master = null
    this.voices = []
    this.enabled = false
  }

  async toggle() {
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: 'interactive' })
      this.master = new GainNode(this.context, { gain: 0 })
      this.master.connect(this.context.destination)
      const frequencies = [73.42, 98, 130.81, 174.61]
      frequencies.forEach((frequency, index) => {
        const oscillator = new OscillatorNode(this.context, { type: index % 2 ? 'triangle' : 'sine', frequency })
        const voiceGain = new GainNode(this.context, { gain: .13 / frequencies.length })
        oscillator.connect(voiceGain).connect(this.master)
        oscillator.start()
        this.voices.push({ oscillator, base: frequency })
      })
    }
    if (this.context.state === 'suspended') await this.context.resume()
    this.enabled = !this.enabled
    this.master.gain.setTargetAtTime(this.enabled ? .13 : 0, this.context.currentTime, .08)
    return this.enabled
  }

  modulate(pointer, silence) {
    if (!this.context || !this.master) return
    const time = this.context.currentTime
    const spread = .93 + pointer.x * .14
    this.voices.forEach((voice, index) => {
      const unresolved = 1 + ((index % 2 ? -1 : 1) * (pointer.y - .5) * .022)
      voice.oscillator.frequency.setTargetAtTime(voice.base * spread * unresolved, time, .12)
    })
    this.master.gain.setTargetAtTime(this.enabled && !silence ? .13 : 0, time, .08)
  }

  stop() {
    for (const voice of this.voices) voice.oscillator.stop()
    this.context?.close().catch(() => {})
  }
}

class ArtworkRenderer {
  constructor(canvas, config) {
    this.canvas = canvas
    this.context = canvas.getContext('2d', { alpha: false })
    this.config = config
    this.abort = new AbortController()
    this.pointer = { x: .5, y: .5, active: false }
    this.width = 1
    this.height = 1
    this.frame = 0
    this.entered = false
    this.imageReady = false
    this.neutralUntil = 0
    this.silenceUntil = 0
    this.restoredUntil = 0
    this.chosenSide = 'right'
    this.traces = []
    this.pulses = []
    this.lastTraceAt = 0
    this.lastStatusAt = 0
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.choir = new LocalChoir()
    this.random = seededSequence(0x0f4a7 + config.index)
    this.points = Array.from({ length: 46 }, () => ({
      x: this.random(), y: this.random(), radius: 1 + this.random() * 3, phase: this.random() * TAU,
    }))
    this.image = new Image()
    this.image.src = config.image
    this.image.alt = ''
    this.image.decode().then(() => {
      this.imageReady = true
      this.queueDraw()
    }).catch(() => this.setStatus('The visual source could not be decoded. The coded field remains available.'))
    this.canvas.setAttribute('aria-label', config.alt)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.bind()
    this.resize()
  }

  bind() {
    const options = { signal: this.abort.signal }
    this.canvas.addEventListener('pointermove', event => this.move(event), options)
    this.canvas.addEventListener('pointerdown', event => this.press(event), options)
    this.canvas.addEventListener('pointerleave', () => { this.pointer.active = false }, options)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(this.frame)
      else this.queueDraw()
    }, options)
    window.addEventListener('pagehide', () => this.destroy(), { ...options, once: true })
  }

  resize() {
    const bounds = this.canvas.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    this.width = Math.max(1, bounds.width)
    this.height = Math.max(1, bounds.height)
    this.canvas.width = Math.round(this.width * dpr)
    this.canvas.height = Math.round(this.height * dpr)
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.context.imageSmoothingEnabled = true
    this.context.imageSmoothingQuality = 'high'
    this.queueDraw()
  }

  enter() {
    this.entered = true
    this.canvas.focus({ preventScroll: true })
    this.queueDraw()
  }

  move(event) {
    if (!this.entered) return
    const bounds = this.canvas.getBoundingClientRect()
    this.pointer.x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    this.pointer.y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))
    this.pointer.active = true
    if (slug === 'afterimage-commons' && event.timeStamp - this.lastTraceAt > 58) {
      this.lastTraceAt = event.timeStamp
      this.traces.push({ x: this.pointer.x, y: this.pointer.y, born: performance.now(), size: 12 + this.random() * 38 })
      if (this.traces.length > 180) this.traces.shift()
    }
    this.queueDraw()
  }

  press(event) {
    if (!this.entered) return
    this.move(event)
    if (slug === 'choir-of-almost') {
      this.pulses.push({ x: this.pointer.x, y: this.pointer.y, born: performance.now() })
      this.setStatus('One unfinished phrase moved into the shared field.')
    } else if (slug === 'unchosen-signal') {
      this.chosenSide = this.pointer.x < .5 ? 'left' : 'right'
      this.setStatus(`${this.chosenSide === 'left' ? 'Discarded' : 'favoured'} field held in the selection aperture.`)
    }
    this.queueDraw()
  }

  queueDraw() {
    cancelAnimationFrame(this.frame)
    if (document.hidden) return
    this.frame = requestAnimationFrame(time => this.draw(time))
  }

  draw(time) {
    const context = this.context
    context.save()
    context.setTransform(this.canvas.width / this.width, 0, 0, this.canvas.height / this.height, 0, 0)
    context.fillStyle = '#050605'
    context.fillRect(0, 0, this.width, this.height)
    context.restore()

    context.save()
    if (slug === 'borrowed-weather') this.drawBorrowedWeather(time)
    if (slug === 'choir-of-almost') this.drawChoir(time)
    if (slug === 'afterimage-commons') this.drawAfterimage(time)
    if (slug === 'unchosen-signal') this.drawUnchosen(time)
    context.restore()

    if (this.entered && !this.reducedMotion) this.frame = requestAnimationFrame(nextTime => this.draw(nextTime))
  }

  drawImage({ alpha = 1, filter = 'none', shift = 0, scale = 1.04 } = {}) {
    if (!this.imageReady) return
    const imageRatio = this.image.naturalWidth / this.image.naturalHeight
    const viewRatio = this.width / this.height
    let drawWidth
    let drawHeight
    if (imageRatio > viewRatio) {
      drawHeight = this.height * scale
      drawWidth = drawHeight * imageRatio
    } else {
      drawWidth = this.width * scale
      drawHeight = drawWidth / imageRatio
    }
    const driftX = this.entered ? (this.pointer.x - .5) * -28 : 0
    const driftY = this.entered ? (this.pointer.y - .5) * -16 : 0
    const x = (this.width - drawWidth) / 2 + driftX + shift
    const y = (this.height - drawHeight) / 2 + driftY
    this.context.save()
    this.context.globalAlpha = alpha
    this.context.filter = filter
    this.context.drawImage(this.image, x, y, drawWidth, drawHeight)
    this.context.restore()
  }

  drawBorrowedWeather(time) {
    const neutral = time < this.neutralUntil
    this.drawImage({ alpha: neutral ? .42 : .92, filter: neutral ? 'grayscale(1) contrast(.82)' : 'saturate(1.08) contrast(1.05)' })
    const context = this.context
    const anchorX = this.width * (.38 + this.pointer.x * .25)
    const anchorY = this.height * (.35 + this.pointer.y * .25)
    context.globalCompositeOperation = 'screen'
    for (let layer = 0; layer < 9; layer += 1) {
      const phase = time * .00018 + layer * .57
      context.beginPath()
      for (let step = 0; step <= 42; step += 1) {
        const progress = step / 42
        const y = progress * this.height
        const breadth = Math.sin(progress * Math.PI) * (55 + layer * 12)
        const x = anchorX + Math.sin(progress * 8 + phase) * breadth + Math.cos(phase * 1.7) * 15
        if (step === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.strokeStyle = neutral ? `rgba(230,232,225,${.025 + layer * .004})` : `rgba(216,255,63,${.035 + layer * .006})`
      context.lineWidth = 1 + layer * .13
      context.stroke()
    }
    context.globalCompositeOperation = 'source-over'
    context.fillStyle = neutral ? 'rgba(225,228,220,.2)' : 'rgba(216,255,63,.72)'
    context.beginPath()
    context.arc(anchorX, anchorY, neutral ? 3 : 5 + Math.sin(time * .002) * 2, 0, TAU)
    context.fill()
  }

  drawChoir(time) {
    const silent = time < this.silenceUntil
    this.drawImage({ alpha: silent ? .48 : .8, filter: silent ? 'grayscale(1) brightness(.72)' : 'saturate(1.14) contrast(1.08)' })
    const context = this.context
    context.globalCompositeOperation = 'screen'
    for (const [index, point] of this.points.entries()) {
      const x = point.x * this.width
      const y = point.y * this.height
      const proximity = 1 - Math.min(1, Math.hypot(this.pointer.x - point.x, this.pointer.y - point.y) * 2.2)
      const pulse = silent ? 0 : Math.sin(time * .0014 + point.phase) * (4 + proximity * 14)
      context.beginPath()
      context.moveTo(x, y - 16 - pulse)
      context.lineTo(x, y + 16 + pulse)
      context.strokeStyle = index % 3 === 0 ? `rgba(255,118,93,${.12 + proximity * .45})` : `rgba(129,126,255,${.08 + proximity * .34})`
      context.lineWidth = point.radius * .45
      context.stroke()
    }
    this.pulses = this.pulses.filter(pulse => time - pulse.born < 3600)
    for (const pulse of this.pulses) {
      const age = (time - pulse.born) / 3600
      context.beginPath()
      context.arc(pulse.x * this.width, pulse.y * this.height, age * Math.min(this.width, this.height) * .48, 0, TAU * (.82 + age * .12))
      context.strokeStyle = `rgba(255,240,224,${(1 - age) * .42})`
      context.lineWidth = 1
      context.stroke()
    }
    context.globalCompositeOperation = 'source-over'
    this.choir.modulate(this.pointer, silent)
  }

  drawAfterimage(time) {
    this.drawImage({ alpha: .72, filter: 'saturate(.82) contrast(1.08)' })
    const context = this.context
    const lifespan = 60_000
    this.traces = this.traces.filter(trace => time - trace.born < lifespan)
    context.globalCompositeOperation = 'screen'
    for (const [index, trace] of this.traces.entries()) {
      const age = Math.max(0, time - trace.born) / lifespan
      const radius = trace.size + age * 72
      context.beginPath()
      context.arc(trace.x * this.width, trace.y * this.height, radius, 0, TAU)
      const hue = index % 3 === 0 ? '143,234,255' : index % 3 === 1 ? '171,156,255' : '245,242,224'
      context.strokeStyle = `rgba(${hue},${(1 - age) * .2})`
      context.lineWidth = Math.max(.35, 2.1 * (1 - age))
      context.stroke()
    }
    context.globalCompositeOperation = 'source-over'
    if (time - this.lastStatusAt > 1000) {
      this.lastStatusAt = time
      const traceAge = this.traces.length ? Math.max(0, time - this.traces[0].born) : 0
      const nextExpiry = this.traces.length ? Math.min(60, Math.max(0, 60 - Math.floor(traceAge / 1000))) : 0
      this.setStatus(`${this.traces.length} local traces · next expiry ${nextExpiry}s · nothing written to storage`)
    }
  }

  drawUnchosen(time) {
    const context = this.context
    const boundary = this.width * (.22 + this.pointer.x * .56)
    const restored = time < this.restoredUntil
    const selectedLeft = restored || this.chosenSide === 'left'
    context.save()
    context.beginPath()
    context.rect(0, 0, boundary, this.height)
    context.clip()
    this.drawImage({ alpha: selectedLeft ? .98 : .48, filter: selectedLeft ? 'saturate(1.28) contrast(1.1)' : 'grayscale(.8) brightness(.62)', shift: -8 })
    context.restore()
    context.save()
    context.beginPath()
    context.rect(boundary, 0, this.width - boundary, this.height)
    context.clip()
    this.drawImage({ alpha: selectedLeft ? .46 : .98, filter: selectedLeft ? 'grayscale(.78) brightness(.62)' : 'saturate(1.28) contrast(1.1)', shift: 8 })
    context.restore()

    const slats = 18
    for (let index = 0; index < slats; index += 1) {
      const phase = Math.sin(time * .0005 + index * .71)
      const y = index * (this.height / slats)
      const width = 24 + Math.abs(phase) * Math.min(190, this.width * .14)
      context.fillStyle = index % 2 ? 'rgba(255,79,54,.22)' : 'rgba(146,255,46,.16)'
      context.fillRect(boundary + (index % 2 ? -width : 0), y, width, Math.max(2, this.height / slats - 3))
    }
    context.fillStyle = 'rgba(245,244,236,.78)'
    context.fillRect(boundary - .5, 0, 1, this.height)
  }

  async counterAction() {
    const now = performance.now()
    let message
    if (slug === 'borrowed-weather') {
      this.neutralUntil = now + 12_000
      message = 'Forecast cleared. A neutral threshold is held for twelve seconds.'
    }
    if (slug === 'choir-of-almost') {
      this.silenceUntil = now + 10_000
      message = 'Silence now has equal status for ten seconds.'
    }
    if (slug === 'afterimage-commons') {
      const boundary = now - 15_000
      const removed = this.traces.filter(trace => trace.born >= boundary).length
      this.traces = this.traces.filter(trace => trace.born < boundary)
      message = `${removed} recent local ${removed === 1 ? 'trace was' : 'traces were'} erased. No individual record existed.`
    }
    if (slug === 'unchosen-signal') {
      this.restoredUntil = now + 12_000
      this.chosenSide = 'left'
      message = 'The discarded field has priority for twelve seconds; restoration does not imply approval.'
    }
    this.setStatus(message)
    this.queueDraw()
    try {
      const response = await fetch('/api/public/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'refusal', surface: `study/${slug}` }),
      })
      if (!response.ok) throw new Error('Counter-event unavailable')
    } catch {
      this.setStatus(`${message} The local artwork changed; no aggregate receipt is claimed.`)
    }
  }

  setStatus(message) {
    document.querySelector('#work-state').textContent = message
  }

  destroy() {
    cancelAnimationFrame(this.frame)
    this.abort.abort()
    this.resizeObserver.disconnect()
    this.choir.stop()
  }
}

const renderer = new ArtworkRenderer(document.querySelector('#work-canvas'), work)
const intro = document.querySelector('#work-intro')
const interfaceElement = document.querySelector('#work-interface')

document.querySelector('#enter-work').addEventListener('click', () => {
  intro.dataset.dismissed = 'true'
  window.setTimeout(() => { intro.hidden = true }, renderer.reducedMotion ? 0 : 720)
  interfaceElement.hidden = false
  renderer.enter()
})

document.querySelector('#counter-action').addEventListener('click', () => renderer.counterAction())

const soundControl = document.querySelector('#sound-control')
if (work.sound) {
  soundControl.hidden = false
  soundControl.addEventListener('click', async () => {
    const enabled = await renderer.choir.toggle()
    soundControl.setAttribute('aria-pressed', String(enabled))
    soundControl.textContent = enabled ? 'Sound on' : 'Sound off'
    renderer.setStatus(enabled ? 'Local synthesis is on. No microphone is used.' : 'Local synthesis is off.')
  })
}

const notes = document.querySelector('#work-notes')
const notesControl = document.querySelector('#notes-control')
const notesClose = document.querySelector('#notes-close')

function toggleNotes(open) {
  notes.hidden = !open
  notesControl.setAttribute('aria-expanded', String(open))
  if (open) notesClose.focus()
  else notesControl.focus()
}

notesControl.addEventListener('click', () => toggleNotes(notes.hidden))
notesClose.addEventListener('click', () => toggleNotes(false))
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !notes.hidden) toggleNotes(false)
  if (event.key === 'ArrowLeft' && event.target === document.body) window.location.href = route(work.previous)
  if (event.key === 'ArrowRight' && event.target === document.body) window.location.href = route(work.next)
})
