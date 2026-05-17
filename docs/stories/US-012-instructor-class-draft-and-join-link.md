# US-012 Instructor Class Draft and Join Link

## Status

implemented

## Lane

normal

## Product Contract

Instructors can prepare a new class instance with a selected trigger mode and an issued student join code. The MVP pure-domain slice validates the instructor class draft inputs and returns the initial class month plus a student join path.

This story implements only the pure domain draft rule. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, or join-code generation.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor class draft with instructor id, class name, trigger mode, initial month index, join code, and student join path.
- The draft supports the accepted `auto` and `manual` trigger modes.
- The draft starts classes at month index `0`.
- The draft rejects blank instructor ids and blank class names.
- The draft rejects unknown trigger modes.
- The draft rejects malformed join codes instead of creating a join path.
- Unit tests cover valid manual and auto drafts, trimming behavior, and invalid inputs.
- No auth, database, Supabase, worker, realtime, UI, API route, class persistence, or join-code generation code is introduced.

## Design Notes

- Commands: none; this is pure domain draft creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: a class draft requires an instructor id, class name, `auto` or `manual` trigger mode, and an already-issued uppercase alphanumeric join code.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor class draft creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 12 test files and 68 tests passed.
