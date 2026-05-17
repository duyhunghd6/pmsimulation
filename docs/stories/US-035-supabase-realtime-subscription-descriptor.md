# US-035 Supabase Realtime Subscription Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A Supabase Realtime subscription descriptor can be derived from the Supabase Realtime publication descriptor so future clients have a stable channel name, broadcast event name, deterministic subscription key, audience, delivery semantics, refresh-only payload, and client action for refetching authorized current-turn surfaces. This pure TypeScript slice records the future subscription boundary contract without introducing a Supabase SDK client, auth, RLS, server actions, subscriptions, persistence, UI, or platform publication code.

This story implements only a typed subscription descriptor for future Supabase Realtime clients. It does not implement actual Supabase Realtime subscriptions, UI refetching, server actions, API routes, persistence, Supabase clients, Drizzle, auth, RLS, workers, cron, order execution, ledger writes, background processing, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a Supabase Realtime subscription descriptor from the Supabase Realtime publication descriptor.
- The descriptor records subscription type, deterministic subscription key, Supabase Realtime boundary marker, channel name, broadcast event name, class-participant audience, refresh-only delivery semantics, client refetch action, and the original refresh signal payload.
- The descriptor preserves live and auto month-advance refresh metadata through the same publication path.
- The descriptor excludes per-fund ledger drafts, fund processing keys, aggregate financial totals, database rows, provider clients, and direct gameplay data.
- Unit tests cover descriptor creation and refresh-only payload boundaries.
- No cron, auth, database, Supabase client, worker, UI, API route, RLS, order-execution, ledger-persistence, platform publication, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain descriptor creation for a future Supabase Realtime subscription boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: Supabase Realtime subscription descriptors are derived from Supabase Realtime publication descriptors and carry only class/month refresh metadata plus provider boundary metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for Supabase Realtime subscription descriptor creation from Supabase Realtime publication descriptors. |
| Integration | Not applicable; no database, provider client, RLS, worker, subscription, tenant integration, actual realtime publication, or client refetch in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual Supabase, cron, worker, realtime provider, subscription, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 23 test files and 189 tests passed.
