# US-094 Local Release Validation Proof

## Status

implemented

## Lane

high-risk, narrowed to a local non-deploying release validation slice

## Product Contract

The repository exposes a bounded local release proof command that aggregates the currently available executable checks for the Next.js App Router MVP shell and writes structured evidence without deploying, requiring hosted provider credentials, or mutating shared CI/platform state.

## Relevant Product Docs

- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/TEST_MATRIX.md`

## Acceptance Criteria

- `npm run release:local` runs the current local release gate in order: `npm run validate:quick`, `npm run smoke:routes`, and `npm run build`.
- The route smoke step verifies default public route content and protected-route redirect or safe protected-state behavior, not only HTTP status.
- The command writes a structured JSON report with check names, commands, status, exit code, timing, output tails, and explicit non-goals for no deployment/provider/CI mutation.
- The command fails on the first failed gate while still writing the report.
- Hosted Supabase, hosted Inngest, Vercel cron, provider-backed browser E2E, and deployment proof remain out of scope until credentials/runtimes exist.

## Design Notes

- Commands: add `release:local` in `package.json`.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: no gameplay behavior changes.
- UI surfaces: none.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Covered through `npm run validate:quick` inside `release:local`. |
| Integration | Existing auth-tenancy integration command remains separate because local RLS execution depends on `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not introduced; provider-backed browser auth/order/refresh proof remains pending. |
| Platform | `npm run smoke:routes` and `npm run build` run locally; hosted Vercel/Supabase/Inngest proof remains pending. |
| Release | `npm run release:local` writes `reports/local-release-proof.json`. |

## Harness Delta

`scripts/README.md` now documents the bounded local release proof command and report path.

## Evidence

- `npm run release:local` passed on 2026-05-19, running `npm run validate:quick` (43 test files, 490 tests), strengthened `npm run smoke:routes` (`/` 200 content checked, `/login` 200 content checked, `/dashboard` 307 redirect checked, `/instructor/dashboard` 307 redirect checked), and `npm run build`; report written to `reports/local-release-proof.json`.
