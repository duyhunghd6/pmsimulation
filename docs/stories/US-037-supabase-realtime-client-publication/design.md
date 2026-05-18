# Design

## Domain Model

Use the existing `SupabaseRealtimePublicationDescriptor` as the input contract. The descriptor already carries class channel, broadcast event, audience, delivery semantics, idempotency metadata, and refresh-only payload fields. The downstream US-040 `RealtimeAuthorizedCurrentTurnQueryDescriptor` and US-041 query result envelope remain the future server-query handoff and are not realtime payloads.

## Application Flow

A future month-processing completion handler should create the turn-completion event, derive the refresh signal, wrap it in the provider-neutral publication envelope, map it to the Supabase publication descriptor, and pass that descriptor to a server-only publisher. Subscription, refetch, and server-query descriptors remain separate contracts that clients and server query surfaces use after the broadcast is received.

## Interface Contract

The publisher should accept a typed descriptor and return a publication result containing the publication key, channel name, broadcast event name, and provider acknowledgement or provider error. It must not accept arbitrary gameplay payloads.

## Data Model

No new durable table is selected in this sprint. If publication attempts require auditability or retry state, that persistence requirement should be split or confirmed before implementation.

## UI / Platform Impact

The publisher must be server-only. Browser clients continue to receive a refresh signal and then refetch authorized current-turn surfaces through server-scoped paths; they do not receive holdings, ledger drafts, fund processing keys, aggregate financial totals, or future scenario rows through realtime.

## Observability

Future implementation should log one publication attempt with publication key, class id, channel, event, outcome, and duration. It must not log gameplay payloads or credentials.

## Alternatives Considered

1. Implement Supabase publication immediately in the pure domain layer. Rejected because domain code must not depend on provider SDKs.
2. Add a broad realtime platform scaffold. Rejected because the selected story needs a narrow server-only publication boundary, not a full app shell.
3. Keep only descriptors for now. Accepted for this sprint because provider publication is blocked by missing runtime, auth, and validation boundaries.
