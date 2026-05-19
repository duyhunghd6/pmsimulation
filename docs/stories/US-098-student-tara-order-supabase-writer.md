# US-098 Student TARA Order Supabase Writer

## Status

implemented

## Lane

normal, non-UI integration slice

## Product Contract

The protected student TARA order server action can now prefer a Supabase-backed pending-order store when the App Router server client is available. Provider rows are still parsed by the existing student-safe executor before receipt delivery, and environments without configured Supabase auth keep the bounded local fallback.

This slice does not claim hosted provider proof. It narrows the live order-submission gap by adding the concrete provider read/write adapter behind the existing browser form and safe server-action boundary.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`

## Acceptance Criteria

- The student TARA order submission server boundary has a Supabase store for scoped fund, holding, current-month TARA order, and Apex unrealized-gain metric reads.
- The store inserts accepted pending orders into `tara_orders` with the validated target weights, tax-drag estimate, rebalance trigger, and pending status.
- Provider read/write failures fail closed through safe action failure codes without returning provider errors, provider clients, auth sessions, database rows, worker payloads, realtime payloads, or secrets.
- The protected `/dashboard` order form uses the Supabase store when `createAuthTenancySupabaseServerClient()` succeeds and keeps the bounded local fallback when Supabase server auth configuration is unavailable.
- Hosted Supabase execution proof, local RLS execution proof, worker dispatch, realtime publication, processed order execution, and provider-backed browser E2E remain pending.

## Design Notes

- Commands: no npm scripts added.
- Queries: adds `createSupabaseStudentTaraOrderSubmissionStore` for scoped Supabase table reads behind the existing `executeStudentTaraOrderSubmissionAction` boundary.
- Mutations: inserts one pending `tara_orders` row through the authenticated Supabase server client and returns only the parsed row shape to the executor.
- API: none.
- UI surfaces: `/dashboard` wiring changes only the server action store source; no new browser component was added.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Supabase store unit proof covers scoped reads, pending insert shape, and sanitized provider read/write failures. Existing action executor proof covers role/scope validation, invalid weights, duplicate pending-order rejection, persisted-row parsing, mismatch rejection, and fail-closed store exceptions. |
| Integration | Not added; local RLS execution remains skipped without `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added; provider-backed browser sign-in/order submission proof remains pending. |
| Platform | Not added; no hosted Supabase, Vercel, Inngest, CI, or deployment mutation was performed. |
| Release | Targeted unit tests; `npm run validate:quick`; `npm run smoke:routes`. |

## Evidence

- 2026-05-19 sprint: added `app/infrastructure/auth-tenancy/student-tara-order-submission-supabase-store.ts`, wired `/dashboard` server action store selection to prefer it when a Supabase server client is available, and kept the existing bounded local fallback.
- 2026-05-19 sprint: added safe `row_store_failed` and `pending_order_store_failed` executor failures for provider read/write exceptions.
- `npm run test:unit -- app/infrastructure/auth-tenancy/student-tara-order-submission-action.test.ts app/infrastructure/auth-tenancy/student-tara-order-submission-supabase-store.test.ts` — passed with 2 test files and 12 tests.
- `npm run validate:quick` — passed with 45 test files and 500 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`; protected routes redirected to `/login?status=sign-in-required` because local Supabase auth/session configuration is not present.
