# US-005 TARA Turn Attribution Summary

## Status

implemented

## Lane

normal

## Product Contract

After a TARA rebalance is evaluated, the MVP domain can summarize post-turn attribution from starting AUM, market return, fee drag, estimated tax drag, and crowded-trade liquidity penalty. The summary reports the required ledger-style attribution fields and ending AUM without creating persistence, worker, API, or UI surfaces.

This story implements only the pure domain attribution calculation. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, workers, realtime, order execution, or ledger writes.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function summarizes market beta impact, fee drag, tax paid, tax drag percentage, PvP slippage paid, liquidity penalty percentage, classroom sell concentration, and ending AUM.
- The summary composes the existing tax-drag preview and liquidity-penalty domain calculations instead of duplicating their rules.
- The summary supports negative market returns while rejecting non-finite market returns.
- The summary rejects invalid current AUM, invalid fee drag, invalid allocation inputs, invalid tax-drag inputs, and invalid classroom sell concentration inputs.
- Unit tests cover combined attribution, no-sale friction, sold-tier concentration, and invalid inputs.
- No auth, database, Supabase, worker, realtime, UI, API route, order-execution, or ledger-persistence code is introduced.

## Design Notes

- Commands: none; this is pure domain calculation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: ending AUM equals starting AUM plus market beta impact minus fee drag, tax paid, and PvP slippage paid.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for TARA turn attribution summary and invalid inputs. |
| Integration | Not applicable; no boundary, database, or provider integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 5 test files and 35 tests passed.
