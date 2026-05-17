# US-018 Month Advance Turn-Completion Event

## Status

implemented

## Lane

normal

## Product Contract

A completed class-month processing result can be converted into a provider-neutral turn-completion event for future realtime publication. The MVP pure-domain slice preserves shared trigger metadata and class-level processing totals while excluding per-fund ledger drafts and fund processing keys before any Supabase Realtime, worker, persistence, or UI code exists.

This story implements only the pure domain turn-completion event payload. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime publication, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an aggregate month-advance completion event from a class-month processing result.
- The event records event type, deterministic event key, class id, trigger mode, trigger source, processed month index, advanced-to month index, total months, class/month idempotency key, shared processing path, processed fund count, and class-level AUM/cost totals.
- The event preserves auto and live trigger metadata without branching into separate event paths.
- The event excludes per-fund ledger drafts and fund processing keys so future realtime publication can avoid leaking exact fund-level results through the class-level completion signal.
- Unit tests cover aggregate event creation, event key determinism, metadata preservation, and exclusion of per-fund processing details.
- No cron, auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain event creation for a future worker/realtime boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: turn-completion events are derived from successful class-month processing records and carry only aggregate class-level totals plus shared trigger metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for event creation from class-month processing results. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 13 test files and 102 tests passed.
