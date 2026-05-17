# US-011 MVP Asset-Tier Return Calculation

## Status

implemented

## Lane

normal

## Product Contract

The simulation domain can project MVP asset-tier gross returns from the accepted Asset DNA beta coefficients and already-computed macro/market factor deltas. The calculation covers Base, Core, and Apex tiers and keeps base fee percentage available as a separate attribution input.

This story implements only the pure domain return calculation. It does not implement scenario-delta generation, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, ledger writes, or order execution.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function calculates one asset tier's gross return percentage from Asset DNA coefficients and factor deltas.
- A pure TypeScript domain function calculates returns for all MVP tiers in Base/Core/Apex order.
- The projection returns the tier's `base_fee_pct` separately from gross return so fee drag remains an attribution input rather than being double-counted.
- Unknown asset tiers are rejected instead of invented.
- Non-finite factor deltas are rejected.
- Unit tests cover all-tier return math, single-tier lookup behavior, rate/volatility shock ordering, unknown tiers, and invalid deltas.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, scenario-delta generation, order-execution, or ledger-persistence code is introduced.

## Design Notes

- Commands: none; this is pure domain calculation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: gross return percentage is the sum of each Asset DNA beta coefficient multiplied by the corresponding macro or market factor delta.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for asset-tier return calculations and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 11 test files and 61 tests passed.
