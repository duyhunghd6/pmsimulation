# US-040 Realtime Authorized Current-Turn Query Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A realtime authorized current-turn query descriptor can be derived from the authorized current-turn refetch plan so future clients have a stable contract for which server-scoped current-turn queries must run after a month-advance refresh signal. This pure TypeScript slice records future query boundary instructions for student and instructor current-turn dashboard surfaces without executing server queries, auth/session checks, RLS, database access, UI refetching, provider subscriptions, or gameplay data delivery.

This story implements only a typed descriptor for future server-scoped query behavior. It does not implement actual server queries, Supabase Realtime subscriptions, UI refetching, server actions, API routes, persistence, Supabase clients, Drizzle, auth, RLS, workers, cron, order execution, ledger writes, background processing, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an authorized current-turn query descriptor from the realtime authorized current-turn refetch plan.
- The descriptor records descriptor type, deterministic descriptor key, server query boundary, refetch plan key, required authorization, class id, processed month, current month, total months, idempotency key, per-surface query instructions, and the original refresh-only payload.
- Student and instructor current-turn surfaces map to distinct future scope requirements.
- The descriptor preserves live and auto month-advance refresh metadata through the same refetch path.
- The descriptor excludes per-fund ledger drafts, fund processing keys, aggregate financial totals, database rows, provider clients, executed query results, UI state, and direct gameplay data.
- Unit tests cover descriptor creation and refresh-only/query-boundary payload constraints.
- No cron, auth, database, Supabase client, worker, UI, API route, RLS, order-execution, ledger-persistence, platform subscription, platform publication, server query execution, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain descriptor creation for a future server query boundary.
- Queries: none executed; the descriptor names future server-scoped current-turn query instructions only.
- API: none.
- Tables: none.
- Domain rules: Authorized current-turn query descriptors derive from refetch plans and carry only class/month refresh metadata plus future query scope instructions.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for authorized current-turn query descriptor creation from realtime authorized current-turn refetch plans. |
| Integration | Not applicable; no database, provider client, RLS, worker, subscription, tenant integration, actual realtime publication, actual client refetch, or server query execution in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual Supabase, cron, worker, realtime provider, subscription, client refetch, server query runtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 23 test files and 193 tests passed.
