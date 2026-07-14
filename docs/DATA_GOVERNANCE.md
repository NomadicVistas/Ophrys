# Data governance

## Purpose

Ophrys uses minimal aggregate events to compose an artwork about the limits of behavioural inference. It does not conduct psychological research and does not claim to understand visitors.

## Collected

- hourly counts of bounded events such as arrival, artwork open, short/long dwell band and explicit refusal;
- one hourly counter-signal aggregate containing accepted refusal, applied revision and deferred revision totals;
- the public surface on which the event occurred;
- system and artwork-cycle operational records.
- append-only curatorial governance records containing artwork ID, approve/reject/revise outcome, prior/resulting status, rationale, Operator role and timestamp.

## Not collected

- name, account, email, IP address in persistent storage or device identifier;
- face, voice, gait, gaze, exact route or raw camera/audio stream;
- emotion, intent, personality, vulnerability, demographics or diagnosis;
- cross-visit or cross-device history.

## Processing

- Browser events increment coarse hourly counters only.
- Counters expire automatically after the configured retention period (72 hours by default).
- Counter-signal nodes expire under the same policy and project only as a relation to the shared runtime field; they cannot change publication or curator review state.
- Curatorial decision records are created only by the protected status transaction. They contain no visitor data and selecting candidates for comparison creates no durable record.
- Public lifecycle traces are read-only projections over existing cycle, provenance and decision records. Aggregate inputs are combined by event kind; source surfaces, request order, exact routes, provider response identifiers, raw errors and hidden model reasoning are omitted.
- Simulated light/sound frames are deterministic read projections of the bounded aggregate field score. They add no sensor stream, device identifier or visitor record, and transport remains disabled.
- Aggregate summaries may enter a server-side GPT‑5.6 composition request.
- OpenAI requests use `store:false` and a stable system-level safety identifier.
- Raw API keys and Operator tokens remain server-side.

## Public agency

- The public Studio explains what is observed and what is merely interpreted.
- Refusal is counted as a valid compositional event.
- A consequential erase/reset/counter-signal control is a P0 requirement before completion.
- Production deployment requires a venue-specific notice and, where applicable, a data-protection assessment.

## Counter-signal anonymity review

- **Record isolation:** repeated requests in an hour coalesce into one row. The row has no request timestamp, sequence, surface, IP address, cookie, fingerprint, user agent, free text or visitor identifier.
- **Linkage:** the public relation targets only the shared runtime-field node. It does not target a request, device, route or individual artwork view. The hour bucket may be compared with other hourly aggregates, but those also contain no visitor key.
- **Inference:** accepted/applied/deferred totals show that aggregate counter-pressure occurred, not who acted, how many distinct people acted or why. A low-count bucket can still reveal that an action occurred during a coarse hour, so Ophrys describes the projection as an **aggregate counter-signal**, not as proof of anonymity in every deployment context.

This is a prototype data-minimisation assessment rather than a venue-specific legal determination. Deployment still requires review of other data reasonably available in that context.
