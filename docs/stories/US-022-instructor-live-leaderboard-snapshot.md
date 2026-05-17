# US-022 Instructor Live Leaderboard Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Instructors can view a live leaderboard for an already-scoped class month showing student funds, current AUM, Sharpe ratio, and pending-order status. The MVP pure-domain slice creates a deterministic snapshot from class fund summaries without introducing UI, auth, database, query, or realtime code.

This story implements only the pure domain leaderboard snapshot. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order submission, order processing, or authorization enforcement.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor live leaderboard snapshot for one class month.
- The snapshot reports ranked fund count, pending-order count, missing-order count, and ranked rows containing fund id, student display name, current AUM, Sharpe ratio, and order status.
- Rows are ranked deterministically by current AUM descending, Sharpe ratio descending, and fund id ascending as the final tie-breaker.
- The function trims class ids, fund ids, and display names before producing the snapshot.
- The snapshot excludes holdings, target weights, estimated tax drag, and other order detail payloads.
- The function rejects blank class ids, invalid month indexes, blank or duplicate fund ids, blank display names, invalid AUM, invalid Sharpe ratios, and invalid order statuses.
- Unit tests cover ranking, trimming behavior, tie-breaking, detail exclusion, empty classes, and invalid inputs.
- No auth, database, Supabase, worker, realtime, UI, API route, leaderboard persistence, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: live leaderboard consumes an already-scoped class fund summary set and pending/missing order statuses, then emits deterministic rank rows without holdings or order detail payloads.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor live leaderboard snapshot creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 15 test files and 121 tests passed.
