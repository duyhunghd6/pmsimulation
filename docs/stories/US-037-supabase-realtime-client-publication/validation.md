# Validation

## Proof Strategy

The first bounded publisher slice is implemented with an injected provider client and unit proof. Remaining provider and authorization proof must show that hosted Supabase publication uses the accepted descriptor contract, sends only refresh metadata, and does not weaken class-participant authorization, current-turn refetch rules, or the US-040/US-041 server-query handoff and result envelope.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Publisher input/result mapping preserves descriptor channel, event, delivery semantics, idempotency key, and refresh-only payload fields without executing US-040 server queries or carrying US-041 result envelopes; provider acknowledgement failures return safe envelopes without provider errors or secrets. |
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
npm run test:unit -- app/infrastructure/realtime/supabase-publication.test.ts
npm run validate:quick
TBD: provider/integration validation command after hosted Supabase publication exists
```

## Acceptance Evidence

This sprint added `app/infrastructure/realtime/supabase-publication.ts` and `app/infrastructure/realtime/supabase-publication.test.ts` as the first bounded injected server-only Supabase Realtime publication boundary. `npm run test:unit -- app/infrastructure/realtime/supabase-publication.test.ts` passed with 1 test file and 5 tests, proving descriptor-to-broadcast mapping, requested channel use, refresh-only payload/result semantics, timeout/error acknowledgement mapping, invalid acknowledgement handling, and thrown provider failure handling without leaking provider errors or secrets. `npm run validate:quick` passed with 41 test files and 479 tests. US-089 now covers the first browser-visible subscription/refetch status UI and parse-first payload validation. Hosted Supabase publication/subscription proof, server query execution after refetch, auth/RLS/provider integration proof, E2E, and platform proof remain pending.
