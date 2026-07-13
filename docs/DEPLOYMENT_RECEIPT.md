# Deployment receipt

## 2026-07-13T21:03:32Z — host-loopback runtime

- Git commit: `3e0c5c7691c04d7eeb2b3424bbe2c18d47fdd251` (`main`).
- Runtime: Node `v24.18.0` from the already-present `ghcr.io/hostinger/hvps-openclaw` image (`sha256:ff1cfd1de868682a2a9935cb15be6308eadd7fda061f817f7a2851264f40d01c`).
- Container: `ophrys`, `restart=unless-stopped`, read-only root filesystem, `no-new-privileges`, bounded temporary filesystem.
- Code mount: a dedicated stable `main` worktree mounted read-only. The autonomous `codex/hourly-builder` worktree is not mounted into the runtime.
- State mount: only `/app/var` is writable for the SQLite database.
- Network: host loopback only, `127.0.0.1:7799:7799`; no direct public container port.
- Secrets: Operator token generated with mode `0600` and excluded from Git. Provider credentials remain server-side.

Verified from inside the running container:

- readiness `200`;
- public `/`, `/studio` and `/admin` documents `200`;
- unauthenticated/authenticated Operator API boundary `401/200`;
- database writable and ready;
- container health `healthy`.

## Public edge blocker

At `2026-07-13T21:05:10Z`, DNS resolved `ophrys.nomadicvistas.online` to the expected host and Caddy returned an HTTP `308` redirect to HTTPS. The HTTPS connection then failed during the Caddy TLS handshake with an internal-error alert, before an application response was possible. Caddy's admin interface is host-local and unavailable from the application container, so certificate/edge repair requires host-level access. The public demo must not be marked complete until HTTPS and the reverse proxy are verified externally.

## Rollback

Stop and remove only the `ophrys` container. Runtime data remains in the dedicated stable worktree's ignored `var/` directory. Recreate the container at the recorded commit and image digest after correcting the edge configuration.
