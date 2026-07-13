# Ophrys repository guidance

## Mission

Build Ophrys as a contemporary artwork and public AI-literacy system in which attraction, adaptation, uncertainty and refusal are materially inspectable.

## Read first

Before changing the project, read `PROJECT.md`, `ROADMAP.md`, `ops/PROJECT_BOARD.md`, `ops/AUTONOMY_POLICY.md`, `docs/ETHICS.md`, `docs/DATA_GOVERNANCE.md`, and `docs/HACKATHON_EVIDENCE.md`.

## Commands

- `npm run check` — syntax checks.
- `npm test` — privacy, boundary and GPT integration tests.
- `npm start` — service on `127.0.0.1:7799` by default.
- `npm run cycle` — one server-side GPT‑5.6 artwork-composition cycle.

## Hard boundaries

- Never expose API keys, admin tokens, raw operational data or privileged controls to the browser.
- Never create visitor profiles, persistent identifiers, biometric records, emotion classifications or psychographic inferences.
- Keep observation, hypothesis, uncertainty and artistic interpretation separate.
- Generated artworks remain Studio candidates until a human approves publication.
- Refusal, reset and counter-reading are product functions, not explanatory copy.
- Never execute model-generated code. Render only validated, bounded schemas.
- Never claim museum approval, psychological understanding or research validity without evidence and authority.

## Change discipline

Select one board item, implement its acceptance boundary, test it, update evidence, and commit only that scope. Do not deploy, change DNS, spend money or publish externally without explicit authority.
