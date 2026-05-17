# Test Matrix

This file maps product behavior to proof.

Product behavior is now defined from the accepted Apex Alpha PRD. Executable proof is currently limited to pure domain rules; do not mark broader app, integration, E2E, or platform rows implemented until tests or validation evidence exist.

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
| US-002 TARA tax-drag preview | `docs/product/simulation-engine.md`, `docs/product/user-surfaces.md`, `docs/product/data-model.md` | yes | no | no | no | implemented | `docs/stories/US-002-tara-tax-drag-preview.md`; `npm run validate:quick` |
| US-003 TARA order draft | `docs/product/simulation-engine.md`, `docs/product/data-model.md`, `docs/product/user-surfaces.md` | yes | no | no | no | implemented | `docs/stories/US-003-tara-order-draft.md`; `npm run validate:quick` |
| US-004 TARA liquidity penalty | `docs/product/simulation-engine.md`, `docs/product/data-model.md`, `docs/product/user-surfaces.md` | yes | no | no | no | implemented | `docs/stories/US-004-tara-liquidity-penalty.md`; `npm run validate:quick` |
| US-005 TARA turn attribution summary | `docs/product/simulation-engine.md`, `docs/product/data-model.md`, `docs/product/user-surfaces.md` | yes | no | no | no | implemented | `docs/stories/US-005-tara-turn-attribution-summary.md`; `npm run validate:quick` |
| E00 Data, auth, and tenancy foundation | `docs/product/roles-and-permissions.md`, `docs/product/data-model.md` | planned | planned | no | no | planned | Candidate epic only; no story packet yet |
| US-006 Tracked simulation metrics catalog | `docs/product/simulation-engine.md`, `docs/product/data-model.md`, `docs/product/user-surfaces.md` | yes | no | no | no | implemented | `docs/stories/US-006-tracked-simulation-metrics-catalog.md`; `npm run validate:quick` |
| US-007 Student macro news snapshot | `docs/product/user-surfaces.md`, `docs/product/simulation-engine.md`, `docs/product/data-model.md`, `docs/product/roles-and-permissions.md` | yes | no | no | no | implemented | `docs/stories/US-007-student-macro-news-snapshot.md`; `npm run validate:quick` |
| US-008 Current-turn Driver/String dashboard | `docs/product/user-surfaces.md`, `docs/product/simulation-engine.md`, `docs/product/data-model.md`, `docs/product/roles-and-permissions.md` | yes | no | no | no | implemented | `docs/stories/US-008-current-turn-driver-string-dashboard.md`; `npm run validate:quick` |
| US-009 Student portfolio pyramid snapshot | `docs/product/user-surfaces.md`, `docs/product/data-model.md`, `docs/product/simulation-engine.md` | yes | no | no | no | implemented | `docs/stories/US-009-student-portfolio-pyramid-snapshot.md`; `npm run validate:quick` |
| US-010 MVP Asset DNA catalog | `docs/product/simulation-engine.md`, `docs/product/data-model.md` | yes | no | no | no | implemented | `docs/stories/US-010-mvp-asset-dna-catalog.md`; `npm run validate:quick` |
| US-011 MVP asset-tier return calculation | `docs/product/simulation-engine.md`, `docs/product/data-model.md` | yes | no | no | no | implemented | `docs/stories/US-011-mvp-asset-tier-return-calculation.md`; `npm run validate:quick` |
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
