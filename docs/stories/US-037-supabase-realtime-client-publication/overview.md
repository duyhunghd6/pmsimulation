# US-037 Supabase Realtime Client Publication

## Current Behavior

The repository has pure TypeScript descriptors for provider-neutral realtime publication, Supabase Realtime broadcast metadata, subscription metadata, authorized current-turn refetch plans, authorized current-turn query descriptors, and authorized current-turn query result envelopes. It now also has a first bounded injected server-only Supabase Realtime publication boundary at `app/infrastructure/realtime/supabase-publication.ts` that maps the accepted descriptor to a typed broadcast message and returns safe publication result or failure envelopes. US-089 separately adds the first browser-visible subscription/refetch status UI with parse-first refresh-only payload validation. Hosted Supabase Realtime execution, provider-backed auth/RLS proof, server query execution after refetch, runtime configuration for publication credentials, and platform publication proof remain unwired.

## Target Behavior

After this story is implemented, a completed month-advance refresh signal can be published through an actual Supabase Realtime broadcast path for class participants, while preserving refresh-only payload semantics and relying on server-scoped authorization for subsequent current-turn refetches and query execution.

## Affected Users

- Students connected to a class during month advancement.
- Instructors controlling or observing a class during month advancement.

## Affected Product Docs

- `docs/product/user-surfaces.md`
- `docs/product/runtime-architecture.md`
- `docs/product/simulation-engine.md`
- `docs/product/data-model.md`
- `docs/product/roles-and-permissions.md`

## Non-Goals

- Do not add browser UI refetch execution or server query execution in this story.
- Do not add database migrations or RLS policies in this story unless a confirmed implementation plan includes their proof boundary.
- Do not replace the provider-neutral descriptor contracts from US-028, US-031, US-035, US-036, US-040, or US-041.

## Implementation Evidence

This sprint implemented the first bounded server-only publication boundary using an injected Supabase Realtime client shape instead of constructing hosted provider credentials. The publisher consumes only `SupabaseRealtimePublicationDescriptor`, sends a typed `month_advance_refresh_available` broadcast message to the descriptor channel, maps `ok`, `timed out`, `error`, invalid acknowledgements, and thrown provider failures into safe result/failure envelopes, and does not return gameplay payloads, query results, provider clients, provider errors, or provider secrets.

Remaining US-037 work is still blocked until a selected slice adds hosted Supabase Realtime client construction, server-only publication credential/runtime configuration, class-participant authorization proof, live server query execution after refetch, and provider/integration/E2E/platform proof. Browser-visible subscription/refetch status UI is now tracked in US-089, but hosted provider proof remains pending.
