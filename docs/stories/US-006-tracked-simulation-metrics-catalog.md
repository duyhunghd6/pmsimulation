# US-006 Tracked Simulation Metrics Catalog

## Status

implemented

## Lane

normal

## Product Contract

The simulation domain exposes the accepted PRD tracked-metrics catalog as a pure TypeScript registry. Metric definitions identify the metric id, curriculum family, display label, allowed source types, and whether advanced risk/performance convention metadata is required.

This story implements only the pure domain catalog. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, workers, realtime, schema validation, or metric record storage.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain catalog contains the tracked metric IDs accepted from the PRD.
- Metric definitions classify IDs by curriculum family, including investor policy, macro drivers, market strings, asset/fund inputs, portfolio order state, performance/risk, TARA risk register, friction/attribution, and industry/company evidence.
- Metric definitions identify allowed source types: seeded, computed, student-entered, and rubric-scored.
- Advanced risk/performance metrics that require benchmark, return frequency, lookback window, annualization convention, risk-free proxy, and raw-vs-adjusted price convention are marked in the catalog.
- Unit tests cover catalog coverage, family lookup, source types, and advanced convention flags.
- No auth, database, Supabase, worker, realtime, UI, API route, or metric-persistence code is introduced.

## Design Notes

- Commands: none; this is a pure domain registry.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: metric catalog lookups must not invent unknown metrics, and advanced performance metric flags are explicit per metric id.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for tracked metric catalog coverage, family lookup, source types, and advanced convention flags. |
| Integration | Not applicable; no boundary, database, or provider integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run typecheck` — passed.
- `npm run test:unit` — passed; 6 test files and 39 tests passed.
- `npm run validate:quick` — passed; 6 test files and 39 tests passed.
