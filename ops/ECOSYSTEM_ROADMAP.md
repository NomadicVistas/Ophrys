# Ophrys ecosystem roadmap

Last re-audited: 2026-07-14. This is the active phase-two plan; the stopped phase-one lane remains a completed foundation.

## Current-state map

| Layer | Present on `codex/hourly-builder` | Evidence / gap |
|---|---|---|
| Runtime organism | Aggregate hourly events, labelled field score, bounded three-lure renderer, consequential refusal, candidate composition, human publication gate | OPH-016 adds honest continuity; OPH-017 separates accepted counter-pressure from bounded applied revisions and retains no request-level trace |
| Ecosystem | Seed and generated artwork nodes, bounded runtime-field state, hourly counter-signal nodes, append-only curatorial decision nodes, cycle/provenance packets, status transitions and explicit typed relations | OPH-018 connects rationale-required approve/reject/revise governance to works; end-to-end public trace and physical-output nodes remain to be connected |
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
| 1 | OPH-016 · Runtime continuity and freshness summary — **DONE** | Existing field, cycles and settings | Studio distinguishes active, quiet, stale, disabled and failed from stored timestamps without claiming current liveness; deterministic clock tests cover all labels |
| 2 | OPH-017 · Counter-signal / erasure ledger nodes — **DONE** | OPH-015 topology; identity-free refractory bound is **DONE** | An anonymous burst rotates the field at most once per declared interval; refusals coalesce into one expiring hourly counter-signal node/edge with no request-level or individual attribution |
| 3 | OPH-018 · Curatorial decision relations and lineage comparison — **DONE** | OPH-015, current rationale gate | Approve/reject/revise decisions appear as attributed human-governance edges; comparison never mutates candidate state |
| 4 | OPH-019 · Public trace lifecycle | OPH-016–018 | Observation, interpretation, candidate, decision and public/refused outcome can be followed end-to-end with redacted public projections |
| 5 | OPH-020 · Simulated physical bridge contract | Stable bounded score schema | Deterministic light/sound adapter validates bounds, has safe/quiet fallback and recorded simulator evidence; no real hardware action |
| 6 | OPH-021 · Ecosystem literacy protocol and evidence rubric | OPH-019 | A visitor can distinguish node, relation, interpretation and human decision without disclosure; facilitator and automated evidence updated |
| 7 | OPH-022 · Reliability/access/privacy/judge pass | Each preceding slice | Migrations, invalid relations, stale state, reduced motion, narrow screens, redaction and reproducible judge path are covered |

External deployment, quota, feedback, video and submission items remain blocked as recorded on the project board. They are not prerequisites for deterministic ecosystem work and this lane will not attempt them.

## Latest runtime continuity slice

On 2026-07-14 OPH-016 added one public Studio continuity record derived only from stored aggregate buckets, public-field revisions, composition-cycle outcomes and the operator cycle setting. It exposes active, quiet, stale, disabled and failed labels with observed/updated/assessment timestamps, a documented local two-hour threshold and an explicit statement that stored evidence cannot verify current server, sensor or installation liveness. A deterministic clock test covers all five labels; the judging smoke verifies the same public projection. OPH-017 now carries this runtime evidence into an expiring aggregate counter-signal node without adding request-level traces.

## Latest counter-signal slice

On 2026-07-14 OPH-017 completed the consequential-refusal ledger. The atomic refusal transaction now coalesces all accepted pressure in a UTC hour into one counter-signal node containing only accepted, applied and deferred totals. Its typed `counter-to` edge addresses a dedicated bounded runtime-field node—not an artwork or visitor—and both node and edge expire with the configured aggregate-retention policy. The public projection caps counter-signals at 24, remains graph-closed, and states that it stores no request timestamp, order, surface, technical marker, free text, visitor identifier or inferred trait. Deterministic tests cover a six-request burst, a second eligible revision in the same hour, a new hour, exact schema minimisation and expiry.

## Latest curatorial governance slice

On 2026-07-14 OPH-018 made approve, reject and return-for-revision into append-only curatorial decision nodes. Each protected action requires a rationale and atomically commits the artwork status, latest provenance review and historical decision record; existing non-pending provenance reviews migrate idempotently. The bounded public topology projects up to 40 eligible decisions as attributed governance edges to visible artworks while preserving graph closure and explicit total/truncation metadata. Operator attribution is a role record, not proof of identity, and selecting one or two comparison candidates remains reversible browser state with no storage or publication effect. Deterministic tests cover all three decisions, status history, rationale/role evidence, topology closure, the HTTP boundary and restart idempotence. Next: OPH-019 should connect observation, interpretation, candidate, decision and public/refused outcome into one redacted trace lifecycle.

## Slice discipline

Each run chooses at most one independently testable item, records what changed and what remains absent, and stops on a clean dependency rather than manufacturing activity. Evidence must include the narrowest relevant test plus `npm run check`, `npm test`, and `npm run judge:smoke` when the public loop is affected.
