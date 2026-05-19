# US-086 Instructor Live Month-Advance Control UI

## Status

implemented

## Lane

normal

## Product Contract

Instructors can use the protected `/instructor/dashboard` browser surface to view whether an instructor-scoped manual class can accept a live Fast-Forward Month request and submit that request through the existing safe server-action receipt boundary into the bounded Inngest handoff. The UI renders empty, loading, accepted, validation-error, authorization-error, disabled, and bounded failure states without exposing worker jobs, ledger drafts, realtime payloads, database rows, fund rows, processed month results, or provider clients.

This story implements browser UI and a bounded server action over the existing pure-domain live month-advance control, request, command descriptor, result envelope, validation failure envelope, and first Inngest handoff dispatch. It does not implement ledger writes, realtime publication, processed order execution, durable class-month persistence, live Supabase writes, Vercel cron discovery, hosted worker execution, or provider-backed E2E proof.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`

## Acceptance Criteria

- The protected instructor dashboard renders a Manual month advance panel reachable by trusted instructor sessions.
- The panel shows trigger mode, current month, next month, total months, and disabled reason when the existing control snapshot cannot advance.
- The form posts class id, trigger mode, current month, and total months to a server action; instructor id is derived only from the trusted server session.
- The server action rejects missing or non-instructor sessions with an instructor-safe authorization state.
- Invalid live advancement inputs redirect to a validation-error state without Inngest handoff dispatch, database writes, realtime publication, or month processing.
- Successful submissions dispatch the bounded Inngest handoff and redirect to an accepted state with safe receipt metadata only: advancement key, current month, and next month.
- The submit button has a pending state and is disabled when the control snapshot cannot advance.
- Ledger writes, realtime publication, processed order execution, live provider writes, hosted worker proof, and provider-backed browser proof remain out of scope.

## Design Notes

- Commands: `advanceInstructorLiveMonth` creates an `InstructorLiveMonthAdvanceRequest`, maps it to the existing command descriptor, dispatches the bounded Inngest handoff, and returns the existing accepted receipt envelope through redirect search params.
- Queries: existing instructor dashboard query executors remain unchanged; the live month-advance control uses the existing pure-domain snapshot factory.
- API: no route handler is added; the App Router form posts directly to a server action.
- Tables: no migration changes; live class-month persistence remains pending.
- Domain rules: the existing month-advance domain validation still owns manual-mode, current-month, total-month, next-month, and idempotency-key rules.
- UI surfaces: `/instructor/dashboard` now includes the Manual month advance panel above pending-order visibility, leaderboard, aggregate analytics, and God Mode panels.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Existing live month-advance domain tests and `app/infrastructure/inngest/month-advance.test.ts` cover command/control and bounded live handoff convergence. |
| Integration | Planned; hosted worker execution, persistence, and local/live Supabase proof remain pending. |
| E2E | Planned; provider-backed browser session and accepted live month-advance proof remain pending. |
| Platform | Local dev-server route smoke for `/instructor/dashboard`. |
| Release | `npm run validate:quick` and `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, and matrix evidence.

## Evidence

- Selected Full-Stack MVP Sprint Sequence item 6: instructor class management and manual month-advance UI/server boundaries.
- Browser-visible UI slice: protected `/instructor/dashboard` now renders the Manual month advance panel over the existing bounded live month-advance control and safe receipt envelope.
- Follow-up non-UI convergence slice: `advanceInstructorLiveMonth` dispatches valid manual/live requests through the bounded Inngest handoff before redirecting to the accepted browser-safe receipt.
- `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` — passed with 1 test file and 7 tests.
- `npm run validate:quick` — passed with 42 test files and 483 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`.
- `npm run build` — passed and rendered `/instructor/dashboard` as a dynamic server route.
- Authenticated provider-backed browser proof remains pending because Supabase public environment values, hosted provider runtime, durable class-month persistence, worker execution, and browser automation are not configured for this slice.
