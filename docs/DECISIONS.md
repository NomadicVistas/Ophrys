# Decision log

## D-001 · One standalone service

Use one dependency-free Node 24 service with same-origin static pages/API and SQLite WAL. This keeps the Build Week system runnable, inspectable and portable.

## D-002 · Three information boundaries

Public field is experiential; Studio is a sanitized evidence ledger; Operator contains protected controls and full operational state. Hidden model reasoning is never presented as evidence.

## D-003 · Aggregate, expiring public traces

Ophrys counts a small event vocabulary by hour. No persistent visitor identifier or psychological classification exists.

## D-004 · Mandatory human publication

GPT‑5.6 may compose artwork candidates. It may not approve, publish, advertise or claim exhibition readiness.

## D-005 · Bounded schemas, not generated executable code

The composition organ emits strict JSON. Future visual/audio engines will render validated scores locally and will never execute arbitrary model output.

## D-006 · Consequential refusal rotates a shared repertoire

The public field renders a server-owned score with a fixed three-lure vocabulary and numeric bounds. Aggregate approach and attention alter its tempo and tilt. The first refusal transaction permitted by the shared refractory policy suppresses the active lure and selects the next bounded lure; every accepted refusal increments one coarse aggregate count. The field state contains no persistent visitor identifier or interpretation of why the refusal occurred. D-016 specifies the later refractory refinement.

## D-007 · Artwork provenance lives with the candidate

Each generated artwork stores a provenance packet alongside the candidate record. The packet carries the prompt version, aggregate input summary, returned usage data, rights basis, and curator review fields so approval, revision and rejection remain inspectable without exposing private visitor data or hidden reasoning.

## D-008 · Accessibility changes the encounter structure

Keyboard access, reduced motion and failure states are part of the artwork's public agency rather than a separate explanatory layer. Primary navigation remains present on narrow screens, refusal and Operator controls use native elements, artwork cards lead somewhere on activation, and a failed data request visibly declines to claim system state. The automated suite protects these boundaries without claiming final WCAG certification.

## D-009 · Comparison precedes publication decisions

Candidate selection is reversible Operator-interface state and never changes a candidate record. The Operator may align at most two works across the same artistic, public-agency and provenance fields, then approve or reject each independently. Both terminal decisions require a written human rationale stored in the candidate's provenance packet; model output and comparison position never decide publication.

## D-010 · Education is enacted through the live state

The public AI-literacy protocol uses the same bounded field score and refusal transaction as the artwork rather than a simulated lesson. Lure precedes explanation; Reveal labels observation, provisional interpretation, uncertainty, artistic choice and human responsibility separately; Counter-read suppresses the active lure and exposes the next collective revision. The learning outcome is the ability to distinguish counting from interpretation and verify agency without requiring personal disclosure.

## D-011 · Compute accounting uses enforceable units

Each composition attempt stores its requested and returned model, provider-returned token usage, measured latency and active output-token cap. A validated UTC daily attempt limit is enforced even for manual Operator cycles. Studio and Operator show the same compute boundary; they do not convert tokens into a speculative currency amount because provider pricing is external and may change. Provider billing controls remain an additional external safeguard, not a substitute for application limits.

## D-012 · Ecosystem lineage records context, not hidden influence

Artwork nodes keep explicit, typed relations. The first relation, `context-derived-from`, is created only when an earlier work ID was actually included in a candidate's bounded composition input. Its public evidence states that only title and publication state were present and that the edge does not imply authorship, approval or aesthetic descent. A relation cannot change publication status; the human curatorial gate remains separate.

## D-013 · A quartet can enter the ecosystem without becoming an exhibition

Four human-authored studies map Threshold, Field, Residue, and Counter-field into distinct artwork propositions. They are seeded idempotently as `studio` candidates with project-owned provenance and explicit relations, while `False Spring` remains the sole published work. Seeding provides a substantive ecosystem for comparison and lineage testing; it does not count as curatorial approval, a model-generated cycle, or evidence of a public physical exhibition.

## D-014 · Public topology projections are closed bounded graphs

The Studio selects its newest bounded artwork-node page before selecting relations. It returns only relations whose source and target are both present in that page, then reports exact ledger totals, in-projection relation eligibility and node/relation truncation separately. This preserves a valid inspectable graph as the ledger grows without implying that a partial projection is the whole ecosystem.

## D-015 · Runtime continuity is an evidence label, not a liveness claim

The public Studio derives one of five states from stored aggregate buckets, public-field revisions, composition-cycle outcomes and the operator cycle setting: `active`, `quiet`, `stale`, `disabled` or `failed`. `Active` means only that stored evidence is no more than two hours old; two hours is a documented local policy chosen for hourly buckets, not a sector standard. Every projection carries its observed, updated and assessment times, evidence basis and an explicit statement that it cannot verify a server, sensor or physical installation is currently live.

## D-016 · Refusal pressure and repertoire revision have different bounds

Every accepted refusal increments one anonymous hourly aggregate, but the shared repertoire may advance at most once during a 60-second server-side refractory interval. The atomic field transaction returns explicit `changed` and `deferred` outcomes plus the next eligible timestamp. This bound is global to the public field rather than attached to an IP address, cookie, fingerprint or visitor record. A deferred request is still public counter-pressure, but the interface does not claim that it suppressed a lure or created a new revision.

## D-017 · Counter-signals are hourly ecosystem nodes, not request histories

The same refusal transaction upserts at most one counter-signal node per UTC hour. Its complete durable payload is the hour bucket plus accepted, applied and deferred aggregate totals; it stores no request timestamp, order, surface, technical marker, free text or visitor reference. Each node has a `counter-to` relation to the bounded runtime-field node rather than to an artwork the action did not specifically address. Counter-signals use the configured aggregate-retention period, are capped to 24 nodes in the public projection, and cannot publish, approve or alter an artwork record.

## D-018 · Curatorial decisions are append-only governance nodes

Approval, rejection and return-for-revision each require a rationale and write one append-only curatorial decision in the same database transaction as the artwork status and provenance update. A request for the artwork's current status is not a decision: the store rejects it as a stable conflict before changing provenance or history. The bounded public topology connects each real transition node to its artwork with the resulting governance edge and Operator-role attribution. Existing non-pending provenance reviews are imported idempotently as historical decisions. A decision edge cannot create itself, comparison selection remains browser-only reversible state, and the public record does not claim to prove reviewer identity or deliberative quality.

## D-019 · Public lifecycles are derived, redacted views

An end-to-end public trace is derived from the existing cycle, artwork provenance and curatorial-decision ledgers rather than stored as a second mutable history. Each bounded trace connects a coarse aggregate observation, a labelled provisional interpretation, its Studio candidate, the latest human-gate decision and the resulting public, refused, revision or pending outcome. Observation inputs are combined by event kind; surfaces, request order, exact routes, provider response identifiers, raw errors and hidden model reasoning are omitted. A trace can report publication only when an append-only human approval exists.

## D-020 · Physical output begins as a transport-free deterministic contract

The first light/sound bridge consumes only the existing bounded field-score schema. It validates repertoire, phase, numeric limits, aggregate-count shape and source timestamp before mapping a score to capped light and sound values. The evidence packet carries a stable digest of the validated input, the mapping version and an explicit `hardwareAction: false` / `transport: none` boundary. Invalid or incomplete input returns a quiet frame with light and sound disabled instead of attempting recovery through a device. The current frame is a read projection connected to the runtime-field node; it is not evidence that physical hardware is present, live or rendered the output.
