# Test Matrix

This file maps product behavior to proof.

Product behavior is now defined from the accepted Apex Alpha PRD. The first executable proof is limited to the pure TARA allocation validator; do not mark any other row implemented until tests or validation evidence exist.

## Status Values

| Status | Meaning |
| --- | --- |
| planned | Accepted as intended behavior, not implemented |
| in_progress | Actively being built |
| implemented | Implemented and proof exists |
| changed | Contract changed after earlier implementation |
| retired | No longer part of the product contract |

## Matrix

| Story | Contract | Unit | Integration | E2E | Platform | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Spec intake | `SPEC.md`, `docs/product/*` | no | no | no | no | planned | `docs/stories/spec-intake-2026-05-16.md` |
| US-001 TARA allocation validation | `docs/product/simulation-engine.md`, `docs/product/data-model.md`, `docs/product/user-surfaces.md` | yes | no | no | no | implemented | `docs/stories/US-001-tara-allocation-validation.md`; `npm run validate:quick` |
| E00 Data, auth, and tenancy foundation | `docs/product/roles-and-permissions.md`, `docs/product/data-model.md` | planned | planned | no | no | planned | Candidate epic only; no story packet yet |
| Tracked simulation metrics catalog | `SPEC.md`, `docs/product/data-model.md`, `docs/product/simulation-engine.md`, `docs/product/user-surfaces.md` | planned | planned | planned | no | planned | Contract expanded from PRD tracked-metrics catalog; no story packet yet |
| E01 Student Bloomberg dashboard | `docs/product/user-surfaces.md`, `docs/product/simulation-engine.md` | planned | planned | planned | no | planned | Candidate epic only; no story packet yet |
| E02 Instructor management | `docs/product/roles-and-permissions.md`, `docs/product/user-surfaces.md` | planned | planned | planned | no | planned | Candidate epic only; no story packet yet |
| E03 Dual-trigger execution engine | `docs/product/simulation-engine.md`, `docs/product/runtime-architecture.md` | planned | planned | planned | planned | planned | Candidate epic only; no story packet yet |
| E04 Realtime and release proof | `docs/product/user-surfaces.md`, `docs/product/runtime-architecture.md` | no | planned | planned | planned | planned | Candidate epic only; no story packet yet |

## Evidence Rules

- Unit proof covers pure domain and application rules.
- Integration proof covers backend enforcement, data integrity, provider behavior, jobs, or service contracts.
- E2E proof covers user-visible browser flows.
- Platform proof covers only shell, deployment, mobile, desktop, or runtime behavior that cannot be proven in lower layers.
- A story can be implemented without every proof column if the story packet explains why.
