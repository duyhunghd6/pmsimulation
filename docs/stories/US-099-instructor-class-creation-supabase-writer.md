# US-099 Instructor Class Creation Supabase Writer

## Status

implemented

## Lane

normal, non-UI integration slice

## Product Contract

The protected instructor class creation server action can now prefer a Supabase-backed class creation store when the App Router server client is available. The store calls a bounded authenticated Supabase RPC that creates the class row plus the instructor administrator row and returns only the created-class row shape for the existing parse-first executor.

This slice does not claim hosted provider proof. It narrows the live instructor class-management gap by adding the concrete provider write adapter behind the existing browser form and safe server-action boundary.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The instructor class creation server boundary has a Supabase store for authenticated class creation writes.
- The Supabase migration exposes a bounded `create_instructor_class` RPC that requires `app_role=instructor`, uses `auth.uid()` as the instructor owner, inserts both `classes` and `class_administrators`, and returns the persisted class row shape expected by the existing parser.
- Provider write failures fail closed through a generic store error without returning provider errors, provider clients, auth sessions, raw database rows, realtime payloads, or secrets to the browser.
- The protected `/instructor/dashboard` class creation form uses the Supabase store when `createAuthTenancySupabaseServerClient()` succeeds and keeps the bounded local fallback when Supabase server auth configuration is unavailable.
- Hosted Supabase execution proof, local RLS execution proof, roster editing, realtime publication, and provider-backed browser E2E remain pending; server-refreshed class-list UI is captured separately in `docs/stories/US-100-instructor-class-list-refresh-ui.md`, and roster visibility is captured separately in `docs/stories/US-110-instructor-class-roster-visibility-ui.md`.

## Design Notes

- Commands: no npm scripts added.
- Queries: none.
- Mutations: adds `createSupabaseInstructorClassCreationStore`, which calls `public.create_instructor_class(...)` and leaves persisted-row parsing plus browser-safe receipt delivery to `executeInstructorClassCreationAction`.
- API: no route handler is added; the existing App Router form still posts directly to the server action.
- UI surfaces: `/instructor/dashboard` copy now reflects the preferred Supabase writer, but no new browser component was added.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Supabase store unit proof covers RPC argument shape, created-row return shape, and sanitized provider write failures. Existing action executor proof covers role denial, invalid draft failure, persisted-row parsing, and mismatch rejection. |
| Integration | Not added; local RLS execution remains skipped without `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added; provider-backed browser sign-in/class creation proof remains pending. |
| Platform | Not added; no hosted Supabase, Vercel, Inngest, CI, or deployment mutation was performed. |
| Release | Targeted unit tests; `npm run validate:quick`; `npm run smoke:routes`. |

## Evidence

- 2026-05-19 sprint: added `app/infrastructure/auth-tenancy/instructor-class-creation-supabase-store.ts`, wired `/instructor/dashboard` server action store selection to prefer it when a Supabase server client is available, and kept the bounded local fallback.
- 2026-05-19 sprint: added `public.create_instructor_class(...)` to the Supabase migration so authenticated instructors can atomically create a class row and owner admin row through a bounded RPC without introducing service-role browser exposure.
- `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-class-creation-supabase-store.test.ts app/infrastructure/auth-tenancy/instructor-class-creation-action.test.ts` — passed with 2 test files and 7 tests.
- `npm run validate:quick` — passed with 46 test files and 502 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`; protected routes redirected to `/login?status=sign-in-required` because local Supabase auth/session configuration is not present.
- `npm run test:integration:auth-tenancy` — passed SQL contract tests with 1 local RLS execution test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured.
