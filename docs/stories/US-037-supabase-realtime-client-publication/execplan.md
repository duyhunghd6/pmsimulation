# Exec Plan

## Goal

Publish the existing refresh-only month-advance signal through Supabase Realtime without sending gameplay data through realtime and without bypassing future server-scoped authorization for current-turn refetches.

## Scope

In scope:

- A Supabase Realtime publication boundary that consumes `SupabaseRealtimePublicationDescriptor`.
- Environment and channel naming contract needed by the publisher.
- Integration proof that the broadcast payload remains refresh-only.
- Preservation of the US-040/US-041 server-query handoff and result envelope; realtime publication must not execute current-turn queries or carry query results.
- Failure handling for provider publication errors at the application boundary.

Out of scope:

- Browser UI subscription/refetch execution.
- Server query execution for authorized current-turn surfaces.
- Worker provider selection or worker execution.
- Database schema design unrelated to realtime authorization proof.
- Weakening the existing refresh-only realtime payload contract.

## Risk Classification

Risk flags:

- Authorization.
- External systems.
- Public contracts.
- Weak proof.
- Multi-domain.

Hard gates:

- Authorization.
- External provider behavior.

Lane: high-risk.

## Work Phases

1. Confirm the runtime surface that owns publication after month processing.
2. Define the Supabase client and environment boundary without leaking service credentials to the browser.
3. Add the smallest publisher implementation against the accepted descriptor contract.
4. Add integration proof for channel/event mapping and refresh-only payload semantics.
5. Add authorization/RLS proof or explicitly split that prerequisite into an earlier story.
6. Run quick and provider/integration validation.
7. Update story, product docs, test matrix, and decisions if architecture changes.

## Stop Conditions

Pause for human confirmation if:

- The implementation requires introducing Supabase SDK dependencies or runtime env names.
- The publication surface would run in a browser or any context that could expose server credentials.
- RLS or class-participant authorization cannot be proven in the same slice.
- Validation requirements would need to be weakened.
- The worker/provider architecture decision changes.
