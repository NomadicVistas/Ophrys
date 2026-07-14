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

## 2026-07-13 — provenance packet

- Completed OPH-005 by persisting a provenance packet with each generated candidate: prompt version, aggregate input summary, returned usage payload, rights basis, and curator review fields now travel with the artwork record.
- Operator status changes now require and store a rationale, and archiving a candidate refuses without a rejection reason.
- The Studio and Operator views surface the stored packet so the candidate remains inspectable without collapsing into hidden approval logic.

## 2026-07-13 — scheduler model pin

- The first validation run used GPT‑5.6 Sol as configured. A later scheduled run silently used the workspace fallback model even though the job still named Sol; its OPH-005 change was independently reviewed and all five tests pass.
- Disabled fallbacks on `ophrys-build-week-hourly-sol`. Future runs must use `codex/gpt-5.6-sol` with high reasoning or fail visibly instead of substituting another model.

## 2026-07-13 — accessibility and responsive verification

- Completed OPH-006 across the public, Studio and Operator surfaces with skip links, persistent mobile navigation, visible focus treatment, live status/error regions and a global reduced-motion boundary.
- Recast artwork cards as real links to the Studio ledger. Keyboard focus no longer records an artwork-open event; the coarse aggregate event occurs only when the link is activated.
- Corrected muted small-text contrast from 3.71:1 to 4.74:1 and added deterministic contrast, semantic, responsive, motion and fallback-state assertions.
- Verified all surfaces in Chromium 149 at desktop and 390 × 844 mobile dimensions, including the reduced-motion preference. `npm run check` and all six tests pass.

## 2026-07-13 — reproducible judging evidence

- Advanced OPH-008 with a credential-free `npm run judge:smoke` path using an ephemeral loopback service and in-memory database.
- Recorded the exact runnable baseline SHA and the dated prior/new implementation boundary in `docs/JUDGING.md`, alongside a five-minute local and browser test sequence.
- Kept external proof honest: the primary Codex `/feedback` Session ID, public HTTPS URL, live GPT-5.6 Sol cycle, video and Devpost confirmation remain open and are not replaced with scheduler metadata.
- Verified `npm run check`, all six tests and the judging smoke; refusal rotated `orbit` to `interruption` at collective revision 1. OPH-008 is now blocked only on human/external evidence.

## 2026-07-13 — artwork candidate comparison

- Completed OPH-010 with a protected Operator workspace that selects up to two candidates for side-by-side comparison without changing their publication state.
- Aligned each candidate across proposition, visitor relation, exhibition form, learning question, lure hypothesis, counter-reading, materials, model/prompt/usage provenance, rights basis and current review.
- Replaced prompt-based status shortcuts with explicit per-candidate decision forms. Approval and rejection now both require a written curatorial rationale, enforced in the store as well as the browser, and the decision remains attached to the provenance packet.
- Verified `npm run check`, all six tests and the credential-free judging smoke.

## 2026-07-14 — education encounter protocol

- Completed OPH-011 with a public Lure → Reveal → Counter-read sequence driven by the existing live field score and consequential refusal transaction.
- Kept observation, provisional interpretation, uncertainty, bounded artistic choice and human curatorial responsibility separately labelled; the explicit learning outcome asks visitors to distinguish counting from interpretation and verify agency without personal disclosure.
- Added a five-minute facilitation protocol with observable completion evidence, optional participation and reduced-motion/keyboard boundaries.
- Extended deterministic coverage and the judging smoke to protect the encounter structure and live repertoire transition. `npm run check`, all seven tests, the judging smoke and Chromium 149 desktop/reduced-motion mobile render checks pass.

## 2026-07-14 — cost and compute ledger

