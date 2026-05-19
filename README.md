# Apex Alpha Portfolio Simulator

Apex Alpha Portfolio Simulator is a classroom portfolio-management simulation game.

Students act as fund managers, start with virtual `$50M` AUM, and compete across deterministic monthly turns. Instructors create class instances, control simulation pacing, and debrief results using portfolio and leaderboard data.

## Project Status

The repository has started minimal pure TypeScript domain slices for TARA allocation rules, TARA risk register evidence snapshots, tracked metrics, current-turn scenario projections, current-turn Driver/String dashboard query descriptors, current-turn Driver/String dashboard query result envelopes, current-turn Driver/String dashboard query result validation failure envelopes, student macro news query descriptors, student macro news query result envelopes, student macro news query result validation failure envelopes, an MVP scenario catalog, portfolio pyramid snapshots, student portfolio pyramid query descriptors, student portfolio pyramid query result envelopes, student portfolio pyramid query result validation failure envelopes, Asset DNA seeds, asset-tier return calculations, student leaderboard rank snapshots, student leaderboard rank query descriptors, student leaderboard rank query result envelopes, student leaderboard rank query result validation failure envelopes, student attribution report snapshots, student attribution report query descriptors, student attribution report query result envelopes, student attribution report query result validation failure envelopes, student TARA order-entry snapshots, student TARA order-entry query descriptors, student TARA order-entry query result envelopes, student TARA order-entry query result validation failure envelopes, student TARA order submission receipts, student TARA order server-action command descriptors, student TARA order server-action result envelopes, student TARA order server-action validation failure envelopes, student dashboard current-turn snapshots, student dashboard current-turn query descriptors, student dashboard current-turn query result envelopes, student dashboard current-turn query result validation failure envelopes, student dashboard post-turn snapshots, student dashboard post-turn query descriptors, student dashboard post-turn query result envelopes, student dashboard post-turn query result validation failure envelopes, instructor class drafts, instructor class server-action command descriptors, instructor class server-action result envelopes, instructor class server-action validation failure envelopes, instructor pending-order visibility snapshots, instructor pending-order visibility query descriptors, instructor pending-order visibility query result envelopes, instructor pending-order visibility query result validation failure envelopes, instructor live leaderboard snapshots, instructor live leaderboard query descriptors, instructor live leaderboard query result envelopes, instructor live leaderboard query result validation failure envelopes, instructor class aggregate analytics snapshots, instructor class aggregate analytics query descriptors, instructor class aggregate analytics query result envelopes, instructor class aggregate analytics query result validation failure envelopes, instructor God Mode portfolio visibility snapshots, instructor God Mode portfolio visibility query descriptors, instructor God Mode portfolio visibility query result envelopes, instructor God Mode portfolio visibility query result validation failure envelopes, instructor dashboard current-turn snapshots, instructor dashboard current-turn query descriptors, instructor dashboard current-turn query result envelopes, instructor dashboard current-turn query result validation failure envelopes, instructor live month-advance control snapshots, instructor live/auto advancement requests, auto month-advance scheduled trigger descriptors, auto month-advance scheduled-trigger result envelopes, auto month-advance scheduled-trigger validation failure envelopes, instructor live month-advance server-action command descriptors, instructor live month-advance server-action result envelopes, instructor live month-advance server-action validation failure envelopes, shared month-advance processing requests, shared month-advance processing validation failure envelopes, provider-neutral month-advance worker job envelopes, provider-neutral month-advance worker job result envelopes, per-fund month processing results, per-fund month processing validation failure envelopes, class-month processing results, class-month processing validation failure envelopes, aggregate turn-completion events, realtime refresh signals, provider-neutral realtime publication envelopes, Supabase Realtime publication descriptors, Supabase Realtime subscription descriptors, realtime authorized current-turn refetch descriptors, realtime authorized current-turn query descriptors, realtime authorized current-turn query result envelopes, realtime authorized current-turn query result validation failure envelopes, a first bounded injected server-only Supabase Realtime publication boundary, and a first browser-visible Supabase Realtime subscription/refetch status panel with parse-first refresh-only payload validation and safe public-env fallback. The human approved the full-stack MVP implementation track on 2026-05-18. A minimal Next.js App Router shell now exists with public home, Supabase magic-link login/logout actions, student/instructor route-group dashboard shells protected by Supabase session plus trusted `app_role` claim checks, a first protected student current-turn dashboard UI rendered from the safe bounded server executor with a Supabase-backed row reader when the App Router Supabase server client is available, a protected browser TARA order form over the bounded student TARA order submission executor and a Supabase-backed pending-order read/write store when the App Router Supabase server client is available, a protected student post-turn attribution panel rendered from the existing safe post-turn dashboard envelope, a bounded instructor class creation executor over a trusted instructor session and parsed persisted class row, a protected instructor class creation UI over that bounded executor, a protected instructor manual live month-advance control UI that dispatches valid manual/live requests into the bounded Inngest handoff before returning the existing safe receipt envelope, a first bounded Inngest month-advance worker handoff route and event parser returning the existing worker-safe receipt envelope, a first bounded `/api/cron/month-advance` scheduled-trigger route that requires `CRON_SECRET`, returns scheduled-trigger-safe envelopes, and dispatches valid auto requests into the same Inngest handoff, a first bounded instructor pending-order visibility server query executor over parsed scoped status rows, a first protected instructor pending-order visibility UI rendered from that status-only executor, a first bounded instructor live leaderboard server query executor over parsed scoped leaderboard-safe rows, a protected instructor live leaderboard UI rendered from that leaderboard-safe executor, a first bounded instructor class aggregate analytics server query executor over parsed aggregate-safe rows, a protected instructor class aggregate analytics UI rendered from that aggregate-safe envelope with a Supabase-backed aggregate-safe row reader when the App Router Supabase server client is available, a first bounded instructor God Mode portfolio visibility server query executor over parsed privileged holding rows, a protected instructor God Mode portfolio visibility UI rendered from that privileged envelope with a Supabase-backed privileged row reader when the App Router Supabase server client is available, a bounded local release proof command that aggregates validate, route smoke, and build evidence without deploying, and a bounded non-deploying CI workflow that runs the local release proof with read-only repository permissions; there is still no hosted-proven live provider-backed gameplay database runtime, live provider-backed browser order form, hosted CI run proof, deployment automation, durable auto-class discovery, hosted Vercel cron execution, hosted worker execution, hosted realtime provider execution, hosted Supabase subscription/publication proof, live server query execution after realtime refetch, hosted Supabase project, provider-backed browser E2E auth proof, or processed live month-advance execution. US-038 has started a bounded Supabase/Drizzle auth-tenancy foundation with server-side session parsing, server-side database row parsing for scoped student fund/holding/order/risk-register/ledger/macro-narrative/market-metric/tracked-metric/same-class leaderboard fund and instructor owned-class/God Mode holding result delivery, injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, TARA order-entry, current-turn dashboard, instructor live leaderboard, class aggregate analytics, and God Mode portfolio visibility server query executors over parsed RLS-backed rows, protected instructor God Mode portfolio visibility UI rendered from Supabase-backed privileged rows when the App Router server client is available, protected student post-turn attribution UI rendered from the existing safe envelope, server-only local database URL parsing for the RLS proof harness, browser-safe Supabase auth environment parsing, a Drizzle schema, a role-claim-aware Supabase RLS migration, deterministic fixtures, and an auth-tenancy integration command, but no live database runtime, hosted Supabase project, or production migration path is wired yet.

The accepted seed spec is `SPEC.md`, derived from `docs/prd/PRD-01.md`.

Living product contracts are under `docs/product/`.

## Product Goals

The simulator teaches three course areas:

1. Asset Pyramid structure: Base = Safety, Core = Yield, Apex = Alpha.
2. Macro driver interpretation through time-lagged indicators.
3. Rules-based TARA rebalancing under tax drag and liquidity friction.

The product uses a Pedagogical Deterministic Engine instead of random market simulation.

## Approved MVP Stack

Accepted implementation stories may now use:

- Next.js App Router.
- Vercel hosting and cron.
- Supabase PostgreSQL/Auth/RLS and Supabase Realtime.
- Drizzle ORM.
- Inngest for background turn processing.
- Tailwind CSS and shadcn/ui.
- Apache ECharts and Tremor.
- Unit, integration, E2E, platform, and release proof as the corresponding layers are introduced.

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
