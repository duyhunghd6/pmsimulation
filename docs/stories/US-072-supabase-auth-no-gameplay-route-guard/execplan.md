# Exec Plan

## Goal

Add the smallest Supabase Auth route-boundary slice to the existing no-gameplay Next.js shell.

## Scope

In scope:

- Add Supabase auth client dependencies needed by server actions and server route layouts.
- Add a server-side Supabase client factory that uses only the public Supabase URL and anon key plus Next cookies.
- Add magic-link sign-in and sign-out server actions.
- Guard the student and instructor route groups by authenticated session plus trusted `app_role` claim.
- Keep all protected shell routes free of gameplay payloads.
- Update story evidence and the test matrix.

Out of scope:

- Gameplay server query execution.
- Database/RLS runtime execution beyond the existing US-038 proof harness.
- Browser client state management, signup, password auth, enrollment, role-management UI, middleware, E2E, CI, hosted Supabase setup, deployment, worker, or realtime provider code.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Public contracts.
- Cross-platform/browser runtime.
- Weak proof for real provider flows until configured Supabase credentials and E2E exist.

Hard gates:

- Auth.
- Authorization.

Lane: high-risk, narrowed by the accepted full-stack sprint sequence to a no-gameplay shell route guard.

## Work Phases

1. Confirm US-038 local RLS proof remains blocked only by missing `AUTH_TENANCY_DATABASE_URL`.
2. Reuse the existing browser-safe Supabase auth environment parser.
3. Add the Supabase server client, login/logout actions, and protected route access classifier.
4. Wrap student and instructor route-group layouts with the no-gameplay guard.
5. Update product docs, story evidence, and the test matrix.
6. Run `npm run validate:quick`; run `npm run build` for the App Router shell.

## Stop Conditions

Pause for human confirmation if:

- The slice requires database query execution or gameplay payload delivery.
- Role assignment or enrollment UX becomes necessary.
- Hosted Supabase, CI, deployment, or E2E credentials are required.
- Validation requirements need to be weakened.
