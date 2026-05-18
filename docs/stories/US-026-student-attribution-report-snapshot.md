# US-026 Student Attribution Report Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Students can view their own post-turn attribution report for an already-scoped class month from their own fund ledger draft. The snapshot reports required attribution categories without receiving other funds' ledger drafts, target weights, order details, tax previews, liquidity tier impacts, UI, auth, database, query execution, worker, realtime, or persistence code.

This story implements the pure domain student attribution report snapshot and the future server-query descriptor/result/failure envelope for that already-scoped report boundary. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, ledger persistence, order execution, query execution, or authorization enforcement.

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
- A pure TypeScript domain function creates a future server-query descriptor for one processed class month and viewer fund without returning snapshots, raw ledger drafts, database rows, provider clients, or other-fund data.
- A pure TypeScript domain function wraps an already-authorized attribution report snapshot only when class, processed month, and viewer fund match the descriptor scope.
- A pure TypeScript domain function creates a validation failure envelope for missing or mismatched attribution report query results without returning snapshots, raw ledger drafts, database rows, provider clients, target weights, order details, or UI state.
- The functions reject blank class ids, invalid month indexes, blank viewer fund ids, blank ledger fund ids, mismatched ledger fund ids, mismatched ledger months, invalid attribution numbers, invalid classroom sell concentration percentages, ending AUM values that do not match the ledger formula, and missing or mismatched query result payloads.
- Unit tests cover successful report creation, trimming behavior, negative market impacts, detail exclusion, invalid scope inputs, invalid attribution values, inconsistent ending AUM, query descriptor creation, query result envelopes, query result validation failures, and anti-leakage boundaries.
- No auth, database, Supabase, worker, realtime, UI, API route, ledger persistence, order persistence, order execution, query execution, or authorization code is introduced.

## Design Notes

- Commands: none.
- Queries: none executed; the descriptor and envelopes represent the future `get_student_attribution_report` server-query boundary.
- API: none.
- Tables: none.
- Domain rules: student attribution reports consume one already-scoped viewer fund ledger draft and emit the report categories required by the student dashboard; query result envelopes must preserve the descriptor scope before returning a report snapshot.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for student attribution report snapshot creation, query boundary descriptors, query result envelopes, and invalid inputs. |
| Integration | Not applicable; no database, provider, RLS, tenant query execution, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 19 test files and 150 tests passed.
- `npm run test:unit -- app/domain/student/attribution-report.test.ts` — passed; 1 test file and 15 tests passed.
- `npm run validate:quick` — passed; 24 test files and 282 tests passed.
