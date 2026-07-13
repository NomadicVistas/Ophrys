# Data governance

## Purpose

Ophrys uses minimal aggregate events to compose an artwork about the limits of behavioural inference. It does not conduct psychological research and does not claim to understand visitors.

## Collected

- hourly counts of bounded events such as arrival, artwork open, short/long dwell band and explicit refusal;
- the public surface on which the event occurred;
- system and artwork-cycle operational records.

## Not collected

- name, account, email, IP address in persistent storage or device identifier;
- face, voice, gait, gaze, exact route or raw camera/audio stream;
- emotion, intent, personality, vulnerability, demographics or diagnosis;
- cross-visit or cross-device history.

## Processing

- Browser events increment coarse hourly counters only.
- Counters expire automatically after the configured retention period (72 hours by default).
- Aggregate summaries may enter a server-side GPT‑5.6 composition request.
- OpenAI requests use `store:false` and a stable system-level safety identifier.
- Raw API keys and Operator tokens remain server-side.

## Public agency

- The public Studio explains what is observed and what is merely interpreted.
- Refusal is counted as a valid compositional event.
- A consequential erase/reset/counter-signal control is a P0 requirement before completion.
- Production deployment requires a venue-specific notice and, where applicable, a data-protection assessment.
