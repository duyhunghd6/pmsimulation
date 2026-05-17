# US-020 Month Advance Worker Job Envelope

## Status

implemented

## Lane

normal

## Product Contract

A validated shared month-advance processing request can be converted into a provider-neutral worker job envelope before any actual worker provider is introduced. The MVP pure-domain slice preserves live/auto trigger metadata, the shared processing path, and the deterministic class/month idempotency key while excluding fund-level inputs, ledger drafts, aggregate financial totals, and provider-specific queue details.

This story implements only the pure domain worker job envelope. It does not implement cron, UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, Inngest, QStash, realtime, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates a month-advance worker job envelope from a validated shared processing request.
- The job records job type, deterministic worker job key, class id, trigger mode, trigger source, current month index, next month index, total months, class/month idempotency key, shared processing path, and idempotent queue discipline.
- The job preserves auto and live trigger metadata without branching into separate worker paths.
- The job excludes fund inputs, ledger drafts, fund processing keys, aggregate financial totals, and provider-specific queue names or SDK payloads.
- Unit tests cover job creation, deterministic key derivation, auto-path metadata preservation, and exclusion of fund-level or aggregate processing details.
- No cron, auth, database, Supabase, worker provider, realtime, UI, API route, RLS, order-execution, ledger-persistence, or background processing code is introduced.

## Design Notes

- Commands: none; this is pure domain job-envelope creation for a future worker boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: worker job envelopes are derived from validated shared month-advance processing requests and carry only class/month metadata needed for future idempotent queue processing.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for worker job creation from shared processing requests. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, realtime, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, worker provider, realtime provider, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 13 test files and 106 tests passed.
