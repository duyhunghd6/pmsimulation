# US-046 Instructor Class Server Action Command Descriptor

## Status

implemented

## Lane

normal

## Product Contract

Instructors can map an already-validated class draft into a future server-action command descriptor for class creation. The descriptor preserves instructor id, class name, trigger mode, initial month, join code, join path, idempotency key, command metadata, and persistence intent without executing a server action.

This story implements only the pure domain command descriptor. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth/session enforcement, RLS, join-code generation, workers, realtime, or class creation execution.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function maps a valid instructor class draft to a future server-action command descriptor.
- The descriptor records command boundary metadata for `create_instructor_class`.
- The descriptor carries the future required scope for an instructor creating their own class.
- The descriptor preserves class draft values including trigger mode, initial month index, join code, and student join path.
- The descriptor emits deterministic command and idempotency keys from instructor id and join code.
- The descriptor records a class-creation persistence intent without returning a persisted class id or database row.
- Unit tests cover the descriptor shape and key derivation.
- No UI, server action, auth, database, Supabase, Drizzle, RLS, worker, realtime, API route, or join-code generation code is introduced.

## Design Notes

- Commands: future `create_instructor_class` server action command descriptor only; no execution.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: a descriptor derives only from an already-valid instructor class draft.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for mapping a valid class draft into a server-action command descriptor. |
| Integration | Not applicable; no server action, database, provider, auth, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 209 tests passed.
