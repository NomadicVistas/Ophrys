# Security

Report security issues privately to Nomadic Vistas rather than opening a public issue with exploit details.

## Runtime boundary

- `OPENAI_API_KEY` and `OPHRYS_ADMIN_TOKEN` are server-only environment variables.
- Operator endpoints require a bearer token and same-origin mutation context.
- Production should add edge authentication for `/admin` and `/api/admin/*`.
- Public inputs use an allow-listed event vocabulary, body limit, aggregate rate limit and no HTML rendering.
- Responses use strict JSON schema and model output is never executed.
- Logs and errors must redact credentials and avoid raw provider responses on public routes.

## Production requirements

- HTTPS only.
- Long random Operator token stored outside Git.
- Loopback-only host port behind Caddy.
- Read-only container filesystem where practical, persistent `var/` only.
- Database backup, restore test, health checks and rollback receipt.
