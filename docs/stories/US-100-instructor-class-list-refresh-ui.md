# US-100 Instructor Class List Refresh UI

## Status

implemented

## Lane

UI-backed provider read slice

## Product Contract

The protected instructor dashboard now renders a server-refreshed instructor class list after class creation. When the App Router Supabase server client is available, the dashboard reads instructor-owned rows from the `classes` table through RLS, parses each row with the existing instructor-owned class parser, and renders only safe class-list fields.

This slice does not claim hosted provider proof. It narrows the instructor class-management gap by adding a durable read-side adapter and browser-visible refresh panel behind the existing protected `/instructor/dashboard` route.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The instructor dashboard has a browser-visible class-list panel that refreshes on each protected server render.
- The Supabase class-list reader selects instructor-owned rows from `classes`, scopes the read by the trusted instructor session, orders newest classes first, and parses rows before browser delivery.
- Provider read failures and rejected rows fail closed with safe failure codes and without returning provider errors, raw database rows, auth sessions, provider clients, realtime payloads, or secrets to the browser.
- The dashboard keeps a bounded fallback class-list row when Supabase server auth configuration is unavailable.
- Hosted Supabase execution proof, local RLS execution proof, roster editing, realtime publication, and provider-backed browser E2E remain pending; roster visibility is captured separately in `docs/stories/US-110-instructor-class-roster-visibility-ui.md`.

## Design Notes

- Commands: no npm scripts added.
- Queries: adds `createSupabaseInstructorClassListReader`, which reads `classes` through the Supabase client and delegates row validation to `parseInstructorOwnedClassRow`.
- Mutations: none.
- API: no route handler is added; the protected App Router page refreshes the list during server rendering.
- UI surfaces: `/instructor/dashboard` now renders a class-list refresh panel with empty, success, and safe failure states.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Supabase class-list reader unit proof covers query shape, parsed class row delivery, sanitized provider read failure, and trusted instructor scope rejection. |
| Integration | Not added; local RLS execution remains skipped without `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not added; provider-backed browser sign-in/class creation/list refresh proof remains pending. |
| Platform | Not added; no hosted Supabase, Vercel, Inngest, CI, or deployment mutation was performed. |
| Release | Targeted unit tests; `npm run typecheck`; `npm run validate:quick`; `npm run smoke:routes`. |

## Evidence

- 2026-05-19 sprint: added `app/infrastructure/auth-tenancy/instructor-class-list-supabase-reader.ts` and unit proof in `app/infrastructure/auth-tenancy/instructor-class-list-supabase-reader.test.ts`.
- 2026-05-19 sprint: wired `/instructor/dashboard` to render the class-list refresh panel from the Supabase reader when the App Router Supabase server client is available, with a bounded fallback row otherwise.
- `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-class-list-supabase-reader.test.ts` — passed with 1 test file and 3 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 47 test files and 505 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`; protected routes redirected to `/login?status=sign-in-required` because local Supabase auth/session configuration is not present.
