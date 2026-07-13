# Autonomy policy

## Allowed without additional approval

- Read and edit this repository.
- Implement one board item at a time.
- Run local checks and deterministic tests.
- Use read-only research from primary or authoritative sources.
- Create at most two temporary read-only subagents for independent audits.
- Commit and push verified changes to the designated automation branch.

## Requires human approval

- Publishing an artwork or claiming exhibition readiness.
- Production deployment, DNS, TLS, credentials or infrastructure cleanup.
- Paid generation beyond a documented test cycle and budget.
- Public communication, marketing, submission or partner contact.
- Personal-data processing, research with participants or material changes to the ethics boundary.
- Creation of additional recurring automation.

## Forbidden

- Covert profiling, vulnerability targeting, biometrics or individual tracking.
- Hidden persuasive optimisation, dark patterns or obstructed refusal.
- Model-generated code execution.
- Recursive cron creation or automation sprawl.
- Force pushes, destructive Git recovery or secret publication.

## Stop conditions

The hourly builder stops when `ops/AUTONOMY_STOP` exists, Build Week P0 is complete, or the deadline has passed. Repeated blockers are documented and skipped after three runs.
