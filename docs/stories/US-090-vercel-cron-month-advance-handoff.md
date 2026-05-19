# US-090 Vercel Cron Month-Advance Handoff

## Status

implemented

## Lane

normal

## Product Contract

The first bounded scheduled month-advance trigger route is available at `/api/cron/month-advance`. It requires `CRON_SECRET`, parses one auto-paced class/month transition from the request boundary, returns the existing scheduled-trigger-safe result or validation failure envelopes, and dispatches valid auto requests into the same bounded Inngest `app/month.advance.requested` handoff used by protected live/manual advancement.

This story implements a non-UI scheduled-trigger convergence slice. It does not implement durable auto-class discovery, hosted Vercel cron proof, hosted Inngest execution, order execution, ledger writes, class-month persistence, realtime publication, or provider-backed E2E proof.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- Add a scheduled App Router route for auto month advancement.
- Require a server-only `CRON_SECRET` before accepting scheduled-trigger requests.
- Parse unknown request boundary values before creating an auto month-advance request.
- Return the existing scheduled-trigger-safe validation envelope for malformed auto trigger inputs.
- Return the existing scheduled-trigger-safe accepted envelope for valid auto trigger inputs.
- Dispatch valid auto requests into the same bounded Inngest month-advance event path used by live/manual advancement.
- Keep route responses and worker handoff payloads free of fund inputs, ledger drafts, database rows, realtime payloads, provider secrets, and processed month results.

## Design Notes

- Cron route: `app/api/cron/month-advance/route.ts` handles bounded GET requests for one auto-paced class/month transition.
- Worker convergence: `executeAutoMonthAdvanceInngestHandoff` maps the accepted auto scheduled-trigger request into the same shared processing event and worker-safe receipt shape as live/manual requests.
- Authorization: the route rejects requests when `CRON_SECRET` is missing or the bearer token does not match; hosted platform invocation proof remains future work.
- Tables: no migration changes; durable auto-class discovery, class-month persistence, ledger persistence, and processed order writes remain pending.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/infrastructure/inngest/month-advance.test.ts` covers auto scheduled-trigger convergence onto the shared worker event path. |
| Integration | Planned; hosted/local Inngest execution and durable database class discovery remain pending. |
| E2E | Planned; provider-backed cron-to-worker proof remains pending. |
| Platform | Planned; Vercel cron invocation and hosted route proof remain pending. |
| Release | `npm run validate:quick`, `npm run smoke:routes`, and `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, sprint log, and matrix evidence.

## Evidence

- Selected Full-Stack MVP Sprint Sequence item 7: Inngest month-advance processing and Vercel cron/live trigger convergence.
- Required sequence preflight and non-UI gate recorded in `.claude/sprint-runs/round-160-20260519-chrono-handoff.log`.
- Non-UI slice: `/api/cron/month-advance` now requires `CRON_SECRET`, parses one bounded auto scheduled trigger, returns safe scheduled-trigger envelopes, and dispatches valid auto requests into the existing bounded Inngest handoff.
- `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` — passed with 1 test file and 8 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 42 test files and 484 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`.
- `npm run build` — passed and listed `/api/cron/month-advance` as a dynamic App Router route.
