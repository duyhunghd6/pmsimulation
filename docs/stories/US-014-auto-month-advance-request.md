# US-014 Auto Month Advance Request

## Status

implemented

## Lane

normal

## Product Contract

Auto-paced classes can prepare a month-advancement request for the future scheduled trigger path. The MVP pure-domain slice validates the class state needed for auto advancement and returns the next month plus the same deterministic idempotency key shape used by live advancement so both trigger paths can converge on a shared processing path later.

This story implements only the pure domain request rule. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an auto month-advancement request with class id, current month index, next month index, total months, auto trigger mode, and idempotency key.
- The request is allowed only for `auto` trigger mode.
- The request trims class ids and rejects blank class ids.
- The request accepts total simulation lengths from 12 to 24 monthly turns.
- The request rejects negative, fractional, or out-of-calendar current month indexes.
- The request rejects completed simulations instead of advancing beyond the final month.
- The request emits the same deterministic class/month idempotency key shape as live advancement.
- Unit tests cover valid advancement, trimming, final-month boundary behavior, trigger-mode rejection, invalid indexes, invalid simulation lengths, and completed simulations.
- No cron, auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or month-processing code is introduced.

## Design Notes

- Commands: none; this is pure domain request creation for a future scheduled command boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: auto advancement belongs to auto classes, increments the current month by one, and emits a deterministic class/month idempotency key.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for auto month advancement request creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run typecheck` — passed.
- `npm run validate:quick` — passed; 13 test files and 84 tests passed.
