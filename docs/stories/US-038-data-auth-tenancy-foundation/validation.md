# Validation

## Proof Strategy

This story is not complete until integration proof exists for the security and tenancy guarantees in the product docs. Unit tests can cover parser and policy helper behavior, but they are not sufficient for RLS, session, and database authorization requirements.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Session/input parsers reject malformed role, class, fund, and month inputs; policy helpers preserve class and ownership scope. |
| Integration | Supabase/RLS or accepted backend proof allows a student to read own fund state, rejects another student's exact holdings, rejects future scenario rows, allows an instructor to read owned class God Mode data, and rejects unowned class access. |
| E2E | Deferred until student/instructor browser surfaces exist; prove real flows cannot cross class or role boundaries. |
| Platform | Server-only credentials and environment configuration are unavailable to browser/runtime contexts that should not hold them. |
| Performance | Authorization checks do not require broad cross-class scans for normal class dashboard reads. |
| Logs/Audit | Authorization failures are logged/audited without leaking credentials, future rows, or unauthorized holdings. |

## Fixtures

- Two classes with distinct instructors.
- Two students enrolled in one class and one student enrolled in another class.
- Fund and holdings rows for each student.
- Current, past, and future scenario rows.
- Pending TARA order and ledger draft rows if included in the minimal proof schema.

## Commands

```text
npm run validate:quick
TBD: integration proof command after Supabase/database boundary exists
```

## Acceptance Evidence

Blocked in the 2026-05-17 sprint. US-038 was reselected as the next existing prerequisite packet because remaining implementation packets are blocked by missing app, provider, auth, or platform runtime boundaries. This autonomous sprint round rechecked the backlog and test matrix after the latest pure-domain descriptor slices and confirmed no smaller unblocked normal-lane implementation remains ahead of the security foundation. No auth, database, Supabase, RLS, server runtime, fixtures, or integration validation command exists yet. The minimum unblockers still include role/session claims, class membership/admin schema and RLS shape, parse-first server boundaries, Supabase/Drizzle dependency and environment approval, safe authorization-failure logging, deterministic fixtures, integration proof, and explicit approval to move from pure-domain descriptors into the first provider-backed proof slice. This sprint intentionally did not add auth, database, Supabase, RLS, app runtime, UI, worker, realtime provider, CI, deployment, or broad platform scaffolding.

This sprint added an approval checklist to `execplan.md` so the first provider-backed security slice can be approved without broad scaffolding. The checklist requires a named session source, minimal schema, enforcement boundary, test harness and command, server-only environment boundary, deterministic fixtures, and denied-access observability shape before implementation proceeds. `npm run validate:quick` remains the only available validation command for this blocked story until the integration proof boundary exists; it passed with 24 test files and 288 tests.

Current sprint evidence: the story remains blocked after rechecking the backlog and test matrix, and the exec plan still names the next human decision gate before any provider-backed work can start. `docs/HARNESS_BACKLOG.md` also records the repeated blocked high-risk story reselection pattern as a proposed harness improvement. No product implementation or product contract changed in this sprint. `npm run validate:quick` passed with 24 test files and 288 tests.
