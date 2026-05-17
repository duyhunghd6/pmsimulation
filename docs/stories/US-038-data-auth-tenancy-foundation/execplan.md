# Exec Plan

## Goal

Establish the smallest secure persistence and authorization foundation needed before app, realtime, worker, or provider-backed stories can move beyond pure-domain descriptors.

## Scope

In scope:

- Supabase Auth role/session assumptions for student and instructor paths.
- Minimal class tenancy schema needed to prove class-scoped reads and writes.
- RLS policies or equivalent server-enforced authorization boundaries for student-owned fund data, instructor-owned class data, future scenario rows, and privileged God Mode holdings.
- Parse-first server query/command boundaries for unknown session, request, and database-row inputs.
- Integration proof for tenant isolation, role-scoped access, future-row protection, and other-student holding protection.

Out of scope:

- Browser UI implementation.
- Worker provider selection and execution.
- Supabase Realtime client publication.
- Deployment automation or production environment provisioning.
- Full schema coverage beyond the minimum needed to prove the security foundation.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Data model.
- Audit/security.
- External systems.
- Public contracts.
- Weak proof.
- Multi-domain.

Hard gates:

- Auth.
- Authorization.
- Data model.
- Audit/security.
- External provider behavior.

Lane: high-risk.

## Work Phases

1. Confirm the minimal role/session model for students and instructors.
2. Select the smallest schema/RLS surface that can prove class tenancy and protected reads.
3. Define parse-first server command/query boundaries for session claims and database rows.
4. Add Supabase/Drizzle or accepted persistence tooling only after the boundary is confirmed.
5. Add deterministic fixtures for two classes, two students, one instructor, current/past/future scenario rows, and exact holdings.
6. Add integration proof for allowed and forbidden reads/writes.
7. Update product docs, story evidence, test matrix, and decisions if the security architecture changes.

## Stop Conditions

Pause for human confirmation if:

- The role/session claim shape is ambiguous.
- Implementing proof requires adding Supabase, Drizzle, app runtime, or environment configuration.
- RLS policy shape conflicts with current product docs.
- A broader schema or app shell becomes necessary to prove the slice.
- Any validation requirement would need to be weakened or postponed after implementation.
