# US-030 Instructor Live Month-Advance Control Snapshot

## Status

implemented

## Lane

normal

## Product Contract

Instructors can view whether an already-scoped class can currently use the live Fast-Forward Month action. The MVP pure-domain slice returns an enabled control only for manual classes that have not reached the final simulation month, includes the next month and deterministic request idempotency key when enabled, and returns disabled reasons for auto-mode or completed classes.

This story implements only the pure domain control snapshot. It does not implement UI, server actions, API routes, persistence, Supabase, Drizzle, auth, RLS, workers, realtime, cron, order execution, ledger writes, or background processing.

## Relevant Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`

## Acceptance Criteria

- A pure TypeScript domain function creates an instructor live month-advance control snapshot with class id, trigger mode, current month index, optional next month index, total months, enabled state, disabled reason, and optional request idempotency key.
- Manual classes before the final simulation month return `canAdvance: true`, the next month index, and the deterministic class/month request idempotency key.
- Auto-mode classes return `canAdvance: false` with `auto_mode` and no request idempotency key.
- Completed manual classes return `canAdvance: false` with `simulation_complete` and no request idempotency key.
- The snapshot trims class ids and rejects blank ids, unknown trigger modes, invalid month indexes, and invalid total month counts.
- Unit tests cover enabled, disabled, invalid, and payload-minimization behavior.
- No auth, database, Supabase, worker, realtime, UI, API route, RLS, order-execution, ledger-persistence, or month-processing code is introduced.

## Design Notes

- Commands: none; this is pure domain status derivation before a future instructor command boundary.
- Queries: future instructor-scoped class query may use this shape after authorization has already enforced class ownership.
- API: none.
- Tables: none.
- Domain rules: live fast-forward is available only for manual classes that can advance exactly one month within the simulation calendar.
- UI surfaces: future instructor dashboard Fast-Forward Month control.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Vitest tests for enabled control, disabled states, invalid inputs, and absence of fund/ledger/worker/realtime payloads. |
| Integration | Not applicable; no boundary, database, provider, RLS, worker, or tenant integration in this slice. |
| E2E | Not applicable; no user surface in this slice. |
| Platform | Not applicable. |
| Release | `npm run validate:quick`. |

## Harness Delta

No harness changes were needed beyond updating story and matrix evidence.

## Evidence

- `npm run test:unit -- app/domain/classes/month-advancement.test.ts` — passed; 1 test file and 46 tests passed.
- `npm run validate:quick` — passed; 21 test files and 174 tests passed.
