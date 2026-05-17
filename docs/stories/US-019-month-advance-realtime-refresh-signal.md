# US-019 Month Advance Realtime Refresh Signal

## Status

implemented

## Lane

normal

## Product Contract

A provider-neutral refresh signal can be derived from a month-advance turn-completion event so future realtime publication can tell connected class participants to refetch authorized current-month surfaces. The MVP pure-domain slice preserves the class/month dedupe metadata needed by a future Supabase Realtime publisher while excluding per-fund ledger drafts, fund processing keys, and aggregate financial totals from the refresh signal itself.

This story implements only the pure domain refresh signal payload. It does not implement Supabase Realtime, UI subscriptions, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, cron, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a realtime refresh signal from a completed month-advance turn-completion event.
- The signal records signal type, deterministic refresh signal key, class id, class-participant audience, processed month index, current month index after advancement, total months, class/month idempotency key, and source turn-completion event key.
- The signal supports live and auto month advancement through the same turn-completion event path.
- The signal excludes per-fund ledger drafts, fund processing keys, and aggregate financial totals so future realtime publication remains a refresh trigger rather than a data disclosure path.
- Unit tests cover signal creation, deterministic key derivation, auto-path metadata preservation, and exclusion of processing details and aggregate totals.
- No cron, auth, database, Supabase, worker, realtime provider, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain signal creation for a future realtime publisher boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: refresh signals are derived from completed turn-completion events and carry only class/month refresh metadata plus dedupe keys.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for refresh signal creation from turn-completion events. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, realtime, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime provider, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 13 test files and 104 tests passed.
