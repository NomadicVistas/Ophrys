# Risk register

| Risk | Level | Control | Owner/state |
|---|---:|---|---|
| Covert manipulation contradicts the critical artwork | Critical | Visible lure/reveal/counter-read; no individual targeting; refusal atomically suppresses the active lure and rotates a bounded repertoire | OPH-004 tested |
| Unsupported psychological inference | Critical | Aggregate events only; explicit observation/hypothesis split | Tests active |
| Generated work is presented as approved art | High | All model output enters `studio`; protected comparison workspace and rationale-required human publication gate | OPH-010 tested |
| Public Studio leaks secrets or provider details | High | Separate projection; redacted errors; server-only credentials | Active |
| Concurrent cycles corrupt state or duplicate work | High | SQLite WAL, busy timeout, one-running-cycle index, transactional completion | Active |
| Rights-ambiguous imitation or source use | High | No named living-artist imitation; provenance and rights register required | OPH-005 implemented |
| API cost or runaway generation | High | Single-flight cycle, timeout, validated 400–5,000 output-token cap and enforced 1–24 attempt UTC daily limit; default 2,600 tokens and four attempts | OPH-012 tested; provider account cap remains external [!] |
| OpenAI API quota blocks live judging evidence | High | Deterministic contract test remains runnable; add project quota and capture one redacted successful cycle | Blocked [!] |
| Domain or TLS fails during judging | High | Loopback service, Caddy runbook, readiness probes, deployment receipt | Blocked [!] |
| Host disk exhaustion prevents build/deploy | Critical | No image builds until safe cleanup is approved | Blocked [!] |
| Admin compromise | High | Long random token, same-origin mutations, edge protection, no public admin data | Deployment gate |
| Accessibility is sacrificed for spectacle | Medium | Keyboard, reduced motion, contrast, mobile and failure-state acceptance tests | OPH-006 verified; final deployed screen-reader/device pass remains |
| Hackathon evaluates only prior concept | High | Prior/new record, commits, Codex account and runnable new software | Active |
