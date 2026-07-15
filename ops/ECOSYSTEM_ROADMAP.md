# Ophrys ecosystem roadmap

Last re-audited: 2026-07-15. This is the active phase-two plan; the stopped phase-one lane remains a completed foundation.

## Current-state map

| Layer | Present on `codex/hourly-builder` | Evidence / gap |
|---|---|---|
| Runtime organism | Aggregate hourly events, labelled field score, bounded three-lure renderer, consequential refusal, candidate composition, human publication gate | OPH-016 adds honest continuity; OPH-017 separates accepted counter-pressure from bounded applied revisions and retains no request-level trace |
| Ecosystem | Seed and generated artwork nodes, bounded runtime-field state, hourly counter-signal nodes, append-only curatorial decision nodes, redacted end-to-end candidate lifecycles, simulator-only physical-output nodes, cycle/provenance packets, status transitions and explicit typed relations | OPH-021 connects these records through a five-part public literacy protocol while refusing learner surveillance or comprehension claims |
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
| 3 | OPH-018 · Curatorial decision relations and lineage comparison — **DONE** | OPH-015, current rationale gate | Approve/reject/revise transitions appear as attributed human-governance edges; same-status requests cannot manufacture decisions; comparison never mutates candidate state |
| 4 | OPH-019 · Public trace lifecycle — **DONE** | OPH-016–018 | Observation, interpretation, candidate, decision and public/refused outcome can be followed end-to-end with redacted public projections |
| 5 | OPH-020 · Simulated physical bridge contract — **DONE** | Stable bounded score schema | Deterministic light/sound adapter validates bounds, has safe/quiet fallback and recorded simulator evidence; no real hardware action |
| 6 | OPH-021 · Ecosystem literacy protocol and evidence rubric — **DONE** | OPH-019–020 | A visitor can distinguish node, relation, interpretation, simulated output and human decision without disclosure; facilitator and automated evidence updated |
| 7 | OPH-022 · Reliability/access/privacy/judge pass — **ACTIVE** | Each preceding slice | Reduced motion, 320px study controls, transactional migration failure, malformed-relation refusal, stale-state timestamp integrity and full-payload public redaction are covered; judge reproducibility remains under audit |

External deployment, quota, feedback, video and submission items remain blocked as recorded on the project board. They are not prerequisites for deterministic ecosystem work and this lane will not attempt them.

## Latest runtime continuity slice

On 2026-07-14 OPH-016 added one public Studio continuity record derived only from stored aggregate buckets, public-field revisions, composition-cycle outcomes and the operator cycle setting. It exposes active, quiet, stale, disabled and failed labels with observed/updated/assessment timestamps, a documented local two-hour threshold and an explicit statement that stored evidence cannot verify current server, sensor or installation liveness. A deterministic clock test covers all five labels; the judging smoke verifies the same public projection. OPH-017 now carries this runtime evidence into an expiring aggregate counter-signal node without adding request-level traces.

## Latest counter-signal slice

On 2026-07-14 OPH-017 completed the consequential-refusal ledger. The atomic refusal transaction now coalesces all accepted pressure in a UTC hour into one counter-signal node containing only accepted, applied and deferred totals. Its typed `counter-to` edge addresses a dedicated bounded runtime-field node—not an artwork or visitor—and both node and edge expire with the configured aggregate-retention policy. The public projection caps counter-signals at 24, remains graph-closed, and states that it stores no request timestamp, order, surface, technical marker, free text, visitor identifier or inferred trait. Deterministic tests cover a six-request burst, a second eligible revision in the same hour, a new hour, exact schema minimisation and expiry.

## Latest curatorial governance slice

On 2026-07-14 OPH-018 made approve, reject and return-for-revision into append-only curatorial decision nodes. Each protected transition requires a rationale and atomically commits the artwork status, latest provenance review and historical decision record; existing non-pending provenance reviews migrate idempotently. A follow-up governance audit found that same-status requests could append false decisions, so the transactional store now rejects them with a stable `ARTWORK_STATUS_UNCHANGED` conflict and the HTTP boundary returns `409`, leaving status, provenance and decision count unchanged. The bounded public topology projects up to 40 eligible decisions as attributed governance edges to visible artworks while preserving graph closure and explicit total/truncation metadata. Operator attribution is a role record, not proof of identity, and selecting one or two comparison candidates remains reversible browser state with no storage or publication effect. Deterministic tests cover no-op rejection, all three real transitions, status history, rationale/role evidence, topology closure, the HTTP boundary and restart idempotence.

## Latest public lifecycle slice

