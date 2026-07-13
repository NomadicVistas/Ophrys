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

- [ ] Host disk has safe working capacity.
- [x] Node 24 service runs healthy from the already-present runtime image without pulling or building under disk pressure.
- [ ] The project Dockerfile image builds and tests once safe disk capacity is available.
- [x] Operator token is generated with mode `0600` and stored outside Git.
- [ ] Caddy site block routes to the service.
- [ ] HTTPS certificate and redirect are verified.
- [x] `/api/health/live` and `/api/health/ready` return 200 inside the running service.
- [x] Public, Studio and unauthorized/authenticated Operator probes pass locally.
- [x] Deployment receipt records image, commit, time and rollback target.

The service is ready on host loopback. The public release remains blocked until the host-level Caddy TLS failure is repaired and its upstream route is verified.
