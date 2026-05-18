# US-074 Student TARA Order Submission Action

## Current Behavior

The student dashboard can render a read-only TARA order-entry preview from parsed current-turn rows, and pure domain slices already define the pending-order receipt, server-action command descriptor, result envelope, and validation failure envelope. Before this story, no server-side execution boundary validated a submitted target allocation against authoritative current fund/holding/tracked-metric rows, called a persistence boundary, parsed the persisted pending order row, or returned the existing student-safe result envelope.

## Target Behavior

A bounded server-side student TARA order submission executor accepts one already-authenticated student session, class/fund/month scope, target weights, and an injected persistence store. It reads scoped current rows, rejects wrong roles, missing scope, existing pending orders, unsafe rows, invalid target allocations, and persisted-row mismatches, creates the existing safe command descriptor, calls the injected pending-order writer, parses the returned order row, and returns the existing student-safe accepted-pending-order receipt envelope.

## Affected Users

- Students submitting current-month TARA target allocations.

## Affected Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`

## Non-Goals

- Do not add live Supabase database writes, hosted provider setup, migrations, browser form wiring, realtime publication, worker execution, CI, deployment, or browser E2E proof in this slice.
- Do not alter processed order execution or month-advance behavior.
- Do not allow duplicate pending orders for the same student fund and month.
