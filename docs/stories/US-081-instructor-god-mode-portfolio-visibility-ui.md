# US-081 Instructor God Mode Portfolio Visibility UI

## Status

implemented

## Lane

normal

## Product Contract

The protected instructor dashboard route renders the bounded God Mode portfolio visibility surface for an authorized instructor session. The page displays the God Mode portfolio visibility envelope from the existing server-side instructor executor: current month, fund count, per-fund student display name, current AUM, Sharpe ratio, pending/missing order status, and exact Base/Core/Apex current allocation weights for the instructor-scoped class.

This slice keeps the privileged instructor-only contract. The browser receives exact holdings only after the existing protected route-session check and bounded God Mode executor over scoped parsed rows; it does not receive target weights, estimated tax drag, order details, ledger drafts, raw database rows, provider payloads, student route payloads, aggregate analytics, or month-advance execution controls.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The `/instructor/dashboard` route keeps the existing protected instructor route guard and verifies the trusted instructor `app_role` session before rendering God Mode holdings.
- The route renders current-month exact Base/Core/Apex allocation weights from the existing privileged instructor God Mode executor over bounded scoped rows.
- The bounded row reader used by this slice is parsed by the existing auth-tenancy executor before delivery and contains no target weights, estimated tax drag, order details, ledger drafts, raw provider payloads, student route payloads, aggregate analytics, or month-advance actions.
- The unauthenticated, wrong-role, or failed-query states render safe fallback messages without class roster, order status, leaderboard, God Mode, aggregate, or month-advance payload data.
- Styling uses existing dark financial terminal dashboard classes without introducing Tailwind, shadcn/ui, charting libraries, database clients, server actions, realtime subscriptions, workers, CI, or deployment automation.

## Design Notes

- Commands: none added.
- Queries: reuses `executeInstructorGodModePortfolioVisibilityQuery` with a bounded injected row reader; no live database runtime is introduced.
- API: none.
- Tables: none.
- Domain rules: privileged holding visibility, allocation validation, status derivation, and forbidden payload exclusion remain owned by the existing auth-tenancy executor and domain snapshot builder.
- UI surfaces: `/instructor/dashboard` now renders the current-month instructor God Mode holdings table below the existing pending-order monitor and live leaderboard using existing global CSS classes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing auth-tenancy and domain unit tests continue to prove parser/executor, allocation validation, status derivation, and forbidden payload rules. |
| Integration | Not added in this UI slice; local RLS execution still requires `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added in this UI slice; provider-backed browser sign-in proof remains pending until Supabase public environment and browser automation are configured. |
| Platform | Not added; no CI, hosted Supabase, Vercel deployment, cron, worker, or realtime provider code introduced. |
| Release | `npm run typecheck`; `npm run validate:quick`; `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: implemented the protected instructor God Mode portfolio visibility UI at `/instructor/dashboard` using the existing privileged instructor God Mode executor over bounded scoped rows, alongside the pending-order monitor and live leaderboard. The slice did not add live database runtime, target-weight visibility, order-detail visibility, aggregate analytics UI, class creation, month advancement, realtime, worker, CI, deployment, or provider-backed browser E2E proof.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 38 test files and 461 tests.
- `npm run build` — passed; `/dashboard`, `/instructor/dashboard`, and `/login` remain dynamic server-rendered routes.
- Existing dev server route smoke for `/instructor/dashboard` returned HTTP 200 with the safe no-session fallback; authenticated browser UI proof was not completed because provider-backed Supabase browser session setup is not configured in this environment.
