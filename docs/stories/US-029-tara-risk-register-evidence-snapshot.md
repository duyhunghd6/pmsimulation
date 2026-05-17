# US-029 TARA Risk Register Evidence Snapshot

## Status

implemented

## Lane

normal

## Product Contract

The TARA risk register needs a pure-domain evidence snapshot for one already-scoped fund month so probability, impact, direction, time lag, treatment class, matrix label, and treatment action can be validated before future persistence, rubric scoring, UI, or order-execution code exists.

This story implements only the pure domain snapshot. It does not implement database tables, Drizzle, Supabase, auth, RLS, UI, server actions, rubric workflows, order execution, ledger persistence, worker processing, or provider integrations.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a TARA risk register evidence snapshot for one already-scoped fund month.
- The snapshot records fund id, month index, risk type, risk direction, impact weight, time lag, probability score, impact score, normalized TARA treatment class, derived matrix label, and treatment action.
- The snapshot accepts the four TARA course treatment classes: Transfer, Avoid, Reduce, and Accept.
- Invalid scope, score, lag, impact, treatment class, and action inputs are rejected before creating a snapshot.
- The snapshot excludes class-wide, other-fund, target-weight, order, ledger, database, and persistence payloads.
- Unit tests cover happy path creation, field trimming, treatment-class normalization, all treatment classes, payload exclusions, and invalid inputs.
- No auth, database, RLS, UI, server action, worker, provider, order-execution, or ledger-persistence code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot construction.
- Queries: none.
- API: none.
- Tables: none; this precedes future `Risk_Register` persistence.
- Domain rules: risk evidence must include explicit treatment class and treatment action for one scoped fund month.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for TARA risk register evidence snapshot creation and validation. |
| Integration | Not applicable; no database, auth, RLS, server action, provider, or tenant boundary in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no runtime platform behavior in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 21 test files and 169 tests passed.
