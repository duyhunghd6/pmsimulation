# US-016 Month Advance Fund Processing Result

## Status

implemented

## Lane

normal

## Product Contract

A shared month-advance processing request can be combined with one fund's attribution inputs to produce a deterministic per-fund processing result. The MVP pure-domain slice preserves shared trigger metadata, creates a fund-level processing key, and emits a ledger draft for the processed month before future worker, order-execution, or persistence code exists.

This story implements only the pure domain per-fund processing result. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a per-fund month processing result from a validated shared processing request and one fund's attribution inputs.
- The result records class id, fund id, trigger mode, trigger source, processed month index, advanced-to month index, total months, class/month idempotency key, fund-level processing key, and ledger draft.
- The result trims fund ids and rejects blank fund ids.
- The ledger draft records the processed month index and uses existing deterministic TARA attribution math for market beta impact, fee drag, tax drag, liquidity penalty, classroom sell concentration, and ending AUM.
- The result preserves auto and live trigger metadata from the shared processing request without branching into separate processing paths.
- Unit tests cover valid processing, fund-id trimming, auto metadata preservation, blank fund ids, and invalid attribution inputs.
- No cron, auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain processing-result creation for a future command or worker boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: per-fund processing results inherit the shared class/month idempotency key, add a deterministic fund-level processing key, and produce a ledger draft for the processed month.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for per-fund month processing result creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 13 test files and 96 tests passed.
