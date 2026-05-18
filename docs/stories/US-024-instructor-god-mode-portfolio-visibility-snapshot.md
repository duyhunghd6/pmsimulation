# US-024 Instructor God Mode Portfolio Visibility Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Instructors can view exact current portfolio allocations for all funds in an already-scoped class month through God Mode. The MVP pure-domain slice creates per-fund portfolio visibility rows from class fund summaries and records the future server-query descriptor, result envelope, and validation failure envelope without executing UI, auth, database, query, or provider code.

This story implements only the pure domain God Mode portfolio visibility snapshot and query-boundary envelopes. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order submission, order processing, or authorization enforcement.

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
- A pure TypeScript query descriptor records the future instructor-scoped God Mode server-query boundary for one class/current-month request.
- A pure TypeScript query result envelope wraps only an already-authorized God Mode portfolio visibility snapshot when class and current-month scope match.
- A pure TypeScript validation failure envelope reports missing or mismatched God Mode query results without returning snapshots, database rows, provider clients, UI state, target weights, estimated tax drag, or order details.
- Unit tests cover query descriptor creation, descriptor input validation, result envelope scope matching, failure envelope creation, and failure envelope payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, portfolio persistence, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot and query-boundary envelope creation.
- Queries: future server-query descriptor, result envelope, and validation failure envelope only; no query execution.
- API: none.
- Tables: none.
- Domain rules: God Mode portfolio visibility consumes already-scoped class fund portfolio summaries, emits exact current tier holdings for instructor-only use, and wraps already-authorized snapshots only when class and current-month scope match.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor God Mode portfolio visibility snapshot creation, query descriptor creation, result envelopes, validation failure envelopes, and invalid inputs. |
| Integration | Not applicable; no executed database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 17 test files and 136 tests passed.
- `npm run test:unit -- app/domain/classes/god-mode-portfolio-visibility.test.ts` — passed; 1 test file and 17 tests passed.
- `npm run validate:quick` — passed; 24 test files and 306 tests passed.
