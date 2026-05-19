# US-111 Vercel Cron Schedule Configuration

## Status

Implemented locally with configuration proof. Hosted Vercel cron execution proof remains pending.

## Sequence item

Item 7 — Inngest month-advance processing and Vercel cron/live trigger convergence.

## Lane

Normal, non-UI platform-configuration slice.

## User story

As the auto-mode scheduler, I need the repository to declare the Vercel Cron job that calls the existing scheduled month-advance route at midnight UTC+7, so deployment has a concrete platform schedule for the accepted auto-mode trigger without requiring a hosted mutation in this sprint.

## Implementation

- `vercel.json` now declares one cron job for `/api/cron/month-advance`.
- The schedule is `0 17 * * *`, which is 17:00 UTC and corresponds to 00:00 UTC+7.
- The cron path carries no query payloads, so deployed cron uses the existing durable auto-class discovery path and keeps class/month selection server-side.

## Proof

- `app/vercel-cron-config.test.ts` reads `vercel.json` and asserts that the only configured cron path is `/api/cron/month-advance`, scheduled at `0 17 * * *`, without query parameters.

## Validation

- `npm run test:unit -- app/vercel-cron-config.test.ts` passed with 1 test file and 2 tests.
- `npm run validate:quick` passed with 57 test files and 548 tests.
- `npm run smoke:routes` passed for `/`, `/login`, `/join/ALPHA01`, `/dashboard`, and `/instructor/dashboard`.

## Out of scope

- Hosted Vercel cron invocation proof.
- Hosted Supabase auto-class discovery proof.
- Hosted Inngest worker execution proof.
- Live RLS write proof for worker persistence.
- Hosted realtime proof.
- Provider-backed browser/E2E proof.
