# US-015 Shared Month Advance Processing Request

## Status

implemented

## Lane

normal

## Product Contract

Live and auto month-advancement requests can be converted into the same pure-domain processing request shape before a future background worker boundary. The MVP slice validates the class/month transition, trigger-source pairing, and deterministic idempotency key so both trigger paths converge before order execution or ledger writes are introduced.

This story implements only the pure domain processing-request rule. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a shared month-advance processing request from validated live or auto advancement request fields.
- The request records class id, trigger mode, trigger source, current month index, next month index, total months, idempotency key, and shared processing path.
- Live trigger sources are accepted only with manual trigger mode.
- Auto trigger sources are accepted only with auto trigger mode.
- The request trims class ids and rejects blank class ids.
- The request accepts total simulation lengths from 12 to 24 monthly turns.
- The request rejects negative, fractional, non-sequential, or out-of-calendar month indexes.
- The request rejects idempotency keys that do not match the class and month transition.
- Unit tests cover live and auto convergence, class-id trimming, trigger-source pairing, invalid fields, month-index boundaries, and idempotency-key mismatch.
- No cron, auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or month-processing code is introduced.

## Design Notes

- Commands: none; this is pure domain request preparation for a future command or worker boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: a shared processing request must preserve a deterministic class/month idempotency key and advance exactly one month through either accepted trigger source.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for shared month-advance processing request creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 13 test files and 91 tests passed.
