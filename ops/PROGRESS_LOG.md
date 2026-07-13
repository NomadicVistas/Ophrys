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
