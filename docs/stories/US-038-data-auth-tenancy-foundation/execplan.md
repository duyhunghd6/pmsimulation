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
3. Define parse-first server command/query boundaries for session claims and database rows. Session/scope parsers and scoped result-row parsers for student own-fund state, student own-holding rows, instructor owned-class rows and God Mode holdings, student revealed macro narrative and market metric rows, student tracked metric rows, student TARA orders, student risk register entries, student ledger rows, and same-class leaderboard fund rows are present. The injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, TARA order-entry, and current-turn dashboard server query executors now read RLS-backed rows, parse them before delivery, and wrap only safe student result envelopes.
4. Add Supabase Auth/PostgreSQL/RLS and Drizzle schema/migrations for the approved proof slice. First bounded schema/RLS files are present, and RLS helpers/policies now check the trusted `app_role` claim for student and instructor paths; local database execution remains pending.
5. Add deterministic fixtures for two classes, two instructors, at least three students, current/past/future scenario rows, and exact holdings. First deterministic fixture file is present.
6. Add integration proof for allowed and forbidden reads/writes. The command and SQL contract tests exist; safe authorization event serialization now emits fixed fields only, scoped database row parsers preserve result scope before delivery for student fund, own-holding, TARA order, ledger, revealed macro narrative, revealed market metric, tracked metric, same-class leaderboard fund, and instructor owned-class/God Mode holding rows, a server-only parser validates `AUTH_TENANCY_DATABASE_URL` for the local proof harness, a browser-safe parser validates only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for future auth client setup, injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, TARA order-entry, and current-turn dashboard query executors return safe envelopes from parsed rows, and the local Supabase RLS test is skipped until that variable points at a local Supabase database.
7. Update product docs, story evidence, test matrix, and decisions if the security architecture changes.

## Approved Unblockers

- Role/session claims: Supabase Auth JWT claims are the trusted student and instructor identity source. Class membership and instructor administration are represented in persisted membership/admin rows and rechecked by RLS and server guards.
- Minimal schema/RLS shape: classes, class administration, class membership or enrollment, funds, asset holdings, macro narratives, market metrics, tracked metrics, TARA orders, risk register rows, and simulation ledger rows are approved for the first Drizzle/Supabase foundation as needed by proof.
- Server boundary: parse session claims, request inputs, and database rows before returning typed allowed/forbidden query or command outcomes.
- Dependencies and environment: Supabase Auth/PostgreSQL/RLS plus Drizzle are approved for the narrow proof slice with server-only credentials and local Supabase as the initial executable harness.
- Authorization observability: denied authorization attempts may log safe actor id, role, class id, resource kind, action, decision, reason code, and request correlation id, without credentials, future rows, unauthorized holdings, raw forbidden payloads, or service-role secrets.
- Fixtures and command: deterministic two-class, two-instructor, three-student fixtures plus current/past/future scenario rows and exact holdings are required before marking the security row implemented; the first integration command should be `npm run test:integration:auth-tenancy`.

## Approved First Provider-Backed Slice

The human approved the full-stack MVP implementation track on 2026-05-18. US-038 may now leave pure-domain descriptor mode and introduce the first provider-backed proof slice.

Approved choices:

- Session source: Supabase Auth JWT claims, including trusted role and subject identifiers for student and instructor paths.
- Minimal schema: classes, instructor administration, class membership or enrollment, funds, holdings, macro narratives, market metrics, tracked metrics, TARA orders, risk register rows, and simulation ledger rows as needed for the foundation proof.
- Enforcement boundary: Supabase RLS is primary for persisted tenant/role enforcement; server-side parse-first guards must preserve the same scope before database access and result delivery.
- Test harness: local Supabase first, with `npm run test:integration:auth-tenancy` as the first dedicated integration command.
- Environment boundary: server-only Supabase URL/key variables and database credentials, plus browser-safe Supabase URL/anon-key parsing; tests must not expose service-role or database credentials to browser/client code.
- Fixtures: deterministic two-class, multi-student, multi-instructor rows with current, past, and future scenario data plus exact holdings.
- Denied-access observability: safe actor id, role, class id, resource kind, action, decision, reason code, and request correlation id only.

## Next Human Decision Gate

No additional human decision is needed before starting the narrow US-038 provider-backed proof slice above. Pause again only if implementation would expand beyond the approved stack, add hosted production resources, weaken the proof cases, introduce a broader app shell, or require a schema/security choice not covered here.

## Stop Conditions

Pause for human confirmation if:

- Implementation needs auth/session claims beyond Supabase Auth JWT role and subject identifiers.
- Implementation requires hosted production Supabase, Vercel deployment, or third-party resources beyond local proof.
- RLS policy shape conflicts with current product docs.
- A broader app shell, browser UI, worker, realtime provider, CI, or deployment setup becomes necessary to prove this slice.
- Any validation requirement would need to be weakened or postponed after implementation.
