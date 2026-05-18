# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository has started minimal pure TypeScript domain slices for TARA allocation rules, TARA risk register evidence snapshots, tracked metrics, current-turn scenario projections, an MVP scenario catalog, portfolio pyramid snapshots, Asset DNA seeds, asset-tier return calculations, student leaderboard rank snapshots, student attribution report snapshots, student attribution report query descriptors, student attribution report query result envelopes, student attribution report query result validation failure envelopes, student TARA order-entry snapshots, student TARA order-entry query descriptors, student TARA order-entry query result envelopes, student TARA order-entry query result validation failure envelopes, student TARA order submission receipts, student TARA order server-action command descriptors, student TARA order server-action result envelopes, student TARA order server-action validation failure envelopes, student dashboard current-turn snapshots, student dashboard current-turn query descriptors, student dashboard current-turn query result envelopes, student dashboard current-turn query result validation failure envelopes, student dashboard post-turn snapshots, student dashboard post-turn query descriptors, student dashboard post-turn query result envelopes, student dashboard post-turn query result validation failure envelopes, instructor class drafts, instructor class server-action command descriptors, instructor class server-action result envelopes, instructor class server-action validation failure envelopes, instructor pending-order visibility snapshots, instructor pending-order visibility query descriptors, instructor pending-order visibility query result envelopes, instructor pending-order visibility query result validation failure envelopes, instructor live leaderboard snapshots, instructor live leaderboard query descriptors, instructor live leaderboard query result envelopes, instructor live leaderboard query result validation failure envelopes, instructor class aggregate analytics snapshots, instructor God Mode portfolio visibility snapshots, instructor God Mode portfolio visibility query descriptors, instructor God Mode portfolio visibility query result envelopes, instructor God Mode portfolio visibility query result validation failure envelopes, instructor dashboard current-turn snapshots, instructor dashboard current-turn query descriptors, instructor dashboard current-turn query result envelopes, instructor dashboard current-turn query result validation failure envelopes, instructor live month-advance control snapshots, instructor live/auto advancement requests, auto month-advance scheduled trigger descriptors, auto month-advance scheduled-trigger result envelopes, auto month-advance scheduled-trigger validation failure envelopes, instructor live month-advance server-action command descriptors, instructor live month-advance server-action result envelopes, instructor live month-advance server-action validation failure envelopes, shared month-advance processing requests, shared month-advance processing validation failure envelopes, provider-neutral month-advance worker job envelopes, provider-neutral month-advance worker job result envelopes, per-fund month processing results, per-fund month processing validation failure envelopes, class-month processing results, class-month processing validation failure envelopes, aggregate turn-completion events, realtime refresh signals, provider-neutral realtime publication envelopes, Supabase Realtime publication descriptors, Supabase Realtime subscription descriptors, realtime authorized current-turn refetch descriptors, realtime authorized current-turn query descriptors, realtime authorized current-turn query result envelopes, and realtime authorized current-turn query result validation failure envelopes. There is still no Next.js app, UI, database, auth, CI, migrations, deployment automation, worker, or realtime provider implementation.

Accepted specification sources:

- `SPEC.md` — ingested seed specification snapshot for the Apex Alpha Portfolio Simulator.
- `docs/prd/PRD-01.md` — original Product Requirements Document source material.
- `docs/product/` — living product contract derived from the accepted spec.

## Commands

The repository now has a minimal TypeScript/Vitest setup for pure domain validation.

- `npm run typecheck` — run TypeScript without emitting files.
- `npm run test:unit` — run unit tests.
- `npm run validate:quick` — run typecheck and unit tests.

No Next.js app, database, integration tests, E2E tests, CI, or deployment commands exist yet. Expected future stack from the PRD is Next.js App Router on Vercel with Supabase, Drizzle ORM, Inngest, Tailwind CSS, shadcn/ui, Apache ECharts, and Tremor.

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
- **Inngest or Upstash QStash**: offload end-of-month calculations so PvP slippage, taxes, and beta-matrix math are not constrained by Vercel serverless timeouts.
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
