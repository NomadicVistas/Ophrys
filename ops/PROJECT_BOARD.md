# Ophrys project board

Statuses: `DONE`, `ACTIVE`, `READY`, `BLOCKED`, `LATER`. `[!]` requires human authority or external state.

| ID | Priority | Status | Work item | Acceptance evidence |
|---|---:|---|---|---|
| OPH-001 | P0 | DONE | Standalone public/Studio/Operator skeleton | Routes render; public/admin boundary tests pass |
| OPH-002 | P0 | DONE | Aggregate SQLite event model | No identity/profile tables; expiry and disclosure present |
| OPH-003 | P0 | DONE | GPT‑5.6 Sol composition adapter | Responses API, strict schema, `store:false`, deterministic test |
| OPH-004 | P0 | ACTIVE | Complete adaptive artwork loop | Bounded renderer changes from aggregate state; refusal changes next state |
| OPH-005 | P0 | READY | Provenance and curator decision records | Model, prompt version, inputs, usage, rights, decision and rejection reason stored |
| OPH-006 | P0 | READY | Accessibility and responsive verification | Keyboard, reduced motion, contrast, mobile and error-state evidence |
| OPH-007 | P0 | BLOCKED [!] | Production deployment | Loopback service and Operator secret verified; host Caddy route, HTTPS and safe disk capacity remain |
| OPH-008 | P0 | READY | Hackathon evidence package | Prior/new work, Codex account, session ID, test instructions complete |
| OPH-009 | P0 | BLOCKED [!] | Submission video and Devpost entry | Human recording, approval and submission required |
| OPH-010 | P1 | READY | Artwork candidate comparison | Curator can compare, approve, reject and record rationale |
| OPH-011 | P1 | READY | Education encounter protocol | Lure → reveal → counter-read flow tested with explicit learning outcome |
| OPH-012 | P1 | READY | Cost and compute ledger | Usage, latency, model and bounded budget visible to Operator/Studio |
| OPH-013 | P2 | LATER | Physical light/sound bridge | Hardware adapter consumes the same bounded artwork score |
| OPH-014 | P0 | BLOCKED [!] | Verify a live GPT‑5.6 Sol generation | OpenAI project has available API quota; cycle completes with redacted usage evidence |

## Current definition of done

Build Week P0 is complete when OPH-004 through OPH-008 and OPH-014 have evidence, the demo is freely testable, and the remaining blocked items require explicit human authority.
