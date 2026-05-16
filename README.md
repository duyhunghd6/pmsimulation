# Apex Alpha Portfolio Simulator

Apex Alpha Portfolio Simulator is a classroom portfolio-management simulation game.

Students act as fund managers, start with virtual `$50M` AUM, and compete across deterministic monthly turns. Instructors create class instances, control simulation pacing, and debrief results using portfolio and leaderboard data.

## Project Status

The repository has started its first minimal application-code slice: a pure TypeScript domain validator for TARA allocation weights. There is still no Next.js app, UI, database, auth, CI, migrations, deployment automation, worker, or realtime implementation.

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
