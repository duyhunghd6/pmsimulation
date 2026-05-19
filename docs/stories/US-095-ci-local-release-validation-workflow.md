# US-095 CI Local Release Validation Workflow

## Status

implemented

## Lane

high-risk, narrowed to a non-deploying CI validation slice

## Product Contract

The repository includes a bounded CI workflow that runs the existing local release proof for pull requests, pushes to `main`, and manual dispatches without deploying, requiring hosted provider credentials, or mutating Supabase, Inngest, or Vercel runtime state.

## Relevant Product Docs

- `docs/product/runtime-architecture.md`
- `docs/TEST_MATRIX.md`
- `scripts/README.md`

## Acceptance Criteria

- A GitHub Actions workflow installs dependencies from `package-lock.json` with `npm ci`.
- The workflow runs `npm run release:local` as the single release-validation gate.
- The workflow uploads `reports/local-release-proof.json` as an artifact when available.
- The workflow uses read-only repository permissions and does not deploy or require hosted provider secrets.
- Hosted provider integration, provider-backed E2E, deployment automation, and hosted release proof remain out of scope.

## Design Notes

- Commands: reuse `npm run release:local`; no new package script is required.
- CI: `.github/workflows/local-release-validation.yml` runs on pull requests, pushes to `main`, and manual dispatches.
- Secrets: none required for this bounded workflow.
- UI surfaces: none.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Covered through `npm run validate:quick` inside `npm run release:local`. |
| Integration | Existing auth-tenancy integration command remains separate because local RLS execution depends on `AUTH_TENANCY_DATABASE_URL`. |
| E2E | Not introduced; provider-backed browser auth/order/refresh proof remains pending. |
| Platform | Workflow syntax is checked by repository review; hosted GitHub Actions run proof remains pending until the workflow runs remotely. |
| Release | `npm run release:local` remains the executable local release gate used by CI. |

## Evidence

- `.github/workflows/local-release-validation.yml` added a non-deploying GitHub Actions workflow with read-only permissions, `npm ci`, `npm run release:local`, and local release report artifact upload.
- `npm run release:local` passed on 2026-05-19, running `npm run validate:quick` (43 test files, 490 tests), strengthened `npm run smoke:routes` (`/` 200 content checked, `/login` 200 content checked, `/dashboard` 307 redirect checked, `/instructor/dashboard` 307 redirect checked), and `npm run build`; report written to `reports/local-release-proof.json`.
