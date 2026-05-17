# US-023 Instructor Class Aggregate Analytics Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Instructors can view class-wide aggregate analytics for an already-scoped class month. The MVP pure-domain slice creates class-level AUM, Sharpe ratio, and order-submission aggregates from fund summaries without introducing UI, auth, database, query, or provider code.

This story implements only the pure domain aggregate analytics snapshot. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order submission, order processing, or authorization enforcement.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor class aggregate analytics snapshot for one class month.
- The snapshot reports fund count, total current AUM, average current AUM, average Sharpe ratio, pending-order count, missing-order count, pending-order AUM, and missing-order AUM.
- The function trims class and fund ids before validating and aggregating.
- The snapshot excludes per-fund rows, holdings, target weights, estimated tax drag, and other order detail payloads.
- The function rejects blank class ids, invalid month indexes, blank or duplicate fund ids, invalid AUM, invalid Sharpe ratios, and invalid order statuses.
- Unit tests cover aggregate calculation, trimming behavior, detail exclusion, empty classes, and invalid inputs.
- No auth, database, Supabase, worker, realtime, UI, API route, aggregate persistence, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: class aggregate analytics consumes already-scoped class fund summaries and emits only class-level aggregates.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor class aggregate analytics snapshot creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 16 test files and 128 tests passed.
