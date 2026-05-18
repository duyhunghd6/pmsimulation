# US-045 Student TARA Order Server Action Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

Students need a student-safe validation failure envelope when a future submit-student-TARA-order server action rejects invalid submission input before persistence. This pure TypeScript slice maps invalid student TARA order submission inputs to deterministic validation-failure result metadata without introducing actual server actions, persistence, auth/session enforcement, database clients, worker dispatch, realtime publication, UI state, or processed order execution.

This story implements only a typed validation-failure envelope for the future server-action result boundary. It does not implement UI, client validation, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, processed order execution, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student-safe validation failure envelope from invalid student TARA order submission inputs.
- The envelope records envelope type, deterministic result key, result boundary, command name, viewer-fund scope requirement, available class/month/fund scope, validation-failed status, no-persistence intent, delivery semantics, and validation errors.
- The envelope uses deterministic fallback key parts when invalid scope inputs cannot identify class, fund, or month.
- The envelope excludes raw order payloads, target weights, current weights, tax-drag previews, auth sessions, database rows, persisted order ids, server-action execution details, worker payloads, realtime payloads, and processed order data.
- Unit tests cover invalid submission failures, deterministic fallback key creation, valid-submission rejection, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, order-persistence, or processed order-execution code is introduced.

## Design Notes

- Commands: pure validation-failure result-envelope creation for a future `submit_student_tara_order` server-action result boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: validation-failure envelopes reuse existing student submission receipt validation errors and carry only student-safe error metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for validation failure envelope creation, deterministic fallback keys, valid-submission rejection, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server action execution, worker, persistence, or realtime integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server action runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 208 tests passed.
