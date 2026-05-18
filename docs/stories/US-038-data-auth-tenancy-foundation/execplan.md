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

## Minimum Unblockers

- Role/session claims for student and instructor identities are confirmed, including how class membership and instructor administration are represented in trusted server context.
- Minimal class membership and instructor-admin schema/RLS shape is confirmed for own-fund reads, future-row denial, other-holding denial, instructor-owned God Mode reads, and unowned-class rejection.
- The server-side query/command boundary that parses session claims, request inputs, and database rows is selected.
- Supabase/Drizzle dependency and environment handling are approved for the narrow proof slice, including server-only credential handling.
- Authorization failure logging or audit expectations are confirmed without exposing credentials, future rows, or unauthorized holdings.
- A deterministic fixture set and integration validation command are available before any security row is marked implemented.

## Decision Inputs Needed

Before implementation can start, the high-risk lane needs explicit confirmation of:

- The trusted role/session claim source for student and instructor identities.
- The minimal membership/admin schema needed to prove class tenancy without a full app shell.
- Whether the first executable proof uses Supabase local development, hosted Supabase, or a different accepted backend harness.
- The server-only environment and credential handling boundary for tests and future runtime code.
- The integration command name and fixture ownership model for forbidden-read proof.
- The safe audit/log shape for denied authorization attempts.
- Whether this story should now leave pure-domain descriptor mode and introduce the first provider-backed proof slice.

## Approval Checklist For First Provider-Backed Slice

Before implementation can leave blocker mode, the approved slice should name:

- Session source: Supabase Auth JWT claims, including the trusted role claim and subject identifier for student and instructor paths.
- Minimal schema: classes, instructor administration, class membership or enrollment, funds, holdings, and scenario rows sufficient to prove the forbidden reads.
- Enforcement boundary: whether proof is primarily Supabase RLS, server-side policy checks, or both, and which checks must be database-enforced.
- Test harness: local Supabase, hosted Supabase test project, or another accepted backend target, plus the exact integration command name.
- Environment boundary: required server-only variables and how tests prevent browser/client exposure.
- Fixtures: deterministic two-class, multi-student, multi-instructor rows with current, past, and future scenario data.
- Denied-access observability: safe log or audit fields that exclude credentials, future rows, unauthorized holdings, and raw forbidden payloads.

## Next Human Decision Gate

This story should not leave blocker mode until the human selects one of these paths:

1. Approve a first provider-backed proof slice with the checklist above filled in.
2. Defer provider-backed work and keep future autonomous rounds to docs or harness improvements only.
3. Narrow a pure TypeScript policy-helper slice while keeping US-038 integration proof explicitly planned, not implemented.

## Stop Conditions

Pause for human confirmation if:

- The role/session claim shape is ambiguous.
- Implementing proof requires adding Supabase, Drizzle, app runtime, or environment configuration.
- RLS policy shape conflicts with current product docs.
- A broader schema or app shell becomes necessary to prove the slice.
- Any validation requirement would need to be weakened or postponed after implementation.