- Completed OPH-012 with per-cycle records for requested/returned model, exact provider-returned token usage, measured request latency and the output-token limit active for that attempt.
- Added two enforced cost boundaries: at most four composition attempts per UTC day by default and at most 2,600 output tokens per request by default. Operator may adjust only within validated ranges; forcing a manual cycle does not bypass the daily limit.
- Exposed the same bounded ledger in public Studio and protected Operator views, including attempts remaining, usage availability and average latency. Currency cost is deliberately not estimated from potentially changing external prices.
- Verified `npm run check`, all eight deterministic tests and the credential-free judging smoke.

## 2026-07-14 — hourly builder stopped

- Stopped the bounded hourly builder because no honest READY or ACTIVE P0/P1 implementation item remains.
- Left the project completion flag false: OPH-007, OPH-008, OPH-009 and OPH-014 still depend on human authority or external deployment, feedback, recording, submission or API-quota state.
- Removed only the current hourly job; no additional automation was created.

## 2026-07-14 — ecosystem phase reactivated and explicit lineage

- Reinterpreted the old stopped state as the completed phase-one lane and created `ops/ECOSYSTEM_ROADMAP.md` for the active ecosystem phase.
- Re-audited `https://autopoiesis.art` read-only at 11:49 UTC. The site was reachable and exposed a separate eight-agent, multi-artwork gallery, but no Ophrys service route; its broad autonomous-emergence claims are not evidence for this bounded project. Compared `main` (`3e0c5c7`) with the builder head (`1fc5f5a`) without mutating either public production or `main`.
- Completed OPH-015: generated candidates now form explicit `studio` nodes and receive `context-derived-from` relations only for earlier work IDs actually present in the bounded composition packet.
- Added a public Studio topology projection with node/status counts, relation direction and concise evidence. It explicitly refuses claims of aesthetic similarity, authorship, visitor knowledge or automatic approval.
- Preserved the human gate: relation creation has no publication side effect and all generated works still enter `studio` pending a curator decision.
- Verified `npm run check`, all eight deterministic tests and `npm run judge:smoke`; the smoke retained aggregate-only traces, deny-by-default Operator access and curated publication.

Next: OPH-016, an evidence-based runtime continuity/freshness summary that distinguishes a quiet or stale organism from one known to be active.

## 2026-07-14 — curatorial ecosystem quartet

- Added four distinct human-authored Studio candidates at Ewoud’s request: `Borrowed Weather` (Threshold), `Choir of Almost` (Field), `Afterimage Commons` (Residue), and `The Unchosen Signal` (Counter-field).
- Gave each candidate a full artwork proposition, material form, visitor relation, lure hypothesis, counter-reading, learning question, and `human-ecosystem-quartet-v1` provenance packet.
- Kept every work unpublished with a pending human review; no composition API request, automatic approval, production deployment, or public artwork mutation occurred.
- Added four explicit `revision-of`, `coexists-with`, and `counter-to` relations so the quartet forms a legible ecosystem around `False Spring` without claiming authorship, causation, or approval.
- Added deterministic coverage proving the four candidates enter Studio, only `False Spring` remains public, and every relation endpoint exists in the projected topology.

Next: OPH-016 remains the structural priority, informed by the research observatory’s runtime-state disclosure recommendation and the integration reviewer’s graph-closure acceptance test.

## 2026-07-14 — closed bounded ecosystem projection

- Resolved the integration reviewer’s OPH-015 merge-readiness finding: the public topology now selects the bounded node page first and returns only relations whose two endpoints are present.
- Added exact total-node and total-relation counts, an in-projection eligible-relation count, explicit node/relation limits and truncation flags; the Studio labels all partial status and graph counts as projected rather than global.
- Added a deterministic growth fixture with 46 works and 865 relations. Its 40-node projection returns the capped 120 relations, and every returned source and target exists in the projected node set.
- Preserved the existing authority boundary: this changes only the read projection and creates no publication, curatorial decision, visitor record, identity mechanism or production mutation.
- Verified the targeted topology test, `npm run check`, all 10 tests and `npm run judge:smoke`.

Next: OPH-016 runtime continuity and freshness summary. The reviewer’s separate anonymous-refusal refractory-window finding remains open for a later bounded slice.

## 2026-07-14 — honest runtime continuity

