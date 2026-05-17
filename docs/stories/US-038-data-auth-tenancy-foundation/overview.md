# US-038 Data, Auth, and Tenancy Foundation

## Current Behavior

The repository has pure TypeScript domain slices and product contracts for class, fund, student, instructor, order, ledger, scenario, and realtime descriptor behavior. No Supabase project boundary, authentication/session model, database schema, RLS policy set, server query boundary, integration proof harness, or app runtime exists.

## Target Behavior

After this story is implemented, the product has a minimal Supabase-backed foundation that authenticates students and instructors, scopes gameplay records by class tenancy, enforces student and instructor access rules at the database/server boundary, and provides proof that future rows and other students' exact holdings are not exposed through unauthorized paths.

## Affected Users

- Students enrolled in a class simulation.
- Instructors administering one or more class simulations.

## Affected Product Docs

- `docs/product/roles-and-permissions.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/product/simulation-engine.md`

## Non-Goals

- Do not build student or instructor browser UI in this story.
- Do not implement month-advance worker execution or realtime provider publication in this story.
- Do not migrate historical data; no durable production data exists yet.
- Do not weaken current pure-domain contracts or mark integration proof implemented before it exists.

## Sprint Blocker

Implementation is blocked in this autonomous sprint because the slice crosses auth, authorization, data-model, audit/security, and external-provider hard gates. Proceeding would require selecting concrete Supabase schema/RLS/session boundaries, dependency/runtime configuration, integration fixtures, and proof commands. Scaffolding those pieces ad hoc would violate the harness rule against broad platform shells and the high-risk lane requirement to confirm ambiguous security and architecture boundaries before implementation.
