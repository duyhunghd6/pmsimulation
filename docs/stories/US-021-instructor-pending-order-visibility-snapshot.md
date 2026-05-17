# US-021 Instructor Pending-Order Visibility Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Instructors can see which enrolled class funds have pending current-month TARA orders before month advancement. The MVP pure-domain slice builds a status-only snapshot from an already-scoped class fund set and current-month pending order records, preserving the future instructor dashboard contract without introducing UI, auth, database, or query code.

This story implements only the pure domain pending-order visibility snapshot. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order submission, order processing, or authorization enforcement.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor pending-order visibility snapshot for one class month.
- The snapshot reports total enrolled funds, pending-order count, missing-order count, and each enrolled fund's pending or missing status.
- The function trims class and fund ids before matching current-month pending orders to enrolled funds.
- The snapshot excludes order target weights, estimated tax drag, and other TARA order detail payloads.
- The function rejects blank class ids, invalid month indexes, blank or duplicate enrolled fund ids, non-current-month orders, non-pending orders, orders for unknown funds, and duplicate pending orders for one fund.
- Unit tests cover snapshot creation, trimming behavior, detail exclusion, no-submission classes, and invalid inputs.
- No auth, database, Supabase, worker, realtime, UI, API route, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: pending-order visibility consumes an already-scoped enrolled fund set and current-month pending order summaries, then emits only per-fund submission status.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor pending-order visibility snapshot creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 14 test files and 113 tests passed.
