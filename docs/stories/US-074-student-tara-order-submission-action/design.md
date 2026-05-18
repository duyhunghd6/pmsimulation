# Design

## Domain Model

The slice reuses the existing student TARA order submission receipt, command descriptor, result envelope, and validation failure envelope from `app/domain/tara/order.ts`. Target weights remain valid only when Base/Core/Apex total exactly `100.0%`, and the authoritative tax-drag preview is derived from parsed current AUM, current holdings, and the Apex unrealized-gain tracked metric.

## Application Flow

`executeStudentTaraOrderSubmissionAction` receives a parsed student session, parsed class/fund/month scope, target weights, and an injected store. It rejects non-student roles and missing fund/month scope before data access. It then parses fund, holding, current pending order, and tracked-metric rows; rejects unsafe rows and existing pending orders; creates a receipt and command descriptor; invokes the injected pending-order writer; parses the persisted row with the existing student TARA order row parser; verifies the persisted row matches the command payload; and returns the safe server-action result envelope.

## Interface Contract

The executor returns either `StudentTaraOrderServerActionResultEnvelope` or an internal failure code. Invalid target allocations also carry the existing `StudentTaraOrderServerActionValidationFailureEnvelope` so callers can render student-safe validation feedback without echoing raw order payloads. Auth sessions, raw database rows, persisted order ids, worker payloads, realtime payloads, and processed execution details are excluded from successful student delivery.

## Data Model

No schema or migration changes are introduced. The injected persistence writer represents the future `tara_orders` pending-row insert boundary and must return a row shaped like the existing TARA order parser expects: class id, fund id, month index, target weights, tax-drag percentage, rebalance trigger, and pending status.

## UI / Platform Impact

No browser form wiring, route changes, provider client setup, worker, realtime, CI, deployment, or hosted platform configuration is added in this slice.

## Observability

No new logging surface is introduced. The executor keeps failure codes fixed and safe for future callers; denied authorization observability remains covered by the existing auth-tenancy safe authorization event contract.

## Alternatives Considered

1. Wire a real Supabase insert immediately. Rejected for this sprint because local/hosted provider runtime and `AUTH_TENANCY_DATABASE_URL` are still not configured, and the smallest safe slice is the parse-first execution boundary over an injected store.
2. Trust browser-supplied current weights and tax preview. Rejected because server validation must be authoritative and based on parsed current rows.
