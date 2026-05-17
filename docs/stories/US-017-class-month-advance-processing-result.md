# US-017 Class Month Advance Processing Result

## Status

implemented

## Lane

normal

## Product Contract

A shared month-advance processing request can be combined with multiple fund attribution inputs to produce one deterministic class-month processing result. The MVP pure-domain slice preserves shared trigger metadata, creates per-fund processing keys through the existing fund-processing rule, emits ledger drafts for every processed fund, and summarizes class-level AUM and cost totals before future worker, order-execution, or persistence code exists.

This story implements only the pure domain class-month processing result. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a class-month processing result from a validated shared processing request and multiple per-fund attribution inputs.
- The result records class id, trigger mode, trigger source, processed month index, advanced-to month index, total months, class/month idempotency key, shared processing path, processed fund count, fund processing keys, ledger drafts, and class-level AUM/cost totals.
- The result preserves auto and live trigger metadata from the shared processing request without branching into separate processing paths.
- The result rejects duplicate fund ids after trimming so a single batch cannot emit duplicate fund processing keys.
- The result reports invalid per-fund processing inputs from the existing per-fund processing rule.
- Unit tests cover multi-fund processing, auto metadata preservation, duplicate fund ids, blank fund ids, and invalid attribution inputs.
- No cron, auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain processing-result creation for a future command or worker boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: class-month processing inherits the shared class/month idempotency key, runs each fund through the existing per-fund processing rule, prevents duplicate fund processing keys, and aggregates ledger drafts into class-level totals.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for class-month processing result creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 13 test files and 100 tests passed.
