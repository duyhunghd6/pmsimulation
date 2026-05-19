# US-101 Month Advance Supabase Processing Store

## Status

implemented

## Lane

Worker-backed provider persistence slice

## Product Contract

The month-advance worker boundary now has a bounded Supabase-backed class-month processing store that implements the existing injected reader/writer contracts. The store reads class-scoped funds, asset holdings, pending current-month TARA orders, and tracked metrics into deterministic class-month processing inputs, then persists completed processing records by upserting `simulation_ledger`, updating `funds.current_aum`, marking pending `tara_orders` as `processed`, and advancing `classes.current_month_index`.

This slice does not claim hosted worker execution, live RLS write proof, durable auto-class discovery, or provider-backed browser proof. It narrows the item-7 persistence gap with a tested adapter that still needs runtime wiring through the hosted Inngest/Supabase execution path.

## Relevant Product Docs

- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- The Supabase month-processing store reads only class-scoped provider rows for the requested class and current month before class-month processing.
- Provider fund, holding, pending-order, and tracked-metric rows are parsed before use, with malformed rows rejected by safe generic errors.
- Pending TARA order target weights override current weights for processed funds; funds without pending orders retain current weights.
- Classroom sell concentration is derived from current weights plus pending current-month target weights across class funds.
- Completed class-month records write ledger rows idempotently by `(fund_id, month_index)`, update fund AUMs, mark matching pending orders processed, and advance only the expected class/month row.
- Provider read/write failures are sanitized and do not return provider errors, raw database rows, worker payloads, realtime payloads, auth sessions, provider clients, or secrets.
- Hosted Supabase write enforcement, RLS execution proof, runtime Inngest wiring, asset-holding rebalance mutation, durable auto-class discovery, and provider-backed E2E remain pending.

## Design Notes

- Commands: no npm scripts added.
- Reads: adds `createSupabaseMonthAdvanceClassMonthProcessingStore`, selecting `funds`, `asset_holdings`, pending `tara_orders`, and `tracked_metrics` through the injected Supabase client shape.
- Writes: upserts `simulation_ledger`, updates `funds`, updates pending `tara_orders`, and advances `classes` through the same injected Supabase client shape.
- API/UI: no route handler or browser UI changed in this slice.
- Runtime: the adapter is tested in isolation and is not yet wired into hosted Inngest execution.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Supabase month-processing store unit proof covers row-to-input mapping, sell concentration, parser rejection, ledger/order/fund/class mutations, and sanitized provider failures. |
| Integration | Not added; local Supabase RLS/write execution remains pending without provider runtime configuration. |
| E2E | Not added; no provider-backed browser order-processing flow exists yet. |
| Platform | Not added; no hosted Vercel, Supabase, Inngest, cron, realtime, or CI mutation was performed. |
| Release | Targeted unit tests; `npm run typecheck`; `npm run validate:quick`. |

## Evidence

- 2026-05-19 sprint: added `app/infrastructure/inngest/month-advance-supabase-store.ts` and unit proof in `app/infrastructure/inngest/month-advance-supabase-store.test.ts`.
- `npm run test:unit -- app/infrastructure/inngest/month-advance-supabase-store.test.ts` — passed with 1 test file and 4 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 48 test files and 509 tests.
