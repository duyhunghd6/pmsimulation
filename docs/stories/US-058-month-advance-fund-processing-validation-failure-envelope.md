# US-058 Month Advance Fund Processing Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

Invalid per-fund month-advance processing inputs can be mapped to a deterministic, fund-processing-safe validation failure envelope. The MVP pure-domain slice exposes only class/month metadata, normalized fund identity when available, and validation errors; it does not return raw attribution inputs, current or target weights, ledger drafts, database rows, worker jobs, realtime payloads, or provider execution details.

This story implements only the pure domain validation failure envelope for an already-scoped fund processing input. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function maps invalid per-fund month processing inputs to a validation failure envelope.
- The envelope records class id, optional normalized fund id, processed month index, advanced-to month index, total months, class/month idempotency key, result status, processing path, and validation errors.
- The envelope uses a deterministic result key that does not depend on raw financial inputs.
- Blank fund ids are represented without echoing blank raw input.
- Attribution validation failures return error metadata without returning current AUM, allocation weights, ledger drafts, worker jobs, database rows, realtime payloads, or provider execution details.
- Valid per-fund processing inputs do not create validation failure envelopes.
- Unit tests cover invalid attribution inputs, blank fund ids, payload exclusions, and valid-input rejection.
- No cron, auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is a pure domain validation-envelope helper for a future worker or processing boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: the envelope derives metadata from the validated shared processing request and reuses the existing per-fund processing validation errors.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for invalid per-fund month processing envelopes and valid-input rejection. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker, realtime, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed with 24 test files and 247 tests.
