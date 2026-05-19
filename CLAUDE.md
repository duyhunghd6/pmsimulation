# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository has started minimal pure TypeScript domain slices for TARA allocation rules, TARA risk register evidence snapshots, tracked metrics, current-turn scenario projections, current-turn Driver/String dashboard query descriptors, current-turn Driver/String dashboard query result envelopes, current-turn Driver/String dashboard query result validation failure envelopes, student macro news query descriptors, student macro news query result envelopes, student macro news query result validation failure envelopes, an MVP scenario catalog, portfolio pyramid snapshots, student portfolio pyramid query descriptors, student portfolio pyramid query result envelopes, student portfolio pyramid query result validation failure envelopes, Asset DNA seeds, asset-tier return calculations, student leaderboard rank snapshots, student leaderboard rank query descriptors, student leaderboard rank query result envelopes, student leaderboard rank query result validation failure envelopes, student attribution report snapshots, student attribution report query descriptors, student attribution report query result envelopes, student attribution report query result validation failure envelopes, student TARA order-entry snapshots, student TARA order-entry query descriptors, student TARA order-entry query result envelopes, student TARA order-entry query result validation failure envelopes, student TARA order submission receipts, student TARA order server-action command descriptors, student TARA order server-action result envelopes, student TARA order server-action validation failure envelopes, student dashboard current-turn snapshots, student dashboard current-turn query descriptors, student dashboard current-turn query result envelopes, student dashboard current-turn query result validation failure envelopes, student dashboard post-turn snapshots, student dashboard post-turn query descriptors, student dashboard post-turn query result envelopes, student dashboard post-turn query result validation failure envelopes, instructor class drafts, instructor class server-action command descriptors, instructor class server-action result envelopes, instructor class server-action validation failure envelopes, instructor pending-order visibility snapshots, instructor pending-order visibility query descriptors, instructor pending-order visibility query result envelopes, instructor pending-order visibility query result validation failure envelopes, instructor live leaderboard snapshots, instructor live leaderboard query descriptors, instructor live leaderboard query result envelopes, instructor live leaderboard query result validation failure envelopes, instructor class aggregate analytics snapshots, instructor class aggregate analytics query descriptors, instructor class aggregate analytics query result envelopes, instructor class aggregate analytics query result validation failure envelopes, instructor God Mode portfolio visibility snapshots, instructor God Mode portfolio visibility query descriptors, instructor God Mode portfolio visibility query result envelopes, instructor God Mode portfolio visibility query result validation failure envelopes, instructor dashboard current-turn snapshots, instructor dashboard current-turn query descriptors, instructor dashboard current-turn query result envelopes, instructor dashboard current-turn query result validation failure envelopes, instructor live month-advance control snapshots, instructor live/auto advancement requests, auto month-advance scheduled trigger descriptors, auto month-advance scheduled-trigger result envelopes, auto month-advance scheduled-trigger validation failure envelopes, instructor live month-advance server-action command descriptors, instructor live month-advance server-action result envelopes, instructor live month-advance server-action validation failure envelopes, shared month-advance processing requests, shared month-advance processing validation failure envelopes, provider-neutral month-advance worker job envelopes, provider-neutral month-advance worker job result envelopes, per-fund month processing results, per-fund month processing validation failure envelopes, class-month processing results, class-month processing validation failure envelopes, aggregate turn-completion events, realtime refresh signals, provider-neutral realtime publication envelopes, Supabase Realtime publication descriptors, Supabase Realtime subscription descriptors, realtime authorized current-turn refetch descriptors, realtime authorized current-turn query descriptors, realtime authorized current-turn query result envelopes, realtime authorized current-turn query result validation failure envelopes, a first bounded injected server-only Supabase Realtime publication boundary, a first browser-visible Supabase Realtime subscription/refetch status panel with parse-first refresh-only payload validation and safe public-env fallback, a bounded local release proof command that aggregates validate, route smoke, and build evidence without deploying, and a bounded non-deploying CI workflow that runs the local release proof with read-only repository permissions. The human approved the full-stack MVP implementation track on 2026-05-18. A minimal Next.js App Router shell now exists with public home, Supabase magic-link login/logout actions, student/instructor route-group dashboard shells protected by Supabase session plus trusted `app_role` claim checks, a protected student current-turn dashboard UI with a bounded browser TARA order form and first bounded post-turn attribution panel, a bounded instructor class creation server-action executor, protected instructor class creation UI, protected instructor pending-order visibility, live leaderboard, class aggregate analytics, and God Mode portfolio visibility UI, a first bounded Inngest month-advance worker handoff route and event parser returning the existing worker-safe receipt envelope, a first bounded `/api/cron/month-advance` scheduled-trigger route that requires `CRON_SECRET`, returns scheduled-trigger-safe envelopes, and dispatches valid auto requests into the same Inngest handoff, a bounded instructor live leaderboard server query executor over parsed RLS-backed rows, a bounded instructor class aggregate analytics server query executor over parsed aggregate-safe rows, and a bounded instructor God Mode portfolio visibility server query executor over parsed privileged holding rows; there is still no live provider-backed gameplay database runtime, live provider-backed browser order form, hosted CI run proof, deployment automation, durable auto-class discovery, hosted Vercel cron execution, hosted worker execution, hosted realtime provider execution, hosted Supabase subscription/publication proof, live server query execution after realtime refetch, hosted Supabase project, or provider-backed browser E2E auth proof. US-038 has started a bounded Supabase/Drizzle auth-tenancy foundation with server-side session parsing, server-side database row parsing for scoped student fund/holding/order/risk-register/ledger/macro-narrative/market-metric/tracked-metric/same-class leaderboard fund and instructor owned-class/God Mode holding result delivery, injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, TARA order-entry, current-turn dashboard server query executors, a bounded instructor class creation server-action executor, protected instructor class creation UI, bounded instructor pending-order visibility, live leaderboard, class aggregate analytics, and God Mode portfolio visibility server query executors over parsed RLS-backed rows, and protected instructor pending-order visibility, live leaderboard, class aggregate analytics, and God Mode portfolio visibility UI rendered from bounded rows, server-only local database URL parsing for the RLS proof harness, browser-safe Supabase auth environment parsing, a Drizzle schema, a role-claim-aware Supabase RLS migration, deterministic fixtures, and an auth-tenancy integration command, but no live database runtime, hosted Supabase project, or production migration path is wired yet. Accepted stories may continue to introduce layers using Next.js App Router, Vercel, Supabase Auth/PostgreSQL/RLS/Realtime, Drizzle ORM, Inngest, Tailwind CSS, shadcn/ui, Apache ECharts, Tremor, and release proof.

