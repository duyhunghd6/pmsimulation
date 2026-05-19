# US-105 Instructor God Mode Supabase Reader

## Status

implemented

## Lane

normal

## Product Contract

The protected instructor dashboard can use a Supabase-backed God Mode portfolio visibility row reader when the App Router Supabase server client is available. The reader loads only the privileged row sets already accepted by the existing safe God Mode executor: scoped class funds, current holdings, and current-month pending TARA order status rows.

This slice preserves the instructor-only God Mode contract. The browser still receives only the parsed privileged God Mode result envelope after route-session checks and executor parsing; it does not receive target weights, estimated tax drag, order details, raw database rows, provider errors, provider clients, worker payloads, realtime payloads, ledger drafts, processed order data, or unscoped/student-facing holdings.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- Add a narrow Supabase row reader for instructor God Mode portfolio visibility that reads `funds` with only `id,class_id,student_display_name,current_aum,sharpe_ratio` for the scoped class.
- Read `asset_holdings` with only `id,class_id,fund_id,tier,allocation_weight_pct` for the scoped class.
- Read `tara_orders` with only `id,class_id,fund_id,month_index,status` for scoped class/current-month pending orders.
- Fail closed on provider read errors and let the existing executor return a safe `row_reader_failed` failure before browser delivery.
- Keep the existing executor parser boundary responsible for rejecting malformed, cross-class, future-month, duplicate, unknown, processed, incomplete, or invalid allocation rows.
- Wire `/instructor/dashboard` to prefer this Supabase reader only for God Mode when the App Router Supabase server client is available, preserving bounded fallback rows.

## Design Notes

- Commands: none added.
- Queries: `createSupabaseInstructorGodModePortfolioVisibilityRowReader` implements the existing `InstructorGodModePortfolioVisibilityQueryRowReader` contract.
- API: none.
- Tables: reads `funds`, `asset_holdings`, and `tara_orders` through the App Router Supabase server client.
- Domain rules: portfolio visibility composition, pending/missing status composition, and safe envelope delivery remain owned by the existing auth-tenancy executor and domain snapshot builder.
- UI surfaces: no new UI; `/instructor/dashboard` now prefers provider-backed God Mode rows for the existing panel.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Supabase reader tests prove scoped table/column filters and safe provider failure; executor tests prove provider read failures map to `row_reader_failed`. |
| Integration | Not added; local RLS execution still requires `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added; provider-backed browser sign-in proof remains pending until Supabase public environment and browser automation are configured. |
| Platform | Not added; no hosted Supabase, Vercel deployment, cron, worker, realtime provider, or CI mutation introduced. |
| Release | `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-god-mode-portfolio-visibility-query.test.ts app/infrastructure/auth-tenancy/instructor-god-mode-portfolio-visibility-supabase-reader.test.ts`; `npm run typecheck`; `npm run validate:quick`; `npm run smoke:routes`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, and matrix evidence.

## Evidence

- 2026-05-19 sprint: added `app/infrastructure/auth-tenancy/instructor-god-mode-portfolio-visibility-supabase-reader.ts`, which reads privileged fund, holding, and current-month pending-order status row sets from Supabase behind the existing safe executor and fails closed on provider errors.
- 2026-05-19 sprint: updated `executeInstructorGodModePortfolioVisibilityQuery` to return a safe `row_reader_failed` result when provider row reads fail before result delivery.
- 2026-05-19 sprint: updated `/instructor/dashboard` to prefer the Supabase God Mode reader when the App Router Supabase server client is available, while preserving bounded fallback rows.
- `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-god-mode-portfolio-visibility-query.test.ts app/infrastructure/auth-tenancy/instructor-god-mode-portfolio-visibility-supabase-reader.test.ts` — passed with 2 test files and 10 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 52 test files and 521 tests.
- `npm run smoke:routes` — passed with `/` and `/login` content checks plus protected `/dashboard` and `/instructor/dashboard` redirects to `/login?status=sign-in-required`.
