# Artwork register

Every candidate must receive a provenance packet before publication.

Required fields:

- candidate ID, title and creation time;
- cycle ID, requested model and returned model;
- prompt/schema version and aggregate input summary;
- source/corpus references and rights basis;
- materials, exhibition constraints and accessibility notes;
- uncertainty, lure hypothesis and counter-reading;
- human curator, decision, date and rationale;
- rejection or revision reason;
- public/exhibition status and documentation links.

Implementation note: generated candidates keep that packet in the artwork record itself, including prompt version, aggregate input summary, returned usage payload, rights basis and curator review fields. The protected Operator can align up to two candidates for comparison. Both approval and rejection require an explicit curatorial rationale, enforced server-side and retained with the candidate.

Current seed work: `False Spring` — human-authored baseline, public status, used to test the exhibition interface.

Current human-authored ecosystem candidates, all `studio` / unpublished and pending explicit curatorial review:

- `Borrowed Weather` — Threshold: an atmospheric address that exposes its aggregate crossing basis and can be neutralised through refusal.
- `Choir of Almost` — Field: distributed unresolved sound that responds to collective density without recording voices or individual paths.
- `Afterimage Commons` — Residue: a decaying aggregate trace whose retention, expiry, and public erasure are visible materials.
- `The Unchosen Signal` — Counter-field: favoured, discarded, refused, and restored signals remain inspectable rather than disappearing into optimisation.

The quartet was drafted with Codex assistance after Ewoud’s 2026-07-14 request. It did not use the composition API, carries `human-ecosystem-quartet-v1` provenance, and does not enter the public exhibition until a human curator records an explicit approval rationale.

Each candidate now also has an original generated visual source and a bounded browser-native prototype under `/works/<slug>`. The public Studio may link to these routes as explicitly unpublished studies; this does not change the artwork record’s `studio` status or satisfy the human publication gate. Interaction, physical translation, image prompts and review questions are recorded in [the coded quartet dossier](ARTWORK_QUARTET.md).

Implementation note: the adaptive field score is system state, not a newly approved artwork. Its fixed `orbit`, `interruption`, and `split-signal` repertoire exists to test the seed work's consequential counter-reading; model-generated candidates still require separate provenance and human approval.
