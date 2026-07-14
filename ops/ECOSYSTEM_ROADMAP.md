# Ophrys ecosystem roadmap

Last re-audited: 2026-07-14. This is the active phase-two plan; the stopped phase-one lane remains a completed foundation.

## Current-state map

| Layer | Present on `codex/hourly-builder` | Evidence / gap |
|---|---|---|
| Runtime organism | Aggregate hourly events, labelled field score, bounded three-lure renderer, consequential refusal, candidate composition, human publication gate | OPH-016 adds honest continuity; the OPH-017 prerequisite now records every refusal as aggregate pressure while permitting at most one atomic repertoire revision per declared 60-second interval |
| Ecosystem | Seed and generated artwork nodes, cycle/provenance packets, status transitions, explicit composition-context relations | OPH-015 adds a bounded public topology projection closed over relation endpoints, with exact totals and truncation metadata; counter-signal, decision and physical-output nodes remain to be connected |
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
| 2 | OPH-017 · Counter-signal / erasure ledger nodes — **ACTIVE** | OPH-015 topology; identity-free refractory bound is **DONE** | An anonymous burst rotates the field at most once per declared interval; a refusal creates only a coarse counter-signal node/edge with bounded retention or aggregation and no individual attribution |
| 3 | OPH-018 · Curatorial decision relations and lineage comparison | OPH-015, current rationale gate | Approve/reject/revise decisions appear as attributed human-governance edges; comparison never mutates candidate state |
| 4 | OPH-019 · Public trace lifecycle | OPH-016–018 | Observation, interpretation, candidate, decision and public/refused outcome can be followed end-to-end with redacted public projections |
| 5 | OPH-020 · Simulated physical bridge contract | Stable bounded score schema | Deterministic light/sound adapter validates bounds, has safe/quiet fallback and recorded simulator evidence; no real hardware action |
| 6 | OPH-021 · Ecosystem literacy protocol and evidence rubric | OPH-019 | A visitor can distinguish node, relation, interpretation and human decision without disclosure; facilitator and automated evidence updated |
| 7 | OPH-022 · Reliability/access/privacy/judge pass | Each preceding slice | Migrations, invalid relations, stale state, reduced motion, narrow screens, redaction and reproducible judge path are covered |

External deployment, quota, feedback, video and submission items remain blocked as recorded on the project board. They are not prerequisites for deterministic ecosystem work and this lane will not attempt them.

## Latest runtime continuity slice

On 2026-07-14 OPH-016 added one public Studio continuity record derived only from stored aggregate buckets, public-field revisions, composition-cycle outcomes and the operator cycle setting. It exposes active, quiet, stale, disabled and failed labels with observed/updated/assessment timestamps, a documented local two-hour threshold and an explicit statement that stored evidence cannot verify current server, sensor or installation liveness. A deterministic clock test covers all five labels; the judging smoke verifies the same public projection. Next, the reviewer’s identity-free refusal refractory window should precede OPH-017 counter-signal persistence so one anonymous burst cannot repeatedly rotate the field.

## Latest refusal-bound slice

On 2026-07-14 the OPH-017 prerequisite added an atomic, identity-free 60-second refractory interval to the public field. Six same-interval HTTP refusals now yield six coarse aggregate counts, exactly one applied repertoire revision and five explicit deferred outcomes; advancing the injected clock by 60 seconds permits exactly one further rotation. The public interface declares the interval and does not claim suppression for a deferred action. No IP address, cookie, fingerprint, visitor record, counter-signal node or publication decision was introduced. Next: persist a bounded aggregate counter-signal/erasure node and relation without turning individual requests into ledger entries.

## Slice discipline

Each run chooses at most one independently testable item, records what changed and what remains absent, and stops on a clean dependency rather than manufacturing activity. Evidence must include the narrowest relevant test plus `npm run check`, `npm test`, and `npm run judge:smoke` when the public loop is affected.
