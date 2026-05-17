# US-024 Instructor God Mode Portfolio Visibility Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Instructors can view exact current portfolio allocations for all funds in an already-scoped class month through God Mode. The MVP pure-domain slice creates per-fund portfolio visibility rows from class fund summaries without introducing UI, auth, database, query, or provider code.

This story implements only the pure domain God Mode portfolio visibility snapshot. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order submission, order processing, or authorization enforcement.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor God Mode portfolio visibility snapshot for one class month.
- The snapshot reports fund count, pending-order count, missing-order count, and per-fund rows containing fund id, student display name, current AUM, Sharpe ratio, order status, and exact current Base/Core/Apex allocation weights.
- Rows are sorted deterministically by student display name ascending and fund id ascending as the tie-breaker.
- The function trims class ids, fund ids, and display names before producing the snapshot.
- The snapshot exposes current tier holdings for the privileged instructor view, but excludes target weights, estimated tax drag, order details, and ledger drafts.
- The function rejects blank class ids, invalid month indexes, blank or duplicate fund ids, blank display names, invalid AUM, invalid Sharpe ratios, invalid order statuses, and current holdings that do not form a valid 100.0% Base/Core/Apex allocation.
- Unit tests cover snapshot creation, trimming behavior, deterministic sorting, detail exclusion, empty classes, and invalid inputs.
- No auth, database, Supabase, worker, realtime, UI, API route, portfolio persistence, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: God Mode portfolio visibility consumes already-scoped class fund portfolio summaries and emits exact current tier holdings for instructor-only use.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor God Mode portfolio visibility snapshot creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 17 test files and 136 tests passed.
