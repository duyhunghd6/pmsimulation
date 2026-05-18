# US-048 Instructor Class Server Action Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

Instructors need an instructor-safe validation failure envelope when a future create-instructor-class server action rejects invalid class draft input before persistence. This pure TypeScript slice maps invalid instructor class draft inputs to deterministic validation-failure result metadata without introducing actual server actions, persistence, auth/session enforcement, database clients, join-code generation, realtime publication, UI state, or persisted class ids.

This story implements only a typed validation-failure envelope for the future server-action result boundary. It does not implement UI, client validation, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, class creation execution, join-code generation, or deployment code.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor-safe validation failure envelope from invalid instructor class draft inputs.
- The envelope records envelope type, deterministic result key, result boundary, command name, instructor class-creation scope requirement, available instructor scope, validation-failed status, no-persistence intent, delivery semantics, and validation errors.
- The envelope uses deterministic fallback key parts when invalid scope inputs cannot identify instructor or join-code context.
- The envelope excludes raw class draft payloads, class name, trigger mode, join code, student join path, auth sessions, database rows, persisted class ids, server-action execution details, worker payloads, and realtime payloads.
- Unit tests cover invalid class draft failures, deterministic fallback keys, valid-draft rejection, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, class persistence, persisted class id, or join-code generation code is introduced.

## Design Notes

- Commands: pure validation-failure result-envelope creation for a future `create_instructor_class` server-action result boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: validation-failure envelopes reuse existing instructor class draft validation errors and carry only instructor-safe error metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for validation failure envelope creation, deterministic fallback keys, valid-draft rejection, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server action execution, worker, persistence, join-code generation, or realtime integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server action runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 215 tests passed.
