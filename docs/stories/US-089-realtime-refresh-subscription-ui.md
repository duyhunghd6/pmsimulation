# US-089 Realtime Refresh Subscription UI

## Status

implemented

## Lane

normal

## Product Contract

The first browser-visible Supabase Realtime refresh subscription panel is rendered on the protected student and instructor dashboards. It uses the existing refresh-only Supabase subscription and authorized current-turn refetch descriptors, validates unknown broadcast payloads against the class/month/idempotency scope before any refresh, and calls `router.refresh()` only after accepting a refresh-only payload.

This story implements a bounded browser UI and client subscription/refetch slice. It does not implement hosted Supabase Realtime publication proof, provider-backed browser authentication proof, live database-backed server query execution after refetch, worker-to-realtime dispatch, E2E proof, deployment proof, or processed live month execution.

## Relevant Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`

## Acceptance Criteria

- Render a reachable Realtime refresh status panel on protected `/dashboard` and `/instructor/dashboard` surfaces.
- Build the panel from the existing month-advance refresh signal, Supabase publication/subscription descriptors, authorized refetch plan, and authorized current-turn query descriptor.
- Parse unknown Supabase Realtime broadcast payloads before invoking an authorized route refresh.
- Reject malformed, cross-class, stale-month, wrong-total-month, wrong-idempotency, and non-refresh payloads before refetch.
- Keep the accepted browser payload refresh-only and free of gameplay payloads, ledger drafts, provider clients, raw database rows, aggregate financial totals, and secrets.
- Show a safe browser fallback when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing or invalid.
- Display loading, subscribed, provider-error, rejected-payload, refresh-requested, and configuration-missing states without exposing provider secrets.

## Design Notes

- `app/realtime-refresh-plan.ts` creates the server-side panel config from the existing domain descriptor chain and parses browser-safe Supabase public environment values.
- `app/realtime-refresh-panel.tsx` is a client component that subscribes to the descriptor channel/event with `@supabase/supabase-js`, validates broadcast payloads, and calls `router.refresh()` for accepted refresh-only broadcasts.
- `app/infrastructure/realtime/supabase-subscription.ts` owns the parse-first payload boundary used by the browser component and unit tests.
- `app/(student)/dashboard/page.tsx` and `app/(instructor)/instructor/dashboard/page.tsx` render the panel over the current bounded fixture-backed dashboard surfaces.
- The panel treats missing public Supabase browser configuration as a safe fallback state; it does not require hosted provider credentials to render.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `app/infrastructure/realtime/supabase-subscription.test.ts` covers accepted refresh-only payloads, malformed/cross-class/stale/wrong-idempotency rejections, and ignoring extra gameplay/provider fields. |
| Integration | Planned; hosted Supabase subscription execution and live server query refetch remain pending. |
| E2E | Planned; provider-backed browser auth plus realtime broadcast-to-refresh proof remains pending. |
| Platform | Planned; hosted Supabase Realtime and deployment proof remain pending. |
| Release | `npm run validate:quick` and `npm run smoke:routes`. |

## Harness Delta

No harness changes were needed beyond updating story, backlog, product docs, and matrix evidence.

## Evidence

- Selected Full-Stack MVP Sprint Sequence item 8: Supabase Realtime turn-completion publication, subscription, and authorized client refetch.
- UI slice: protected student and instructor dashboards now render a browser-visible Realtime refresh status panel with safe public-env fallback.
- Parser slice: `parseSupabaseRealtimeRefreshPayload` accepts only scope-matched refresh-only metadata before router refresh and drops extra gameplay/provider fields.
- `npm run test:unit -- app/infrastructure/realtime/supabase-subscription.test.ts` — passed with 1 test file and 3 tests.
- `npm run typecheck` — passed.
- `npm run validate:quick` — passed with 42 test files and 482 tests.
- `npm run smoke:routes` — passed for `/`, `/login`, `/dashboard`, and `/instructor/dashboard`.
