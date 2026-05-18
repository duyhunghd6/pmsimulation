# US-084 Instructor Class Creation UI

## Status

implemented

## Lane

normal

## Product Contract

Instructors can use the protected `/instructor/dashboard` browser surface to submit a class draft to the existing bounded class-creation server action executor and receive an instructor-safe class creation receipt state. The UI renders empty, loading, success, validation-error, and authorization/error states without exposing persisted class ids, raw database rows, auth sessions, realtime payloads, roster data, or live provider payloads.

This story implements browser UI over the injected proof executor only. It does not implement live Supabase class writes, hosted provider proof, durable class list refresh, class roster management, realtime publication, worker dispatch, deployment code, or provider-backed E2E proof.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The protected instructor dashboard renders a class creation form reachable by trusted instructor sessions.
- The form captures class name, uppercase join code, and trigger mode, then posts to a server action.
- The server action uses the trusted instructor session and calls the existing bounded class-creation executor with an injected proof store.
- Non-instructor or missing sessions redirect to an instructor-safe authorization error state.
- Invalid drafts redirect to an instructor-safe validation error state without calling live provider writes.
- Successful submissions redirect to a safe receipt state showing join-code and trigger-mode metadata only.
- The UI includes an empty state before submission and a pending button state while the server action is running.
- Live Supabase writes, persisted class ids, raw rows, roster management, realtime publication, and provider-backed browser proof remain out of scope.

## Design Notes

- Commands: `createInstructorClass` server action calls `executeInstructorClassCreationAction` through an injected store that returns a parsed proof row.
- Queries: existing instructor dashboard query executors remain unchanged.
- API: no route handler is added; the App Router form posts directly to a server action.
- Tables: no migration changes; live Supabase class creation writes remain pending.
- Domain rules: the existing class draft and class creation executor validation still own class name, trigger mode, join-code, and trusted instructor scope checks.
- UI surfaces: `/instructor/dashboard` now includes the class creation panel above current instructor status, leaderboard, aggregate, and God Mode panels.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing class creation executor unit tests remain the command proof. |
| Integration | Planned; live Supabase write/RLS proof remains pending. |
| E2E | Planned; provider-backed browser session and durable class write proof remain pending. |
| Platform | Local dev-server route smoke for `/instructor/dashboard` when practical. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- Pending validation in this sprint.
