# US-096 Local Browser Surface Smoke Proof

## Status

implemented

## Lane

normal, release-proof slice

## Product Contract

The local route smoke proof verifies that the default reachable App Router surfaces render expected public content or enforce protected-route auth behavior without hosted provider credentials.

## Relevant Product Docs

- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/TEST_MATRIX.md`
- `scripts/README.md`

## Acceptance Criteria

- `npm run smoke:routes` still checks `/`, `/login`, `/dashboard`, and `/instructor/dashboard`, starting `npm run dev` when needed.
- Public routes must render expected shell/login content instead of only returning HTTP 2xx.
- Protected routes must either redirect to `/login?status=sign-in-required` or render an accepted safe protected state when local auth configuration/session state allows HTTP 200.
- The proof does not require Supabase, Inngest, Vercel, hosted CI, provider-backed browser sessions, or deployment.

## Design Notes

- Commands: strengthen the existing `smoke:routes` command rather than adding a new dependency or browser driver.
- UI surfaces: default App Router surfaces only.
- Provider behavior: out of scope; hosted proof remains pending.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Covered separately by `npm run validate:quick`. |
| Integration | Not introduced; no provider runtime is required. |
| E2E | Local HTTP-level browser-surface proof for reachable public/protected route states; provider-backed E2E remains pending. |
| Platform | Local Next.js dev-server route proof. |
| Release | Included in `npm run release:local` through `npm run smoke:routes`. |

## Evidence

- `npm run smoke:routes` passed on 2026-05-19, asserting public route content for `/` and `/login` plus protected-route redirects for `/dashboard` and `/instructor/dashboard` to `/login?status=sign-in-required`.
- `npm run release:local` passed on 2026-05-19, running `npm run validate:quick` (43 test files, 490 tests), strengthened `npm run smoke:routes` (`/` 200 content checked, `/login` 200 content checked, `/dashboard` 307 redirect checked, `/instructor/dashboard` 307 redirect checked), and `npm run build`; report written to `reports/local-release-proof.json`.
