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
npm run test:integration:auth-tenancy
```

## Acceptance Evidence

2026-05-18 approval evidence: the human approved the full-stack MVP implementation track and the first US-038 provider-backed proof slice. US-038 is no longer blocked on generic permission to introduce Supabase Auth/PostgreSQL/RLS, Drizzle schema/migrations, local fixtures, server-only environment handling, safe denied-access observability, or the first dedicated integration command.

The story is complete only after executable proof exists. Expected evidence includes `npm run validate:quick` plus `npm run test:integration:auth-tenancy` passing against the local Supabase harness with deterministic fixtures for two classes, at least two instructors, at least three students, current/past/future scenario rows, and exact holdings. Proof must show allowed own-fund reads, current/past scenario reads, instructor owned-class God Mode reads, and denied future-row, other-student holding, cross-class student, and unowned-class instructor access.

Not in this story: browser UI, hosted production Supabase setup, Vercel deployment, CI, month-advance worker execution, or Supabase Realtime publication.
