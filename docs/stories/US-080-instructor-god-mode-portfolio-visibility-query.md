# US-080 Instructor God Mode Portfolio Visibility Query

## Status

implemented

## Lane

normal

## Product Contract

A bounded instructor server-query executor returns the existing God Mode portfolio visibility query result envelope for one instructor-scoped class and current month. It accepts an authenticated instructor session, class/current-month scope, and injected row reader, parses instructor-safe class fund rows, exact current holding rows, and status-only TARA order rows before delivery, derives pending/missing order status, and returns only the privileged instructor God Mode envelope.

This slice does not add live Supabase clients, database runtime, UI rendering, browser delivery, target weights, estimated tax drag, order details, ledger drafts, worker dispatch, realtime publication, CI, deployment, or provider-backed E2E proof.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The executor rejects non-instructor sessions before row access.
- The executor requires current-month class scope before row access.
- The executor parses instructor-scoped class fund rows and rejects cross-class, malformed, or blank-display-name rows before result delivery.
- The executor parses instructor-scoped current holding rows and rejects cross-class, unknown-fund, duplicate-tier, incomplete, or invalid allocation rows before result delivery.
- The executor parses current-month status-only TARA order rows and rejects cross-class, future-month, processed, unknown-fund, or duplicate pending order rows before result delivery.
- The result envelope includes only privileged instructor God Mode fields: fund identity, student display name, current AUM, Sharpe ratio, pending/missing order status, and exact current Base/Core/Apex holding weights.
- The result envelope excludes target weights, estimated tax drag, order details, ledger drafts, database rows, provider clients, UI state, workers, and realtime payloads.

## Design Notes

- Commands: none added.
- Queries: adds `executeInstructorGodModePortfolioVisibilityQuery` with an injected row reader; no live database/provider execution.
- API: none.
- Tables: none.
- Domain rules: reuses the existing `createInstructorGodModePortfolioVisibilitySnapshot` and query result envelope.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Auth-tenancy executor and row-parser unit tests for role/scope enforcement, fund/holding/order row rejection, order-status derivation, allocation validation, and forbidden payload exclusion. |
| Integration | Pending; future Supabase-backed reader and RLS proof. |
| E2E | Pending; no instructor browser UI in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: added `executeInstructorGodModePortfolioVisibilityQuery` over injected parsed rows. The slice did not add live Supabase reads, broader instructor UI, class creation persistence, target-weight/order-detail visibility, month advancement, realtime, worker, CI, deployment, or provider-backed browser E2E proof.
- `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-god-mode-portfolio-visibility-query.test.ts app/infrastructure/auth-tenancy/rows.test.ts` — passed with 2 test files and 37 tests.
- `npm run validate:quick` — passed with 38 test files and 461 tests.
