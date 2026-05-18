# US-042 Student TARA Order Submission Receipt

## Status

implemented

## Lane

normal

## Product Contract

Students need a stable pure-domain receipt after a valid TARA target allocation is accepted as a pending current-month submission. This slice creates a student-safe receipt from the same validated pending draft inputs used by order entry, records deterministic class/fund/month submission metadata, and keeps the result separate from future server actions, persistence, auth, database, UI, worker, and realtime execution.

This story implements only the pure domain receipt contract. It does not implement UI, client validation, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, processed order execution, or deployment code.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a student TARA order submission receipt for one already-scoped class, viewer fund, and month.
- The receipt reuses the pending TARA order draft validation for target weights and estimated tax drag.
- The receipt records receipt type, deterministic submission key, class id, month index, viewer fund id, target weights, estimated tax drag, rebalance trigger, and pending status.
- The receipt trims class and viewer fund identifiers before returning data or deriving the submission key.
- The receipt rejects blank class ids, blank viewer fund ids, invalid month indexes, invalid allocation inputs, and invalid tax-drag inputs.
- The receipt excludes classroom order lists, other-fund payloads, order ids, processed timestamps, auth sessions, database rows, UI state, worker payloads, realtime payloads, and processed execution data.
- Unit tests cover valid receipts, deterministic key creation, trimming behavior, invalid inputs, and payload exclusions.
- No auth, database, Supabase, worker, realtime, UI, API route, server action, or order-persistence code is introduced.

## Design Notes

- Commands: none; this is a pure domain receipt for a future server action boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: a student TARA order submission receipt derives from one valid pending order draft and one already-scoped class/viewer fund boundary.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for student TARA order submission receipt creation, scope validation, draft validation reuse, and payload exclusions. |
| Integration | Not applicable; no boundary, database, provider, RLS, or persistence integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no app, worker, realtime, provider, or deployment surface in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 200 tests passed.
