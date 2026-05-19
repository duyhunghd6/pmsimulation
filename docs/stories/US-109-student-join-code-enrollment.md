# US-109 Student Join-Code Enrollment

## Status

implemented

## Lane

Browser-visible UI plus server-action/Supabase RPC boundary

## Product Contract

Authenticated students can use the public `/join/[joinCode]` landing route to attach themselves to a class roster from a safe instructor-issued join link. The route still validates the join-code shape before any enrollment work; when the viewer is an authenticated student, it renders a server-action form that validates the student session, normalizes the join code, writes class membership through the bounded `join_class_by_code` RPC when the App Router Supabase server client is available, and returns only a student-safe enrollment receipt state.

This slice implements the first roster membership write plus initial fund creation boundary. A 2026-05-19 follow-up seeds initial Base/Core/Apex asset holdings for newly enrolled funds through the same idempotent RPC. It does not prove hosted Supabase execution, provider-backed browser E2E, local RLS execution without `AUTH_TENANCY_DATABASE_URL`, or immediate live gameplay readiness after enrollment.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- `/join/[joinCode]` renders an authenticated-student enrollment form for valid join codes after route-session parsing confirms `app_role=student`.
- The join server action blocks unauthenticated, wrong-role, and invalid join-code submissions before persistence.
- The bounded enrollment executor validates the request, persists through an injected store, parses the persisted enrollment row, verifies student and join-code scope, and returns only a student-safe receipt envelope.
- The Supabase-backed store calls only `join_class_by_code` with a generated fund id and normalized join code, and fails closed without returning provider error details.
- The SQL contract defines `join_class_by_code(text, uuid)` as an authenticated student-only RPC that creates `class_enrollments`, an initial `funds` row, and default Base/Core/Apex `asset_holdings` rows idempotently.
- The browser result state must not expose class roster rows, instructor data, future scenarios, other-student holdings, raw provider payloads, provider errors, or gameplay snapshots.
- Hosted Supabase execution proof, provider-backed browser E2E, and local RLS execution proof remain pending.

## Design Notes

- Commands: no package scripts added.
- Domain: `app/domain/classes/class-enrollment.ts` defines join request validation, command descriptors, safe result envelopes, and safe validation-failure envelopes.
- Server action: `app/join/[joinCode]/actions.ts` reads the route session, requires student role, runs the bounded enrollment executor, and redirects back to the join landing route with safe status parameters.
- Infrastructure: `app/infrastructure/auth-tenancy/student-class-enrollment-action.ts` and `student-class-enrollment-supabase-store.ts` keep provider reads/writes behind injected contracts.
- Rows: `parseStudentClassEnrollmentRow` validates role, subject, class id, fund id, display name, current month, and join-code scope before receipt delivery.
- SQL: `join_class_by_code` uses `auth.uid()` and trusted `public.current_app_role()` to create membership, a default initial fund, and 40/40/20 Base/Core/Apex holdings, then returns only the parsed receipt row shape.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Domain, executor, Supabase store, and row-parser unit tests. |
| Integration | SQL contract proof for the `join_class_by_code` RPC; local live RLS execution remains gated by `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added; provider-backed browser sign-in and enrollment proof remain pending. |
| Platform | Local route smoke should continue covering `/join/ALPHA01`; hosted platform proof remains pending. |
| Release | `npm run typecheck`; `npm run validate:quick`; `npm run smoke:routes`; `npm run test:integration:auth-tenancy`. |

## Evidence

- 2026-05-19 sprint: added student join-code request/command/result/validation envelopes and safe receipt delivery.
- 2026-05-19 sprint: added bounded student enrollment executor, Supabase RPC store, and parse-first persisted enrollment row validation.
- 2026-05-19 sprint: updated `/join/[joinCode]` to render an authenticated-student enrollment action while preserving safe unauthenticated and invalid-code states.
- 2026-05-19 sprint: added `join_class_by_code` SQL RPC contract for idempotent class enrollment and initial fund creation.
- 2026-05-19 follow-up sprint: extended `join_class_by_code` to seed idempotent default Base/Core/Apex holdings (40%/40%/20%) for the enrolled fund without returning holdings in the student-safe receipt.
- 2026-05-19 sprint: targeted unit proof passed for `class-enrollment`, `student-class-enrollment-action`, `student-class-enrollment-supabase-store`, and `rows` with 4 test files and 43 tests.
- 2026-05-19 sprint: `npm run typecheck` passed.
- 2026-05-19 sprint: `npm run test:integration:auth-tenancy` passed SQL contract proof with 5 tests and 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured.
- 2026-05-19 sprint: `npm run validate:quick` passed with 55 test files and 541 tests.
- 2026-05-19 sprint: `npm run smoke:routes` passed for `/`, `/login`, `/join/ALPHA01`, `/dashboard`, and `/instructor/dashboard`.
