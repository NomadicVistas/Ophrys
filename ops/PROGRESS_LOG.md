# Progress log

## 2026-07-13 — standalone baseline

- Established Ophrys as a standalone Nomadic Vistas repository and project-management lane.
- Implemented a dependency-free Node 24 service with public, Studio and protected Operator surfaces.
- Added SQLite WAL state, expiring aggregate event counts, GPT‑5.6 Sol Responses structured output, single-flight cycles and mandatory human publication review.
- Added tests for identity-free aggregation, public/admin separation and the OpenAI request contract.
- Verified all three surfaces and health endpoints against a running local service; unauthorized Operator access returns `401` and a refusal event is represented only as an aggregate count.
- Ran the full static and test suites successfully (three tests passing).
- Attempted a real GPT‑5.6 Sol artwork cycle. The request reached the OpenAI API but returned `429 insufficient_quota`; the failed cycle was safely recorded and the public Studio projection exposes only a generic error.
- Deployment remains blocked by host disk pressure, missing Operator secret and incomplete Caddy/TLS configuration.

Next: publish the baseline, install the guarded hourly builder, then implement OPH-004. A live cycle also requires API quota to be added to the configured OpenAI project.
