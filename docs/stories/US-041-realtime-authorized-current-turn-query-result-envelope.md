# US-041 Realtime Authorized Current-Turn Query Result Envelope

## Status

implemented

## Lane

normal

## Product Contract

A realtime authorized current-turn query result envelope can be created from the authorized current-turn query descriptor after future server-scoped query boundaries have produced already-authorized student and instructor current-turn dashboard snapshots. This pure TypeScript slice records the post-query result contract without introducing server query execution, auth/session checks, RLS, database access, Supabase clients, UI refetching, provider subscriptions, workers, cron, or platform code.

This story implements only a typed result envelope for already-scoped current-turn dashboard snapshots. It does not implement actual server queries, Supabase Realtime subscriptions, UI refetching, server actions, API routes, persistence, Supabase clients, Drizzle, auth, RLS, workers, cron, order execution, ledger writes, background processing, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an authorized current-turn query result envelope from the realtime authorized current-turn query descriptor and already-authorized current-turn dashboard snapshots.
- The envelope records envelope type, deterministic result key, server query result boundary, query descriptor key, required authorization, class id, processed month, current month, total months, idempotency key, delivery semantics, per-surface result entries, and the original refresh-only payload.
- Student and instructor current-turn surfaces preserve their distinct future scope requirements and attach only matching current-turn dashboard snapshots.
- The envelope rejects missing or class/month-mismatched dashboard snapshots for requested surfaces.
- The envelope excludes database rows, provider clients, UI state, per-fund ledger drafts, fund processing keys, aggregate financial totals, and unscoped gameplay payloads.
- Unit tests cover envelope creation, current-turn scope constraints, and missing/mismatched snapshot errors.
- No cron, auth, database, Supabase client, worker, UI, API route, RLS, order-execution, ledger-persistence, platform subscription, platform publication, server query execution, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain result-envelope creation for a future server query result boundary.
- Queries: none executed; the envelope accepts already-authorized dashboard snapshots as inputs.
- API: none.
- Tables: none.
- Domain rules: Query result envelopes derive from query descriptors and carry authorized current-turn dashboard snapshots only when class and current-month scope match.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for authorized current-turn query result envelope creation and scope errors. |
| Integration | Not applicable; no database, provider client, RLS, worker, subscription, tenant integration, actual realtime publication, actual client refetch, or server query execution in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual Supabase, cron, worker, realtime provider, subscription, client refetch, server query runtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 196 tests passed.
