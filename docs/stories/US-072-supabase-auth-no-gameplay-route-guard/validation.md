# Validation

## Proof Strategy

The slice is done when unit/type/build proof shows that the no-gameplay App Router shell can compile with Supabase auth dependencies, protected route decisions enforce the expected app-role claim, and the shell still has no gameplay data path. Real provider E2E sign-in remains pending until Supabase public environment values and browser automation are configured.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Protected route access classifier allows matching app-role sessions, blocks wrong or malformed role claims, blocks missing public config safely, and redirects unauthenticated/provider-error sessions to login. |
| Integration | Existing US-038 auth-tenancy integration command remains the RLS proof path; no new database integration is required for this no-gameplay shell slice. |
| E2E | Deferred until a configured Supabase auth provider and browser automation are available. |
| Platform | `npm run build` must compile the App Router shell with protected route groups. |
| Performance | Not applicable; no gameplay queries or provider dashboard reads are introduced. |
| Logs/Audit | No new logs; future denied query logs continue to use the existing safe authorization event serializer. |

## Fixtures

- Unit tests use deterministic student and instructor session ids with trusted `app_role` claims.
- Real Supabase auth users are not required for this slice.

## Commands

```text
npm run validate:quick
npm run build
```

## Acceptance Evidence

2026-05-18 sprint evidence: added `@supabase/ssr` and `@supabase/supabase-js`, Supabase server-client creation from browser-safe public environment values, magic-link login and logout server actions, and no-gameplay protected student/instructor route layouts that require a parsed Supabase user id plus matching trusted `app_role` claim before rendering shell placeholders. Added unit proof for route access classification. `npm run validate:quick` passed with 28 test files and 393 tests. `npm run build` passed and rendered `/` statically while `/login`, `/dashboard`, and `/instructor/dashboard` are dynamic server routes. `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured. Local dev-server HTTP route smoke passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`, with protected routes rendering the safe auth-configuration blocker when public Supabase environment values are absent. Provider-backed browser sign-in E2E was not attempted because no Supabase public environment values or browser automation are configured in this session.

2026-05-19 callback fix evidence: added `/auth/callback` to exchange Supabase magic-link codes into SSR cookies, redirect role-claimed students/instructors to their protected dashboards, and map callback/provider failures back to safe `/login?status=...` messages. Updated magic-link generation to pass an explicit local callback redirect URL. `npm run typecheck` passed; `npm run smoke:routes` passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`; `npm run build` passed and listed `/auth/callback` as a dynamic route. Provider-backed browser sign-in still requires Supabase Dashboard redirect allow-listing for `http://localhost:3000/auth/callback` and trusted user `app_metadata.app_role` values.
