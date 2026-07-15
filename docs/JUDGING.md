# Judging guide

This path demonstrates the Build Week implementation without an API key, external service, persistent visitor record, hardware action or model-generated code. It exercises the public field, consequential refusal, public Studio trace, transport-free light/sound simulator and protected Operator boundary.

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
- the first refusal in a declared 60-second interval suppresses the active lure, rotates the bounded repertoire and increments the public field revision; further same-interval refusals are counted as aggregate pressure but explicitly deferred;
- Studio exposes that refusal as a coarse aggregate event and counter-read state;
- Studio exposes five distinct ecosystem-literacy evidence types and the deterministic fixture satisfies all five technical checks without collecting or scoring a learner;
- the bounded field score produces a digest-linked light/sound simulator frame with hardware action disabled and transport set to `none`;
- Operator data is denied without a bearer token; and
- publication remains in human-curated mode.

Expected final output begins with `Ophrys judging smoke: PASS`. No network access or credential is needed.

The fixture injects a fixed UTC clock, passes its own disposable Operator token, and ignores deployment database, port, token and API-key settings. The OPH-022 reproducibility audit also runs it with an otherwise empty environment, a non-UTC timezone and deliberately unusable deployment values; the smoke still uses only its in-memory ledger and ephemeral loopback listener. It never calls the composition provider.

## Browser encounter

Start a disposable local instance:

```bash
OPHRYS_DB_PATH=:memory: OPHRYS_ADMIN_TOKEN=local-judging-token npm start
```

1. Open `http://127.0.0.1:7799/#encounter`. Follow **Lure → Reveal → Counter-read**: notice the active lure, compare the separately labelled observation, interpretation, uncertainty, artistic choice and human responsibility, then activate **Refuse this lure**. On the first action in the current interval, the named lure must be suppressed, another must replace it, and the public field revision must increase. If the field interval is already refractory, the control must say that anonymous pressure was counted while no new revision is claimed. The learning and facilitation protocol is in `docs/EDUCATION_ENCOUNTER.md`.
2. Open `http://127.0.0.1:7799/studio#literacy`. Follow **Node → Relation → Interpretation → Simulated output → Human decision**. Confirm that each card names current evidence and its limit, the rubric says it checks technical evidence rather than learner comprehension, and visitor responses stored is `none`. The facilitator protocol is in `docs/ECOSYSTEM_LITERACY.md`.
3. Under **Aggregate public field**, inspect the refusal count. Under **Simulated physical bridge**, inspect the light/sound frame, source revision and digest; confirm that the panel says hardware action is disabled and does not claim a device rendered it. The Studio separates observed counts, the provisional tactic, the counter-reading and curatorial status.
4. Open `http://127.0.0.1:7799/admin`. An empty or incorrect token must fail. The local token above reveals protected controls; it is deliberately disposable and must never be used for deployment.
5. Test keyboard navigation and, if available, reduced-motion mode. The recorded browser matrix and automated assertions are in `docs/ACCESSIBILITY.md`.

When Chromium is installed, the reduced-motion and narrow-screen path is repeatable without a browser library:

```bash
npm run test:accessibility
```

This opens each coded study only on an ephemeral loopback server, emulates a 320 × 700 CSS-pixel reduced-motion viewport, and fails on an animation loop, CSS motion, horizontal overflow, hidden evidence/control path or missing static canvas alternative. It reads the device preference locally and stores no preference or visitor record.

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
