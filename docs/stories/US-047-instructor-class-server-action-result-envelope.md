# US-047 Instructor Class Server Action Result Envelope

## Status

implemented

## Lane

normal

## Product Contract

Instructors need an instructor-safe result envelope after a future create-instructor-class server action accepts the already-described command boundary. This pure TypeScript slice maps the existing command descriptor to an accepted class-creation receipt without introducing actual server actions, persistence, auth/session enforcement, database clients, join-code generation, realtime publication, UI state, or persisted class ids.

This story implements only a typed result envelope derived from an already-scoped instructor class server-action command descriptor. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, join-code generation, class creation execution, or deployment code.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor class server-action result envelope from an existing instructor class server-action command descriptor.
- The envelope records envelope type, deterministic result key, command key, result boundary, command name, instructor class-creation scope requirement, instructor id, idempotency key, accepted class-creation status, persistence intent, delivery semantics, and an instructor-safe receipt payload.
- The envelope preserves the command descriptor idempotency key as the receipt creation key.
- The receipt preserves class name, trigger mode, initial month index, join code, and student join path from the command descriptor.
- The envelope excludes auth sessions, database rows, persisted class ids, server-action execution details, worker payloads, realtime payloads, and generated join-code payloads.
- Unit tests cover result envelope creation, deterministic key creation, scope metadata, receipt data preservation, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, class persistence, class id, or join-code generation code is introduced.

## Design Notes

- Commands: pure result-envelope creation for a future `create_instructor_class` server-action result boundary; no command is executed.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: server-action result envelopes derive from command descriptors and carry only already-scoped instructor class-creation receipt data.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for result envelope creation, idempotency key preservation, scope metadata, receipt preservation, and payload exclusions. |
| Integration | Not applicable; no database, provider client, RLS, server action execution, worker, persistence, join-code generation, or realtime integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime provider, server action runtime, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 211 tests passed.