On 2026-07-14 OPH-019 added a bounded read projection over existing cycle, provenance, artwork and curatorial-decision records. Each trace has five explicitly linked stages: coarse aggregate observation, provisional interpretation, Studio candidate, latest human-gate decision and public/refused/revision/pending outcome. Aggregate inputs are combined by event kind and the public projection omits source surfaces, request order, exact routes, provider response identifiers, raw errors and hidden model reasoning. The lifecycle does not create authority: only the existing authenticated, rationale-required decision transaction can produce a public or refused outcome. Deterministic tests prove both approval and refusal mappings, redaction, link closure and the empty state; the credential-free judge path now exercises a refused lifecycle without a paid API call.

## Latest simulated physical bridge slice

On 2026-07-14 OPH-020 added a pure deterministic adapter for field-score schema version 1. It validates the fixed lure repertoire, lure/counter-read relationship, score bounds, aggregate-count shape and canonical source timestamp before emitting capped light, sound and frame-timing values. Every valid frame carries a stable input digest and mapping version. Invalid or incomplete input returns zero light, zero sound and zero timing. The adapter has no device or network transport, reports `hardwareAction: false` and `transport: none`, and Studio explicitly says that a simulator frame is not evidence that a device rendered it. The current frame appears as a physical-output node related from the runtime field, preserving graph closure without claiming hardware liveness or adding visitor data.

## Latest ecosystem literacy slice

On 2026-07-14 OPH-021 added a bounded public literacy projection and Studio sequence for five distinct evidence types: node, declared relation, provisional interpretation, simulated output and recorded human decision. Each step names current evidence plus the claim it cannot support. When no generated lifecycle exists, the interpretation step reports the absence rather than inventing an example. The technical rubric measures only whether inspectable evidence is available; no answers, quiz results, routes, scores or inferred comprehension are collected. A five-minute facilitator protocol preserves optional participation and refuses to present the interface as human-subject research or proof of educational effectiveness. The deterministic judging fixture supplies all five evidence types and passes 5 / 5 without a paid model call, persistent database or hardware action.

## Latest OPH-022 reliability slice

On 2026-07-14 OPH-022 made reduced-motion counter-actions semantically honest across the coded quartet. A counter-state that cannot visibly time itself without a continuous animation loop now remains explicitly static instead of promising an unseen timed restoration. The interface exposes the locally read device preference, retains each work instruction, counter-action, notes and Studio evidence link, and stores no preference or visitor record. A dependency-free Chromium DevTools smoke checks all four studies at 320 × 700 CSS pixels and asserts no JavaScript animation loop, CSS motion, horizontal overflow or hidden control while requiring a non-empty static canvas alternative. Dynamic preference changes cancel or resume bounded rendering without losing the counter-state.

The second OPH-022 slice gives SQLite schema and relation-ledger failures a fail-closed boundary. Store schema creation, supported additive upgrades, required-column checks and the explicit schema-version write now commit atomically; an incompatible fixture proves that added columns, tables and the version marker all roll back. Initialization seeds and backfills inside a second transaction, then validates every stored artwork relation before any public projection can be returned. New relations require existing distinct endpoints, a declared type, bounded trimmed evidence and canonical UTC time; a deliberately corrupted legacy relation stops initialization without deleting or projecting the row. Targeted failure probes, syntax checks, all 21 deterministic tests and the credential-free judging smoke pass.

The third OPH-022 slice closes the runtime freshness clock boundary. A reproduced future aggregate bucket was previously clamped to age zero and labelled active. Continuity evidence now requires canonical UTC timestamps, exact UTC-hour alignment for aggregate buckets and no date later than the assessment clock. Invalid evidence returns a generic failed integrity record without exposing the offending value or manufacturing an age. The two-hour threshold now uses exact elapsed time and reports a conservatively rounded-up whole-minute age. Deterministic tests cover the exact threshold, one millisecond beyond it, a future bucket, a non-hourly bucket and a malformed value; syntax checks, all 22 tests and the credential-free judging smoke pass.

The fourth OPH-022 slice closes the public provenance boundary identified by integration review. Public and Studio state now use explicit allow-listed cycle, artwork, provenance and usage projections instead of spreading the protected Operator state. Provider response identifiers, source surfaces, exact routes, hidden reasoning and unknown nested fields stay behind authentication; aggregate evidence remains visible as totals by event kind alongside bounded usage and human-gate status. A deterministic HTTP fixture asserts unique private markers are absent from the complete public payload and retained in authenticated Operator state. Syntax checks, all 23 tests and the credential-free judging smoke pass.

Next: continue OPH-022 with the judge-reproducibility audit. OPH-022 remains active until that final audit has evidence.

## Slice discipline

Each run chooses at most one independently testable item, records what changed and what remains absent, and stops on a clean dependency rather than manufacturing activity. Evidence must include the narrowest relevant test plus `npm run check`, `npm test`, and `npm run judge:smoke` when the public loop is affected.
