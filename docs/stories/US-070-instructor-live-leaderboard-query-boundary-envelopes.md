# US-070 Instructor Live Leaderboard Query Boundary Envelopes

## Status

implemented

## Lane

normal

## Product Contract

Instructors can receive a future server-query descriptor, result envelope, and validation failure envelope for live leaderboard access in one already-scoped class/current-month request. This slice wraps the existing instructor live leaderboard snapshot without executing server queries, auth/session checks, RLS, database access, UI rendering, provider clients, or order detail delivery.

This story implements only pure TypeScript query-boundary contracts. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order submission, order processing, or authorization enforcement.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript function creates a server-query descriptor for one already-scoped instructor class and current month.
- A pure TypeScript function wraps an already-authorized live leaderboard snapshot only when class and current-month scope match the descriptor.
- A pure TypeScript function emits a validation failure envelope for missing or mismatched query results without returning the snapshot.
- Descriptor, result, and validation failure payloads exclude holdings, target weights, estimated tax drag, order details, database rows, provider clients, UI state, and executed query metadata.
- Unit tests cover descriptor creation, descriptor invalid inputs, result wrapping, result scope mismatch, validation failure envelopes, and exclusion of forbidden payload fields.
- No auth, database, Supabase, worker, realtime, UI, API route, leaderboard persistence, order persistence, order execution, or authorization code is introduced.

## Design Notes

- Commands: none.
- Queries: future server-query boundary only; no server query execution.
- API: none.
- Tables: none.
- Domain rules: result envelopes wrap only an already-authorized instructor live leaderboard snapshot matching the descriptor class and current month.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for descriptor, result envelope, and validation failure envelope behavior. |
| Integration | Not applicable; no boundary execution, database, provider, RLS, tenant query, or authorization integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/classes/live-leaderboard.test.ts` — passed; 1 test file and 17 tests passed.
- `npm run validate:quick` — passed; 24 test files and 315 tests passed.
