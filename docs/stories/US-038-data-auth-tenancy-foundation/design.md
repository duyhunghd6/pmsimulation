# Design

## Domain Model

The foundation must preserve the existing product roles and core identifiers: class, instructor, student, fund, macro narrative, market metric, holding, TARA order, and ledger. A class remains the primary tenant boundary. Students may access their own fund state and current/past class scenario data; instructors may access scoped class management and God Mode surfaces for classes they administer.

## Application Flow

Future server queries and commands should parse unknown session claims and request inputs before calling application code. Student query paths should require a viewer identity, class scope, and fund ownership. Instructor query paths should require instructor identity and class administration scope. Month-advance and realtime stories should depend on these server-scoped boundaries rather than carrying authorization assumptions in provider payloads.

## Interface Contract

The first implementation should expose only narrow server-side query/command contracts needed for proof, not public browser routes. Contracts should return typed allowed/forbidden outcomes for:

- Student reads of own fund state.
- Student reads of permitted current/past scenario rows.
- Rejection of future scenario rows.
- Rejection of other-student exact holdings.
- Instructor reads of owned class data and God Mode holdings.
- Rejection of instructor access to unowned classes.

## Data Model

Minimum durable entities likely include classes, class memberships or enrollment, funds, asset holdings, macro narratives or scenario rows, and instructor ownership/admin links. The exact schema, indexes, Drizzle representation, migrations, and RLS policies must be confirmed before implementation because this story owns the product's security foundation.

## UI / Platform Impact

No UI or deployment shell should be introduced solely for this story. Any Supabase credentials or service-role behavior must be server-only. Browser clients should receive data only through authorized server-scoped query paths once an app runtime exists.

## Observability

Future implementation should distinguish operational logs from audit records. Authorization failures should be observable without logging credentials, exact unauthorized holdings, future scenario payloads, or other sensitive gameplay data.

## Alternatives Considered

1. Implement pure-domain authorization descriptors only. Rejected for this story because E00 requires actual backend enforcement proof, not another descriptor layer.
2. Scaffold a broad Next.js/Supabase application shell. Rejected because the selected foundation should introduce only the runtime and schema pieces needed to prove tenancy and role-scoped access.
3. Keep E00 unsliced. Rejected for this sprint because US-037 and future provider/client work need a durable blocker and prerequisite story to reference.
