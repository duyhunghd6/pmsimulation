# US-093 Realtime Authorized Server Refetch Result UI

## Status

implemented

## Lane

normal

## Product Contract

Protected student and instructor dashboards render browser-visible proof that the realtime authorized current-turn refetch plan is tied back to a server-scoped current-turn query result boundary on each route render. The proof is scoped to the current route surface and validates the already-authorized dashboard snapshot before the panel reports the server query result as ready.

This story implements a bounded browser-visible UI/status slice. It does not implement hosted Supabase Realtime credentials, hosted publication/subscription execution, live Supabase reads or writes, provider-backed browser auth, E2E proof, deployment proof, or processed-order database mutation.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- Protected `/dashboard` passes the authorized student current-turn dashboard snapshot into the realtime refresh panel config.
- Protected `/instructor/dashboard` passes the authorized instructor current-turn dashboard snapshot into the realtime refresh panel config.
- The realtime refresh panel config scopes the refetch/query descriptor to the route's current surface before creating the authorized current-turn query result envelope.
- The browser-visible panel shows a ready or validation-stopped server query result state with the safe query result key.
- Validation failures expose only safe failure codes and surfaces, not dashboard snapshots, database rows, provider clients, provider errors, ledger drafts, fund-processing keys, or gameplay data through the realtime payload.

## Design Notes

- `app/realtime-refresh-plan.ts` now accepts the route surface plus the already-authorized student or instructor dashboard snapshot, creates a scoped realtime authorized query descriptor, and derives a safe server query result status from `createRealtimeAuthorizedCurrentTurnQueryResultEnvelope`.
- `app/realtime-refresh-panel.tsx` renders the server query result status alongside the existing channel/event/refetch metadata.
- `app/(student)/dashboard/page.tsx` and `app/(instructor)/instructor/dashboard/page.tsx` provide their current route snapshots after role/session checks and bounded query execution.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/realtime-refresh-plan.test.ts` covers student-surface ready status, instructor-surface ready status, and safe validation failure status when the scoped snapshot is missing. |
| Integration | Planned; hosted Supabase subscription and live provider-backed server query execution remain pending. |
| E2E | Planned; provider-backed browser auth plus realtime broadcast-to-refresh proof remains pending. |
| Platform | Planned; hosted Supabase Realtime and deployment proof remain pending. |
| Release | `npm run validate:quick` and `npm run smoke:routes`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, sprint log, and matrix evidence.

## Evidence

- Selected Full-Stack MVP Sprint Sequence item 8: Supabase Realtime turn-completion publication, subscription, and authorized client refetch.
- Required sequence preflight recorded in `.claude/sprint-runs/round-164-20260519-realtime-server-refetch-result.log`.
- UI slice: protected student and instructor dashboards now render a server query result status inside the Realtime refresh panel, proving the current route render validated the scoped authorized current-turn dashboard snapshot.
- `npm run test:unit -- app/realtime-refresh-plan.test.ts` — passed with 1 test file and 3 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 43 test files and 490 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`.
