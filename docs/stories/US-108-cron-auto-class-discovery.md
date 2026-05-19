# US-108 Cron auto-class discovery

## Status

Implemented locally with unit proof. Hosted Vercel cron/Supabase execution proof remains pending.

## Sequence item

Item 7 — Inngest month-advance processing and Vercel cron/live trigger convergence.

## Lane

Normal, non-UI infrastructure slice.

## User story

As the scheduled month-advance trigger, I need `/api/cron/month-advance` to discover auto-paced classes that are ready for advancement from the durable `classes` table and dispatch each ready class through the existing auto Inngest handoff, so cron no longer depends only on a manually supplied class/month query while preserving the shared idempotent worker path.

## Implementation

- `app/infrastructure/inngest/month-advance.ts` now includes a narrow Supabase auto-class discovery reader over `classes` selecting only `id`, `trigger_mode`, `current_month_index`, and `total_months` for `trigger_mode = auto`.
- Discovery rows are parsed before use, reject malformed provider rows, and are converted through the existing `createAutoMonthAdvanceRequest` path so idempotency keys and completed-simulation rejection stay centralized.
- `executeMonthAdvanceAutoClassDiscoveryHandoff` dispatches every ready auto class through `executeAutoMonthAdvanceInngestHandoff`, skips classes that are not ready to advance, and returns only a scheduled-trigger-safe discovery receipt plus worker-safe handoff receipts.
- Provider read and dispatch failures are sanitized into a safe discovery failure without provider error details, provider clients, raw database rows, or secrets.
- `app/api/cron/month-advance/route.ts` keeps the explicit query-parameter handoff path for targeted local proof, and uses durable discovery when no explicit class/month params are supplied.

## Proof

- `app/infrastructure/inngest/month-advance.test.ts` covers:
  - dispatching only ready auto classes discovered by the reader,
  - skipping completed auto classes through the existing auto request validator,
  - Supabase discovery query shape and row parsing,
  - malformed provider row rejection,
  - sanitized provider read/dispatch failures.

## Validation

- `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` passed with 1 test file and 20 tests.
- `npm run validate:quick` passed with 52 test files and 530 tests.

## Out of scope

- Hosted Vercel cron execution proof.
- Hosted Supabase discovery proof.
- Hosted Inngest worker execution proof.
- Live RLS write proof for worker persistence.
- Asset-holding rebalance mutation.
- Hosted realtime proof.
- Provider-backed browser/E2E proof.
