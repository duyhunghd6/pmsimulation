# US-049 Instructor Live Month-Advance Server Action Command Descriptor

## Status

implemented

## Lane

normal

## Product Contract

Instructors need an already-validated live month-advance request to map cleanly to a future server-action command boundary without introducing actual server actions, persistence, auth/session enforcement, database clients, worker dispatch, realtime publication, UI state, or month-processing execution. This pure TypeScript slice records the command descriptor that a future server action can consume after instructor-class scope has already been enforced.

This story implements only a typed command descriptor derived from an already-valid instructor live month-advance request. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, ledger writes, order execution, or deployment code.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor live month-advance server-action command descriptor from an already-validated live month-advance request.
- The descriptor records descriptor type, deterministic command key, command boundary, command name, instructor-administered manual-class scope requirement, class id, instructor id, month transition, total months, idempotency key, and future processing intent.
- The descriptor preserves the live request idempotency key as the future command idempotency key.
- The descriptor excludes auth sessions, database rows, server-action execution results, worker payloads, realtime payloads, fund inputs, ledger drafts, and month-processing execution data.
- Unit tests cover descriptor creation, deterministic key creation, scope metadata, request data preservation, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, order execution, ledger persistence, or month-processing execution code is introduced.

## Design Notes

- Commands: pure descriptor creation for a future `advance_instructor_live_month` server-action command boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: server-action command descriptors derive from validated manual-mode live month-advance requests and carry only already-scoped instructor/class transition metadata.
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

- `npm run validate:quick` — passed; 24 test files and 217 tests passed.
