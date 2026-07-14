# Progress log

## 2026-07-13 — standalone baseline

- Established Ophrys as a standalone Nomadic Vistas repository and project-management lane.
- Implemented a dependency-free Node 24 service with public, Studio and protected Operator surfaces.
- Added SQLite WAL state, expiring aggregate event counts, GPT‑5.6 Sol Responses structured output, single-flight cycles and mandatory human publication review.
- Added tests for identity-free aggregation, public/admin separation and the OpenAI request contract.
- Verified all three surfaces and health endpoints against a running local service; unauthorized Operator access returns `401` and a refusal event is represented only as an aggregate count.
- Ran the full static and test suites successfully (three tests passing).
- Attempted a real GPT‑5.6 Sol artwork cycle. The request reached the OpenAI API but returned `429 insufficient_quota`; the failed cycle was safely recorded and the public Studio projection exposes only a generic error.
- Published the runnable baseline as commit `5e8900a` on `main` and created the isolated `codex/hourly-builder` branch.
- Installed guarded hourly job `ophrys-build-week-hourly-sol` (`0d023788-f31e-4540-bc4c-d51882dfdfcb`) at minute 25 Europe/Amsterdam, using GPT‑5.6 Sol, high reasoning and a 55-minute timeout. It may push one verified change to the builder branch per run and is barred from deployment, dark patterns, production publication and cron proliferation.
- Deployment remains blocked by host disk pressure, missing Operator secret and incomplete Caddy/TLS configuration.

Next: implement provenance and curator decision records (OPH-005). A live cycle also requires API quota to be added to the configured OpenAI project.

## 2026-07-13 — adaptive loop

- Completed OPH-004 with a server-owned, bounded field score derived from coarse aggregate approach and attention counts.
- Added a visible public counter-control. Refusal atomically suppresses the active lure, rotates a fixed three-state repertoire, increments the aggregate refusal count and returns the revised score for immediate rendering.
- Kept the state collective and minimal: the durable field record contains only active/suppressed lure names, a global revision and update time; it contains no visitor record or inferred trait.
- Verified the loop with four deterministic tests plus a running-service smoke check (`orbit` → `interruption`, revision `1`, aggregate refusal `1`). `npm run check` and `npm test` pass.

## 2026-07-13 — provenance packet

- Completed OPH-005 by persisting a provenance packet with each generated candidate: prompt version, aggregate input summary, returned usage payload, rights basis, and curator review fields now travel with the artwork record.
- Operator status changes now require and store a rationale, and archiving a candidate refuses without a rejection reason.
- The Studio and Operator views surface the stored packet so the candidate remains inspectable without collapsing into hidden approval logic.

## 2026-07-13 — scheduler model pin

- The first validation run used GPT‑5.6 Sol as configured. A later scheduled run silently used the workspace fallback model even though the job still named Sol; its OPH-005 change was independently reviewed and all five tests pass.
- Disabled fallbacks on `ophrys-build-week-hourly-sol`. Future runs must use `codex/gpt-5.6-sol` with high reasoning or fail visibly instead of substituting another model.

## 2026-07-13 — accessibility and responsive verification

- Completed OPH-006 across the public, Studio and Operator surfaces with skip links, persistent mobile navigation, visible focus treatment, live status/error regions and a global reduced-motion boundary.
- Recast artwork cards as real links to the Studio ledger. Keyboard focus no longer records an artwork-open event; the coarse aggregate event occurs only when the link is activated.
- Corrected muted small-text contrast from 3.71:1 to 4.74:1 and added deterministic contrast, semantic, responsive, motion and fallback-state assertions.
- Verified all surfaces in Chromium 149 at desktop and 390 × 844 mobile dimensions, including the reduced-motion preference. `npm run check` and all six tests pass.

## 2026-07-13 — reproducible judging evidence

- Advanced OPH-008 with a credential-free `npm run judge:smoke` path using an ephemeral loopback service and in-memory database.
- Recorded the exact runnable baseline SHA and the dated prior/new implementation boundary in `docs/JUDGING.md`, alongside a five-minute local and browser test sequence.
- Kept external proof honest: the primary Codex `/feedback` Session ID, public HTTPS URL, live GPT-5.6 Sol cycle, video and Devpost confirmation remain open and are not replaced with scheduler metadata.
- Verified `npm run check`, all six tests and the judging smoke; refusal rotated `orbit` to `interruption` at collective revision 1. OPH-008 is now blocked only on human/external evidence.

## 2026-07-13 — artwork candidate comparison

- Completed OPH-010 with a protected Operator workspace that selects up to two candidates for side-by-side comparison without changing their publication state.
- Aligned each candidate across proposition, visitor relation, exhibition form, learning question, lure hypothesis, counter-reading, materials, model/prompt/usage provenance, rights basis and current review.
- Replaced prompt-based status shortcuts with explicit per-candidate decision forms. Approval and rejection now both require a written curatorial rationale, enforced in the store as well as the browser, and the decision remains attached to the provenance packet.
- Verified `npm run check`, all six tests and the credential-free judging smoke.

## 2026-07-14 — education encounter protocol

- Completed OPH-011 with a public Lure → Reveal → Counter-read sequence driven by the existing live field score and consequential refusal transaction.
- Kept observation, provisional interpretation, uncertainty, bounded artistic choice and human curatorial responsibility separately labelled; the explicit learning outcome asks visitors to distinguish counting from interpretation and verify agency without personal disclosure.
- Added a five-minute facilitation protocol with observable completion evidence, optional participation and reduced-motion/keyboard boundaries.
- Extended deterministic coverage and the judging smoke to protect the encounter structure and live repertoire transition. `npm run check`, all seven tests, the judging smoke and Chromium 149 desktop/reduced-motion mobile render checks pass.
