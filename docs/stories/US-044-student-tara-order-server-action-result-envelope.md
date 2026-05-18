# US-044 Student TARA Order Server Action Result Envelope

## Status

implemented

## Lane

normal

## Product Contract

Students need a student-safe result envelope after a future submit-student-TARA-order server action accepts the already-described command boundary. This pure TypeScript slice maps the existing command descriptor back to a receipt-shaped accepted-pending-order result without introducing actual server actions, persistence, auth/session enforcement, database clients, worker dispatch, realtime publication, UI state, or processed order execution.

This story implements only a typed result envelope derived from an already-scoped student TARA order server-action command descriptor. It does not implement UI, client validation, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, processed order execution, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student TARA order server-action result envelope from an existing student TARA order server-action command descriptor.
- The envelope records envelope type, deterministic result key, command key, result boundary, command name, viewer-fund scope requirement, class id, month index, viewer fund id, idempotency key, accepted-pending-order status, persistence intent, delivery semantics, and a student-safe receipt payload.
- The envelope preserves the command descriptor idempotency key as the receipt submission key.
- The envelope excludes auth sessions, database rows, persisted order ids, server-action execution details, worker payloads, realtime payloads, and processed order data.
- Unit tests cover result envelope creation, deterministic key creation, scope metadata, receipt data preservation, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, order-persistence, or processed order-execution code is introduced.

## Design Notes

- Commands: pure result-envelope creation for a future `submit_student_tara_order` server-action result boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: server-action result envelopes derive from command descriptors and carry only already-scoped viewer-fund pending-order receipt data.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for result envelope creation, idempotency key preservation, scope metadata, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server action execution, worker, persistence, or realtime integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server action runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 204 tests passed.
