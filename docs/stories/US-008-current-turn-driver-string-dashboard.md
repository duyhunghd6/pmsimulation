# US-008 Current-Turn Driver/String Dashboard

## Status

implemented

## Lane

normal

## Product Contract

The student dashboard can project current-turn macro driver indicators and market-string metrics into a dashboard-ready shape. The projection must use only the current month and must not expose future macro narrative or market metric rows.

This story implements the pure domain dashboard projection plus future server-query descriptor, result envelope, and validation failure envelope contracts. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, or class tenancy enforcement.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function builds a current-turn Driver/String dashboard projection.
- The projection includes current investment clock, scenario persistence, and business-cycle context.
- The projection groups macro driver metrics by leading, coincident, and lagging indicator timing.
- The projection includes current market-string metrics for index level, liquidity, flows, earnings expectations, and valuation sentiment.
- Future macro narrative and market metric rows passed into the domain function are not returned.
- The projection rejects invalid current month indexes.
- The projection rejects missing or duplicate current-month macro narrative or market metrics rows through the current snapshot boundary.
- Unit tests cover current dashboard output, future-row non-exposure, invalid month indexes, and duplicate current rows.
- A pure TypeScript query descriptor records the future server-query boundary for one already-scoped class/current-month/viewer-fund dashboard request.
- A query result envelope wraps only an already-authorized dashboard projection whose current month matches the descriptor.
- A query result validation failure envelope maps missing or mismatched dashboards to safe validation errors without returning dashboard payloads.
- Unit tests cover descriptor validation, result envelope scope matching, safe payload exclusions, and validation failure envelopes.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, or class-tenancy code is introduced.

## Design Notes

- Commands: none; this is pure domain projection.
- Queries: future server-query descriptor, result envelope, and validation failure envelope only; no query execution.
- API: none.
- Tables: none.
- Domain rules: the dashboard reuses the current-month macro news snapshot boundary so future-row protection and current-row uniqueness remain consistent.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for current-turn Driver/String projection, future-row non-exposure, and query boundary envelopes. |
| Integration | Not applicable; no executed boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/scenario/driver-string-dashboard.test.ts` — passed; 1 test file and 12 tests passed.
- `npm run validate:quick` — passed; 24 test files and 347 tests passed.
