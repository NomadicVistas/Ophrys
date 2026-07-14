# Ophrys

**A living AI installation about attraction without understanding.**

Ophrys is the first physical installation developed within [Autopoiesis](https://autopoiesis.art), an evolving ecology of autonomous AI artist agents.

The work takes its name from the *Ophrys* orchid. Its flowers attract pollinators through deceptive mimicry: a signal can be highly effective without containing mutual understanding. Ophrys translates that biological tension into a spatial AI system.

Across light, sound, movement and digital traces, the installation changes how it addresses a room in response to aggregate patterns of approach, attention, hesitation and withdrawal. It can become better at attracting people while remaining fundamentally uncertain about who they are or why they responded.

## The question

> Can an adaptive installation make the force of algorithmic address perceptible without turning visitors into profiles or pretending that prediction is understanding?

## How the installation behaves

Ophrys is organised as four overlapping conditions:

1. **Threshold** — an incomplete signal appears before its purpose is clear.
2. **Field** — light, sound, movement, distance and collective presence form a shared sensing environment.
3. **Residue** — earlier encounters return as transformed, depersonalised traces.
4. **Counter-field** — the system's tactics, uncertainty and dependencies can be inspected, refused or disrupted.

Visitors do not operate a kiosk or prompt an assistant. They enter a changing ecology. One encounter alters the conditions encountered by the next.

## Hackathon prototype

The first prototype focuses on one complete feedback loop:

```text
signal state
    ↓
aggregate public response
    ↓
bounded observation
    ↓
provisional system belief
    ↓
changed signal repertoire
```

The prototype should demonstrate:

- a small repertoire of spatial light and/or sound signals;
- low-resolution, non-identifying observation of collective response;
- an adaptive policy that changes the next signal state;
- a visible log separating observation from interpretation;
- a refusal or counter-action that materially changes the system;
- graceful operation without cloud AI where possible.

See [docs/HACKATHON.md](docs/HACKATHON.md) for the build brief and [docs/ETHICS.md](docs/ETHICS.md) for the public-data boundary.

## Online system

The Build Week implementation is one small Node 24 service with three deliberately different surfaces:

- `/` — public exhibition and artwork field;
- `/studio` — public evidence ledger for runtime freshness, aggregate inputs, redacted candidate lifecycles, cycles, tactics and counter-readings;
- `/admin` — protected Operator controls for models, retention, generation and human publication decisions.
- `/works/<slug>` — four responsive artwork studies linked from Studio and labelled unpublished until explicit human approval.

The server uses built-in SQLite and calls the OpenAI Responses API with `gpt-5.6-sol`, explicit reasoning effort, `store:false` and strict structured artwork output. Model-generated code is never executed.

## Run locally

Requirements: Node 24+, an OpenAI API key for real composition cycles, and a long random Operator token.

```bash
export OPENAI_API_KEY="..."
export OPHRYS_ADMIN_TOKEN="..."
npm test
npm start
```

Open `http://127.0.0.1:7799`, `/studio`, and `/admin`. Run a server-side composition cycle with:

```bash
npm run cycle
```

Without an API key, the public and Studio surfaces remain runnable with the human-authored seed work; only real GPT‑5.6 generation is unavailable.

The coded quartet does not need an API key at runtime. Start the service, open `/studio#works`, and enter `Borrowed Weather`, `Choir of Almost`, `Afterimage Commons`, or `The Unchosen Signal`. The studies use original local visual sources and browser-native interaction; they do not bypass the curatorial publication gate.

## Build Week status

Ophrys is a pre-existing artistic concept. The runnable online system, GPT‑5.6 composition organ, public Studio, Operator controls, aggregate event contract and tests are new work created during OpenAI Build Week. See [the evidence record](docs/HACKATHON_EVIDENCE.md) for the distinction and dated proof requirements, or follow [the five-minute judging guide](docs/JUDGING.md) for a credential-free verification path.

This is a testable prototype, not the final installation form. Generated work remains a candidate until a human curator approves publication.

## How Codex contributed

Codex accelerated the standalone architecture, GPT‑5.6 Responses integration, interface implementation, privacy-boundary tests, official-documentation review and parallel research/security audits. Human decisions remain explicit: Ewoud Bakker established the artistic proposition and title; Nomadic Vistas retains responsibility for curation, publication, rights, deployment and public claims.

The project records where Codex accelerated work, where human judgment changed its direction, and which implementation was added during the submission window in [docs/HACKATHON_EVIDENCE.md](docs/HACKATHON_EVIDENCE.md) and [ops/PROGRESS_LOG.md](ops/PROGRESS_LOG.md).

## Project context

- [Autopoiesis online ecosystem](https://autopoiesis.art)
- [Nomadic Vistas](https://nomadicvistas.online)

Ophrys is initiated by artist Ewoud Bakker with Nomadic Vistas.

## Collaboration

Useful contributions include spatial interaction design, privacy-preserving sensing, adaptive signal systems, light and sound behaviour, explainable system state, low-energy local inference and forms of meaningful refusal.

Open an issue to propose an experiment, component or critique. Please do not add facial recognition, demographic inference, emotion classification or individual behavioural profiles.

## Licence

This repository is released under the [MIT Licence](LICENSE). Attribution to Nomadic Vistas and the project contributors is appreciated when the artistic concept or prototype is presented publicly.
