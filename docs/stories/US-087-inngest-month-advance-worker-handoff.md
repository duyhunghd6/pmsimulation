# US-087 Inngest Month-Advance Worker Handoff

## Status

implemented

## Lane

normal

## Product Contract

The first Inngest month-advance worker boundary is available at the App Router `/api/inngest` route. It accepts the bounded `app/month.advance.requested` event, parses event data into the existing shared month-advance processing request, maps valid live or auto trigger metadata to the existing worker-safe job receipt envelope, and rejects malformed event data through the existing shared processing validation failure envelope. The protected instructor live month-advance server action now dispatches valid manual/live requests into that same bounded Inngest handoff before returning the browser-safe receipt.

This story implements a non-UI worker-provider handoff slice plus the first live server-action dispatch into that handoff. It does not implement durable class discovery, Vercel cron scheduling, order execution, ledger writes, class-month persistence, realtime publication, hosted Inngest execution proof, or provider-backed E2E proof.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- Add the Inngest SDK as the selected worker provider dependency for the approved MVP stack.
- Expose `/api/inngest` through `inngest/next` with the month-advance requested function registered.
- Map a shared processing request to an `app/month.advance.requested` event with deterministic class/month idempotency metadata.
- Preserve both live/manual and auto/scheduled trigger metadata on the same shared worker event path.
- Parse unknown Inngest event data before creating a worker job receipt.
- Return the existing worker-safe month-advance job result envelope for valid event data.
- Reject malformed event data with a shared-processing-safe validation failure envelope.
- Keep event, worker receipt, and failure payloads free of fund inputs, ledger drafts, database rows, realtime payloads, and processed month results.
- Dispatch valid protected instructor live month-advance server-action requests into the bounded Inngest handoff before returning the browser-safe accepted receipt.

## Design Notes

- Provider route: `app/api/inngest/route.ts` serves the registered Inngest function.
- Provider client and function: `app/infrastructure/inngest/month-advance.ts` owns the Inngest client, event mapping, injectable handoff sender, event-data parser, and worker result mapping.
- Domain rules: existing `app/domain/classes/month-advancement.ts` factories remain the source of validation, idempotency, worker job, and worker receipt semantics.
- Trigger convergence: this slice proves live/manual and auto/scheduled trigger metadata can enter the same bounded Inngest event path and wires the protected live server action to dispatch valid manual/live requests into that handoff. Vercel cron discovery remains pending.
- Tables: no migration changes; class-month persistence, ledger persistence, and processed order writes remain pending.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/infrastructure/inngest/month-advance.test.ts` covers event mapping, live/auto convergence, live server-action handoff convergence, event-data parsing, safe worker receipt delivery, and safe validation failure delivery. |
| Integration | Planned; hosted/local Inngest execution and durable database processing remain pending. |
| E2E | Planned; provider-backed trigger-to-worker browser proof remains pending. |
| Platform | Planned; Vercel cron and hosted Inngest route proof remain pending. |
| Release | `npm run validate:quick` and `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, and matrix evidence.

## Evidence

- Selected Full-Stack MVP Sprint Sequence item 7: Inngest month-advance processing and Vercel cron/live trigger convergence.
- Non-UI slice: first bounded Inngest provider route and month-advance requested function now map parsed shared processing requests to worker-safe receipt envelopes.
- Follow-up non-UI slice: protected instructor live month-advance server action now dispatches valid manual/live requests into the same bounded Inngest handoff before returning the browser-safe receipt; UI copy now reflects the handoff while keeping worker jobs, ledger drafts, realtime payloads, and processed month results out of browser delivery.
- `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` — passed with 1 test file and 7 tests.
- Latest sprint validation: `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` — passed with 1 test file and 7 tests.
- `npm run validate:quick` — passed with 42 test files and 483 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`.
- `npm run build` — passed and listed `/api/inngest` as a dynamic App Router route.
