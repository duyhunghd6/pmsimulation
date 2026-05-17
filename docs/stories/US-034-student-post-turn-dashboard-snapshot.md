# US-034 Student Post-Turn Dashboard Snapshot

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript student post-turn dashboard snapshot composes the already-scoped student attribution report and leaderboard-rank domain snapshots for one viewer fund and processed class month. The snapshot is a safe domain composition for future server-side student dashboard fetching after month advancement; it does not introduce UI, server actions, auth, database, persistence, Supabase, Drizzle, realtime subscriptions, background workers, or platform code.

The composed snapshot preserves the student anti-leakage contract: attribution details come only from the viewer fund ledger draft, leaderboard rows expose only permitted class ranking metrics, and the payload excludes order details, target weights, exact holdings, other-fund ids, class aggregate analytics, instructor God Mode data, database rows, provider payloads, and future scenario rows.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student post-turn dashboard snapshot from an already-scoped viewer ledger draft and leaderboard inputs.
- The snapshot includes the viewer fund attribution report and current leaderboard rank for the same processed month.
- The snapshot trims class and viewer fund ids through the child snapshot builders.
- The snapshot excludes order details, target weights, exact holdings, other-fund ids, class aggregate payloads, instructor God Mode data, ledger draft collections, realtime payloads, database rows, and provider clients.
- Invalid child surfaces return source-tagged errors so future application boundaries can show or log the failing dashboard section.
- Unit tests cover composition, anti-leakage boundaries, and child error propagation.
- No UI, server action, API route, auth, RLS, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none; this is a pure domain snapshot composition.
- Queries: none; future server queries can call this after enforcing class and viewer-fund scope.
- API: none.
- Tables: none.
- Domain rules: post-turn dashboard composition reuses existing attribution report and leaderboard rank builders rather than broadening either payload contract.
- UI surfaces: no UI in this slice; this describes the payload shape a future student dashboard surface can request after authorization exists.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for post-turn composition, anti-leakage boundaries, and source-tagged errors. |
| Integration | Not applicable; no database, auth, RLS, server query, provider, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, or realtime provider code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 23 test files and 187 tests passed.
