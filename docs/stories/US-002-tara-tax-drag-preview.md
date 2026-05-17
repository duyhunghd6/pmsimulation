# US-002 TARA Tax-Drag Preview

## Status

implemented

## Lane

normal

## Product Contract

Students should see an estimated tax-drag preview before submitting a TARA rebalance. In MVP domain terms, reducing a profitable Apex allocation estimates a `20%` capital gains tax on the realized gain amount.

This story implements only the pure domain preview calculation. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, workers, realtime, or order submission.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function estimates tax paid when target Apex weight is below current Apex weight.
- The preview applies the accepted `20%` capital gains tax rate only to profitable Apex reductions.
- The preview returns zero tax when Apex is not reduced.
- The preview returns zero tax when reduced Apex assets have no unrealized gain.
- The preview reports tax drag as a percentage of current AUM.
- The preview rejects invalid current AUM, invalid current/target allocation weights, and non-finite Apex gain inputs.
- Unit tests cover taxable and non-taxable preview cases.
- No auth, database, Supabase, worker, realtime, UI, or order-persistence code is introduced.

## Design Notes

- Commands: none.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: estimated tax paid equals `current_AUM * Apex reduction weight * Apex unrealized gain pct * 20%`.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for the tax-drag preview calculation and invalid inputs. |
| Integration | Not applicable; no boundary, database, or provider integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed.

## Evidence

- `npm run validate:quick` — passed; 2 test files and 17 tests passed.
