# Apex Alpha Portfolio Simulator

Apex Alpha Portfolio Simulator is a classroom portfolio-management simulation game.

Students act as fund managers, start with virtual `$50M` AUM, and compete across deterministic monthly turns. Instructors create class instances, control simulation pacing, and debrief results using portfolio and leaderboard data.

## Project Status

The repository has started minimal pure TypeScript domain slices for TARA allocation rules, TARA risk register evidence snapshots, tracked metrics, current-turn scenario projections, an MVP scenario catalog, portfolio pyramid snapshots, Asset DNA seeds, asset-tier return calculations, student leaderboard rank snapshots, student attribution report snapshots, student TARA order-entry snapshots, student dashboard current-turn snapshots, student dashboard post-turn snapshots, instructor class drafts, instructor pending-order visibility snapshots, instructor live leaderboard snapshots, instructor class aggregate analytics snapshots, instructor God Mode portfolio visibility snapshots, instructor dashboard current-turn snapshots, instructor live month-advance control snapshots, instructor live/auto advancement requests, shared month-advance processing requests, provider-neutral month-advance worker job envelopes, per-fund month processing results, class-month processing results, aggregate turn-completion events, realtime refresh signals, provider-neutral realtime publication envelopes, Supabase Realtime publication descriptors, Supabase Realtime subscription descriptors, and realtime authorized current-turn refetch descriptors. There is still no Next.js app, UI, database, auth, CI, migrations, deployment automation, worker, or realtime provider implementation.

The accepted seed spec is `SPEC.md`, derived from `docs/prd/PRD-01.md`.

Living product contracts are under `docs/product/`.

## Product Goals

The simulator teaches three course areas:

1. Asset Pyramid structure: Base = Safety, Core = Yield, Apex = Alpha.
2. Macro driver interpretation through time-lagged indicators.
3. Rules-based TARA rebalancing under tax drag and liquidity friction.

The product uses a Pedagogical Deterministic Engine instead of random market simulation.

## Intended Stack

Future implementation is expected to use:

- Next.js App Router.
- Vercel hosting and cron.
- Supabase PostgreSQL/Auth/RLS and Supabase Realtime.
- Drizzle ORM.
- Inngest or Upstash QStash for background turn processing.
- Tailwind CSS and shadcn/ui.
- Apache ECharts and Tremor.

## Documentation Map

- `AGENTS.md` — agent operating guide.
- `SPEC.md` — accepted seed specification snapshot.
- `docs/prd/PRD-01.md` — original PRD source.
- `docs/product/` — living product contract.
- `docs/stories/backlog.md` — candidate epics and first story candidates.
- `docs/TEST_MATRIX.md` — behavior-to-proof matrix.
- `docs/decisions/` — architecture and harness decisions.

## MVP Boundaries

In scope:

- Student dashboard.
- Instructor class management.
- Dual-trigger simulation execution.
- Realtime refresh after turn completion.

Out of scope for MVP:

- Live market APIs.
- Individual stock picking.
- Short selling and leverage.
- Instructor scenario builder.
