# US-065 Student Dashboard Post-Turn Query Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript student dashboard post-turn query descriptor records the future server-query boundary for one already-scoped class, processed month, and viewer fund. The descriptor names the required post-turn dashboard sections and authorization scope without executing server queries, auth/session checks, RLS, database access, UI rendering, provider clients, result delivery, or attribution payload delivery.

This story keeps the server-query contract aligned with the existing student dashboard post-turn snapshot while preserving student anti-leakage constraints: processed-turn only, viewer-fund scope only, no future scenario rows, no other-fund ids or exact holdings, no order details, no class aggregate payload, no instructor God Mode data, no provider payloads, and no ledger draft collections.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student dashboard post-turn query descriptor from class id, processed month index, and viewer fund id.
- The descriptor records descriptor type, deterministic descriptor key, server-query boundary, query name, required scope, class id, processed month index, viewer fund id, requested dashboard sections, and anti-leakage flags.
- Invalid descriptor inputs return typed validation errors for missing class id, invalid processed month index, or missing viewer fund id.
- The descriptor excludes snapshots, attribution reports, database rows, provider clients, other-fund ids, exact holdings, order details, class aggregate payloads, ledger draft collections, UI state, and executed query results.
- Unit tests cover descriptor creation, anti-leakage boundaries, and invalid scope inputs.
- No UI, server action, API route, auth/session check, RLS policy, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none; this is a pure query descriptor.
- Queries: none executed; the descriptor names a future `get_student_dashboard_post_turn` server-query boundary.
- API: none.
- Tables: none.
- Domain rules: descriptor scope must be class/processed-month/viewer-fund and must keep post-turn dashboard sections separate from server query execution and result delivery.
- UI surfaces: no UI in this slice; this describes the future student dashboard post-turn server-query contract.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for descriptor creation, anti-leakage fields, and invalid scope inputs. |
| Integration | Not applicable; no database, auth, RLS, server query execution, provider client, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, realtime provider, or platform code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 268 tests passed.
