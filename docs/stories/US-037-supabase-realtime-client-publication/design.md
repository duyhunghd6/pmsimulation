# Design

## Domain Model

Use the existing `SupabaseRealtimePublicationDescriptor` as the input contract. The descriptor already carries class channel, broadcast event, audience, delivery semantics, idempotency metadata, and refresh-only payload fields. The downstream US-040 `RealtimeAuthorizedCurrentTurnQueryDescriptor` and US-041 query result envelope remain the future server-query handoff and are not realtime payloads.

## Application Flow

A future month-processing completion handler should create the turn-completion event, derive the refresh signal, wrap it in the provider-neutral publication envelope, map it to the Supabase publication descriptor, and pass that descriptor to the server-only publisher. The first publisher boundary is injected with a Supabase Realtime client shape so unit proof can cover channel and acknowledgement behavior without hosted provider credentials. Subscription, refetch, and server-query descriptors remain separate contracts that clients and server query surfaces use after the broadcast is received.

## Interface Contract

The publisher accepts a typed descriptor and returns either a safe publication result containing the publication key, channel name, broadcast event name, and successful provider acknowledgement, or a safe failure envelope containing an allowlisted failure code and acknowledgement. It does not accept arbitrary gameplay payloads and does not return provider errors, provider clients, server query results, ledger drafts, fund processing keys, or aggregate financial totals.

## Data Model

No new durable table is selected in this sprint. If publication attempts require auditability or retry state, that persistence requirement should be split or confirmed before implementation.

## UI / Platform Impact

The publisher must be server-only. Browser clients continue to receive a refresh signal and then refetch authorized current-turn surfaces through server-scoped paths; they do not receive holdings, ledger drafts, fund processing keys, aggregate financial totals, or future scenario rows through realtime.

## Observability

Future implementation should log one publication attempt with publication key, class id, channel, event, outcome, and duration. It must not log gameplay payloads or credentials.

## Alternatives Considered

1. Implement Supabase publication immediately in the pure domain layer. Rejected because domain code must not depend on provider SDKs.
2. Add a broad realtime platform scaffold. Rejected because the selected story needs a narrow server-only publication boundary, not a full app shell.
3. Keep only descriptors for now. Rejected for this sprint because a narrower injected publication boundary could be proven without hosted runtime credentials, subscription execution, or server-query execution.
