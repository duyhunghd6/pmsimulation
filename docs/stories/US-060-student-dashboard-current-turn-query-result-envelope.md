# US-060 Student Dashboard Current-Turn Query Result Envelope

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript student dashboard current-turn query result envelope wraps an already-authorized current-turn dashboard snapshot for the descriptor created by `US-059`. The envelope records the future server-query result boundary while preserving the same class/current-month/viewer-fund scope and anti-leakage flags, without executing server queries, auth/session checks, RLS, database access, UI rendering, provider clients, or result delivery.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student dashboard current-turn query result envelope from a query descriptor and an already-authorized student dashboard current-turn snapshot.
- The envelope records envelope type, deterministic result key, server-query result boundary, descriptor key, query name, required scope, class id, current month index, viewer fund id, result status, anti-leakage flags, and the safe student dashboard snapshot.
- The function rejects missing snapshots or snapshots whose class id, current month index, or viewer fund id do not match the descriptor.
- The envelope excludes database rows, provider clients, UI state, other-fund exact holdings, instructor God Mode data, future scenario rows, ledger drafts, and executed server-query metadata.
- Unit tests cover envelope creation, anti-leakage boundaries, and invalid or mismatched result inputs.
- No UI, server action, API route, auth/session check, RLS policy, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none.
- Queries: none executed; the envelope represents the future `get_student_dashboard_current_turn` server-query result boundary.
- API: none.
- Tables: none.
- Domain rules: query results must match the descriptor's class/current-month/viewer-fund scope and carry only the already-safe student dashboard snapshot.
- UI surfaces: no UI in this slice; this describes the future student dashboard server-query result contract.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for envelope creation, anti-leakage fields, and invalid or mismatched result inputs. |
| Integration | Not applicable; no database, auth, RLS, server query execution, provider client, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, realtime provider, or platform code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 253 tests passed.
