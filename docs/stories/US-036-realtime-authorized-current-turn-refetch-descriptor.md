# US-036 Realtime Authorized Current-Turn Refetch Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A realtime authorized current-turn refetch descriptor can be derived from the Supabase Realtime subscription descriptor so future clients have a stable refetch plan for authorized student and instructor current-turn surfaces after a month-advance refresh signal. This pure TypeScript slice records the future client refetch boundary contract without introducing a Supabase SDK client, browser UI, auth, RLS, server queries, persistence, platform subscriptions, or actual refetch execution.

This story implements only a typed refetch descriptor for future client behavior. It does not implement actual Supabase Realtime subscriptions, UI refetching, server actions, API routes, persistence, Supabase clients, Drizzle, auth, RLS, workers, cron, order execution, ledger writes, background processing, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an authorized current-turn refetch descriptor from the Supabase Realtime subscription descriptor.
- The descriptor records plan type, deterministic refetch plan key, subscription key, class channel, broadcast event, class-participant audience, refresh-only delivery semantics, client refetch action, required server-scoped authorization, current-turn surface names, class id, processed month, current month, total months, idempotency key, and the original refresh-only payload.
- The descriptor preserves live and auto month-advance refresh metadata through the same subscription path.
- The descriptor excludes per-fund ledger drafts, fund processing keys, aggregate financial totals, database rows, provider clients, and direct gameplay data.
- Unit tests cover descriptor creation and refresh-only payload boundaries.
- No cron, auth, database, Supabase client, worker, UI, API route, RLS, order-execution, ledger-persistence, platform subscription, platform publication, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain descriptor creation for a future client refetch boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: Authorized current-turn refetch descriptors are derived from Supabase Realtime subscription descriptors and carry only class/month refresh metadata plus future refetch instructions.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for authorized current-turn refetch descriptor creation from Supabase Realtime subscription descriptors. |
| Integration | Not applicable; no database, provider client, RLS, worker, subscription, tenant integration, actual realtime publication, actual client refetch, or server query in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual Supabase, cron, worker, realtime provider, subscription, client refetch, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 23 test files and 191 tests passed.
