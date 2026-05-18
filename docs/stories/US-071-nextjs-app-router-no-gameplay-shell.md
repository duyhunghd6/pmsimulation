# US-071 Next.js App Router No-Gameplay Shell

## Status

implemented

## Lane

normal

## Product Contract

The MVP has a minimal Next.js App Router shell with a public entry route, a login boundary placeholder, and separate student and instructor route groups. The shell must not fetch, render, or expose gameplay data before Supabase Auth session guards, RLS-backed server queries, and scoped result delivery are implemented.

## Relevant Product Docs

- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- The repository includes the minimum Next.js App Router files needed to render a home page, login placeholder, student dashboard shell, and instructor dashboard shell.
- Student and instructor routes are structurally separated, with the instructor route resolving under `/instructor/dashboard`.
- The shell contains no Supabase client, no database access, no session parsing in UI routes, and no gameplay payload delivery.
- Validation proves the shell typechecks and builds.

## Design Notes

- Commands: `npm run dev`, `npm run build`.
- Queries: none in this slice.
- API: none in this slice.
- Tables: none in this slice.
- Domain rules: future student data must still come from student-scoped server queries; future instructor God Mode data must stay on instructor-scoped paths.
- UI surfaces: public home, public login boundary placeholder, student dashboard shell, instructor dashboard shell.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing unit suite remains green. |
| Integration | Not required; this slice has no auth provider, database, RLS, or server query execution. |
| E2E | Deferred until real auth and browser flows exist. |
| Platform | `npm run build` proves the App Router shell compiles and statically renders. |
| Release | Not required. |

## Harness Delta

No harness workflow changes were needed.

## Evidence

2026-05-18 sprint evidence: added Next.js/React dependencies, `npm run dev`, `npm run build`, root App Router layout/page, login placeholder, student dashboard shell, and instructor dashboard shell. `npm run validate:quick` passed with 27 test files and 388 tests. `npm run test:integration:auth-tenancy` passed SQL contract tests with 1 local RLS test skipped because `AUTH_TENANCY_DATABASE_URL` is not configured. `npm run build` passed and produced static routes `/`, `/login`, `/dashboard`, and `/instructor/dashboard`. Browser interaction was not performed because this session has no browser automation tool; a local dev-server route smoke test passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard` using HTTP requests.
