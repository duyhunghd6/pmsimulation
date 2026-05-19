# US-088 Student Post-Turn Attribution UI

## Status

implemented

## Lane

normal

## Product Contract

The protected student dashboard route renders a browser-visible post-turn attribution panel for an authorized student session when a processed month exists. The panel uses the existing student post-turn dashboard snapshot and query-result envelope builders to display only viewer-fund attribution categories and viewer-safe rank metadata.

This slice keeps the student anti-leakage contract intact. The browser receives no target weights, order details, raw ledger drafts, other-fund ledger rows, provider payloads, future scenario rows, class aggregate payloads, or instructor God Mode data.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`

## Acceptance Criteria

- The `/dashboard` student route keeps the existing protected student route guard and renders the post-turn attribution surface only after a trusted student `app_role` session is available.
- The route renders starting AUM, ending AUM, market beta impact, fee drag, tax paid, tax drag percentage, PvP slippage, liquidity penalty percentage, classroom sell concentration, and post-turn viewer rank from the existing post-turn dashboard snapshot/query-result envelope builders.
- Empty and bounded failure states render without attribution payloads when no processed month exists or query-result envelope construction fails.
- The slice does not add live Supabase ledger reads, raw ledger drafts, order-detail delivery, realtime subscriptions, worker processing, browser E2E, CI, deployment, or provider-backed proof.

## Design Notes

- Commands: none added.
- Queries: reuses `buildStudentDashboardPostTurnSnapshot`, `createStudentDashboardPostTurnQueryDescriptor`, and `createStudentDashboardPostTurnQueryResultEnvelope` with bounded in-route proof data; no live database runtime is introduced.
- API: no public API route added.
- Tables: no schema or migration changes.
- Domain rules: post-turn attribution remains validated by the existing student attribution report and post-turn dashboard builders.
- UI surfaces: `/dashboard` now renders a reachable post-turn attribution panel with empty, safe failure, and success states.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing student attribution report, post-turn dashboard, and leaderboard unit tests continue to prove safe snapshot/envelope rules. |
| Integration | Not added; local RLS execution still requires `AUTH_TENANCY_DATABASE_URL`, and this slice uses bounded proof data rather than live Supabase ledger reads. |
| E2E | Not added; provider-backed browser sign-in/attribution proof remains pending until Supabase public environment and browser automation are configured. |
| Platform | Not added; no hosted Supabase, Vercel deployment, cron, worker processing, realtime provider, or CI introduced. |
| Release | `npm run typecheck`; `npm run validate:quick`; `npm run build`; local dev-server HTTP smoke for `/dashboard`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: implemented the protected `/dashboard` post-turn attribution panel over the existing student post-turn dashboard snapshot/query-result envelope builders, with empty, safe failure, and success states.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 40 test files and 474 tests.
- `npm run build` — passed and listed `/dashboard` as a dynamic App Router route.
- Local dev-server HTTP smoke for `/dashboard` returned HTTP 200; an existing Next dev server was already running for this repository.
