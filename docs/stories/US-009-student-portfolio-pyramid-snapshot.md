# US-009 Student Portfolio Pyramid Snapshot

## Status

implemented

## Lane

normal

## Product Contract

The student dashboard can project a portfolio pyramid snapshot from current and intended Base/Core/Apex weights. The projection reports per-tier drift and flags dangerous drift when the absolute current-vs-intended difference exceeds the accepted drift threshold.

This story also records the future server-query boundary for one already-scoped class/current-month/viewer-fund portfolio pyramid request. The query descriptor, result envelope, and validation failure envelope wrap only an already-authorized viewer-fund portfolio pyramid snapshot and keep other-fund exact holdings, instructor God Mode data, target weights, order details, estimated tax drag, ledger drafts, database rows, provider payloads, UI state, and executed query metadata out of the boundary.

This story implements only the pure domain snapshot projection and query boundary envelopes. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, or class tenancy enforcement.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- A pure TypeScript domain function builds a portfolio pyramid snapshot for Base/Core/Apex tiers.
- The projection includes class, month, and viewer-fund scope for an already-scoped viewer fund.
- The projection includes current weight, intended weight, drift amount, drift direction, and dangerous-drift status for each tier.
- The projection flags dangerous drift only when absolute drift is greater than the supplied threshold.
- The projection rejects invalid class, month, viewer fund, current allocation, intended allocation, and dangerous drift threshold inputs.
- A pure TypeScript query descriptor records the future server-query boundary for a student portfolio pyramid request without executing the query or returning snapshot data.
- A pure TypeScript query result envelope wraps an already-authorized portfolio pyramid snapshot only when class, current-month, and viewer-fund scope match.
- A pure TypeScript query result validation failure envelope reports missing or mismatched result inputs without returning the snapshot or unsafe payloads.
- Unit tests cover normal projection, dangerous drift, allocation validation failures, threshold validation, descriptor validation, result envelope scope matching, and validation failure envelope safety.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, or class-tenancy code is introduced.

## Design Notes

- Commands: none; this is pure domain projection and future query-boundary metadata.
- Queries: `get_student_portfolio_pyramid` descriptor only; no server query execution exists in this slice.
- API: none.
- Tables: none.
- Domain rules: current and intended weights must both be valid Base/Core/Apex allocation maps totaling exactly `100.0%`; drift is `current - intended`; dangerous drift is `abs(drift) > threshold`.
- Boundary rules: descriptors require already-scoped class, current month, and viewer fund; result envelopes require snapshot scope to match the descriptor; validation failure envelopes must not return portfolio snapshots or provider/database/UI payloads.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for portfolio pyramid projection, drift flags, invalid inputs, query descriptor, query result envelope, and validation failure envelope. |
| Integration | Not applicable; no boundary execution, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/portfolio/pyramid.test.ts` — passed with 1 test file and 14 tests.
- `npm run validate:quick` — passed with 24 test files and 357 tests.
