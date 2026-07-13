# Risk register

| Risk | Level | Control | Owner/state |
|---|---:|---|---|
| Covert manipulation contradicts the critical artwork | Critical | Visible lure/reveal/counter-read; no individual targeting; refusal atomically suppresses the active lure and rotates a bounded repertoire | OPH-004 tested |
| Unsupported psychological inference | Critical | Aggregate events only; explicit observation/hypothesis split | Tests active |
| Generated work is presented as approved art | High | All model output enters `studio`; human publication gate | Active |
| Public Studio leaks secrets or provider details | High | Separate projection; redacted errors; server-only credentials | Active |
| Concurrent cycles corrupt state or duplicate work | High | SQLite WAL, busy timeout, one-running-cycle index, transactional completion | Active |
| Rights-ambiguous imitation or source use | High | No named living-artist imitation; provenance and rights register required | OPH-005 |
| API cost or runaway generation | High | One bounded cycle, output limit, timeout, Operator control; budget still required | Human decision [!] |
| OpenAI API quota blocks live judging evidence | High | Deterministic contract test remains runnable; add project quota and capture one redacted successful cycle | Blocked [!] |
| Domain or TLS fails during judging | High | Loopback service, Caddy runbook, readiness probes, deployment receipt | Blocked [!] |
| Host disk exhaustion prevents build/deploy | Critical | No image builds until safe cleanup is approved | Blocked [!] |
| Admin compromise | High | Long random token, same-origin mutations, edge protection, no public admin data | Deployment gate |
| Accessibility is sacrificed for spectacle | Medium | Keyboard, reduced motion, contrast and mobile acceptance tests | OPH-006 |
| Hackathon evaluates only prior concept | High | Prior/new record, commits, Codex account and runnable new software | Active |
