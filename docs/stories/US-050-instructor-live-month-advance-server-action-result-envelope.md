# US-050 Instructor Live Month-Advance Server Action Result Envelope

## Status

implemented

## Lane

normal

## Product Contract

Instructors need an instructor-safe result envelope after a future live month-advance server action accepts the already-described command boundary. This pure TypeScript slice maps the existing command descriptor to an accepted live month-advance receipt without introducing actual server actions, persistence, auth/session enforcement, database clients, worker dispatch, realtime publication, ledger writes, UI state, or month-processing execution.

This story implements only a typed result envelope derived from an already-scoped instructor live month-advance server-action command descriptor. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, ledger writes, order execution, month processing, or deployment code.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor live month-advance server-action result envelope from an existing live month-advance command descriptor.
- The envelope records envelope type, deterministic result key, command key, result boundary, command name, instructor-administered manual-class scope requirement, instructor id, class id, idempotency key, accepted live month-advance status, processing intent, delivery semantics, and an instructor-safe receipt payload.
- The envelope preserves the command descriptor idempotency key as the receipt advancement key.
- The receipt preserves class id, instructor id, trigger mode, month transition, total months, and future processing intent from the command descriptor.
- The envelope excludes auth sessions, database rows, server-action execution details, worker jobs, realtime payloads, fund inputs, ledger drafts, and month-processing execution results.
- Unit tests cover result envelope creation, deterministic key creation, scope metadata, receipt data preservation, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, order execution, ledger persistence, worker dispatch, or month-processing execution code is introduced.

## Design Notes

- Commands: pure result-envelope creation for a future `advance_instructor_live_month` server-action result boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: server-action result envelopes derive from command descriptors and carry only already-scoped instructor live month-advance receipt data.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for result envelope creation, idempotency key preservation, scope metadata, receipt preservation, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server action execution, worker, persistence, ledger write, or realtime integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server action runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 219 tests passed.
