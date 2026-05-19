# US-039 Release Validation and Deployment Proof

## Current Behavior

The repository has pure TypeScript/domain validation through `npm run validate:quick`, a bounded Next.js App Router shell, route smoke, build proof, a local non-deploying release evidence command captured by US-094, and a non-deploying CI workflow captured by US-095 that runs the local release proof. It has no hosted CI run proof, deployment environment, Vercel project boundary, Supabase project boundary, provider secrets contract, hosted platform smoke command, provider-backed E2E suite, or complete hosted release validation path.

## Target Behavior

After this story is implemented, the project has an accepted release proof path that can verify the deployable application, platform configuration, provider integrations, and runtime smoke checks before release. Release proof must not replace the existing unit, integration, or E2E validation ladder; it should aggregate already-existing lower-layer proof and add platform checks only after an app/runtime exists.

## Affected Users

- Instructors and students who rely on stable classroom simulations.
- Operators or maintainers responsible for release readiness.

## Affected Product Docs

- `docs/product/runtime-architecture.md`
- `docs/product/user-surfaces.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Do not add deploying CI steps, deployment automation, Vercel configuration, Supabase configuration, or provider secrets in this story until the remaining integration, E2E, hosted provider, and deployment boundaries exist.
- Do not mark release, platform, integration, or E2E proof implemented without executable evidence.
- Do not weaken existing `npm run validate:quick` expectations for pure domain slices.

## Sprint Blocker

Implementation remains blocked in this sprint because there is no deployable application surface, platform configuration, CI runner, provider environment, integration suite, E2E suite, platform smoke command, or release evidence format to validate. Adding those ad hoc would scaffold broad platform shells and cross external-provider/platform gates before the lower-layer app, auth, database, worker, and realtime stories are unblocked.

This sprint reselected US-039 after confirming the remaining E04 implementation path still depends on blocked US-038 auth/tenancy and US-037 Supabase Realtime provider boundaries. It stopped at blocker refinement; no CI, deployment automation, Vercel, Supabase, worker, realtime provider, browser app, server runtime, or release command was introduced.