- Completed OPH-016 with a public Studio continuity record that distinguishes `active`, `quiet`, `stale`, `disabled` and `failed` from stored aggregate buckets, public-field revisions, cycle outcomes and the operator cycle setting.
- Exposed the evidence basis, observed/updated/assessment timestamps and age. The two-hour stale threshold is labelled as local policy for hourly aggregate buckets, and every state explicitly refuses to claim that a server, sensor or physical installation is currently live.
- Kept the record in the primary evidence ledger, marked loading with `aria-busy`, and used the existing polite status region for the concise loaded-state transition.
- Added deterministic clock coverage for all five labels and extended the judging smoke to verify recent aggregate refusal evidence is represented as active without losing the no-liveness boundary.
- Verified the targeted continuity/server/accessibility checks, `npm run check`, all 11 tests and `npm run judge:smoke`.

Next: add an identity-free refractory window so an anonymous refusal burst can rotate the field at most once per declared interval, then persist bounded counter-signal/erasure nodes for OPH-017.

## 2026-07-14 — identity-free refusal refractory interval

- Completed the prerequisite boundary for OPH-017: every accepted refusal remains a coarse hourly aggregate, while an atomic server-side timestamp permits at most one shared repertoire revision per 60-second interval.
- Added explicit `changed`/`deferred` API outcomes, the applied and next-eligible timestamps, and public copy that distinguishes a successful suppression from anonymous pressure counted during the refractory interval.
- Kept the bound field-wide and identity-free: no IP persistence, cookie, fingerprint, visitor row, individualized cooldown or claim that multiple requests represent multiple people.
- Added deterministic store and HTTP tests proving six same-interval requests yield six aggregate counts but one revision, cannot wrap the three-lure repertoire, and allow exactly one more rotation after the injected clock advances 60 seconds.
- Verified the targeted refusal/public-boundary tests, `npm run check`, all 12 tests and `npm run judge:smoke`.

Next: complete OPH-017 by persisting a bounded aggregate counter-signal/erasure node and relation; do not create one ledger node per request.

## 2026-07-14 — expiring aggregate counter-signal ledger

- Completed OPH-017 by coalescing every accepted refusal in a UTC hour into one counter-signal record with only accepted, applied and deferred aggregate totals.
- Added a dedicated bounded runtime-field topology node and a typed `counter-to` edge. The public action is not falsely attributed to an artwork, person, device or motive, and it cannot change publication or curator review state.
- Applied the existing aggregate-retention policy to counter-signals, capped the public projection at 24 retained counter-signal nodes, preserved the 120-edge projection bound and displayed expiry plus privacy limits in Studio.
- Recorded an isolation/linkage/inference assessment: no request timestamp, order, surface, IP address, cookie, fingerprint, user agent, free text, visitor identifier or inferred trait enters the counter-signal table.
- Added deterministic coverage for a six-request burst, same-hour coalescing, applied/deferred totals, a second hour, schema minimisation, graph closure and expiry. `npm run check`, all 13 tests and `npm run judge:smoke` pass.

Next: implement OPH-018 as typed curatorial decision relations while preserving reversible comparison and the rationale-required human publication gate.

## 2026-07-14 — coded artwork quartet

- Completed OPH-024 by turning the four human-authored candidates into distinct browser-native studies with original generated visual sources: atmospheric threshold, distributed near-resolution, visibly expiring residue and reversible selection.
- Added one consequential counter-action per work: clear the forecast, give silence equal status, erase the newest layer and restore a discarded signal.
- Kept all four candidates explicitly `studio` / unpublished. Studio links expose prototypes for review without changing publication state or making a museum-approval claim.
- Added accessible textual descriptions, native controls, reduced-motion handling, page-visibility pausing, capped pixel density, optional gesture-gated local synthesis and an explicit no-storage trace boundary.
- Recorded the complete artwork, implementation and image-prompt rationale in `docs/ARTWORK_QUARTET.md` and added deterministic route, asset-budget, privacy and publication-boundary coverage.

