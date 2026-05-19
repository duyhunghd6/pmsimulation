# US-097 Student Dashboard Live Supabase Row Reader

## Status

implemented

## Lane

normal, non-UI integration slice

## Product Contract

The protected student current-turn dashboard server query can now load scoped row sets through a Supabase-backed reader when the App Router server client is available, including a class-membership-gated student leaderboard RPC, then pass those unknown provider rows through the existing parse-first student dashboard executor before any browser delivery.

This slice does not claim hosted provider proof. It narrows the live gameplay database gap by adding the concrete provider read adapter and fail-closed executor behavior while preserving the bounded local fallback for environments without configured Supabase auth.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`

## Acceptance Criteria

- The student dashboard current-turn server boundary has a Supabase row reader for macro narratives, market metrics, viewer fund state, viewer holdings, current-month TARA orders, Apex unrealized-gain tracked metric, and RLS-visible leaderboard fund rows.
- The reader scopes provider reads by class, viewer fund, and current month before rows reach the existing parser/executor boundary.
- The reader uses the `student_leaderboard_funds` RPC for same-class leaderboard rows and returns only the existing safe leaderboard row parser shape without provider clients or provider errors in the result envelope.
- The protected `/dashboard` route uses the Supabase row reader when a server Supabase client can be created and keeps the existing bounded row reader fallback when local public Supabase auth configuration is unavailable.
- The current-turn executor fails closed with a safe `row_reader_failed` code if provider reads fail.
- Hosted Supabase execution proof, local RLS execution proof, and provider-backed browser auth proof remain pending.

## Design Notes

- Commands: none added.
- Queries: adds `createSupabaseStudentDashboardCurrentTurnRowReader` for Supabase table reads and the `student_leaderboard_funds` RPC behind the existing `executeStudentDashboardCurrentTurnQuery` boundary.
- API: none.
- Tables: reads existing `macro_narratives`, `market_metrics`, `funds`, `asset_holdings`, `tara_orders`, and `tracked_metrics` tables through the authenticated Supabase server client.
- UI surfaces: `/dashboard` wiring changes only the server row source; no new browser component was added.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Supabase reader unit proof covers scoped table filters, safe leaderboard RPC invocation, and provider-error fail-closed behavior. Existing current-turn executor unit proof covers parser and anti-leakage behavior. |
| Integration | SQL contract proof covers the leaderboard RPC contract and local RLS proof expectations cover same-class leaderboard visibility without cross-class rows when `AUTH_TENANCY_DATABASE_URL` is configured; local RLS execution remains skipped without that URL. |
| E2E | Not added; provider-backed browser sign-in/session proof remains pending. |
| Platform | Not added; no hosted Supabase, Vercel, Inngest, CI, or deployment mutation was performed. |
| Release | `npm run typecheck`; targeted unit tests; `npm run validate:quick`. |

## Evidence

- 2026-05-19 sprint: added `app/infrastructure/auth-tenancy/student-dashboard-current-turn-supabase-reader.ts`, wired `/dashboard` to use it when `createAuthTenancySupabaseServerClient()` succeeds, and added fail-closed `row_reader_failed` handling in the existing current-turn executor.
- 2026-05-19 follow-up: added `public.student_leaderboard_funds(target_class_id uuid)` with class-student membership gating, wired the Supabase reader to call that RPC for leaderboard rows, and extended SQL/local proof expectations for same-class leaderboard visibility without cross-class rows.
- `npm run test:unit -- app/infrastructure/auth-tenancy/student-dashboard-current-turn-query.test.ts app/infrastructure/auth-tenancy/student-dashboard-current-turn-supabase-reader.test.ts` — passed with 2 test files and 11 tests.
- `npm run test:integration:auth-tenancy` — passed SQL contract proof with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured.
- `npm run validate:quick` — passed with 44 test files and 494 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`; protected routes redirected to `/login?status=sign-in-required` because local Supabase auth/session configuration is not present.
