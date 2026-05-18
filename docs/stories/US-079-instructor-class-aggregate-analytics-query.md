# US-079 Instructor Class Aggregate Analytics Query

## Status

implemented

## Lane

normal

## Product Contract

A bounded instructor server-query executor returns the existing class aggregate analytics query result envelope for one instructor-scoped class and current month. It accepts an authenticated instructor session, class/current-month scope, and injected row reader, parses aggregate-safe class fund rows and status-only TARA order rows before delivery, derives pending/missing order counts and AUM totals, and returns only the aggregate-safe envelope.

This slice does not add live Supabase clients, database runtime, UI rendering, browser delivery, per-fund rows, holdings, target weights, estimated tax drag, order details, worker dispatch, realtime publication, CI, deployment, or provider-backed E2E proof.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The executor rejects non-instructor sessions before row access.
- The executor requires current-month class scope before row access.
- The executor parses instructor-scoped aggregate fund rows and rejects cross-class, malformed, or negative metric rows before result delivery.
- The executor parses current-month status-only TARA order rows and rejects cross-class, future-month, processed, unknown-fund, or duplicate pending order rows before result delivery.
- The result envelope includes only aggregate analytics fields: fund count, total and average AUM, average Sharpe ratio, pending/missing order counts, and pending/missing order AUM.
- The result envelope excludes per-fund rows, holdings, target weights, estimated tax drag, order details, database rows, provider clients, UI state, workers, and realtime payloads.

## Design Notes

- Commands: none added.
- Queries: adds `executeInstructorClassAggregateAnalyticsQuery` with an injected row reader; no live database/provider execution.
- API: none.
- Tables: none.
- Domain rules: reuses the existing `createInstructorClassAggregateAnalyticsSnapshot` and query result envelope.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Auth-tenancy executor and row-parser unit tests for role/scope enforcement, row rejection, order-status derivation, aggregate calculation, and forbidden payload exclusion. |
| Integration | Pending; future Supabase-backed reader and RLS proof. |
| E2E | Pending; no instructor browser UI in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: added `executeInstructorClassAggregateAnalyticsQuery` and `parseInstructorClassAggregateFundRow` with unit proof over injected rows. The slice did not add live Supabase reads, broader instructor UI, class creation persistence, God Mode, month advancement, realtime, worker, CI, deployment, or provider-backed browser E2E proof.
- `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-class-aggregate-analytics-query.test.ts app/infrastructure/auth-tenancy/rows.test.ts` — passed with 2 test files and 35 tests.
- `npm run validate:quick` — passed with 37 test files and 454 tests.
