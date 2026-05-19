# US-091 Inngest Class-Month Processing Executor

## Status

implemented

## Lane

normal

## Product Contract

The first bounded Inngest-side class-month processing executor can consume unknown `app/month.advance.requested` event data, parse it into the existing shared month-advance processing request, load class fund processing inputs through an injected reader, create the existing class-month processing result, persist the result through an injected writer, and return only a worker-safe completion event plus a safe persistence receipt.

This story implements a non-UI injected processing slice. It does not implement live Supabase class/fund reads, live Supabase ledger writes, durable class discovery, hosted Inngest execution proof, realtime publication dispatch, processed-order database mutation, provider-backed E2E proof, or platform proof.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- Parse unknown Inngest event data before processing class-month inputs.
- Load class fund processing inputs only through an injected worker reader.
- Create class-month processing results with the existing deterministic domain processor.
- Reject invalid fund inputs through the existing class-month-processing-safe validation failure envelope.
- Persist successful class-month processing results through an injected worker writer.
- Return only the aggregate turn-completion event and safe persistence receipt to the worker boundary.
- Keep worker results free of fund inputs, ledger drafts, database rows, provider payloads, provider errors, provider clients, secrets, and browser-visible gameplay payloads.

## Design Notes

- `app/infrastructure/inngest/month-advance.ts` now exports `executeMonthAdvanceClassMonthProcessingFromInngestEventData` with injected reader and writer boundaries.
- The executor reuses `createClassMonthAdvanceProcessingResult`, `createClassMonthAdvanceProcessingValidationFailureEnvelope`, and `createMonthAdvanceTurnCompletionEvent` from `app/domain/classes/month-advancement.ts`.
- The existing `/api/inngest` provider handoff remains bounded to safe job receipts; hosted runtime wiring, durable database adapters, and realtime dispatch remain separate future slices.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/infrastructure/inngest/month-advance.test.ts` covers event parsing, injected reader use, injected writer persistence, safe aggregate completion delivery, and invalid fund-input rejection before persistence. |
| Integration | Planned; live Supabase class/fund reads and ledger writes remain pending. |
| E2E | Planned; provider-backed trigger-to-processing browser proof remains pending. |
| Platform | Planned; hosted Inngest and Vercel runtime proof remain pending. |
| Release | `npm run validate:quick` and `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, sprint log, and matrix evidence.

## Evidence

- Selected Full-Stack MVP Sprint Sequence item 7: Inngest month-advance processing and Vercel cron/live trigger convergence with idempotent class-month processing.
- Required sequence preflight and non-UI gate recorded in `.claude/sprint-runs/round-161-20260519-class-month-processing.log`.
- Non-UI slice: `executeMonthAdvanceClassMonthProcessingFromInngestEventData` parses event data, reads class fund inputs through an injected reader, creates deterministic class-month processing results, persists through an injected writer, and returns only an aggregate turn-completion event plus a safe persistence receipt.
- `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` — passed with 1 test file and 10 tests.
- `npm run validate:quick` — passed with 42 test files and 486 tests.
- `npm run build` — passed and listed `/api/inngest` plus `/api/cron/month-advance` as dynamic App Router routes.
