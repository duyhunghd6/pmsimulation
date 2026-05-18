# US-052 Auto Month Advance Scheduled Trigger Descriptor

## Status

implemented

## Lane

normal

## Product Contract

A validated auto month-advance request can be mapped to a provider-neutral scheduled-trigger descriptor before any actual cron, platform, worker, persistence, auth, or provider implementation exists. The descriptor preserves the class/month idempotency key and auto trigger metadata, then points to the existing shared month-advance processing request path. Invalid auto advancement inputs can be mapped to a scheduled-trigger-safe validation failure envelope without echoing raw advancement payloads.

This story implements only the pure domain scheduled-trigger descriptor and validation failure envelope. It does not implement Vercel cron, scheduled jobs, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, order execution, ledger writes, UI, or background processing.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an auto month-advance scheduled-trigger descriptor from a validated auto month-advance request.
- The descriptor records trigger type, deterministic trigger key, scheduled-trigger boundary, trigger name, required auto-paced class scope, class id, auto trigger mode, auto trigger source, current month index, next month index, total months, idempotency key, and processing intent.
- The descriptor can feed the existing shared month-advance processing request path without branching into a separate auto-processing path.
- The descriptor excludes cron expressions, Vercel/project payloads, auth sessions, database rows, worker payloads, realtime payloads, fund inputs, and ledger drafts.
- Unit tests cover descriptor creation, shared-processing handoff, scheduled-trigger validation failure envelopes, valid-request rejection for failure envelopes, and exclusion of platform/provider/auth/worker/realtime/fund/ledger payloads.
- No cron, auth, database, Supabase, worker provider, realtime, UI, API route, RLS, order-execution, ledger-persistence, scheduled-trigger execution, or background processing code is introduced.

## Design Notes

- Commands: provider-neutral scheduled-trigger descriptor and validation failure envelope only; no executable command boundary.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: auto scheduled-trigger descriptors derive from validated auto advancement requests and preserve the same idempotent class/month path used by shared processing; invalid auto advancement inputs derive scheduled-trigger-safe validation failures without exposing raw payloads.
- UI surfaces: none in this slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for descriptor creation, shared-processing handoff, validation failure envelopes, and payload exclusions. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, realtime, scheduled-trigger execution, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable; no actual cron, scheduled job, worker provider, realtime provider, or platform trigger in this slice. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run validate:quick` — passed; 24 test files and 230 tests passed.
