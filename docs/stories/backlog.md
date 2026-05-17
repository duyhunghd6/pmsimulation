# Story Backlog

This backlog contains candidate epics derived from the accepted Apex Alpha PRD.

Do not create every possible story packet up front. Create story packets when work is selected or when a product decision needs a durable place to land.

## Candidate Epics

| Epic | Description | Status | Product docs |
| --- | --- | --- | --- |
| E00 Data, auth, and tenancy foundation | Establish authentication, class tenancy, RLS, scenario data, asset DNA, and base persistence contracts. | in_progress | `docs/product/roles-and-permissions.md`, `docs/product/data-model.md`, `docs/product/runtime-architecture.md` |
| E01 Student Bloomberg dashboard | Build student macro terminal, pyramid visualizer, TARA order entry, tax preview, rank view, and attribution report. | in_progress | `docs/product/user-surfaces.md`, `docs/product/simulation-engine.md` |
| E02 Instructor management | Build class creation, join links, God Mode portfolio visibility, live leaderboard, pending-order visibility, and aggregate analytics. | in_progress | `docs/product/roles-and-permissions.md`, `docs/product/user-surfaces.md` |
| E03 Dual-trigger execution engine | Build cron and instructor-triggered month advancement through the same idempotent background processing path. | in_progress | `docs/product/simulation-engine.md`, `docs/product/runtime-architecture.md` |
| E04 Realtime and release proof | Build realtime turn-completion refresh and establish the validation/deployment proof needed for release. | in_progress | `docs/product/user-surfaces.md`, `docs/product/runtime-architecture.md`, `docs/TEST_MATRIX.md` |

## First Story Candidates

- Establish Supabase auth, class tenancy, and student/instructor RLS boundaries. High-risk story and blocker captured as `docs/stories/US-038-data-auth-tenancy-foundation/`; implementation remains blocked until role/session, schema/RLS, runtime, and integration proof boundaries are confirmed.
- Seed deterministic macro narratives, market strings, tracked metrics, and asset DNA. First pure-domain scenario catalog slice captured as `docs/stories/US-027-mvp-scenario-catalog.md`; first pure-domain Asset DNA catalog slice captured as `docs/stories/US-010-mvp-asset-dna-catalog.md`; first pure-domain asset-tier return slice captured as `docs/stories/US-011-mvp-asset-tier-return-calculation.md`.
- Implement the tracked simulation metrics catalog. Sliced as `docs/stories/US-006-tracked-simulation-metrics-catalog.md`.
- Implement the student current-month macro news terminal without exposing future rows. First domain snapshot slice captured as `docs/stories/US-007-student-macro-news-snapshot.md`.
- Implement the student leaderboard rank view. First pure-domain student rank snapshot captured as `docs/stories/US-025-student-leaderboard-rank-snapshot.md`.
- Implement the current-turn Driver/String metrics dashboard with no future metric leakage. First pure domain slice captured as `docs/stories/US-008-current-turn-driver-string-dashboard.md`.
- Implement the student portfolio pyramid visualizer. First pure domain snapshot slice captured as `docs/stories/US-009-student-portfolio-pyramid-snapshot.md`; current-turn student dashboard composition captured as `docs/stories/US-032-student-dashboard-current-turn-snapshot.md`; post-turn student dashboard composition captured as `docs/stories/US-034-student-post-turn-dashboard-snapshot.md`.
- Implement TARA target allocation validation. Sliced as `docs/stories/US-001-tara-allocation-validation.md`.
- Implement TARA tax-drag preview. Sliced as `docs/stories/US-002-tara-tax-drag-preview.md`.
- Implement TARA order submission. First domain draft and student order-entry snapshot slices captured as `docs/stories/US-003-tara-order-draft.md`.
- Implement TARA risk register evidence. First pure-domain fund-month evidence snapshot captured as `docs/stories/US-029-tara-risk-register-evidence-snapshot.md`.
- Implement TARA crowded-sell liquidity penalty. Sliced as `docs/stories/US-004-tara-liquidity-penalty.md`.
- Implement deterministic month-processing math and ledger attribution. First domain attribution slice captured as `docs/stories/US-005-tara-turn-attribution-summary.md`; first pure-domain student attribution report snapshot captured as `docs/stories/US-026-student-attribution-report-snapshot.md`; student post-turn dashboard composition captured as `docs/stories/US-034-student-post-turn-dashboard-snapshot.md`.
- Implement instructor class creation and join links. First pure-domain class draft slice captured as `docs/stories/US-012-instructor-class-draft-and-join-link.md`.
- Implement instructor live month advancement. Live Fast-Forward Month control snapshot captured as `docs/stories/US-030-instructor-live-month-advance-control-snapshot.md`; first pure-domain live advancement request slice captured as `docs/stories/US-013-instructor-live-month-advance-request.md`; first pure-domain auto advancement request slice captured as `docs/stories/US-014-auto-month-advance-request.md`; shared processing request slice captured as `docs/stories/US-015-shared-month-advance-processing-request.md`; provider-neutral worker job envelope slice captured as `docs/stories/US-020-month-advance-worker-job-envelope.md`; per-fund processing result slice captured as `docs/stories/US-016-month-advance-fund-processing-result.md`; class-month processing result slice captured as `docs/stories/US-017-class-month-advance-processing-result.md`; turn-completion event slice captured as `docs/stories/US-018-month-advance-turn-completion-event.md`; realtime refresh signal slice captured as `docs/stories/US-019-month-advance-realtime-refresh-signal.md`.
- Implement instructor pending-order visibility. First pure-domain status snapshot slice captured as `docs/stories/US-021-instructor-pending-order-visibility-snapshot.md`.
- Implement instructor live leaderboard. First pure-domain leaderboard snapshot slice captured as `docs/stories/US-022-instructor-live-leaderboard-snapshot.md`.
- Implement instructor God Mode portfolio visibility. First pure-domain portfolio visibility snapshot slice captured as `docs/stories/US-024-instructor-god-mode-portfolio-visibility-snapshot.md`.
- Implement instructor class-wide aggregate analytics. First pure-domain aggregate analytics snapshot slice captured as `docs/stories/US-023-instructor-class-aggregate-analytics-snapshot.md`; current-turn instructor dashboard composition captured as `docs/stories/US-033-instructor-dashboard-current-turn-snapshot.md`.
- Implement Supabase Realtime turn-completion refresh. First provider-neutral refresh signal slice captured as `docs/stories/US-019-month-advance-realtime-refresh-signal.md`; provider-neutral publication envelope slice captured as `docs/stories/US-028-realtime-refresh-publication-envelope.md`; Supabase Realtime publication descriptor slice captured as `docs/stories/US-031-supabase-realtime-publication-descriptor.md`; Supabase Realtime subscription descriptor slice captured as `docs/stories/US-035-supabase-realtime-subscription-descriptor.md`; realtime authorized current-turn refetch descriptor slice captured as `docs/stories/US-036-realtime-authorized-current-turn-refetch-descriptor.md`; Supabase client publication story and blocker captured as `docs/stories/US-037-supabase-realtime-client-publication/`; release validation and deployment proof blocker captured as `docs/stories/US-039-release-validation-and-deployment-proof/`; actual Supabase client publication, subscription execution, UI refetch execution, and release proof remain unimplemented.