Accepted specification sources:

- `SPEC.md` — ingested seed specification snapshot for the Apex Alpha Portfolio Simulator.
- `docs/prd/PRD-01.md` — original Product Requirements Document source material.
- `docs/product/` — living product contract derived from the accepted spec.

## Commands

The repository now has a minimal TypeScript/Vitest setup for pure domain validation.

- `npm run dev` — run the minimal Next.js App Router shell locally.
- `npm run build` — build the minimal Next.js App Router shell.
- `npm run typecheck` — run TypeScript without emitting files.
- `npm run test:unit` — run unit tests.
- `npm run smoke:routes` — smoke the default App Router surfaces, starting `npm run dev` when needed.
- `npm run validate:quick` — run typecheck and unit tests.
- `npm run release:local` — run the local release gate (`validate:quick`, route smoke, and build) and write a structured JSON report without deploying.

A bounded Supabase magic-link login/logout flow, protected route guards, protected student current-turn dashboard UI, protected student TARA order form, protected student post-turn attribution panel, protected instructor class creation, pending-order visibility, live leaderboard, class aggregate analytics, and God Mode portfolio visibility UI, bounded instructor class creation server-action executor, a first bounded Inngest month-advance worker handoff route, a first bounded `/api/cron/month-advance` scheduled-trigger route requiring `CRON_SECRET` and dispatching valid auto requests into the same Inngest handoff, bounded instructor live leaderboard, class aggregate analytics, and God Mode portfolio visibility server query executors, a browser-visible Supabase Realtime subscription/refetch status panel, a bounded local release proof command, and a bounded non-deploying CI workflow now exist, but no live provider-backed gameplay database runtime, live provider-backed browser order form, hosted Supabase project, provider-backed browser E2E auth proof, E2E tests, hosted CI run proof, deployment commands, durable auto-class discovery, hosted Vercel cron execution, hosted worker execution, hosted realtime provider execution, hosted Supabase subscription/publication proof, or live server query execution after realtime refetch exists yet. `npm run test:integration:auth-tenancy` now exists for the US-038 local Supabase proof, but its local RLS test requires `AUTH_TENANCY_DATABASE_URL`. The approved MVP stack is Next.js App Router on Vercel with Supabase Auth/PostgreSQL/RLS/Realtime, Drizzle ORM, Inngest, Tailwind CSS, shadcn/ui, Apache ECharts, Tremor, plus integration, E2E, platform, and release proof as those layers are introduced by accepted stories.

## Product architecture

