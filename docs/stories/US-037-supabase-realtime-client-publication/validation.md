# Validation

## Proof Strategy

This story cannot be implemented until provider and authorization boundaries exist. When unblocked, proof must show that Supabase publication uses the accepted descriptor contract, sends only refresh metadata, and does not weaken class-participant authorization, current-turn refetch rules, or the US-040/US-041 server-query handoff and result envelope.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Publisher input/result mapping preserves descriptor channel, event, delivery semantics, idempotency key, and refresh-only payload fields without executing US-040 server queries or carrying US-041 result envelopes. |
| Integration | Supabase broadcast uses the expected class channel and event; rejected or unauthorized publication paths are handled without leaking provider credentials or query results. |
| E2E | Connected class participant receives refresh trigger and refetches authorized current-turn surface only after server authorization exists. |
| Platform | Runtime environment keeps Supabase service credentials server-only and available only to the publication surface. |
| Performance | Publication path does not block month processing beyond the accepted worker/application boundary. |
| Logs/Audit | Publication logs include key metadata and outcome but no gameplay payloads or secrets. |

## Fixtures

- A deterministic `SupabaseRealtimePublicationDescriptor` from US-031.
- A deterministic `RealtimeAuthorizedCurrentTurnQueryDescriptor` from US-040 and query result envelope from US-041 for the post-refetch server-query handoff.
- A class participant fixture for an authorized subscription path.
- A non-participant fixture for authorization failure proof after auth/RLS exists.

## Commands

```text
npm run validate:quick
TBD: provider/integration validation command after Supabase boundary exists
```

## Acceptance Evidence

Blocked in this sprint. US-040, US-041, and US-056 now supply the server-query handoff descriptor, result envelope, and validation-failure envelope, but no provider code, auth/RLS proof, server query execution, or provider validation command exists yet. This sprint refreshed the blocker evidence after confirming no smaller unblocked E04 pure-domain or descriptor slice remains, intentionally did not add provider, auth, RLS, server query, UI, worker, or platform code, and `npm run validate:quick` passed with 24 test files and 244 tests.