## 2026-07-14 — append-only curatorial governance

- Completed OPH-018 with append-only decision records for approval, rejection and return-for-revision, each carrying prior/resulting status, rationale, Operator role and time.
- Made the decision append atomic with the artwork status and latest provenance review; deterministic restart coverage proves existing non-pending provenance reviews import once without duplicating history.
- Added bounded curatorial decision nodes and governance edges to the graph-closed public ecosystem projection, with exact totals, truncation metadata and an explicit limit that Operator attribution does not prove reviewer identity or deliberative quality.
- Added an explicit return-for-revision action to the protected comparison workspace. Selecting works remains reversible browser-only state and cannot create a decision, publish a work or change its status.
- Preserved the visitor privacy boundary: decision records contain artwork governance only and no visitor event, identifier, profile, route or inferred trait.
- Verified the targeted migration/provenance tests, `npm run check`, all 15 tests and `npm run judge:smoke`.

Next: implement OPH-019 as one redacted end-to-end trace from aggregate observation through provisional interpretation, candidate and curatorial decision to a public or refused outcome.

## 2026-07-14 — redacted public trace lifecycle

- Completed OPH-019 with a bounded, read-only lifecycle projection derived from the existing composition-cycle, provenance, artwork and append-only curatorial-decision ledgers rather than a second mutable history.
- Connected five explicit stages—coarse aggregate observation, provisional interpretation, Studio candidate, latest human decision and public/refused/revision/pending outcome—with inspectable endpoint links.
- Coarsened provenance inputs across source surfaces into event-kind totals and omitted request order, exact routes, provider response identifiers, raw errors and hidden model reasoning from the lifecycle projection.
- Kept authority at the existing human gate: a cycle can create only a candidate, while public and refused outcomes require the latest authenticated, rationale-required approval or rejection record.
- Added a responsive Studio lifecycle view with projection/redaction limits and an honest empty state. Extended the credential-free judge path with an ephemeral in-memory refused lifecycle; no live API request, deployment, publication or hardware action occurred.
- Verified the targeted lifecycle/accessibility tests, `npm run check`, all 16 tests and `npm run judge:smoke`.

Next: implement OPH-020 as a deterministic simulated light/sound bridge with strict score validation and a safe quiet fallback; do not contact real hardware.

## 2026-07-14 — curatorial transition invariant

- Resolved the integration reviewer’s P1 governance finding: a request for an artwork’s existing status is now rejected at the store boundary instead of manufacturing an approve/reject/revise record.
- Added the stable `ARTWORK_STATUS_UNCHANGED` error and authenticated HTTP `409` response while leaving the artwork status, provenance JSON and append-only decision count unchanged.
- Preserved valid governance: one real status transition still updates provenance and appends exactly one rationale-bearing Operator decision atomically.
- Replaced the HTTP fixture that re-approved the published seed with a real Studio-to-published transition and added deterministic store/API regression evidence.
- No artwork was published, deployed or changed outside isolated in-memory tests.
- Verified the targeted transition/API tests, `npm run check`, all 17 tests and `npm run judge:smoke`.

Next: OPH-020 remains the best bounded slice: a deterministic simulated light/sound bridge with strict score validation and a safe quiet fallback, without contacting real hardware.

## 2026-07-14 — transport-free simulated physical bridge

- Completed OPH-020 with a pure deterministic adapter that accepts only the existing bounded field-score schema and validates revision, phase/repertoire consistency, density, tempo, tilt, aggregate-count shape and canonical UTC source time.
- Mapped each valid score into capped light intensity/pattern/hue and sound gain/tone values with a stable input digest and mapping version. Repeating the same score produces byte-equivalent simulator evidence.
- Made failure quiet by construction: invalid or incomplete input returns light disabled, sound disabled and zero frame timing, with explicit validation errors.
- Fixed the bridge to `hardwareAction: false` and `transport: none`; the module imports no device, network or process transport and performs no real hardware action.
- Connected the current evidence frame to the runtime field with a typed `simulated-as` relation, displayed it in Studio and explicitly refused claims that a lamp, speaker, controller or installation rendered it.
- Added deterministic boundary tests and extended the credential-free judge path. `npm run check`, all 18 tests and `npm run judge:smoke` pass.

