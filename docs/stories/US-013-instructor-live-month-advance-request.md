# US-013 Instructor Live Month Advance Request

## Status

implemented

## Lane

normal

## Product Contract

Instructors can prepare a live month-advancement request for a manually paced class. The MVP pure-domain slice validates the class state needed for live advancement and returns the next month plus a deterministic idempotency key for the future shared processing path.

This story implements only the pure domain request rule. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor live month-advancement request with class id, instructor id, current month index, next month index, total months, manual trigger mode, and idempotency key.
- The request is allowed only for `manual` trigger mode.
- The request trims class and instructor ids and rejects blank ids.
- The request accepts total simulation lengths from 12 to 24 monthly turns.
- The request rejects negative, fractional, or out-of-calendar current month indexes.
- The request rejects completed simulations instead of advancing beyond the final month.
- Unit tests cover valid advancement, trimming, final-month boundary behavior, trigger-mode rejection, invalid indexes, invalid simulation lengths, and completed simulations.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or month-processing code is introduced.

## Design Notes

- Commands: none; this is pure domain request creation for a future command boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: live advancement belongs to manual classes, increments the current month by one, and emits a deterministic class/month idempotency key.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for instructor live month advancement request creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 13 test files and 76 tests passed.
