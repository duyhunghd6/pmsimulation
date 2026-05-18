# US-085 Student TARA Order Form UI

## Status

implemented

## Lane

normal

## Product Contract

The protected student dashboard route renders a browser-visible TARA target-allocation form for an authorized student session. The form posts Base/Core/Apex target percentages to the existing bounded student TARA order submission executor, returns only student-safe receipt or validation state, and keeps raw rows, auth session payloads, worker payloads, realtime payloads, provider clients, and processed-order execution out of the browser surface.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`

## Acceptance Criteria

- The `/dashboard` student route keeps the protected student route guard and renders the TARA order form only after a trusted student `app_role` session is available.
- The form collects Base/Core/Apex target percentages with browser constraints and posts to a server action that uses the existing bounded submission executor.
- The server action returns empty, loading, accepted receipt, validation-error, authorization-error, and bounded failure states without exposing raw database rows, auth sessions, provider payloads, worker jobs, realtime payloads, or other-fund data.
- The authoritative server executor still validates exact `100.0%` allocation, scoped fund/holding/tracked-metric rows, duplicate pending orders, and parsed persisted pending-order rows before returning a safe receipt.
- The slice does not add live Supabase writes, durable provider persistence, worker dispatch, realtime publication, browser E2E, CI, deployment, or processed order execution.

## Design Notes

- Commands: adds `submitStudentTaraOrder` as a dashboard server action that delegates to `executeStudentTaraOrderSubmissionAction`.
- Queries: reuses `executeStudentDashboardCurrentTurnQuery` for the current-turn dashboard/order-entry state.
- API: no public API route added.
- Tables: no schema or migration changes.
- Domain rules: target allocations remain validated by the existing TARA order submission domain/application path.
- UI surfaces: `/dashboard` now renders a reachable TARA order form and receipt/error notice states.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing TARA order submission executor and parser tests continue to prove authoritative validation and safe receipt delivery. |
| Integration | Not added; local RLS execution still requires `AUTH_TENANCY_DATABASE_URL`, and this slice uses an injected proof store rather than live Supabase writes. |
| E2E | Not added; provider-backed browser sign-in/order proof remains pending until Supabase public environment and browser automation are configured. |
| Platform | Not added; no hosted Supabase, Vercel deployment, cron, worker, realtime provider, or CI introduced. |
| Release | `npm run typecheck`; `npm run validate:quick`; `npm run build`; local dev-server HTTP smoke for `/dashboard`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- 2026-05-18 sprint: implemented the protected `/dashboard` TARA order form UI over the existing bounded student TARA order submission executor, with empty, loading, accepted, validation-error, authorization-error, and bounded failure states.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 39 test files and 468 tests.
- `npm run build` — passed and kept `/dashboard` as a dynamic server-rendered route.
- Local dev-server HTTP smoke for `/dashboard` — passed with HTTP 200 on the existing Next dev server at port 3000.
