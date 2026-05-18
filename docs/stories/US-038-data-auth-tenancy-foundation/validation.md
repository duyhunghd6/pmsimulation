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

2026-05-18 sprint evidence: added server-side Supabase Auth claim and scope parsers with unit coverage, a minimum Drizzle schema, Supabase RLS migration `supabase/migrations/202605180001_auth_tenancy_foundation.sql`, deterministic fixture `supabase/fixtures/auth-tenancy.sql`, and `npm run test:integration:auth-tenancy`. In this environment `npm run validate:quick` passed with 25 test files and 362 tests. The integration command passed SQL contract tests and skipped the local RLS execution test because `AUTH_TENANCY_DATABASE_URL` is not configured; therefore provider-backed RLS proof is still pending.

2026-05-18 follow-up sprint evidence: tightened the Supabase RLS migration so `is_class_admin`, `is_class_student`, `owns_fund`, `administers_fund`, and direct class-admin/enrollment/fund policies require the trusted `app_role` claim for their role path. Extended auth-tenancy tests to assert the SQL contract includes student/instructor role-claim checks and that an instructor subject with a student-role claim receives no admin or God Mode holding rows when the local Supabase proof is configured. `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured. `npm run validate:quick` passed with 25 test files and 362 tests.

2026-05-18 server-only environment slice evidence: added `app/infrastructure/auth-tenancy/environment.ts` and unit proof for parsing the local `AUTH_TENANCY_DATABASE_URL` as a PostgreSQL-only server environment value. The local Supabase RLS proof now consumes that parser so a malformed configured URL fails the proof instead of silently entering database execution. `npm run test:unit -- app/infrastructure/auth-tenancy` passed with 2 test files and 7 tests; `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured; `npm run validate:quick` passed with 26 test files and 364 tests.

2026-05-18 safe observability slice evidence: tightened US-038 authorization metadata to allowlisted resource/action values and added fixed-field JSON serialization so denied-access events do not include accidental database URLs, future scenario rows, unauthorized holdings, or raw forbidden payloads. `npm run test:unit -- app/infrastructure/auth-tenancy` passed with 2 test files and 8 tests; `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured; `npm run validate:quick` passed with 26 test files and 365 tests.

2026-05-18 database row parser slice evidence: added parse-first database row guards for student own-fund state, instructor God Mode holdings, and student revealed macro narrative rows so scoped result delivery rejects other-student, cross-class, wrong-role, and future-scenario rows even after RLS/database access. `npm run test:unit -- app/infrastructure/auth-tenancy` passed with 3 test files and 14 tests; `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured; `npm run validate:quick` passed with 27 test files and 371 tests.

2026-05-18 student order/ledger row parser slice evidence: extended the US-038 parse-first database row guards to student TARA order rows and student simulation ledger rows. The guards require student role, matching class/fund/month scope, valid TARA target weights totaling 100%, order status, and ledger attribution numeric fields before result delivery. `npm run test:unit -- app/infrastructure/auth-tenancy` passed with 3 test files and 18 tests; `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured; `npm run validate:quick` passed with 27 test files and 375 tests.

2026-05-18 student market metric row parser slice evidence: extended the US-038 parse-first database row guards to revealed student market metric rows. The guard requires student role, matching class scope, current-or-past month scope, numeric market-string fields, and non-empty valuation/business-cycle text before result delivery; future market metric rows are rejected before delivery even after database access. `npm run test:unit -- app/infrastructure/auth-tenancy` passed with 3 test files and 20 tests; `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured; `npm run validate:quick` passed with 27 test files and 377 tests.

Not in this story: browser UI, hosted production Supabase setup, Vercel deployment, CI, month-advance worker execution, or Supabase Realtime publication.
