# US-063 Instructor Dashboard Current-Turn Query Result Envelope

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript instructor dashboard current-turn query result envelope wraps an already-authorized current-turn instructor dashboard snapshot for the descriptor created by `US-062`. The envelope records the future server-query result boundary while preserving the same instructor-scoped class and current-month scope, without executing server queries, auth/session checks, RLS, database access, UI rendering, provider clients, or result delivery.

The envelope may carry instructor-only God Mode current holdings after instructor/class scope has already been enforced. It must not include future scenario rows, target weights, order details, ledger drafts, provider payloads, database rows, UI state, or executed server-query metadata.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor dashboard current-turn query result envelope from a query descriptor and an already-authorized instructor dashboard current-turn snapshot.
- The envelope records envelope type, deterministic result key, server-query result boundary, descriptor key, query name, required instructor-scoped class boundary, class id, current month index, result status, anti-leakage flags, and the instructor dashboard snapshot.
- The function rejects missing snapshots or snapshots whose class id or current month index do not match the descriptor.
- The envelope permits instructor God Mode current holdings only inside the already-authorized instructor dashboard snapshot.
- The envelope excludes future scenario rows, target weights, order details, ledger drafts, provider payloads, database rows, UI state, and executed server-query metadata.
- Unit tests cover envelope creation, instructor scope preservation, anti-leakage boundaries, permitted God Mode holdings, and invalid or mismatched result inputs.
- No UI, server action, API route, auth/session check, RLS policy, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none.
- Queries: none executed; the envelope represents the future `get_instructor_dashboard_current_turn` server-query result boundary.
- API: none.
- Tables: none.
- Domain rules: query results must match the descriptor's instructor-scoped class/current-month scope and may carry only the already-authorized instructor dashboard snapshot.
- UI surfaces: no UI in this slice; this describes the future instructor dashboard server-query result contract.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for envelope creation, instructor scope preservation, anti-leakage fields, permitted God Mode holdings, and invalid or mismatched result inputs. |
| Integration | Not applicable; no database, auth, RLS, server query execution, provider client, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, realtime provider, or platform code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 262 tests passed.
