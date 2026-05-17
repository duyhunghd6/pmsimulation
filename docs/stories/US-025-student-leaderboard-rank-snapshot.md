# US-025 Student Leaderboard Rank Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Students can view their own class leaderboard rank and permitted leaderboard metrics for an already-scoped class month without receiving exact holdings, pending-order status, target weights, tax-drag details, order payloads, ledger drafts, future scenario rows, UI, auth, database, query, or realtime code.

This story implements only the pure domain leaderboard rank snapshot. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, leaderboard persistence, order submission, order processing, or authorization enforcement.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student leaderboard rank snapshot for one already-scoped class month.
- The snapshot reports class id, month index, viewer fund id, viewer rank, ranked fund count, and leaderboard rows.
- Rows include rank, student display name, current AUM, Sharpe ratio, and whether the row belongs to the viewing fund.
- Rows are ranked deterministically by current AUM descending, Sharpe ratio descending, and fund id ascending as the final tie-breaker.
- The function trims class ids, viewer fund ids, fund ids, and display names before producing the snapshot.
- The snapshot excludes exact holdings, fund ids in row payloads, pending-order status, target weights, estimated tax drag, order details, and ledger drafts.
- The function rejects blank class ids, invalid month indexes, blank viewer fund ids, viewer fund ids not present in the scoped input, blank or duplicate fund ids, blank display names, invalid AUM, and invalid Sharpe ratios.
- Unit tests cover ranking, viewer-rank marking, trimming behavior, tie-breaking, detail exclusion, and invalid inputs.
- No auth, database, Supabase, worker, realtime, UI, API route, leaderboard persistence, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: student leaderboard rank consumes an already-scoped class fund summary set, ranks by permitted leaderboard metrics, marks the viewing fund, and omits exact holdings and order status/details.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for student leaderboard rank snapshot creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 18 test files and 143 tests passed.
