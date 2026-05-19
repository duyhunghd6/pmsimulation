# US-106 Instructor Join-Link Landing UI

## Status

implemented

## Lane

Browser-visible UI slice

## Product Contract

Instructors can deliver a browser-visible student join path derived from the safe class join code already returned by the instructor class creation/list boundaries. The public `/join/[joinCode]` route validates the join-code format and explains the enrollment state without reading class rows, writing roster records, exposing provider payloads, or returning gameplay data.

This slice reduces the instructor class-management join-link gap but does not itself implement roster enrollment, class membership writes, hosted Supabase proof, or provider-backed browser E2E. Follow-up roster enrollment is captured in `docs/stories/US-109-student-join-code-enrollment.md`.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- The protected instructor dashboard renders a student join path for each parsed class-list row and for successful class creation receipts.
- `/join/[joinCode]` renders a public safe landing state for valid join codes and a safe invalid state for malformed join codes.
- The join landing route does not read class rows, create class memberships, expose roster rows, return provider clients/errors, or deliver gameplay payloads.
- Local route smoke covers `/join/ALPHA01` with content assertions.
- Roster enrollment is handled by `docs/stories/US-109-student-join-code-enrollment.md`; provider-backed browser proof and hosted platform proof remain explicitly pending.

## Design Notes

- Commands: no package scripts added.
- Queries: none; the landing route validates only the route join-code parameter.
- Mutations: none.
- API: no route handler or server action added.
- UI surfaces: `/instructor/dashboard` shows derived `/join/{code}` paths; `/join/[joinCode]` provides the public landing route.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not added; this slice is route/UI composition and format validation only. |
| Integration | Not added; no provider read/write is introduced. |
| E2E | Not added; provider-backed student sign-in and roster enrollment remain pending. |
| Platform | Local route smoke covers the new public join path; hosted platform proof remains pending. |
| Release | `npm run typecheck`; `npm run validate:quick`; `npm run smoke:routes`. |

## Evidence

- 2026-05-19 sprint: added public `/join/[joinCode]` landing UI with valid and invalid join-code states.
- 2026-05-19 sprint: updated `/instructor/dashboard` class creation receipt and class-list rows to render derived student join links from parsed join codes.
- 2026-05-19 sprint: added `/join/ALPHA01` to local route smoke with public content assertions.
- 2026-05-19 sprint: `npm run typecheck` passed.
- 2026-05-19 sprint: `npm run validate:quick` passed with 52 test files and 521 tests.
- 2026-05-19 sprint: `npm run smoke:routes` passed for `/`, `/login`, `/join/ALPHA01`, `/dashboard`, and `/instructor/dashboard`.
