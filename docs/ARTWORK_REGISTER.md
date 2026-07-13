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

Implementation note: generated candidates now keep that packet in the artwork record itself, including prompt version, aggregate input summary, returned usage payload, rights basis and curator review fields. Archiving a candidate requires an explicit rejection reason.

Current seed work: `False Spring` — human-authored baseline, public status, used to test the exhibition interface.

Implementation note: the adaptive field score is system state, not a newly approved artwork. Its fixed `orbit`, `interruption`, and `split-signal` repertoire exists to test the seed work's consequential counter-reading; model-generated candidates still require separate provenance and human approval.
