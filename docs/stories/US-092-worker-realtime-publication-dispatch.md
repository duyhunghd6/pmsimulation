# US-092 Worker Realtime Publication Dispatch

## Status

implemented

## Lane

normal

## Product Contract

After bounded class-month processing persists, the worker-side executor derives the existing refresh-only realtime signal, maps it through the provider-neutral and Supabase Realtime publication descriptors, and publishes it through the existing injected server-only Supabase Realtime boundary.

This story implements a non-UI injected dispatch slice. It does not implement hosted Supabase Realtime credentials, hosted Inngest execution proof, live Supabase class/fund reads, live ledger writes, processed-order database mutation, live server query execution after refetch, provider-backed E2E proof, or deployment/platform proof.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- Publish only after class-month processing succeeds and the processing result is persisted through the injected writer.
- Derive realtime payloads from the aggregate turn-completion event, not from fund inputs or ledger drafts.
- Reuse the existing provider-neutral realtime publication envelope and Supabase Realtime publication descriptor.
- Dispatch through the existing injected server-only Supabase Realtime publisher boundary.
- Return safe publication success or failure envelopes without provider clients, provider errors, secrets, database rows, fund inputs, ledger drafts, aggregate financial totals in the payload, or browser-visible gameplay data.
- Do not publish when shared processing validation or class-month fund validation fails.

## Design Notes

- `app/infrastructure/inngest/month-advance.ts` now requires an injected `SupabaseRealtimeClient` for `executeMonthAdvanceClassMonthProcessingFromInngestEventData`.
- The executor creates `createMonthAdvanceRealtimeRefreshSignal`, `createMonthAdvanceRealtimePublicationEnvelope`, and `createSupabaseRealtimePublicationDescriptor` from the completed aggregate event before calling `publishSupabaseRealtimeRefresh`.
- A publication failure is returned as a safe nested realtime publication failure while the class-month processing result remains completed; hosted retry semantics remain a future provider/runtime slice.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/infrastructure/inngest/month-advance.test.ts` covers successful processing-to-publication dispatch, safe publication failure delivery, and no publication on invalid fund input. |
| Integration | Planned; hosted Supabase publication and live database-backed worker execution remain pending. |
| E2E | Planned; provider-backed browser auth plus realtime broadcast-to-refresh proof remains pending. |
| Platform | Planned; hosted Inngest, Supabase Realtime, and Vercel runtime proof remain pending. |
| Release | `npm run validate:quick` and `npm run build`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, sprint log, and matrix evidence.

## Evidence

- Selected Full-Stack MVP Sprint Sequence item 8: Supabase Realtime turn-completion publication, subscription, and authorized client refetch.
- Required sequence preflight and non-UI gate recorded in `.claude/sprint-runs/round-162-20260519-realtime-publication-dispatch.log`.
- Non-UI slice: `executeMonthAdvanceClassMonthProcessingFromInngestEventData` now persists successful class-month processing, derives a refresh-only Supabase Realtime publication descriptor from the aggregate turn-completion event, and dispatches through the existing injected server-only publisher.
- `npm run test:unit -- app/infrastructure/inngest/month-advance.test.ts` — passed with 1 test file and 11 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 42 test files and 487 tests.
- `npm run build` — passed.
