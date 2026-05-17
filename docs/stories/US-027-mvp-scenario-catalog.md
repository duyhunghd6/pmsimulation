# US-027 MVP Scenario Catalog

## Status

implemented

## Lane

normal

## Product Contract

The simulation uses deterministic seeded macro narrative and market metric rows for the full 12-month MVP curriculum calendar. Student-facing reveal helpers may expose only current and past scenario rows for a selected month and must not expose future rows.

This story implements only the pure domain scenario catalog and reveal-window helper. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, or class tenancy enforcement.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain module defines an MVP deterministic macro narrative catalog for 12 months.
- A pure TypeScript domain module defines paired MVP market metric rows for the same 12 month indexes.
- Catalog rows are consecutive from month index `0` through `11` and can be listed or looked up without inventing unknown months.
- The catalog includes a deterministic inflation-threshold rate-hike stress turn where CPI crosses `3.0%`, policy rate rises by `0.50%`, and VIX rises.
- A reveal-window helper returns only current and past rows for a valid current month index.
- The reveal-window helper rejects invalid current month indexes.
- Unit tests cover 12-month catalog coverage, lookup behavior, future-row non-exposure, invalid reveal windows, and deterministic rate-hike stress turns.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, cron, or class-tenancy code is introduced.

## Design Notes

- Commands: none; this is pure domain seed data and projection.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: the 12-month catalog is deterministic seed data for future persistence/seeding work, and the reveal helper preserves the current/past-only student data invariant before a server query boundary exists.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for 12-month catalog coverage, lookup, reveal-window filtering, invalid month handling, and deterministic rate-hike stress behavior. |
| Integration | Not applicable; no boundary, database, provider, RLS, tenant, or seed-script integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 23 test files and 191 tests passed.
