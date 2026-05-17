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

Blocked in this sprint. No auth, database, Supabase, RLS, server runtime, or integration validation command exists yet.
