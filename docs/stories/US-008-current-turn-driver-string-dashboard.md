# US-008 Current-Turn Driver/String Dashboard

## Status

implemented

## Lane

normal

## Product Contract

The student dashboard can project current-turn macro driver indicators and market-string metrics into a dashboard-ready shape. The projection must use only the current month and must not expose future macro narrative or market metric rows.

This story implements only the pure domain dashboard projection. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, or class tenancy enforcement.

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
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, or class-tenancy code is introduced.

## Design Notes

- Commands: none; this is pure domain projection.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: the dashboard reuses the current-month macro news snapshot boundary so future-row protection and current-row uniqueness remain consistent.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for current-turn Driver/String projection and future-row non-exposure. |
| Integration | Not applicable; no boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 8 test files and 48 tests passed.
