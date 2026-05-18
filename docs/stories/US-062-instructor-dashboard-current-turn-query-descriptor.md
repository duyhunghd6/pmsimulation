# US-062 Instructor Dashboard Current-Turn Query Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript instructor dashboard current-turn query descriptor records the future server-query boundary for one already-scoped instructor class and current month. The descriptor names the required instructor dashboard sections and scope without executing server queries, auth/session checks, RLS, database access, UI rendering, provider clients, or query result delivery.

This story keeps the server-query contract aligned with the existing instructor dashboard current-turn snapshot while preserving instructor boundaries: the future query may return instructor-only God Mode current holdings after instructor/class scope is enforced, but it must not include future scenario rows, target weights, order details, ledger drafts, provider payloads, database rows, UI state, or executed query results.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor dashboard current-turn query descriptor from class id and current month index.
- The descriptor records descriptor type, deterministic descriptor key, server-query boundary, query name, required instructor-scoped class boundary, class id, current month index, requested dashboard sections, and anti-leakage flags.
- Invalid descriptor inputs return typed validation errors for missing class id or invalid current month index.
- The descriptor excludes snapshots, database rows, provider clients, target weights, order details, ledger drafts, UI state, and executed query results.
- Unit tests cover descriptor creation, instructor God Mode permission boundary, anti-leakage fields, and invalid scope inputs.
- No UI, server action, API route, auth/session check, RLS policy, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none; this is a pure query descriptor.
- Queries: none executed; the descriptor names a future `get_instructor_dashboard_current_turn` server-query boundary.
- API: none.
- Tables: none.
- Domain rules: descriptor scope must be instructor-scoped class/current-month and must keep instructor-only God Mode visibility separate from student query paths and server query execution.
- UI surfaces: no UI in this slice; this describes the future instructor dashboard server-query contract.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for descriptor creation, anti-leakage fields, instructor God Mode permission boundary, and invalid scope inputs. |
| Integration | Not applicable; no database, auth, RLS, server query execution, provider client, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, realtime provider, or platform code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 259 tests passed.
