# US-061 Student Dashboard Current-Turn Query Result Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

When a future student dashboard current-turn server-query result cannot wrap an already-authorized snapshot because the snapshot is missing or does not match the descriptor's class/current-month/viewer-fund scope, the pure-domain boundary emits a student-safe validation failure envelope instead of returning a snapshot, provider payload, database rows, UI state, or executed server-query metadata.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student dashboard current-turn query result validation failure envelope from invalid query result inputs.
- Missing snapshots and class/current-month/viewer-fund mismatches are represented as validation errors in the envelope.
- The envelope preserves descriptor scope, query name, result boundary, anti-leakage flags, and validation errors.
- The envelope excludes dashboard snapshots, database rows, Supabase clients, UI state, other-fund exact holdings, instructor God Mode data, future scenario rows, ledger drafts, provider payloads, and executed server-query metadata.
- A validation failure envelope is not created for a valid query result that can be wrapped by `US-060`.
- No UI, server action, API route, auth/session check, RLS policy, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none.
- Queries: none executed; the envelope represents invalid results at the future `get_student_dashboard_current_turn` server-query result boundary.
- API: none.
- Tables: none.
- Domain rules: reuses `StudentDashboardCurrentTurnQueryDescriptor` and existing query result validation errors.
- UI surfaces: no UI in this slice; future students still receive only sanitized validation metadata from this boundary.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/domain/student/dashboard-snapshot.test.ts` covers validation failure envelope creation, payload exclusions, and valid-result rejection. |
| Integration | Not applicable; no database, auth, RLS, server query execution, provider client, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, realtime provider, or platform code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 256 tests passed.
