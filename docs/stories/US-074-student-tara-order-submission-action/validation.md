# Validation

## Proof Strategy

Unit proof covers the new server-side execution boundary because this slice uses injected row reads and an injected pending-order writer instead of a live Supabase runtime. Existing parser and domain envelope tests continue to prove lower-level validation behavior.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Successful scoped student submission, non-student rejection before writes, invalid target allocation safe failure, duplicate pending-order rejection, persisted row scope rejection, persisted row command mismatch. |
| Integration | Not added; local Supabase RLS execution still requires `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added; browser order form and provider-backed sign-in proof remain unwired. |
| Platform | Not added; no Vercel, CI, hosted Supabase, worker, or realtime provider changes. |
| Performance | Not applicable for this injected boundary slice. |
| Logs/Audit | Existing safe authorization event contract remains unchanged; no new logging surface. |

## Fixtures

The unit tests use deterministic UUID-shaped class, fund, student, holding, tracked-metric, and pending-order rows that match the existing auth-tenancy parsers.

## Commands

```text
npm run test:unit -- app/infrastructure/auth-tenancy/student-tara-order-submission-action.test.ts
npm run validate:quick
```

## Acceptance Evidence

- `npm run test:unit -- app/infrastructure/auth-tenancy/student-tara-order-submission-action.test.ts` — passed with 1 test file and 6 tests.
- `npm run validate:quick` — passed with 34 test files and 430 tests.
