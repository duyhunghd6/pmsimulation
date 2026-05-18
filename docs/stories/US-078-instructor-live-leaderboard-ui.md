# US-078 Instructor Live Leaderboard UI

## Status

implemented

## Lane

normal

## Product Contract

The protected instructor dashboard route renders the bounded live leaderboard surface for an authorized instructor session. The page displays the live leaderboard envelope from the existing server-side instructor live leaderboard executor: current month, ranked fund count, per-fund rank, student display name, current AUM, Sharpe ratio, and pending/missing order status.

This slice keeps the leaderboard-safe instructor contract. The browser receives only the parsed snapshot returned after route-session checks and scoped row execution; it does not receive holdings, target weights, estimated tax drag, order details, raw database rows, provider payloads, God Mode holdings, aggregate analytics, or month-advance execution controls.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The `/instructor/dashboard` route keeps the existing protected instructor route guard and verifies the trusted instructor `app_role` session before rendering live leaderboard data.
- The route renders current-month live leaderboard rows from the existing safe instructor executor over bounded scoped rows.
- The bounded row reader used by this slice is parsed by the existing auth-tenancy executor before delivery and contains no holdings, target weights, estimated tax drag, order details, raw provider payloads, student route payloads, or month-advance actions.
- The unauthenticated, wrong-role, or failed-query states render safe fallback messages without class leaderboard, class roster, God Mode, aggregate, or month-advance payload data.
- Styling uses existing dark financial terminal dashboard classes without introducing Tailwind, shadcn/ui, charting libraries, database clients, server actions, realtime subscriptions, workers, CI, or deployment automation.

## Design Notes

- Commands: none added.
- Queries: reuses `executeInstructorLiveLeaderboardQuery` with a bounded injected row reader; no live database runtime is introduced.
- API: none.
- Tables: none.
- Domain rules: leaderboard ranking and forbidden payload exclusion remain owned by the existing auth-tenancy executor and domain snapshot builder.
- UI surfaces: `/instructor/dashboard` now renders the current-month instructor live leaderboard next to the existing pending-order monitor using existing global CSS classes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing auth-tenancy and domain unit tests continue to prove parser/executor, ranking, status derivation, and forbidden payload rules. |
| Integration | Not added in this UI slice; local RLS execution still requires `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added in this UI slice; provider-backed browser sign-in proof remains pending until Supabase public environment and browser automation are configured. |
| Platform | Not added; no CI, hosted Supabase, Vercel deployment, cron, worker, or realtime provider code introduced. |
| Release | `npm run validate:quick`; `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: implemented the protected instructor live leaderboard UI at `/instructor/dashboard` using the existing safe instructor live leaderboard executor over bounded scoped rows, alongside the pending-order monitor. The slice did not add live database runtime, holdings visibility, target-weight visibility, order-detail visibility, class creation, God Mode, aggregate analytics, month advancement, realtime, worker, CI, deployment, or provider-backed browser E2E proof.
- `npm run validate:quick` — passed with 36 test files and 447 tests.
- `npm run build` — passed; `/dashboard`, `/instructor/dashboard`, and `/login` remain dynamic server-rendered routes.
- Existing dev server route smoke for `/instructor/dashboard` returned HTTP 200 with the safe no-session fallback; authenticated browser UI proof was not completed because provider-backed Supabase browser session setup is not configured in this environment.
