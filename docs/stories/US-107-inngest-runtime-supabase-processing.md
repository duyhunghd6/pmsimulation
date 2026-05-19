# US-107 Inngest runtime Supabase processing wiring

## Status

Implemented locally with unit proof. Hosted Inngest/Supabase execution proof remains pending.

## Sequence item

Item 7 — Inngest month-advance processing and Vercel cron/live trigger convergence.

## Lane

Normal, non-UI infrastructure slice.

## User story

As the month-advance worker runtime, I need the existing `app/month.advance.requested` Inngest function to run the bounded class-month processing executor through the Supabase processing store and Supabase Realtime publisher when server-only Supabase runtime values are configured, so live/manual and auto/scheduled handoffs can advance from queued receipts toward durable processing without returning fund inputs, ledger drafts, provider clients, provider errors, or secrets.

## Implementation

- `app/infrastructure/inngest/month-advance.ts` now parses server-only worker runtime configuration from `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.
- The Inngest `monthAdvanceRequestedFunction` now calls `executeMonthAdvanceRuntimeWorkerFromInngestEventData`, which:
  - keeps the existing worker-safe receipt for valid events,
  - returns a safe runtime-configuration status when Supabase worker values are absent or malformed,
  - creates a non-persistent Supabase server client when runtime values are present,
  - wires the existing Supabase class-month processing store as reader/writer,
  - reuses the Supabase client as the server-only realtime broadcast client,
  - calls the existing parse-first class-month processing executor,
  - returns only the worker-safe receipt plus safe aggregate processing/publication envelopes.
- Runtime provider failures are sanitized into `worker_runtime_failed` without provider error details or secret values.

## Proof

- `app/infrastructure/inngest/month-advance.test.ts` covers:
  - worker runtime environment parsing,
  - missing/malformed runtime configuration failures,
  - successful runtime wiring through injected reader/writer/realtime boundaries,
  - sanitized provider failure handling.

## Validation

- `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` passed with 1 test file and 16 tests.
- `npm run typecheck` passed.

## Out of scope

- Hosted Inngest execution proof.
- Hosted Supabase read/write and Realtime proof.
- Live RLS write proof.
- Durable auto-class discovery for cron.
- Asset-holding rebalance mutation.
- Provider-backed browser/E2E proof.
