# US-007 Student Macro News Snapshot

## Status

implemented

## Lane

normal

## Product Contract

The student macro news terminal may show the current month's headline, macro regime, scenario-driver metrics, and market-string dashboard values. It must not expose future macro narrative or market metric rows.

This story implements only the pure domain snapshot projection for a current month. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, or class tenancy enforcement.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function builds a student macro news snapshot for one current month.
- The snapshot includes the current-month news headline, investment clock phase, scenario persistence, macro drivers, and market strings.
- Future macro narrative and market metric rows passed into the domain function are not returned.
- The snapshot rejects invalid current month indexes.
- The snapshot rejects missing or duplicate current-month macro narrative rows.
- The snapshot rejects missing or duplicate current-month market metric rows.
- Unit tests cover current snapshot output, future-row non-exposure, invalid month indexes, missing current rows, and duplicate current rows.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, or class-tenancy code is introduced.

## Design Notes

- Commands: none; this is pure domain projection.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: a student-facing macro news snapshot is keyed by one non-negative current month index and returns only that month from already-provided scenario and market rows.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for current-month snapshot projection and future-row non-exposure. |
| Integration | Not applicable; no boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 7 test files and 44 tests passed.
