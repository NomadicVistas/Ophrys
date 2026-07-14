import { createHash } from 'node:crypto'

const LURE_REPERTOIRE = ['orbit', 'interruption', 'split-signal']
const LURE_PROFILES = {
  orbit: { lightPattern: 'orbit', hueDegrees: 46, toneHz: 196 },
  interruption: { lightPattern: 'interruption', hueDegrees: 8, toneHz: 147 },
  'split-signal': { lightPattern: 'split-signal', hueDegrees: 202, toneHz: 220 },
}

const LIMITS = Object.freeze({
  density: Object.freeze({ minimum: 3, maximum: 12 }),
  tempoBpm: Object.freeze({ minimum: 18, maximum: 72 }),
  tiltDegrees: Object.freeze({ minimum: -24, maximum: 24 }),
  lightIntensityPercent: Object.freeze({ minimum: 0, maximum: 66 }),
  soundGainPercent: Object.freeze({ minimum: 0, maximum: 24 }),
  toneHz: Object.freeze({ minimum: 147, maximum: 220 }),
})

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function boundedNumber(value, minimum, maximum) {
  return Number.isFinite(value) && value >= minimum && value <= maximum
}

function validUtcTimestamp(value) {
  if (typeof value !== 'string') return false
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value
}

export function validatePhysicalBridgeScore(score) {
  const errors = []
  if (!isPlainObject(score)) return { valid: false, errors: ['score must be an object'] }
  if (score.schemaVersion !== 1) errors.push('schemaVersion must equal 1')
  if (!Number.isSafeInteger(score.revision) || score.revision < 0) errors.push('revision must be a non-negative safe integer')
  if (!['lure', 'counter-read'].includes(score.phase)) errors.push('phase must be lure or counter-read')
  if (!LURE_REPERTOIRE.includes(score.activeLure)) errors.push('activeLure must use the bounded repertoire')
  if (score.phase === 'lure' && score.suppressedLure !== null) errors.push('lure phase cannot retain a suppressed lure')
  if (score.phase === 'counter-read' && (!LURE_REPERTOIRE.includes(score.suppressedLure) || score.suppressedLure === score.activeLure)) {
    errors.push('counter-read phase requires a distinct suppressed lure from the bounded repertoire')
  }
  if (!Number.isInteger(score.density) || !boundedNumber(score.density, LIMITS.density.minimum, LIMITS.density.maximum)) {
    errors.push('density must be an integer from 3 to 12')
  }
  if (!Number.isInteger(score.tempoBpm) || !boundedNumber(score.tempoBpm, LIMITS.tempoBpm.minimum, LIMITS.tempoBpm.maximum)) {
    errors.push('tempoBpm must be an integer from 18 to 72')
  }
  if (!boundedNumber(score.tiltDegrees, LIMITS.tiltDegrees.minimum, LIMITS.tiltDegrees.maximum)) {
    errors.push('tiltDegrees must be a finite number from -24 to 24')
  }
  if (!Array.isArray(score.repertoire) || score.repertoire.length !== LURE_REPERTOIRE.length || score.repertoire.some((lure, index) => lure !== LURE_REPERTOIRE[index])) {
    errors.push('repertoire must match the complete ordered bounded repertoire')
  }
  if (!isPlainObject(score.aggregateBasis)) {
    errors.push('aggregateBasis must be an object')
  } else {
    const aggregateKeys = Object.keys(score.aggregateBasis).sort()
    if (aggregateKeys.join(',') !== 'approach,attention,refusal') errors.push('aggregateBasis must contain only approach, attention, and refusal')
    for (const key of ['approach', 'attention', 'refusal']) {
      if (!Number.isSafeInteger(score.aggregateBasis[key]) || score.aggregateBasis[key] < 0) errors.push(`aggregateBasis.${key} must be a non-negative safe integer`)
    }
  }
  if (!validUtcTimestamp(score.updatedAt)) errors.push('updatedAt must be a canonical UTC timestamp')
  return { valid: errors.length === 0, errors }
}

function quietFallback(errors) {
  return {
    schemaVersion: 1,
    contract: 'ophrys-simulated-light-sound-v1',
    id: 'simulated-output:quiet-fallback',
    status: 'quiet-fallback',
    source: null,
    light: { enabled: false, pattern: 'quiet', intensityPercent: 0, hueDegrees: 0, pulseBpm: 0, tiltDegrees: 0 },
    sound: { enabled: false, voice: 'silence', gainPercent: 0, toneHz: 0, pulseBpm: 0 },
    timing: { frameDurationMs: 0 },
    evidence: {
      validation: 'failed',
      errors,
      mappingVersion: 'physical-bridge-v1',
      inputDigest: null,
    },
    safety: {
      hardwareAction: false,
      transport: 'none',
      limits: LIMITS,
      fallback: 'Invalid or incomplete input produces zero light and zero sound.',
    },
  }
}

export function simulatePhysicalBridge(score) {
  const validation = validatePhysicalBridgeScore(score)
  if (!validation.valid) return quietFallback(validation.errors)

  const profile = LURE_PROFILES[score.activeLure]
  const counterReduction = score.phase === 'counter-read' ? 12 : 0
  const lightIntensityPercent = Math.max(0, Math.min(LIMITS.lightIntensityPercent.maximum, 18 + (score.density * 4) - counterReduction))
  const soundGainPercent = Math.max(0, Math.min(LIMITS.soundGainPercent.maximum, Math.round(6 + (score.density * 1.5)) - (score.phase === 'counter-read' ? 4 : 0)))
  const input = {
    schemaVersion: score.schemaVersion,
    revision: score.revision,
    phase: score.phase,
    activeLure: score.activeLure,
    suppressedLure: score.suppressedLure,
    density: score.density,
    tempoBpm: score.tempoBpm,
    tiltDegrees: score.tiltDegrees,
    aggregateBasis: score.aggregateBasis,
    repertoire: score.repertoire,
    updatedAt: score.updatedAt,
  }
  const inputDigest = createHash('sha256').update(JSON.stringify(input)).digest('hex')

  return {
    schemaVersion: 1,
    contract: 'ophrys-simulated-light-sound-v1',
    id: `simulated-output:${score.revision}:${inputDigest.slice(0, 12)}`,
    status: 'simulated',
    source: {
      kind: 'bounded-field-score',
      schemaVersion: score.schemaVersion,
      revision: score.revision,
      activeLure: score.activeLure,
      phase: score.phase,
      updatedAt: score.updatedAt,
    },
    light: {
      enabled: true,
      pattern: profile.lightPattern,
      intensityPercent: lightIntensityPercent,
      hueDegrees: profile.hueDegrees,
      pulseBpm: score.tempoBpm,
      tiltDegrees: score.tiltDegrees,
    },
    sound: {
      enabled: true,
      voice: 'sine-simulation',
      gainPercent: soundGainPercent,
      toneHz: profile.toneHz,
      pulseBpm: score.tempoBpm,
    },
    timing: { frameDurationMs: Math.round(60_000 / score.tempoBpm) },
    evidence: {
      validation: 'passed',
      errors: [],
      mappingVersion: 'physical-bridge-v1',
      inputDigest,
    },
    safety: {
      hardwareAction: false,
      transport: 'none',
      limits: LIMITS,
      fallback: 'Invalid or incomplete input produces zero light and zero sound.',
    },
  }
}
