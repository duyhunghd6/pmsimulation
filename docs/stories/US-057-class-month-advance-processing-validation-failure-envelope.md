# US-057 Class Month Advance Processing Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

When class-month processing cannot produce a valid aggregate result because the batch contains duplicate fund ids or invalid per-fund processing inputs, the pure-domain boundary emits a class-processing-safe validation failure envelope instead of returning fund inputs, ledger drafts, processing results, provider payloads, database rows, worker jobs, or realtime payloads.

This story implements only a typed validation-failure envelope around the existing pure domain class-month processing result. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a class-month processing validation failure envelope from invalid class-month processing inputs.
- The envelope preserves class id, processed month, advanced-to month, total months, class/month idempotency key, validation-failed status, and validation errors from the existing class-month processing rule.
- Duplicate fund ids and invalid per-fund processing inputs are represented as validation errors in the envelope.
- The envelope excludes fund inputs, fund processing keys, ledger drafts, processing results, database rows, worker jobs, and realtime payloads.
- A validation failure envelope is not created for a valid class-month processing result.
- Unit tests cover duplicate-fund failure wrapping, invalid per-fund failure wrapping, safe payload exclusions, and valid-result rejection.
- No cron, auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain validation-failure envelope creation for a future worker or processing boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: the envelope reuses the existing class-month processing result validation errors and carries only class/month processing metadata.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/domain/classes/month-advancement.test.ts` covers class-month processing validation failure envelope creation, payload exclusions, and valid-result rejection. |
| Integration | Not applicable; no database, provider client, RLS, worker, persistence, realtime, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` passed with 24 test files and 244 tests.
