# Exec Plan

## Goal

Add the first bounded instructor pending-order visibility server-query execution boundary over parsed RLS-backed rows.

## Scope

In scope:

- Instructor class fund and status-only TARA order row parsers.
- Injected instructor pending-order visibility query executor.
- Unit proof for role, scope, row rejection, forbidden-payload exclusion, duplicate order rejection, and non-pending order rejection.
- Product docs, backlog, and test matrix evidence updates.

Out of scope:

- Browser UI, live Supabase clients, migrations, provider-backed integration proof, order detail visibility, workers, realtime, CI, deployment, and E2E proof.

## Risk Classification

Risk flags:

- Authorization.
- Public contracts.
- Existing behavior.
- Weak proof.

Hard gates:

- Authorization.

## Work Phases

1. Confirm existing instructor pending-order domain envelope and auth-tenancy parser patterns.
2. Add minimal parse-first infrastructure row parsers.
3. Add injected server-query executor using the existing status-only envelope.
4. Add focused unit coverage.
5. Update story, product docs, backlog, and test matrix evidence.
6. Run focused tests and `npm run validate:quick`.

## Stop Conditions

Pause for human confirmation if:

- The slice requires live Supabase credentials or hosted resources.
- Product behavior expands to target weights or order details.
- A database migration or destructive data change becomes necessary.
- Validation requirements need to be weakened.
