# US-082 Instructor Class Aggregate Analytics UI

## Status

implemented

## Lane

normal

## Product Contract

The protected instructor dashboard route renders the bounded class aggregate analytics surface for an authorized instructor session. The page displays the aggregate-safe envelope from the existing server-side instructor class aggregate analytics executor: current month, fund count, total and average AUM, average Sharpe ratio when available, pending/missing order counts, and pending/missing order AUM for the instructor-scoped class.

This slice keeps the aggregate-only instructor contract. The browser receives class totals only after the existing protected route-session check and bounded aggregate executor over scoped parsed rows; it does not receive per-fund aggregate rows, holdings, target weights, estimated tax drag, order details, ledger drafts, raw database rows, provider payloads, student route payloads, or month-advance execution controls.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The `/instructor/dashboard` route keeps the existing protected instructor route guard and verifies the trusted instructor `app_role` session before rendering aggregate analytics.
- The route renders current-month class aggregate totals from the existing aggregate-safe instructor executor over bounded scoped rows.
- The bounded row reader used by this slice is parsed by the existing auth-tenancy executor before delivery and contains no per-fund aggregate rows in the aggregate payload, holdings, target weights, estimated tax drag, order details, ledger drafts, raw provider payloads, student route payloads, or month-advance actions.
- Empty-class average Sharpe renders safely without assuming a numeric value.
- The unauthenticated, wrong-role, or failed-query states render safe fallback messages without class roster, order status, leaderboard, aggregate analytics, God Mode, or month-advance payload data.
- Styling uses existing dark financial terminal dashboard classes without introducing Tailwind, shadcn/ui, charting libraries, database clients, server actions, realtime subscriptions, workers, CI, or deployment automation.

## Design Notes

- Commands: none added.
- Queries: reuses `executeInstructorClassAggregateAnalyticsQuery` with a bounded injected row reader; no live database runtime is introduced.
- API: none.
- Tables: none.
- Domain rules: aggregate calculation, status derivation, and forbidden payload exclusion remain owned by the existing auth-tenancy executor and domain snapshot builder.
- UI surfaces: `/instructor/dashboard` now renders a class aggregate analytics panel alongside the existing pending-order monitor, live leaderboard, and God Mode holdings table using existing global CSS classes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing auth-tenancy and domain unit tests continue to prove parser/executor, aggregate calculation, order-status derivation, and forbidden payload rules. |
| Integration | Not added in this UI slice; local RLS execution still requires `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added in this UI slice; provider-backed browser sign-in proof remains pending until Supabase public environment and browser automation are configured. |
| Platform | Not added; no CI, hosted Supabase, Vercel deployment, cron, worker, or realtime provider code introduced. |
| Release | `npm run typecheck`; `npm run validate:quick`; `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: implemented the protected instructor class aggregate analytics UI at `/instructor/dashboard` using the existing aggregate-safe instructor executor over bounded scoped rows, alongside the pending-order monitor, live leaderboard, and God Mode holdings table. The slice did not add live database runtime, per-fund aggregate rows, holdings in the aggregate payload, target-weight visibility, order-detail visibility, class creation, month advancement, realtime, worker, CI, deployment, or provider-backed browser E2E proof.
- `npm run typecheck` — passed after rendering nullable average Sharpe as `n/a`.
- `npm run validate:quick` — passed with 38 test files and 461 tests.
- `npm run build` — passed; `/dashboard`, `/instructor/dashboard`, and `/login` remain dynamic server-rendered routes.
- Existing dev server route smoke for `/instructor/dashboard` returned HTTP 200 with the safe no-session fallback; authenticated browser UI proof was not completed because provider-backed Supabase browser session setup is not configured in this environment.
