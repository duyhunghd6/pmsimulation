# US-083 Instructor Class Creation Server Action Executor

## Status

implemented

## Lane

normal

## Product Contract

Instructors can execute the first bounded class-creation command boundary with trusted instructor session scope, validated class draft inputs, injected class persistence, and an instructor-safe class creation receipt. The executor uses the session subject as the instructor id, parses the persisted class row before delivery, and returns only the existing safe result envelope.

This story implements only an injected server-side executor and persisted-row parser for class creation. It does not implement browser UI, live Supabase writes, join-code generation, class roster management, realtime publication, worker dispatch, hosted provider proof, E2E proof, or deployment code.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A server-side executor accepts a trusted instructor session plus class draft input and rejects non-instructor sessions before persistence.
- The executor derives the instructor id from the trusted session, not from user-supplied draft input.
- Invalid class draft input returns the existing instructor-safe validation failure envelope and does not call persistence.
- Valid class drafts map to the existing class server-action command descriptor and call an injected class creation store.
- The persisted class row is parsed before result delivery and must belong to the trusted instructor session.
- Persisted rows that do not match the validated command payload are rejected before returning a receipt.
- The returned success payload is the existing instructor-safe class creation result envelope and excludes database rows, persisted class ids, auth sessions, realtime payloads, and server execution details.
- Unit tests cover success, role denial, invalid draft failure, persisted-row rejection, and persisted-command mismatch.

## Design Notes

- Commands: `executeInstructorClassCreationAction` executes the bounded `create_instructor_class` command through an injected store.
- Queries: none.
- API: no route or browser form is added.
- Tables: no migration changes; persisted rows are represented as unknown boundary data and parsed before delivery.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for the injected class creation executor and created class row parser. |
| Integration | Planned; live Supabase write/RLS proof remains pending. |
| E2E | Planned; browser instructor class creation flow remains pending. |
| Platform | Not applicable in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-class-creation-action.test.ts app/infrastructure/auth-tenancy/rows.test.ts` — passed with 2 test files and 37 tests.
- `npm run validate:quick` — passed with 39 test files and 468 tests.
