# US-072 Supabase Auth No-Gameplay Route Guard

## Current Behavior

The app has a minimal Next.js App Router shell with public home/login placeholders and student/instructor dashboard placeholder routes. The shell has browser-safe Supabase auth environment parsing, but no login/logout action, Supabase auth client, session guard, role guard, or protected layout behavior.

## Target Behavior

The no-gameplay shell starts a bounded Supabase Auth flow: the login route can request a magic link using only public Supabase URL/anon-key environment values, student and instructor route groups require an authenticated Supabase user with the trusted matching `app_role` claim, and logout clears the Supabase session. Protected routes still return no gameplay data, database rows, server query results, RLS execution, or provider payloads.

## Affected Users

- Students opening `/dashboard`.
- Instructors opening `/instructor/dashboard`.
- Unauthenticated visitors using `/login`.

## Affected Product Docs

- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`

## Non-Goals

- Do not query gameplay tables or execute RLS-backed dashboard queries.
- Do not create signup, password auth, classroom enrollment, or role-management UI.
- Do not add middleware, hosted Supabase configuration, CI, deployment, E2E, worker, realtime, or database runtime wiring.
- Do not expose macro, holding, order, leaderboard, attribution, roster, God Mode, aggregate, or month-advance payloads.
