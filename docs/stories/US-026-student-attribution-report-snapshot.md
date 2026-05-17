# US-026 Student Attribution Report Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Students can view their own post-turn attribution report for an already-scoped class month from their own fund ledger draft. The snapshot reports required attribution categories without receiving other funds' ledger drafts, target weights, order details, tax previews, liquidity tier impacts, UI, auth, database, query, worker, realtime, or persistence code.

This story implements only the pure domain student attribution report snapshot. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, ledger persistence, order execution, or authorization enforcement.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student attribution report snapshot for one already-scoped class month.
- The snapshot reports class id, month index, viewer fund id, report key, starting AUM, market beta impact, fee drag, tax paid, tax drag percentage, PvP slippage paid, liquidity penalty percentage, classroom sell concentration, and ending AUM.
- The function trims class ids, viewer fund ids, and ledger fund ids before producing the snapshot.
- The function only accepts a ledger draft for the viewing fund and matching month.
- The snapshot excludes target weights, order details, tax-drag previews, liquidity-penalty previews, other fund details, and class aggregate payloads.
- The function rejects blank class ids, invalid month indexes, blank viewer fund ids, blank ledger fund ids, mismatched ledger fund ids, mismatched ledger months, invalid attribution numbers, invalid classroom sell concentration percentages, and ending AUM values that do not match the ledger formula.
- Unit tests cover successful report creation, trimming behavior, negative market impacts, detail exclusion, invalid scope inputs, invalid attribution values, and inconsistent ending AUM.
- No auth, database, Supabase, worker, realtime, UI, API route, ledger persistence, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none; this is pure domain snapshot creation.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: student attribution reports consume one already-scoped viewer fund ledger draft and emit the report categories required by the student dashboard.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for student attribution report snapshot creation and invalid inputs. |
| Integration | Not applicable; no boundary, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 19 test files and 150 tests passed.
