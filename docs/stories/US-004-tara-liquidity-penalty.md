# US-004 TARA Liquidity Penalty

## Status

implemented

## Lane

normal

## Product Contract

During end-of-turn processing, a student's sold tier receives an MVP liquidity penalty when classroom sell concentration for that exact asset tier is greater than `50%`. The pure domain calculation applies `5%` extra PvP slippage to the sold amount for each crowded sold tier and reports the penalty as both currency paid and percentage of current AUM.

This story implements only the pure domain penalty calculation. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, workers, realtime, order execution, or ledger writes.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function calculates PvP slippage for Base/Core/Apex sell reductions.
- The calculation applies the `5%` MVP liquidity penalty only when the sold tier's classroom sell concentration is greater than `50%`.
- The calculation returns zero penalty at exactly `50%` concentration.
- The calculation returns zero penalty when a crowded tier is not sold by the fund.
- The calculation reports `pvpSlippagePaid`, `liquidityPenaltyPct`, and per-tier sell impact details.
- The calculation rejects invalid current AUM, invalid allocation weights, and invalid classroom sell concentration maps.
- Unit tests cover crowded, non-crowded, non-sale, zero-AUM, and invalid-input cases.
- No auth, database, Supabase, worker, realtime, UI, API route, order-execution, or ledger-persistence code is introduced.

## Design Notes

- Commands: none; this is pure domain calculation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: sold amount equals `current_AUM * max(0, current_weight - target_weight)`; crowded sell slippage equals sold amount times `5%` when classroom concentration for that tier is greater than `50%`.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for TARA liquidity penalty calculation and invalid inputs. |
| Integration | Not applicable; no boundary, database, or provider integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 4 test files and 30 tests passed.
