# Bounded review-branch handoff — 2026-10-20

## Scope and provenance

The integration review at 2026-10-20T12:16Z prioritised reconciling four dirty
deployment-record paths instead of adding application features. This builder
retains their existing contents as historical records; it neither discards them
nor treats their historical authority as permission for a new release. Original
bytes were snapshotted outside Git before additive annotations.

Application candidate: `713db9986daebdf9da057592fd3f4101d2c6ac08`, comprising
OPH-029 (`8b82704`), OPH-030 (`b3f3652`) and OPH-031 (`713db99`) above deployed
`355d14cd488a864839a5fda6b7e300b49d9aff62`. The reconciliation commit changes
only `docs/` and `ops/`; there must be no additional application, test, asset,
script or package change. The reconciliation SHA is
`380a3a9bf25e2f55cc650a572a96af130b81ae1f`. The original handoff referred
to completed results in a builder run report; that report has not been retrieved
or independently attested in this repository. See the evidence status below.

## Independently observed production boundary

Read-only HTTPS GETs at 2026-10-20T13:25:59Z returned live/ready 200,
`database: ready`, four `published / approved` study statuses and unauthenticated
Operator API 401. Public state still omitted `runtime`; Studio reported stale
field-revision evidence observed at `2026-08-16T20:40:12.375Z` and zero cycles.
Served SHA-256 hashes matched the local deployed revision:

- HTML: `c562c96a0c6376c5c20a9e7d724fc0c85345dde795ebb3b9f44267b7d6e0dd2e`
- JS: `68eb1c9c026ca63bdb3558c2ded9e71d2dc4d65bb4f855bde77c01f3a619823c`

Service availability is not current composition or physical-liveness evidence.
The runtime-header defect remains public until a separately authorised release.
No request was sent to a composition, refusal, engagement or curator endpoint.
The historical image, restart, disk and secret claims were not re-audited.

## Revision-bound qualification

In a clean detached checkout of the reconciliation commit, record its full SHA,
Node/Chromium versions and clean status before and after these sequential checks:

```sh
npm run check
npm test
npm run test:accessibility
npm run judge:smoke
git status --porcelain
git diff --exit-code 713db99 HEAD -- src public scripts test package.json
```

Use no provider credentials, production database or hardware. The browser and
judge fixtures use in-memory state and ephemeral loopback services. Automated
320px/reduced-motion checks are not actual screen-reader/device evidence.
Qualification results belong to the exact reported SHA, not to production.

## Evidence status — 2026-10-21

Qualified-result availability is **unverified**, not a test failure or a newly
qualified release. The candidate under review is clean reconciliation revision
`380a3a9bf25e2f55cc650a572a96af130b81ae1f`, with application candidate
`713db9986daebdf9da057592fd3f4101d2c6ac08` unchanged. Any later documentation-only
commit is a handoff addendum, not a new application qualification.

| Required qualification command | Revision-bound result available here |
|---|---|
| `npm run check` | Absent; prior run report not retrieved |
| `npm test` | Absent; prior run report not retrieved |
| `npm run test:accessibility` | Absent; prior run report not retrieved |
| `npm run judge:smoke` | Absent; prior run report not retrieved |

The builder independently confirmed clean status at `380a3a9`, no application
changes against `713db99` in `src public scripts test package.json`, and passing
`git diff --check main..HEAD` on 2026-10-21. These structural checks do **not**
attest the four qualification commands above. Historical test statements in the
progress log are not substituted for revision-bound output. Full suites were
not repeated merely for cadence on unchanged code, following the current
integration recommendation.

Before treating this candidate as technically qualified, retrieve the original
report with its exact SHA, command outcomes, environment versions and clean
before/after status. If unavailable, leave the evidence gap explicit; do not
infer a pass or release authority from this note. Actual assistive-technology,
point-of-encounter refusal and contextual exhibition reviews remain separate
and unperformed. Research recommendations are not demonstrated product defects
or approved artistic substitutions.

## Separate human decisions still required

No merge, deployment, production restart, curator decision or scheduler change
is authorised by this record. A future approved release must verify the exact
seven-field public runtime schema, hydrated 320px header and Studio evidence link,
configured-only model wording, no active indicator for stale/failed/unavailable,
health 200, Operator 401, four approved study routes and exact served asset hashes
against the approved revision. Do not manufacture fresh runtime evidence.

OPH-030's contextual exhibition classification, notice, provenance responsibility
and first-exposure accessible equivalents remain human-owned and unassessed.
Actual assistive-technology evaluation, venue/physical access review, operational
handover, paid live-provider proof and submission also remain outstanding. A new
implementation slice needs a reproduced defect or explicit authorised scope.
