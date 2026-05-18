# US-023 Instructor Class Aggregate Analytics Snapshot and Query Boundary Envelopes

## Status

implemented

## Lane

normal

## Product Contract

Instructors can view class-wide aggregate analytics for an already-scoped class month. The MVP pure-domain slice creates class-level AUM, Sharpe ratio, and order-submission aggregates from fund summaries and records the future server-query descriptor, result envelope, and validation failure envelope for that already-scoped class/current-month request without introducing UI, auth, database, server-query execution, or provider code.

This story implements only the pure domain aggregate analytics snapshot and query-boundary contracts. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order submission, order processing, or authorization enforcement.

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
- A pure TypeScript function creates a server-query descriptor for one already-scoped instructor class and current month.
- A pure TypeScript function wraps an already-authorized aggregate analytics snapshot only when class and current-month scope match the descriptor.
- A pure TypeScript function emits a validation failure envelope for missing or mismatched query results without returning the snapshot.
- Descriptor, result, and validation failure payloads exclude per-fund rows, holdings, target weights, estimated tax drag, order details, database rows, provider clients, UI state, and executed query metadata.
- Unit tests cover descriptor creation, descriptor invalid inputs, result wrapping, result scope mismatch, validation failure envelopes, and exclusion of forbidden payload fields.
- No auth, database, Supabase, worker, realtime, UI, API route, aggregate persistence, order persistence, order execution, server-query execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot creation.
- Queries: future server-query boundary only; no server query execution.
- API: none.
- Tables: none.
- Domain rules: class aggregate analytics consumes already-scoped class fund summaries and emits only class-level aggregates; query result envelopes wrap only an already-authorized aggregate snapshot matching the descriptor class and current month.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor class aggregate analytics snapshot creation, descriptor creation, result envelopes, validation failure envelopes, forbidden payload exclusions, and invalid inputs. |
| Integration | Not applicable; no boundary execution, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/classes/class-aggregate-analytics.test.ts` — passed; 1 test file and 15 tests passed.
- `npm run validate:quick` — passed; 24 test files and 331 tests passed.
