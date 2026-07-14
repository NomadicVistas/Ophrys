# Ophrys ecosystem roadmap

Last re-audited: 2026-07-14. This is the active phase-two plan; the stopped phase-one lane remains a completed foundation.

## Current-state map

| Layer | Present on `codex/hourly-builder` | Evidence / gap |
|---|---|---|
| Runtime organism | Aggregate hourly events, labelled field score, bounded three-lure renderer, consequential refusal, candidate composition, human publication gate | Deterministic tests and `npm run judge:smoke`; continuity/freshness is not yet summarised as one honest public state |
| Ecosystem | Seed and generated artwork nodes, cycle/provenance packets, status transitions, explicit composition-context relations | OPH-015 adds the public topology projection; counter-signal, decision and physical-output nodes remain to be connected |
| Development | Isolated review branch, narrow/full tests, project records, no deploy path | This job may commit and push only to `codex/hourly-builder`; it cannot merge or deploy |
| Public production | `autopoiesis.art` is reachable and exposes a separate eight-agent gallery ecosystem | Read-only audit at 2026-07-14T11:49Z found no public Ophrys route; live copy claims “No prompts. No direction. Pure emergence.” and is not evidence for this bounded system |

Branch comparison: `main` remains the phase-one baseline at `3e0c5c7`; the builder branch contains nine phase-one commits through `1fc5f5a` plus the phase-two work described here. No production state was changed.

## Ecosystem architecture

```text
RUNTIME ORGANISM
coarse aggregate events -> labelled observation -> provisional interpretation
  -> bounded score/candidate -> HUMAN CURATOR -> public field or refusal

ECOSYSTEM LEDGER
artwork nodes <-> explicit relations <-> counter-signals / decisions / traces
  -> later simulated light/sound outputs, with provenance retained at every edge

DEVELOPMENT
roadmap -> one reversible slice -> narrow + full verification
  -> review-branch commit -> HUMAN REVIEW -> possible merge/deploy outside this job
```

The loops share records but not authority. A runtime event cannot identify a person; a relation cannot approve a work; the development loop cannot publish or deploy itself.

## Ordered backlog

| Order | Item | Dependency | Evidence criterion |
|---:|---|---|---|
| 1 | OPH-016 · Runtime continuity and freshness summary | Existing field, cycles and settings | Public Studio distinguishes active, quiet, stale, disabled and failed states from stored timestamps without claiming liveness it cannot verify; deterministic clock tests |
| 2 | OPH-017 · Counter-signal / erasure ledger nodes | OPH-015 topology, current refusal transaction | A refusal creates only a coarse collective counter-signal node/edge, has bounded retention or aggregation, changes the repertoire and cannot be attributed to an individual |
| 3 | OPH-018 · Curatorial decision relations and lineage comparison | OPH-015, current rationale gate | Approve/reject/revise decisions appear as attributed human-governance edges; comparison never mutates candidate state |
| 4 | OPH-019 · Public trace lifecycle | OPH-016–018 | Observation, interpretation, candidate, decision and public/refused outcome can be followed end-to-end with redacted public projections |
| 5 | OPH-020 · Simulated physical bridge contract | Stable bounded score schema | Deterministic light/sound adapter validates bounds, has safe/quiet fallback and recorded simulator evidence; no real hardware action |
| 6 | OPH-021 · Ecosystem literacy protocol and evidence rubric | OPH-019 | A visitor can distinguish node, relation, interpretation and human decision without disclosure; facilitator and automated evidence updated |
| 7 | OPH-022 · Reliability/access/privacy/judge pass | Each preceding slice | Migrations, invalid relations, stale state, reduced motion, narrow screens, redaction and reproducible judge path are covered |

External deployment, quota, feedback, video and submission items remain blocked as recorded on the project board. They are not prerequisites for deterministic ecosystem work and this lane will not attempt them.

## Slice discipline

Each run chooses at most one independently testable item, records what changed and what remains absent, and stops on a clean dependency rather than manufacturing activity. Evidence must include the narrowest relevant test plus `npm run check`, `npm test`, and `npm run judge:smoke` when the public loop is affected.
