const ARTWORK_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['title', 'medium', 'proposition', 'publicDescription', 'visitorRelation', 'exhibitionForm', 'learningQuestion', 'lureHypothesis', 'counterReading', 'materials'],
  properties: {
    title: { type: 'string', minLength: 2, maxLength: 100 },
    medium: { type: 'string', minLength: 10, maxLength: 180 },
    proposition: { type: 'string', minLength: 40, maxLength: 700 },
    publicDescription: { type: 'string', minLength: 60, maxLength: 1000 },
    visitorRelation: { type: 'string', minLength: 40, maxLength: 700 },
    exhibitionForm: { type: 'string', minLength: 40, maxLength: 700 },
    learningQuestion: { type: 'string', minLength: 20, maxLength: 280 },
    lureHypothesis: { type: 'string', minLength: 30, maxLength: 500 },
    counterReading: { type: 'string', minLength: 30, maxLength: 500 },
    materials: { type: 'array', minItems: 3, maxItems: 10, items: { type: 'string', minLength: 2, maxLength: 100 } },
  },
}

function outputText(response) {
  for (const item of response.output || []) {
    if (item.type !== 'message') continue
    for (const content of item.content || []) if (content.type === 'output_text') return content.text
  }
  throw new Error('GPT-5.6 returned no artwork text')
}

export async function generateArtwork({ settings, metrics, recentArtworks, apiKey = process.env.OPENAI_API_KEY, fetchImpl = fetch }) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for an Ophrys composition cycle')

  const instructions = `You are the bounded composition organ of Ophrys, a contemporary art ecosystem and public AI-literacy installation.
Create one original, museum-grade artwork proposition that could be prototyped physically and represented online.
Your subject is attraction without understanding: an adaptive system may improve at drawing attention while remaining uncertain about a person.
Treat the Ophrys orchid's deceptive pollination as a behavioural grammar, never as decorative illustration.
Use aggregate public traces only. Never infer identity, emotion, diagnosis, intent, age, gender, ethnicity, disability, vulnerability, or an individual psychological profile.
Make observation, artistic interpretation, uncertainty, infrastructure, and human curatorial responsibility legible.
Refusal must materially alter the work. Do not write promotional hype, imitate a living artist, or claim institutional endorsement.
Produce a precise artwork, not an essay, chatbot, dashboard, or generic interactive installation.`

  const input = {
    currentMode: settings.systemMode,
    curatorialDirective: settings.curatorialDirective,
    explorationRate: settings.explorationRate,
    aggregateEvents: metrics,
    recentArtworkTitles: recentArtworks.map(item => item.title).slice(0, 8),
    requiredSpatialGrammar: ['threshold', 'field', 'residue', 'counter-field'],
    desiredAudience: ['culturally experienced visitors', 'curious general public', 'students and educators'],
  }

  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: settings.model || 'gpt-5.6-sol', instructions,
      input: JSON.stringify(input), store: false,
      safety_identifier: 'ophrys-composition-organ-v1',
      reasoning: { effort: settings.reasoningEffort || 'high', context: 'current_turn' },
      text: { verbosity: 'medium', format: { type: 'json_schema', name: 'ophrys_artwork', strict: true, schema: ARTWORK_SCHEMA } },
      max_output_tokens: 2600,
    }), signal: AbortSignal.timeout(Number(process.env.OPHRYS_OPENAI_TIMEOUT_MS || 120_000)),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`OpenAI Responses API ${response.status}: ${payload.error?.message || 'request failed'}`)
  const artwork = JSON.parse(outputText(payload))
  return { artwork, responseId: payload.id || null, model: payload.model || settings.model }
}
