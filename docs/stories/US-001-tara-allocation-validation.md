# US-001 TARA Allocation Validation

## Status

implemented

## Lane

normal

## Product Contract

Students may only submit MVP TARA target allocations when Base, Core, and Apex weights are present and total exactly `100.0%`.

This story implements only the pure domain validation rule. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, workers, realtime, or order submission.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain validator accepts Base/Core/Apex target weights that total exactly `100.0%`.
- The validator rejects totals below or above `100.0%`.
- The validator rejects missing MVP tiers.
- The validator rejects unknown asset tiers.
- The validator rejects invalid numeric weights such as negative values, non-finite values, or values beyond one decimal place.
- Unit tests cover valid and invalid cases.
- No auth, database, Supabase, worker, realtime, UI, or order-persistence code is introduced.

## Design Notes

- Commands: none; this is pure validation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: Base/Core/Apex target weights must sum to exactly `100.0%` using one-decimal precision.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for the allocation validator. |
| Integration | Not applicable; no boundary, database, or provider integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick` once scripts exist. |

## Harness Delta

This story permits the first minimal application-code scaffold because executable unit proof requires a package manifest, TypeScript config, and test runner.

## Evidence

- `npm run typecheck` — passed.
- `npm run test:unit` — passed; 1 test file and 10 tests passed.
- `npm run validate:quick` — passed.
