# US-028 Realtime Refresh Publication Envelope

## Status

implemented

## Lane

normal

## Product Contract

A provider-neutral realtime publication envelope can be derived from a month-advance refresh signal so a future Supabase Realtime publisher has a stable class-channel, event name, dedupe key, and refresh-only payload. The MVP pure-domain slice preserves the class/month refresh metadata needed by future publication while keeping the payload free of per-fund ledger drafts, fund processing keys, aggregate financial totals, database rows, and provider-specific clients.

This story implements only the pure domain publication envelope. It does not implement Supabase Realtime, UI subscriptions, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, cron, order execution, ledger writes, background processing, or platform publication code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a provider-neutral realtime publication envelope from a month-advance refresh signal.
- The envelope records publication type, deterministic publication key, provider-neutral boundary marker, class month-advance channel name, refresh event name, class-participant audience, refresh-only delivery semantics, and the original refresh signal payload.
- The envelope supports live and auto month advancement through the same refresh signal path.
- The envelope excludes per-fund ledger drafts, fund processing keys, aggregate financial totals, database rows, provider clients, and direct gameplay data so future realtime publication remains a refetch trigger rather than a data disclosure path.
- Unit tests cover envelope creation, deterministic key/channel derivation, auto-path metadata preservation, and exclusion of gameplay details.
- No cron, auth, database, Supabase, worker, realtime provider, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain envelope creation for a future realtime publisher boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: publication envelopes are derived from refresh signals and carry only class/month refresh metadata plus provider-neutral routing metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for publication envelope creation from refresh signals. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, realtime, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime provider, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 20 test files and 164 tests passed.
