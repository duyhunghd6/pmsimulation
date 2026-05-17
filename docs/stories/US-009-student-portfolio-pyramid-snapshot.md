# US-009 Student Portfolio Pyramid Snapshot

## Status

implemented

## Lane

normal

## Product Contract

The student dashboard can project a portfolio pyramid snapshot from current and intended Base/Core/Apex weights. The projection reports per-tier drift and flags dangerous drift when the absolute current-vs-intended difference exceeds the accepted drift threshold.

This story implements only the pure domain snapshot projection. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, or class tenancy enforcement.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function builds a portfolio pyramid snapshot for Base/Core/Apex tiers.
- The projection includes current weight, intended weight, drift amount, drift direction, and dangerous-drift status for each tier.
- The projection flags dangerous drift only when absolute drift is greater than the supplied threshold.
- The projection rejects invalid current or intended allocation weights through the existing TARA allocation validator.
- The projection rejects invalid dangerous drift thresholds.
- Unit tests cover normal projection, dangerous drift, allocation validation failures, and threshold validation.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, or class-tenancy code is introduced.

## Design Notes

- Commands: none; this is pure domain projection.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: current and intended weights must both be valid Base/Core/Apex allocation maps totaling exactly `100.0%`; drift is `current - intended`; dangerous drift is `abs(drift) > threshold`.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for portfolio pyramid projection, drift flags, and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 9 test files and 52 tests passed.
