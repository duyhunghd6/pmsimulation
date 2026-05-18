# US-073 Student Dashboard Current-Turn UI

## Status

implemented

## Lane

normal

## Product Contract

The protected student dashboard route renders the first bounded current-turn gameplay UI for an authorized student session. The page displays the safe current-turn dashboard envelope from the existing server-side student dashboard executor: macro news, Driver/String metrics, portfolio pyramid drift, read-only TARA order-entry preview, tax-drag preview, and viewer-safe leaderboard rank.

This slice keeps the student anti-leakage contract intact. The browser receives only the composed dashboard snapshot returned after route-session checks and parse-first scoped row execution; it does not receive future scenario rows, other-student exact holdings, instructor God Mode data, raw database rows, provider payloads, or order-submission capabilities.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`

## Acceptance Criteria

- The `/dashboard` student route keeps the existing protected student route guard and verifies the trusted student `app_role` session before rendering current-turn gameplay data.
- The route renders macro news, Driver/String metrics, portfolio pyramid drift, read-only TARA order-entry/tax-drag preview, and viewer-safe leaderboard rank from the existing safe current-turn dashboard executor.
- The bounded row reader used by this slice is parsed by the existing auth-tenancy executor before delivery and contains no future scenario row, other-student exact holding, instructor God Mode, raw provider payload, or order-submission action.
- The unauthenticated, wrong-role, or failed-query states render safe fallback messages without macro, holding, order, leaderboard, attribution, or provider payload data.
- Styling supports the dark financial terminal dashboard layout without introducing Tailwind, shadcn/ui, charting libraries, database clients, server actions, realtime subscriptions, workers, CI, or deployment automation.

## Design Notes

- Commands: none added.
- Queries: reuses `executeStudentDashboardCurrentTurnQuery` with a bounded injected row reader; no live database runtime is introduced.
- API: none.
- Tables: none.
- Domain rules: safe current-turn envelope composition remains owned by the existing auth-tenancy executor and domain snapshot builders.
- UI surfaces: `/dashboard` now renders the current-turn student dashboard shell using existing global CSS classes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing auth-tenancy and domain unit tests continue to prove parser/executor and snapshot anti-leakage rules. |
| Integration | Not added in this UI slice; local RLS execution still requires `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added in this UI slice; provider-backed browser sign-in proof remains pending until Supabase public environment and browser automation are configured. |
| Platform | Not added; no CI, hosted Supabase, Vercel deployment, cron, worker, or realtime provider code introduced. |
| Release | `npm run typecheck`; `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: implemented the protected student current-turn dashboard UI at `/dashboard` using the existing safe current-turn dashboard executor over bounded scoped rows, plus terminal-style global CSS for dashboard panels, metrics, pyramid bars, and leaderboard rows. The slice did not add live database runtime, order submission, realtime, worker, CI, deployment, or provider-backed browser E2E proof.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 33 test files and 424 tests.
- `npm run build` — passed; `/dashboard`, `/instructor/dashboard`, and `/login` remain dynamic server-rendered routes.
