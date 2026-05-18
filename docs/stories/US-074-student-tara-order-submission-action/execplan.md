# Exec Plan

## Goal

Add the first bounded server-side execution boundary for student TARA order submission while preserving student tenancy and safe receipt delivery.

## Scope

In scope:

- Student-only role and class/fund/month scope checks.
- Parse-first current fund, holding, pending-order, tracked-metric, and persisted-order row handling.
- Existing domain receipt, command descriptor, result envelope, and validation failure envelope reuse.
- Injected pending-order persistence writer with unit proof.
- Story, backlog, product-doc, and test-matrix updates.

Out of scope:

- Live Supabase/Drizzle insert execution.
- Browser form wiring and client-side validation.
- Realtime publication, worker execution, CI, deployment, provider-backed E2E, and production migration path.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Data model.
- Public contracts.
- Existing behavior.
- Weak proof.

Hard gates:

- Auth.
- Authorization.

Lane: high-risk. The human already approved bounded full-stack MVP implementation, and this slice avoids new provider/runtime decisions by using an injected persistence boundary with unit proof.

## Work Phases

1. Confirm backlog sequence selects student TARA order submission after the protected student dashboard UI.
2. Reuse existing TARA order receipt and server-action envelope domain contracts.
3. Implement the auth-tenancy submission executor over parsed rows and an injected pending-order writer.
4. Add unit tests for success, role denial, validation failure, duplicate pending orders, persisted row rejection, and persisted command mismatch.
5. Update product docs, backlog, story evidence, and test matrix.
6. Run targeted unit validation and `npm run validate:quick`.

## Stop Conditions

Pause for human confirmation if:

- Real provider credentials or hosted Supabase resources are required.
- Schema migrations or destructive data changes become necessary.
- Validation requirements need to be weakened.
- The executor needs to expose raw order/database payloads to the browser.