The target product is the **Apex Alpha Portfolio Simulator**, a web-based, desktop-first financial training simulator where students manage virtual portfolios inside instructor-controlled classrooms.

Key domain concepts:

- Students act as fund managers starting with virtual `$50M` AUM.
- Instructors create isolated class/game instances, advance simulation turns, and can view aggregate or all-student data.
- Simulations run over 12–24 monthly turns and are deterministic, not market-randomized.
- Automated triggers default to UTC+7 / Vietnam time.

## Intended technical architecture

The PRD defines the following stack and constraints:

- **Next.js App Router**: use React Server Components for secure server-side fetching of current-turn data. Do not send future timeline data to the browser.
- **Vercel**: hosting and cron for midnight auto-mode turn advancement.
- **Supabase PostgreSQL/Auth/RLS**: isolate users and classes with Row Level Security. Students must not access other students’ exact holdings or future scenario data.
- **Supabase Realtime**: push turn-completion updates so connected clients refresh after simulation processing.
- **Drizzle ORM**: type-safe database access suited to serverless runtimes.
- **Inngest**: offload end-of-month calculations so PvP slippage, taxes, and beta-matrix math are not constrained by Vercel serverless timeouts.
- **Tailwind CSS + shadcn/ui**: dark financial terminal aesthetic.
- **Apache ECharts + Tremor**: charts, funnel/pyramid portfolio visualization, KPIs, and leaderboards.

## Simulation engine rules

The simulation engine is deterministic and curriculum-driven:

- Macro data comes from a scripted scenario array, not random numbers or live market APIs.
- Leading indicators: `PMI`, `M2 Growth`.
- Coincident indicators: `GDP` lags PMI by 1 turn, `VIX` reacts to sudden rate hikes.
- Lagging indicators: `CPI / Inflation` lags M2 by 2 turns, `CB Rate` hikes mechanically when CPI crosses 3.0%.
- Asset returns are computed from hardcoded beta sensitivities to macro deltas.
- Rebalancing must model tax drag on profitable sales and crowded-trade liquidity penalties when classroom order flow clusters on the same sell action.

## Full-stack sprint sequence

When continuing autonomous full-stack work, follow `docs/stories/backlog.md` and select the earliest safe unimplemented layer from the Full-Stack MVP Sprint Sequence. Do not use the old pure-domain "smallest unblocked" queue when a full-stack server/UI slice is available, and do not rely on stale progression notes from older prompts or sprint logs. If US-038 local RLS execution is blocked only by missing `AUTH_TENANCY_DATABASE_URL`, record that blocker once, do not select more US-038 parser-only or query-executor-only slices unless a concrete security gap blocks browser exposure, and move to the next bounded full-stack slice. Before implementing a non-UI slice, explicitly check whether an earlier or already-backed browser UI is missing; if an unblocked UI over a safe server boundary exists, switch to that UI slice. If a selected slice is UI, implement UI code instead of ending with "No browser UI" as the main result; future rounds should continue through order submission, instructor UI, Inngest processing, Supabase Realtime, E2E/platform proof, deployment, and release proof rather than repeatedly reporting those layers as skipped.

## MVP functional areas

When implementing, keep these epics aligned with the PRD:

1. **Student dashboard**: macro news, current metrics, pyramid/funnel allocation visualizer, TARA order entry, attribution reports.
2. **Instructor management**: class creation, join links, live leaderboard, pending-order visibility, God Mode portfolio visibility, aggregate analytics, manual turn advancement.
3. **Dual-trigger execution engine**: cron-based auto mode and instructor-triggered live mode, both feeding a background worker and realtime client refresh.

## Data model blueprint

The PRD expects these core PostgreSQL/Drizzle entities:

- `Classes`: game instances with instructor, trigger mode, and current month.
- `Macro_Narratives`: scripted monthly macro scenario data.
- `Asset_DNA`: asset-tier beta coefficients and fees.
- `Funds`: student fund state including AUM and Sharpe ratio.
- `Asset_Holdings`: portfolio allocation by Base/Core/Apex tier.
- `TARA_Orders`: pending/processed target-weight submissions by month.
- `Simulation_Ledger`: attribution data including tax, slippage, and ending AUM.

## Important implementation constraints

- The browser must never receive future macro narrative rows or exact holdings for other students.
- Validate TARA target allocations to exactly 100.0% before submission.
- MVP allocation is by asset tier, not individual tickers.
- MVP excludes live market APIs, short selling, leverage, and instructor scenario-builder tooling.
- End-of-month processing should be idempotent and safe to trigger from either cron or instructor live mode.
