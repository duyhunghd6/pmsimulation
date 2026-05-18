# US-059 Student Dashboard Current-Turn Query Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript student dashboard current-turn query descriptor records the future server-query boundary for one already-scoped class, current month, and viewer fund. The descriptor names the required student dashboard sections and authorization scope without executing server queries, auth/session checks, RLS, database access, UI rendering, provider clients, or query result delivery.

This story keeps the server-query contract aligned with the existing student dashboard current-turn snapshot while preserving student anti-leakage constraints: current-turn only, viewer-fund scope only, no future scenario rows, no other-fund exact holdings, no instructor God Mode data, and no provider payloads.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student dashboard current-turn query descriptor from class id, current month index, and viewer fund id.
- The descriptor records descriptor type, deterministic descriptor key, server-query boundary, query name, required scope, class id, current month index, viewer fund id, requested dashboard sections, and anti-leakage flags.
- Invalid descriptor inputs return typed validation errors for missing class id, invalid current month index, or missing viewer fund id.
- The descriptor excludes snapshots, database rows, provider clients, other-fund data, ledger drafts, UI state, and executed query results.
- Unit tests cover descriptor creation, anti-leakage boundaries, and invalid scope inputs.
- No UI, server action, API route, auth/session check, RLS policy, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none; this is a pure query descriptor.
- Queries: none executed; the descriptor names a future `get_student_dashboard_current_turn` server-query boundary.
- API: none.
- Tables: none.
- Domain rules: descriptor scope must be class/current-month/viewer-fund and must keep current-turn dashboard sections separate from server query execution and result delivery.
- UI surfaces: no UI in this slice; this describes the future student dashboard server-query contract.

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

- `npm run validate:quick` — passed; 24 test files and 250 tests passed.
