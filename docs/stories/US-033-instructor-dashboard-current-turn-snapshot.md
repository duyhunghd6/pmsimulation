# US-033 Instructor Dashboard Current-Turn Snapshot

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript instructor dashboard current-turn snapshot composes the already-scoped instructor pending-order visibility, live leaderboard, God Mode portfolio visibility, class aggregate analytics, and live month-advance control domain snapshots for one instructor-scoped class month. The snapshot is a safe domain composition for future server-side instructor dashboard fetching; it does not introduce UI, server actions, auth, database, persistence, Supabase, Drizzle, realtime clients, background workers, cron, or platform code.

The composed snapshot preserves the instructor boundary contract: it may include instructor-only exact current holdings through the God Mode section after class scope has already been enforced, but it excludes target weights, estimated tax drag, order details, ledger drafts, worker payloads, realtime payloads, provider clients, database rows, and student-facing query paths.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor dashboard current-turn snapshot from already-scoped class, fund, pending-order, and live-control inputs.
- The snapshot includes pending-order visibility, live leaderboard, God Mode portfolio visibility, class aggregate analytics, and live month-advance control for the same current month.
- The snapshot derives pending/missing order status once and reuses that status across leaderboard, God Mode, and aggregate sections.
- The snapshot excludes target weights, estimated tax drag, order detail payloads, ledger drafts, worker payloads, realtime payloads, provider clients, database rows, UI, auth, RLS, and platform code.
- Invalid child surfaces return source-tagged errors so future application boundaries can show or log the failing dashboard section.
- Unit tests cover composition, trimming behavior, anti-leakage boundaries, and child error propagation.
- No UI, server action, API route, auth, RLS, database, Supabase, Drizzle, realtime client, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none; this is a pure domain snapshot composition.
- Queries: none; future server queries can call this after enforcing instructor/class scope.
- API: none.
- Tables: none.
- Domain rules: dashboard composition reuses existing section builders rather than broadening any individual data contract.
- UI surfaces: no UI in this slice; this describes the payload shape a future instructor dashboard surface can request after authorization exists.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for current-turn composition, trimming behavior, anti-leakage boundaries, and source-tagged errors. |
| Integration | Not applicable; no database, auth, RLS, server query, provider, worker, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, or realtime provider code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 23 test files and 184 tests passed.
