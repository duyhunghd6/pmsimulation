# US-075 Instructor Pending-Order Visibility Query

## Current Behavior

Instructor pending-order visibility has pure domain snapshots and query-boundary envelopes, and US-038 already parses instructor-owned class and God Mode holding rows. Before this story, no bounded server-side executor read instructor-scoped class fund and TARA order status rows, parsed them before delivery, and returned the existing status-only pending-order visibility result envelope.

## Target Behavior

A bounded instructor server-query executor accepts an authenticated instructor session, class/current-month scope, and an injected row reader. It rejects wrong roles or missing month scope before row access, parses instructor-scoped class fund rows and status-only TARA order rows, rejects cross-class or future-month rows, builds the existing pending-order visibility snapshot, and returns the existing instructor-safe result envelope without target weights, tax drag, order details, database rows, provider clients, or UI state.

## Affected Users

- Instructors monitoring current-month class submission status.

## Affected Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`

## Non-Goals

- Do not add protected instructor browser UI, live Supabase query clients, database migrations, order-detail visibility, target-weight visibility, worker dispatch, realtime publication, CI, deployment, or browser E2E proof in this slice.
- Do not change student order submission or month-advance behavior.
