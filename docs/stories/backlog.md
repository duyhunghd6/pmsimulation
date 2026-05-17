# Story Backlog

This backlog contains candidate epics derived from the accepted Apex Alpha PRD.

Do not create every possible story packet up front. Create story packets when work is selected or when a product decision needs a durable place to land.

## Candidate Epics

| Epic | Description | Status | Product docs |
| --- | --- | --- | --- |
| E00 Data, auth, and tenancy foundation | Establish authentication, class tenancy, RLS, scenario data, asset DNA, and base persistence contracts. | unsliced | `docs/product/roles-and-permissions.md`, `docs/product/data-model.md`, `docs/product/runtime-architecture.md` |
| E01 Student Bloomberg dashboard | Build student macro terminal, pyramid visualizer, TARA order entry, tax preview, rank view, and attribution report. | unsliced | `docs/product/user-surfaces.md`, `docs/product/simulation-engine.md` |
| E02 Instructor management | Build class creation, join links, God Mode portfolio visibility, live leaderboard, pending-order visibility, and aggregate analytics. | unsliced | `docs/product/roles-and-permissions.md`, `docs/product/user-surfaces.md` |
| E03 Dual-trigger execution engine | Build cron and instructor-triggered month advancement through the same idempotent background processing path. | unsliced | `docs/product/simulation-engine.md`, `docs/product/runtime-architecture.md` |
| E04 Realtime and release proof | Build realtime turn-completion refresh and establish the validation/deployment proof needed for release. | unsliced | `docs/product/user-surfaces.md`, `docs/product/runtime-architecture.md`, `docs/TEST_MATRIX.md` |

## First Story Candidates

- Establish Supabase auth, class tenancy, and student/instructor RLS boundaries.
- Seed deterministic macro narratives, market strings, tracked metrics, and asset DNA. First pure-domain Asset DNA catalog slice captured as `docs/stories/US-010-mvp-asset-dna-catalog.md`; first pure-domain asset-tier return slice captured as `docs/stories/US-011-mvp-asset-tier-return-calculation.md`.
- Implement the tracked simulation metrics catalog. Sliced as `docs/stories/US-006-tracked-simulation-metrics-catalog.md`.
- Implement the student current-month macro news terminal without exposing future rows. First domain snapshot slice captured as `docs/stories/US-007-student-macro-news-snapshot.md`.
- Implement the current-turn Driver/String metrics dashboard with no future metric leakage. First pure domain slice captured as `docs/stories/US-008-current-turn-driver-string-dashboard.md`.
- Implement the student portfolio pyramid visualizer. First pure domain snapshot slice captured as `docs/stories/US-009-student-portfolio-pyramid-snapshot.md`.
- Implement TARA target allocation validation. Sliced as `docs/stories/US-001-tara-allocation-validation.md`.
- Implement TARA tax-drag preview. Sliced as `docs/stories/US-002-tara-tax-drag-preview.md`.
- Implement TARA order submission. First domain slice captured as `docs/stories/US-003-tara-order-draft.md`.
- Implement TARA crowded-sell liquidity penalty. Sliced as `docs/stories/US-004-tara-liquidity-penalty.md`.
- Implement deterministic month-processing math and ledger attribution. First domain attribution slice captured as `docs/stories/US-005-tara-turn-attribution-summary.md`.
- Implement instructor class creation and join links.
- Implement instructor live month advancement.
- Implement Supabase Realtime turn-completion refresh.
