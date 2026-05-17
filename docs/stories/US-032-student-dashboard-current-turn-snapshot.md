# US-032 Student Dashboard Current-Turn Snapshot

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript student dashboard current-turn snapshot composes the already-scoped student macro news, Driver/String dashboard, portfolio pyramid, TARA order-entry, and leaderboard-rank domain snapshots for one viewer fund and class month. The snapshot is a safe domain composition for future server-side student dashboard fetching; it does not introduce UI, server actions, auth, database, persistence, Supabase, Drizzle, realtime subscriptions, background workers, or platform code.

The composed snapshot preserves the student anti-leakage contract: current-turn macro and market rows only, exact holdings and target weights only for the viewer fund surfaces, permitted leaderboard metrics for classmates, and no instructor God Mode, pending-order visibility, other-fund ids, other-fund exact holdings, ledger drafts, future scenario rows, or provider payloads.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student dashboard current-turn snapshot from already-scoped class, viewer fund, scenario, allocation, order, and leaderboard inputs.
- The snapshot includes macro news, Driver/String metrics, portfolio pyramid drift, TARA order-entry preview, and leaderboard rank for the same current month.
- The snapshot excludes future macro/market rows, other-fund ids, other-fund exact holdings, other-fund pending-order details, instructor God Mode data, ledger drafts, realtime payloads, database rows, and provider clients.
- Invalid child surfaces return source-tagged errors so future application boundaries can show or log the failing dashboard section.
- Unit tests cover composition, anti-leakage boundaries, and child error propagation.
- No UI, server action, API route, auth, RLS, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none; this is a pure domain snapshot composition.
- Queries: none; future server queries can call this after enforcing class and viewer-fund scope.
- API: none.
- Tables: none.
- Domain rules: dashboard composition reuses existing section builders rather than broadening any individual data contract.
- UI surfaces: no UI in this slice; this describes the payload shape a future student dashboard surface can request after authorization exists.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for current-turn composition, anti-leakage boundaries, and source-tagged errors. |
| Integration | Not applicable; no database, auth, RLS, server query, provider, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, or realtime provider code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 22 test files and 179 tests passed.
