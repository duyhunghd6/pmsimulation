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
- Seed deterministic macro narratives, market strings, tracked metrics, and asset DNA.
- Implement the student current-month macro news terminal without exposing future rows.
- Implement the current-turn Driver/String metrics dashboard with no future metric leakage.
- Implement TARA target allocation validation. Sliced as `docs/stories/US-001-tara-allocation-validation.md`.
- Implement TARA order submission. Still unsliced.
- Implement deterministic month-processing math and ledger attribution.
- Implement instructor class creation and join links.
- Implement instructor live month advancement.
- Implement Supabase Realtime turn-completion refresh.
