# Deployment receipt — artwork hero release

## Authority and scope

Ewoud Bakker explicitly authorised public presentation of all four artworks and production deployment on 2026-07-15. This release makes the artwork encounter lead the public site; it does not authorise live model generation, hardware output or a submission action.

Each artwork received its own rationale-bearing `approved` curatorial decision before its public status became `published`:

- `study-borrowed-weather`
- `study-choir-of-almost`
- `study-afterimage-commons`
- `study-unchosen-signal`

## Deployed revision

- Public origin: `https://ophrys.nomadicvistas.online/`
- Verified application revision: `355d14cd488a864839a5fda6b7e300b49d9aff62`
- Previous production revision and rollback target: `3e0c5c7691c04d7eeb2b3424bbe2c18d47fdd251`
- Service restart: `2026-07-15T09:20:30Z`
- Acceptance completed: `2026-07-15T09:28:32Z`
- Runtime: Node `v24.18.0`
- Image: `ghcr.io/hostinger/hvps-openclaw:latest`
- Image ID: `sha256:ff1cfd1de868682a2a9935cb15be6308eadd7fda061f817f7a2851264f40d01c`
- Container state at acceptance: running and healthy
- Application code: bind-mounted read-only at `/app`
- Persistent state: separate read-write mount at `/app/var`
- Host disk at acceptance: 193 GB total, 79 GB available, 60% used

The Operator token remained in the container environment and was not printed or committed.

## Acceptance evidence

- `npm run check`: passed.
- `npm test`: 24 deterministic tests passed.
- `npm run test:accessibility`: four reduced-motion artworks passed at 320 × 700 CSS pixels with no loop, overflow, hidden control or stored preference.
- `npm run judge:smoke`: passed.
- `/api/health/live` and `/api/health/ready`: HTTPS 200.
- Homepage, Studio, all four artwork routes and all four artwork image assets: HTTPS 200.
- Unauthenticated `/api/admin/state`: HTTPS 401.
- Public status projection: all four works are `published` with `reviewDecision: approved`.
- Chromium production render: all four heroes show `Published · human approved`; each artwork route resolves its title, status and canvas.
- Engagement smoke: `artwork_open` returned 202 and disclosed that only an aggregate hourly count was stored, with no visitor identifier.
- Response policy retained: self-only content security policy, denied camera/microphone/geolocation/topics permissions, content-type protection and strict-origin referrer policy.

## Rollback

If a regression is found, fast-forward or revert the production worktree to the recorded rollback revision, restart the `ophrys` container and repeat the health, public-route, status and unauthorized-Operator probes. The persistent database must not be deleted or replaced during application rollback; the four human decisions remain governance records unless a human records new decisions.

## Historical-record provenance — 2026-10-20

This pre-existing receipt was retained intact during the builder's record-only
reconciliation. Its authority, restart time, image, disk, secret-handling and
Chromium claims are inherited historical evidence, not actions performed or
newly verified by this scheduled run. Read-only HTTPS checks on 2026-10-20
confirmed the deployed HTML/JS hashes still match local main `355d14c`, healthy
readiness, four approved/published status projections and Operator API 401.
These checks do not renew release authority. No rollback, restart, publication
or deployment was performed.
