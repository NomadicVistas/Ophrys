# Deployment

Canonical public origin: `https://ophrys.nomadicvistas.online/`.

## Target topology

```text
Caddy / HTTPS
  └─ 127.0.0.1:7799
       └─ Ophrys Node service
            ├─ public / Studio / Operator
            ├─ same-origin API
            └─ var/ophrys.sqlite
```

## Required environment

- `HOST=0.0.0.0` inside the container.
- `PORT=7799`.
- `OPENAI_API_KEY`.
- `OPHRYS_ADMIN_TOKEN`.
- Optional `OPENAI_MODEL=gpt-5.6-sol` is not needed while the setting remains in SQLite.

Publish only `127.0.0.1:7799:7799` on the host. Caddy should reverse proxy the public origin and add a second authentication layer to Operator routes.

## Current deployment gates

- [x] Host disk has safe working capacity.
- [x] Container image builds and tests on Node 24.
- [x] Operator token is generated and stored outside Git.
- [x] Caddy site block routes to the service.
- [x] HTTPS certificate and redirect are verified.
- [x] `/api/health/live` and `/api/health/ready` return 200.
- [x] Public, Studio and unauthorized Operator probes pass.
- [x] Deployment receipt records image, commit, time and rollback target.

The completed 2026-07-15 production evidence is recorded in [the artwork-hero release receipt](DEPLOYMENT_RECEIPT_2026-07-15.md).

## Review-branch handoff — 2026-10-20

The checked gates above describe the historical 2026-07-15 release, not a current
deployment approval or a fresh disk/image/secret audit. Production remains
`355d14c`; the OPH-029/030/031 runtime-header and protected-handover changes remain
undeployed. See [the bounded release handoff](RELEASE_HANDOFF_2026-10-20.md).
