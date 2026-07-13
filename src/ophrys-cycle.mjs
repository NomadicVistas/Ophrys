import { randomUUID } from 'node:crypto'
import { generateArtwork } from './openai-artwork.mjs'

function safeError(error) {
  return String(error?.message || error).replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]').slice(0, 800)
}

export async function runOphrysCycle({ store, trigger = 'manual', force = false, generator = generateArtwork }) {
  const settings = store.getSettings()
  if (!force && !settings.cycleEnabled) return { skipped: true, reason: 'Cycles are disabled' }

  const cycleId = randomUUID()
  store.createCycle({ id: cycleId, trigger, model: settings.model })
  try {
    const result = await generator({
      settings,
      metrics: store.getMetrics(settings.metricWindowHours),
      recentArtworks: store.listArtworks({ limit: 12 }),
    })
    const artworkId = randomUUID()
    const status = 'studio'
    const summary = `${result.artwork.title} entered the curatorial studio for human review.`
    store.commitArtworkCycle(cycleId, {
      id: artworkId, ...result.artwork, model: result.model,
      status, createdAt: new Date().toISOString(),
      provenance: result.provenance,
    }, { summary, responseId: result.responseId })
    return { skipped: false, cycleId, artworkId, status, title: result.artwork.title, model: result.model, usage: result.usage || null }
  } catch (error) {
    const message = safeError(error)
    store.completeCycle(cycleId, { status: 'failed', summary: 'The composition cycle stopped without publishing.', error: message })
    throw new Error(message)
  }
}
