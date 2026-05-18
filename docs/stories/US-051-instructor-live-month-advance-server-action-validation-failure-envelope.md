# US-051 Instructor Live Month-Advance Server Action Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

Instructors need an instructor-safe validation failure envelope when a future live month-advance server action rejects invalid live advancement input before worker enqueueing or month processing. This pure TypeScript slice maps invalid instructor live month-advance inputs to deterministic validation-failure result metadata without introducing actual server actions, persistence, auth/session enforcement, database clients, worker dispatch, realtime publication, ledger writes, UI state, or month-processing execution.

This story implements only a typed validation-failure envelope for the future server-action result boundary. It does not implement UI, client validation, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, ledger writes, order execution, month processing, or deployment code.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor-safe validation failure envelope from invalid instructor live month-advance inputs.
- The envelope records envelope type, deterministic result key, result boundary, command name, instructor-administered manual-class scope requirement, available instructor/class/month transition scope, validation-failed status, no-processing intent, delivery semantics, and validation errors.
- The envelope uses deterministic fallback key parts when invalid scope or transition inputs cannot identify class, instructor, or month transition context.
- The envelope excludes raw live advancement payloads, trigger mode, total months, idempotency keys, auth sessions, database rows, server-action execution details, worker payloads, worker jobs, realtime payloads, fund inputs, ledger drafts, and month-processing execution results.
- Unit tests cover invalid live request failures, deterministic fallback keys, valid-request rejection, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, worker dispatch, ledger persistence, order execution, or month-processing execution code is introduced.

## Design Notes

- Commands: pure validation-failure result-envelope creation for a future `advance_instructor_live_month` server-action result boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: validation-failure envelopes reuse existing instructor live month-advance request validation errors and carry only instructor-safe error metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for validation failure envelope creation, deterministic fallback keys, valid-request rejection, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server action execution, worker, persistence, ledger write, or realtime integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server action runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 223 tests passed.
