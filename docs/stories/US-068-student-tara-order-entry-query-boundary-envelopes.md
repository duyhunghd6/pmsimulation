# US-068 Student TARA Order-Entry Query Boundary Envelopes

## Status

implemented

## Lane

normal

## Product Contract

Students need the TARA order-entry surface to have a stable future server-query boundary before UI, server query execution, auth/session enforcement, RLS, database clients, provider clients, or result delivery exists. This pure TypeScript slice records the scoped query descriptor, wraps an already-authorized order-entry snapshot when class/month/viewer-fund scope matches, and returns student-safe validation failures without echoing order payloads.

This story implements only provider-neutral domain query boundary envelopes for the already-scoped student TARA order-entry snapshot. It does not implement UI, client validation, server queries, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, processed order execution, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student TARA order-entry server-query descriptor for one already-scoped class, current month, and viewer fund.
- The descriptor records descriptor type, deterministic query descriptor key, query boundary, query name, viewer-fund scope requirement, class id, current month index, viewer fund id, current-turn-only guard, payload-exclusion flags, and requested surface.
- The descriptor trims class and viewer fund identifiers and rejects blank class ids, invalid current-month indexes, and blank viewer fund ids.
- A pure TypeScript domain function wraps an already-authorized student TARA order-entry snapshot only when class id, current month, and viewer fund match the descriptor.
- The result envelope preserves student-safe order-entry snapshot data while excluding other-fund order data, classroom order lists, database rows, provider clients, UI state, auth sessions, and executed query metadata.
- A pure TypeScript domain function creates validation failure envelopes for missing or mismatched query results without returning snapshots, target weights, current weights, estimated tax drag, classroom order lists, database rows, provider clients, or UI state.
- Unit tests cover descriptor creation, descriptor validation, matching result envelopes, missing/mismatched result validation, validation failure envelopes, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server query execution, order-persistence, or processed order-execution code is introduced.

## Design Notes

- Commands: none.
- Queries: pure descriptor/result/failure envelope creation for a future `get_student_tara_order_entry` server-query boundary; no query is executed.
- API: none.
- Tables: none.
- Domain rules: query result envelopes wrap only an already-authorized order-entry snapshot whose class, current month, and viewer fund match the descriptor.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for query descriptor creation, query result envelope creation, validation failure envelope creation, scope matching, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server query execution, worker, or persistence integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server query runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/tara/order.test.ts` — passed with 1 test file and 30 tests.
- `npm run validate:quick` — passed with 24 test files and 288 tests.
