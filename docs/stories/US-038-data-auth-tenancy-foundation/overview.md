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

## Approved Implementation Direction

The human approved the full-stack MVP implementation track on 2026-05-18, including the first US-038 provider-backed proof slice. This story is no longer blocked on generic permission to introduce Supabase, Drizzle, RLS, local integration fixtures, or an auth-tenancy integration command.

Approved foundation choices:

- Supabase Auth JWT claims are the trusted student/instructor session source.
- Local Supabase is the first executable proof harness.
- Supabase RLS is the primary persisted authorization boundary, supported by parse-first server guards.
- Drizzle schema/migrations may cover the minimum tenancy and gameplay tables needed to prove class isolation, own-fund access, future-row denial, other-student holding denial, instructor God Mode access, and unowned-class rejection.
- The first dedicated integration proof command should be `npm run test:integration:auth-tenancy`.
- Browser UI, month-advance worker execution, realtime provider publication, CI, deployment, and hosted production resources remain out of scope for this story.
