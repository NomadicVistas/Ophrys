# Judging guide

This path demonstrates the Build Week implementation without an API key, external service, persistent visitor record or model-generated code. It exercises the public field, consequential refusal, public Studio trace and protected Operator boundary.

## Five-minute local verification

Requirements: Node 24 or newer. This repository has no third-party runtime dependencies.

```bash
git checkout codex/hourly-builder
git pull --ff-only origin codex/hourly-builder
node --version
npm run check
npm test
npm run judge:smoke
```

The smoke command starts Ophrys on an ephemeral loopback port with an in-memory database. A pass proves that:

- the public field and readiness endpoint respond;
- only published work enters the public projection;
- refusal suppresses the active lure, rotates the bounded repertoire and increments the collective revision;
- Studio exposes that refusal as a coarse aggregate event and counter-read state;
- Operator data is denied without a bearer token; and
- publication remains in human-curated mode.

Expected final output begins with `Ophrys judging smoke: PASS`. No network access or credential is needed.

## Browser encounter

Start a disposable local instance:

```bash
OPHRYS_DB_PATH=:memory: OPHRYS_ADMIN_TOKEN=local-judging-token npm start
```

1. Open `http://127.0.0.1:7799/#encounter`. Follow **Lure → Reveal → Counter-read**: notice the active lure, compare the separately labelled observation, interpretation, uncertainty, artistic choice and human responsibility, then activate **Refuse this lure**. The named lure must be suppressed, another must replace it, and the collective revision must increase. The learning and facilitation protocol is in `docs/EDUCATION_ENCOUNTER.md`.
2. Open `http://127.0.0.1:7799/studio`. Under **Aggregate public field**, inspect the refusal count. The Studio separates observed counts, the provisional tactic, the counter-reading and curatorial status.
3. Open `http://127.0.0.1:7799/admin`. An empty or incorrect token must fail. The local token above reveals protected controls; it is deliberately disposable and must never be used for deployment.
4. Test keyboard navigation and, if available, reduced-motion mode. The recorded browser matrix and automated assertions are in `docs/ACCESSIBILITY.md`.

The human-authored `False Spring` seed keeps the encounter legible without cloud generation. Do not run `npm run cycle` for judging unless an authorised OpenAI project has quota: a live cycle is separately blocked as OPH-014, and every generated result remains a Studio candidate until a human decision.

## Dated implementation boundary

Ophrys's name, biological reference, spatial grammar and ethical proposition predate Build Week. The executable service starts with the Build Week baseline below; later commits are bounded additions to that service.

| Evidence | Commit |
|---|---|
| Pre-implementation hackathon brief | `5ccae9d` |
| Runnable public / Studio / Operator baseline | `5e8900af1e34048774462420fa1de12105776821` |
| Consequential aggregate refusal loop | `d091a7f6ae315c0a90cffaa9c039457046843a28` |
| Candidate provenance and human review packet | `ea424de63f0ab8821ed595518118d294dbe72170` |
| Accessible, responsive encounter verification | `4e3a610dedd7fa5d7893cba79aef6feec8776c70` |

Git history is the dated source of truth. External evidence that does not yet exist—public HTTPS, a successful live GPT-5.6 Sol cycle, `/feedback` session ID, video and Devpost URL—is left open in `docs/HACKATHON_EVIDENCE.md` rather than inferred.
