# US-037 Supabase Realtime Client Publication

## Current Behavior

The repository has pure TypeScript descriptors for provider-neutral realtime publication, Supabase Realtime broadcast metadata, subscription metadata, and authorized current-turn refetch plans. No Supabase SDK client, auth boundary, RLS proof, runtime configuration, server action, worker, or platform publication code exists.

## Target Behavior

After this story is implemented, a completed month-advance refresh signal can be published through an actual Supabase Realtime broadcast path for class participants, while preserving refresh-only payload semantics and relying on server-scoped authorization for subsequent current-turn refetches.

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

- Do not add browser UI refetch execution in this story.
- Do not add database migrations or RLS policies in this story unless a confirmed implementation plan includes their proof boundary.
- Do not replace the provider-neutral descriptor contracts from US-028, US-031, US-035, or US-036.

## Sprint Blocker

Implementation is blocked in this sprint because the repository has no Supabase client boundary, environment contract, auth/session model, RLS proof harness, or selected runtime surface for publishing. Scaffolding those pieces ad hoc would violate the harness rule against broad platform shells and would cross external-provider and authorization hard gates without a confirmed high-risk implementation plan.
