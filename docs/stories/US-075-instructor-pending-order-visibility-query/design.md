# Design

## Domain Model

Reuse the existing `InstructorPendingOrderVisibilitySnapshot` and query result envelope. Add infrastructure row parsers for instructor-scoped class fund rows and status-only TARA order rows so the executor can build the snapshot from parsed rows instead of raw database payloads.

## Application Flow

`executeInstructorPendingOrderVisibilityQuery` validates the session role and month scope, creates the existing descriptor, asks an injected row reader for class fund and order status rows, parses every row against the instructor class/month boundary, builds the status-only snapshot, and wraps it in the existing query result envelope.

## Interface Contract

The executor returns either the existing `instructor_pending_order_visibility_query_result` envelope or a typed failure with `invalid_role`, `missing_month_scope`, row rejection, snapshot validation, or result-envelope failure codes. Returned payloads exclude target weights, estimated tax drag, order details, raw database rows, provider clients, and UI state.

## Data Model

No schema or migration changes. The executor assumes future provider code will supply RLS-backed `funds` rows scoped to the instructor class and status-only `tara_orders` rows for the class current month.

## UI / Platform Impact

No browser UI, route, platform, worker, realtime, or hosted provider integration is added in this slice.

## Observability

No new log or audit record shape is introduced. Existing safe authorization event contracts remain unchanged.

## Alternatives Considered

1. Compose the full instructor dashboard server query in one sprint. Rejected to keep this slice small and prove one status-only instructor surface first.
2. Return order target weights for richer instructor visibility. Rejected because the pending-order surface contract is status-only and target weights remain out of scope for this story.
