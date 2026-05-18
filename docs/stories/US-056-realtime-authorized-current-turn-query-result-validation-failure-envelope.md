# US-056 Realtime Authorized Current-Turn Query Result Validation Failure Envelope

## Status

implemented

## Lane

normal

## Product Contract

When a future server-scoped realtime current-turn query result cannot wrap the requested student or instructor dashboard snapshot because an already-authorized snapshot is missing or does not match the refreshed class/month scope, the pure-domain boundary emits a validation failure envelope instead of returning dashboard snapshots, provider payloads, database rows, or gameplay execution details.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/simulation-engine.md`
- `docs/product/runtime-architecture.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- Missing student or instructor current-turn dashboard snapshots are represented as validation errors in a server-query-result validation failure envelope.
- Dashboard snapshots whose class or current month does not match the query descriptor are represented as validation errors in the same envelope.
- The failure envelope preserves descriptor scope, month, idempotency, and refresh metadata while excluding wrapped snapshots, database rows, Supabase clients, ledger drafts, fund processing keys, aggregate financial totals, and UI/provider execution details.
- A validation failure envelope is not created for a valid query result that can be wrapped by `US-041`.

## Design Notes

- Commands: none.
- Queries: pure descriptor/result boundary only; no server query execution.
- API: no route or server action added.
- Tables: none.
- Domain rules: reuses the existing `RealtimeAuthorizedCurrentTurnQueryDescriptor` and query result validation errors.
- UI surfaces: none; future clients still refetch authorized current-turn surfaces after realtime refresh.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/domain/classes/realtime-query-result.test.ts` covers missing snapshots, mismatched scope, safe payload exclusions, and valid-result rejection. |
| Integration | Not required; no auth, RLS, database, or provider client exists in this slice. |
| E2E | Not required; no browser surface exists in this slice. |
| Platform | Not required; no Supabase/Vercel/provider execution exists in this slice. |
| Release | Not required for this pure-domain story. |

## Harness Delta

No harness changes were needed.

## Evidence

- `npm run validate:quick` passed with 24 test files and 241 tests.
