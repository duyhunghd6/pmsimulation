# US-031 Supabase Realtime Publication Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A Supabase Realtime publication descriptor can be derived from the provider-neutral month-advance publication envelope so the future realtime publisher has a stable broadcast channel name, broadcast event name, deterministic publication key, audience, delivery semantics, and refresh-only payload. This pure TypeScript slice records the Supabase Realtime boundary contract without introducing a Supabase SDK client, auth, RLS, server actions, subscriptions, persistence, or platform publication code.

This story implements only a typed publication descriptor for the future Supabase Realtime publisher. It does not implement actual Supabase Realtime publication, UI subscriptions, server actions, API routes, persistence, Supabase clients, Drizzle, auth, RLS, workers, cron, order execution, ledger writes, background processing, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a Supabase Realtime broadcast descriptor from the provider-neutral realtime publication envelope.
- The descriptor records publication type, deterministic Supabase publication key, Supabase Realtime boundary marker, channel name, broadcast event name, class-participant audience, refresh-only delivery semantics, and the original refresh signal payload.
- The descriptor preserves live and auto month-advance refresh metadata through the same envelope path.
- The descriptor excludes per-fund ledger drafts, fund processing keys, aggregate financial totals, database rows, provider clients, and direct gameplay data.
- Unit tests cover descriptor creation and refresh-only payload boundaries.
- No cron, auth, database, Supabase client, worker, UI, API route, RLS, order-execution, ledger-persistence, subscription, platform publication, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain descriptor creation for a future Supabase Realtime publisher boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: Supabase Realtime descriptors are derived from provider-neutral publication envelopes and carry only class/month refresh metadata plus provider boundary metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for Supabase Realtime descriptor creation from provider-neutral publication envelopes. |
| Integration | Not applicable; no database, provider client, RLS, worker, subscription, tenant integration, or actual realtime publication in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual Supabase, cron, worker, realtime provider, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 21 test files and 176 tests passed.
