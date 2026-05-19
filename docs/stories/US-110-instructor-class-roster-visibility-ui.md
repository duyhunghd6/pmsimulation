# US-110 Instructor Class Roster Visibility UI

## Status

implemented

## Lane

Browser-visible UI plus Supabase row-reader boundary

## Product Contract

The protected instructor dashboard now renders a server-side class roster visibility panel for the instructor-scoped class. When the App Router Supabase server client is available, the dashboard reads roster-safe fund rows from `funds`, parses every row against the trusted instructor session and class scope, and renders only enrollment context plus current AUM.

This slice narrows the item-6 class-management gap without adding roster editing, order detail visibility, target-weight visibility, exact holdings, future scenario delivery, hosted provider proof, or provider-backed browser E2E.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/TEST_MATRIX.md`

## Acceptance Criteria

- `/instructor/dashboard` renders a browser-visible roster visibility panel after protected route-session parsing confirms `app_role=instructor`.
- The Supabase roster reader selects only `id,class_id,student_id,current_aum` from `funds`, filters by the instructor-scoped class id, orders by `student_id`, and parses rows before browser delivery.
- The roster row parser rejects wrong-role, cross-class, malformed id, and negative AUM rows before result delivery.
- Provider read failures and rejected rows fail closed with safe failure codes and without returning provider errors, raw database rows, auth sessions, provider clients, order details, target weights, exact holdings, realtime payloads, worker jobs, future scenario rows, or secrets to the browser.
- The dashboard keeps bounded fallback roster rows when Supabase server auth configuration is unavailable.
- Hosted Supabase execution proof, local RLS execution proof, provider-backed browser E2E, and roster editing remain pending.

## Design Notes

- Commands: no npm scripts added.
- Rows: `parseInstructorClassRosterRow` validates instructor role, class scope, fund id, student id, and non-negative current AUM before delivery.
- Queries: `createSupabaseInstructorClassRosterReader` reads a narrow roster-safe fund projection and delegates row validation to the parser.
- Mutations: none.
- API: no route handler is added; the protected App Router page refreshes the roster during server rendering.
- UI surfaces: `/instructor/dashboard` now renders roster empty, success, and safe failure states.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Row-parser and Supabase roster-reader unit proof covers accepted rows, wrong-role/cross-class/malformed/negative row rejection, narrow query shape, sanitized provider read failure, and forbidden payload exclusion. |
| Integration | Not added; local RLS execution remains skipped without `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added; provider-backed browser sign-in/enrollment/roster proof remains pending. |
| Platform | Local route smoke should continue covering `/instructor/dashboard`; hosted platform proof remains pending. |
| Release | Targeted unit tests; `npm run typecheck`; `npm run validate:quick`; `npm run smoke:routes`. |

## Evidence

- 2026-05-19 sprint: added `InstructorClassRosterRow` and `parseInstructorClassRosterRow` in `app/infrastructure/auth-tenancy/rows.ts`.
- 2026-05-19 sprint: added `app/infrastructure/auth-tenancy/instructor-class-roster-supabase-reader.ts` and unit proof in `app/infrastructure/auth-tenancy/instructor-class-roster-supabase-reader.test.ts`.
- 2026-05-19 sprint: wired `/instructor/dashboard` to render a class roster visibility panel from the Supabase reader when the App Router Supabase server client is available, with bounded fallback rows otherwise.
- `npm run test:unit -- app/infrastructure/auth-tenancy/rows.test.ts app/infrastructure/auth-tenancy/instructor-class-roster-supabase-reader.test.ts` — passed with 2 test files and 39 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 56 test files and 546 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/join/ALPHA01`, `/dashboard`, and `/instructor/dashboard`; protected routes redirected to `/login?status=sign-in-required` because local Supabase auth/session configuration is not present.
