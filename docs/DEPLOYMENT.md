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
- [ ] Container image builds and tests on Node 24.
- [ ] Operator token is generated and stored outside Git.
- [ ] Caddy site block routes to the service.
- [ ] HTTPS certificate and redirect are verified.
- [ ] `/api/health/live` and `/api/health/ready` return 200.
- [ ] Public, Studio and unauthorized Operator probes pass.
- [ ] Deployment receipt records image, commit, time and rollback target.
