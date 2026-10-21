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
to completed results in a builder run report; that report had not been retrieved
or independently attested at the first 2026-10-21 review. The original report
has since been recovered; see the chronological evidence statuses below.

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

## Evidence status — 2026-10-21 (initial review)

The initial review at addendum `990dec0` could not retrieve the referenced run
report and explicitly marked the four command results absent. That was an
evidence-availability gap, not a failed test. The recovery below supersedes
that availability status without changing the qualified application candidate.

## Recovered qualification evidence — 2026-10-21 05:25 UTC run

The original shared-lane report was located at
`/data/.openclaw/workspace/ops/ophrys-ecosystem/BUILDER_QUALIFICATION_2026-10-20.json`
and is preserved byte-for-byte as [the qualification artifact](BUILDER_QUALIFICATION_2026-10-20.json).
Its SHA-256 is `0ad847ad2fadb5481fb554cb2713bd76585b7c3f7ffe77544c9168a384677766`.
The accompanying external `BUILDER_HANDOFF_2026-10-20.md` records a clean detached
checkout before and after qualification, with provider secrets and Ophrys
settings removed and in-memory local fixture state only. The JSON itself records
`cleanAfter: true`; it does not independently encode the starting status.

| Required qualification command | Recovered result for `380a3a9bf25e2f55cc650a572a96af130b81ae1f` |
|---|---|
| `npm run check` | Exit 0; syntax checks passed |
| `npm test` | Exit 0; 25 passed, 0 failed, 0 skipped |
| `npm run test:accessibility` | Exit 0; evidence-led header and four reduced-motion works at 320 × 700 CSS pixels |
| `npm run judge:smoke` | Exit 0; applied/deferred refusal, redaction, protected Operator, human publication and simulator boundaries passed |

The report records Node `v24.21.0`, Chromium `155.0.8059.39` on Debian 13,
and execution from `2026-10-20T13:27:47.422015+00:00` to
`2026-10-20T13:28:00.806983+00:00`. It also records a passing application-path
diff against `713db99`. This run independently parsed command identities, all
five exit codes, the candidate SHA and clean-after flag, checked unchanged
application paths at the current addendum, and checked Git whitespace integrity.
It recovered prior execution evidence; it did not rerun or newly attest the
four suites. Later record-only addenda are not new application qualifications.

Technical qualification evidence is now available for the exact reconciliation
candidate. It is not release approval, actual assistive-technology evidence,
paid provider proof, contextual exhibition assessment or production verification.
No visitor traces, secrets or protected prompts are included in the artifact.
Do not repeat full qualification solely for cadence on unchanged code.

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
