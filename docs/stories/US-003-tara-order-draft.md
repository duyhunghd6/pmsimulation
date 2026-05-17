# US-003 TARA Order Draft

## Status

implemented

## Lane

normal

## Product Contract

Students submit TARA target allocations as pending orders for the current fund and month. This domain slice creates a pending order draft only after target allocation validation and tax-drag preview both pass.

The story now also provides a pure-domain student order-entry snapshot for the already-scoped viewer fund. The snapshot composes current allocation, target allocation, pending draft status, rebalance trigger, and tax-drag preview while excluding other-fund, classroom order, persistence, auth, database, UI, worker, and realtime payloads.

This story implements only the pure domain draft and snapshot rules. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, workers, realtime, or processed order execution.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a pending TARA order draft for a fund and month.
- The draft contains validated Base/Core/Apex target weights.
- The draft contains the estimated tax-drag preview for the submitted target weights.
- The draft trims fund identifiers before returning a pending order.
- The draft rejects blank fund identifiers.
- The draft rejects invalid month indexes.
- The draft rejects invalid allocation or tax-drag inputs before returning a pending order.
- A pure TypeScript domain function creates a student order-entry snapshot for one already-scoped viewer fund.
- The snapshot returns class id, month index, viewer fund id, current weights, target weights, estimated tax drag, rebalance trigger, and pending status.
- The snapshot trims class and viewer fund identifiers.
- The snapshot excludes other-fund, classroom order, order-id, processed timestamp, persistence, auth, database, UI, worker, and realtime payloads.
- The snapshot rejects blank class ids, blank viewer fund ids, invalid month indexes, invalid current weights, invalid target weights, and invalid tax-drag inputs.
- Unit tests cover valid pending drafts, student order-entry snapshots, trimming behavior, invalid inputs, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, or order-persistence code is introduced.

## Design Notes

- Commands: none; this is pure domain draft creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: a pending order draft requires a fund id, non-negative integer month index, valid target weights, and a valid tax-drag preview.
- Domain rules: a student order-entry snapshot consumes one already-scoped viewer fund input and emits only the viewer fund's pending draft readiness payload.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for TARA order draft creation, student order-entry snapshot creation, payload exclusions, and invalid inputs. |
| Integration | Not applicable; no boundary, database, or provider integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 20 test files and 161 tests passed.
