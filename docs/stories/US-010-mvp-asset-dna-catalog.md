# US-010 MVP Asset DNA Catalog

## Status

implemented

## Lane

normal

## Product Contract

The simulation domain exposes the accepted MVP Asset DNA coefficient catalog as a pure TypeScript registry. The catalog defines one seeded row for each Base/Core/Apex tier with deterministic beta sensitivities and base fee percentage.

This story implements only the pure domain catalog. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, schema validation, or asset-return processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain catalog contains exactly one Asset DNA definition for each MVP tier: Base, Core, and Apex.
- Asset DNA definitions include beta sensitivities for M2, CPI, GDP, VIX, policy rate, USD/VND, market liquidity, and base fee percentage.
- Lookup returns the seeded definition for known MVP tiers and does not invent unknown tiers.
- Unit tests cover tier coverage, lookup behavior, qualitative beta relationships, and finite seeded coefficient values.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, or return-processing code is introduced.

## Design Notes

- Commands: none; this is a pure domain registry.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: Apex has the strongest positive sensitivity to M2 and market liquidity and the most severe negative sensitivity to policy-rate and volatility shocks.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for Asset DNA catalog coverage, lookup behavior, qualitative beta relationships, and finite seeded values. |
| Integration | Not applicable; no boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 10 test files and 56 tests passed.
