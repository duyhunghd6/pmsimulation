# US-043 Student TARA Order Server Action Command Descriptor

## Status

implemented

## Lane

normal

## Product Contract

Students need the validated TARA order submission receipt to map cleanly to a future server-command boundary without introducing actual server actions, persistence, auth/session enforcement, database clients, worker dispatch, realtime publication, UI state, or processed order execution. This pure TypeScript slice records the command descriptor that a future server action can consume after viewer-fund scope has already been enforced.

This story implements only a typed command descriptor derived from an already-valid student submission receipt. It does not implement UI, client validation, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, processed order execution, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student TARA order server-action command descriptor from an already-validated student submission receipt.
- The descriptor records descriptor type, deterministic command key, command boundary, command name, viewer-fund scope requirement, class id, month index, viewer fund id, idempotency key, target weights, estimated tax drag, rebalance trigger, pending status, and pending-order persistence intent.
- The descriptor preserves the receipt submission key as the future idempotency key.
- The descriptor excludes auth sessions, database rows, Supabase clients, server-action execution results, worker payloads, realtime payloads, and processed order data.
- Unit tests cover descriptor creation, deterministic key creation, scope metadata, receipt data preservation, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, order-persistence, or processed order-execution code is introduced.

## Design Notes

- Commands: pure descriptor creation for a future `submit_student_tara_order` server-action command boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: server-action command descriptors derive from validated student submission receipts and carry only already-scoped viewer-fund pending-order data.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for command descriptor creation, idempotency key preservation, scope metadata, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server action execution, worker, or persistence integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server action runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 202 tests passed.
