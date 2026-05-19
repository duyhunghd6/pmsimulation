# Design

## Domain Model

The slice reuses the existing auth-tenancy session parser. A protected route is allowed only when a Supabase user id parses as the subject and `app_metadata.app_role` matches the route's required `student` or `instructor` role.

## Application Flow

- `/login` parses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before enabling sign-in.
- The login server action uses the Supabase server client to call `signInWithOtp` for an email magic link with an explicit `/auth/callback` redirect URL.
- `/auth/callback` exchanges the Supabase auth code into SSR cookies, parses the trusted `app_role` claim, and redirects students to `/dashboard` or instructors to `/instructor/dashboard`.
- The logout server action calls Supabase `signOut` and redirects to `/login`.
- Student and instructor route-group layouts read the current Supabase user, parse the trusted role claim, and classify the route access decision before rendering placeholder shell content.
- Missing public Supabase configuration renders a safe blocked-state panel so local builds can pass without a hosted auth provider.

## Interface Contract

Routes:

- `/login` remains public and renders either a magic-link form or a no-provider-config blocker.
- `/auth/callback` remains public, handles Supabase auth callback success/error states, and does not render gameplay payloads.
- `/dashboard` requires a student session with `app_role=student`.
- `/instructor/dashboard` requires an instructor session with `app_role=instructor`.

Redirects and blocked states:

- Missing or provider-error sessions redirect to `/login?status=sign-in-required` or another status-specific login message.
- Missing public Supabase environment values render an auth-configuration blocked state and do not read gameplay data.
- Missing, malformed, or mismatched `app_role` claims render a role blocked state with a sign-out action.

## Data Model

No tables, migrations, database clients, fixtures, or RLS policies are changed in this slice.

## UI / Platform Impact

The shell adds a public magic-link form, a logout button for authenticated protected shells, and safe protected-route blocker panels. Student and instructor dashboard pages remain placeholders with no gameplay payloads.

## Observability

No new logs or audit records are added. Existing safe authorization event serialization remains available for future server query authorization denials.

## Alternatives Considered

1. Middleware-based route protection was deferred to keep this slice limited to existing route groups and avoid introducing edge/runtime behavior before provider validation exists.
2. Client-side Supabase auth helpers were deferred because server actions and server layouts prove the boundary without adding browser state management.
