# US-067 Student Dashboard Post-Turn Query Result Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

A pure TypeScript student dashboard post-turn query result validation failure envelope wraps invalid result-boundary inputs for the descriptor created by `US-065`. The envelope records the future server-query result validation boundary while preserving the same class, processed-month, and viewer-fund scope without returning the post-turn dashboard snapshot.

This story keeps post-turn dashboard failure delivery aligned with the existing safe snapshot and result envelope: the validation failure envelope may carry only scoped validation errors and anti-leakage flags, and must not expose future scenario rows, other-fund ids, exact holdings, order details, attribution report payloads, class aggregate payloads, instructor God Mode data, provider payloads, ledger draft collections, UI state, database rows, or executed query metadata.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student dashboard post-turn query result validation failure envelope from a query descriptor and invalid post-turn query result input.
- The envelope records envelope type, deterministic result key, server-query result boundary, descriptor key, query name, required scope, class id, processed month index, viewer fund id, validation-failed status, anti-leakage flags, and scoped validation errors.
- The function returns a typed error instead of a validation failure envelope when the post-turn query result input is valid.
- The envelope excludes snapshots, attribution report payloads, database rows, provider clients, UI state, future scenario rows, other-fund ids, exact holdings, order details, class aggregate payloads, instructor God Mode data, ledger draft collections, and executed server-query metadata.
- Unit tests cover missing snapshot validation failure, mismatched snapshot validation failure, anti-leakage boundaries, and valid-result rejection.
- No UI, server action, API route, auth/session check, RLS policy, database, Supabase, Drizzle, realtime subscription, worker, cron, platform, or deployment code is introduced.

## Design Notes

- Commands: none.
- Queries: none executed; the envelope represents the future `get_student_dashboard_post_turn` server-query result validation boundary.
- API: none.
- Tables: none.
- Domain rules: invalid query results must be converted into scoped validation errors without returning the invalid snapshot or any unsafe post-turn payload.
- UI surfaces: no UI in this slice; this describes the future student dashboard post-turn server-query result validation contract.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for validation failure envelope creation, anti-leakage fields, and valid-result rejection. |
| Integration | Not applicable; no database, auth, RLS, server query execution, provider client, or tenant integration in this slice. |
| E2E | Not applicable; no browser surface in this slice. |
| Platform | Not applicable; no deployment, cron, worker, realtime provider, or platform code in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/student/dashboard-snapshot.test.ts` — passed; 1 test file and 24 tests passed.
- `npm run validate:quick` — passed; 24 test files and 274 tests passed.
