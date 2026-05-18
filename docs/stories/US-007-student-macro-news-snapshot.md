# US-007 Student Macro News Snapshot and Query Boundary Envelopes

## Status

implemented

## Lane

normal

## Product Contract

The student macro news terminal may show the current month's headline, macro regime, scenario-driver metrics, and market-string dashboard values. It must not expose future macro narrative or market metric rows.

This story implements only the pure domain snapshot projection plus future server-query descriptor, result envelope, and validation failure envelope for a current month. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, result delivery, or class tenancy enforcement.

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
- A pure TypeScript query descriptor records the future server-query scope for one already-scoped class, current month, and viewer fund.
- A query result envelope wraps an already-authorized current-month macro news snapshot only when the descriptor month matches.
- A query result validation failure envelope maps missing or mismatched query result inputs without returning snapshots, database rows, provider clients, UI state, future scenario rows, or executed query metadata.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, result delivery, or class-tenancy code is introduced.

## Design Notes

- Commands: none; this is pure domain projection.
- Queries: future server-query descriptor, result envelope, and validation failure envelope only; no query execution.
- API: none.
- Tables: none.
- Domain rules: a student-facing macro news snapshot is keyed by one non-negative current month index and returns only that month from already-provided scenario and market rows. The query boundary is keyed by class, current month, and viewer fund scope, and returns only an already-authorized snapshot.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for current-month snapshot projection, future-row non-exposure, query descriptor creation, query result envelope creation, and query result validation failure envelopes. |
| Integration | Not applicable; no boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/scenario/macro-news.test.ts` — passed; 1 test file and 13 tests passed.
- `npm run validate:quick` — passed; 24 test files and 339 tests passed.