Next: OPH-021 ecosystem literacy protocol and evidence rubric, including the distinction between a simulated output record and physical hardware evidence.

## 2026-07-14 — ecosystem literacy without learner surveillance

- Completed OPH-021 with a public Studio sequence that distinguishes a bounded node, a declared relation, a provisional interpretation, a simulator-only output and a recorded human curatorial decision.
- Added a server-owned literacy projection that selects current graph-closed evidence for every step and reports an absent lifecycle interpretation honestly instead of manufacturing one.
- Added a five-check technical rubric that verifies evidence availability only. It collects no answer, quiz result, route, comprehension score or inferred learner state and explicitly refuses to claim educational effectiveness.
- Recorded a five-minute facilitator protocol with optional participation, contestable labels and a boundary against ranking comprehension or treating the encounter as human-subject research.
- Extended the credential-free judging fixture to provide all five evidence types and require 5 / 5 technical evidence while retaining redacted lifecycle inputs, human-curated publication and disabled hardware transport.
- Verified the focused literacy/accessibility tests, `npm run check`, all 19 tests and `npm run judge:smoke`.

Next: OPH-022 phase-two reliability, accessibility, privacy and reproducible judging audit; select one failure-backed vertical fix rather than broad cosmetic hardening.

## 2026-07-14 — static reduced-motion semantics and 320px browser evidence

- Began OPH-022 with the research observatory's reduced-motion acceptance boundary and found a concrete mismatch: the quartet stopped its animation loop but temporary counter-actions still promised a timed restoration that could not be redrawn.
- Made reduced-motion counter-states explicitly static and labelled. Each work retains its lure instruction, native counter-action, notes and Studio link, and the device preference is read locally without storage or public-ledger projection.
- Added dynamic preference handling that cancels continuous rendering on reduction and safely resumes bounded timed states when motion is re-enabled.
- Added a dependency-free Chromium DevTools smoke across all four coded studies at 320 × 700 CSS pixels. It asserts no ongoing animation frame, CSS motion, horizontal overflow or hidden control and requires a rendered static canvas alternative.
- No artwork status, curatorial decision, aggregate schema, production service, hardware or scheduler was changed. OPH-022 remains active: migration, malformed-relation, stale-state, redaction and judge-reproducibility audits are still open.
- Verified `npm run test:accessibility`, `npm run check`, all 19 tests and `npm run judge:smoke`.

Next: audit malformed relation and migration failure handling as the next bounded OPH-022 slice.

## 2026-07-14 — transactional migration and relation-ledger integrity

- Continued OPH-022 with two reproducible failure boundaries: additive schema changes could survive a later incompatible-schema failure, while a directly corrupted relation row could disappear from joined projections but remain in total counts.
- Added explicit SQLite schema version 1, transactional schema creation/additive upgrades and required-column validation. Unsupported future or incompatible schemas close the store; a deterministic fixture proves no added table, column or version marker survives failure.
- Moved seed, quartet relation and curatorial-decision initialization into one transaction and added stored relation-ledger validation before committing or exposing public state.
- New relations now require two existing distinct artwork endpoints, a declared relation type, concise trimmed evidence and a canonical UTC creation time. Existing malformed rows stop initialization with a stable integrity error and remain untouched for deliberate repair rather than being silently omitted or deleted.
- This slice changes no visitor aggregation, artwork status, curatorial decision, publication, deployment, hardware transport, production database or scheduler state.
- Verified the three focused migration/integrity tests, `npm run check`, all 21 tests and `npm run judge:smoke`.

Next: audit the stale-state boundary as the next bounded OPH-022 slice; public-redaction and judge-reproducibility audits remain open.
