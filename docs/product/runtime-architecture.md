# Runtime Architecture

## Status

The PRD selects an intended web application stack. No application files, package manifests, infrastructure config, or CI exist yet.

## Target Stack

| Layer | Selected technology | Product reason |
| --- | --- | --- |
| Frontend framework | Next.js App Router | Server-side current-turn fetching, React Server Components, and Server Actions. |
| Hosting and cron | Vercel | Web hosting plus scheduled auto-mode trigger. |
| Database and auth | Supabase PostgreSQL/Auth/RLS | Multi-tenant class isolation, authentication, and row-level authorization. |
| Realtime | Supabase Realtime | Push turn-completion updates to connected clients. |
| ORM | Drizzle ORM | Type-safe database access for serverless runtimes. |
| Background worker | Inngest or Upstash QStash | End-of-month calculations should not run inside Vercel request timeouts. |
| UI system | Tailwind CSS and shadcn/ui | Accessible dark financial terminal aesthetic. |
| Visualization | Apache ECharts and Tremor | Funnel/pyramid charts, KPI metrics, and leaderboards. |

## Architectural Constraints

- Future macro rows must never be sent to the browser.
- Student query paths must not return exact holdings for other students.
- Instructor God Mode must be a separate privileged access path.
- End-of-month processing must run in a background job.
- Auto and live turn triggers must converge on the same idempotent processing path.
- Before the future worker boundary, live turn-control status can be represented as a pure class/month snapshot before UI, server actions, or authorization enforcement exist.
- Before future instructor server queries, an instructor dashboard current-turn snapshot can compose already-scoped class sections without introducing UI, auth, database, provider clients, or platform code.
- Before the future worker boundary, both trigger paths should create the same shared month-advance processing request shape.
- Before the future worker provider boundary, the shared processing request can become a provider-neutral worker job envelope with class/month idempotency metadata and no fund-level payload.
- Turn-completion refresh should publish a provider-neutral aggregate event derived from the shared class-month processing result.
- Before the future realtime provider boundary, a refresh signal can be derived from the turn-completion event with class/month dedupe metadata and no fund-level or aggregate financial totals.
- A provider-neutral publication envelope can wrap the refresh signal with class-channel, event, audience, and delivery semantics before future Supabase Realtime code exists.
- A Supabase Realtime publication descriptor can map that provider-neutral envelope to a typed broadcast boundary contract before future Supabase clients, subscriptions, auth, or platform publication code exists.
- A Supabase Realtime subscription descriptor can map the broadcast descriptor to a future client subscription boundary contract before future Supabase clients, auth, UI refetch code, or platform publication code exists.
- A realtime authorized current-turn refetch descriptor can map the subscription descriptor to future client refetch instructions before future UI, server query, Supabase client, auth, or platform subscription code exists.
- Automated triggers default to UTC+7 / Vietnam time.

## Future Implementation Shape

The first implementation story should introduce only the files required for its vertical slice. Do not scaffold the full stack ahead of selected work.

Expected future surfaces:

- Browser app for students and instructors.
- Server-side query and command boundaries.
- Supabase database and RLS policies.
- Background worker for month processing.
- Realtime turn-completion channel.

## Validation Ladder

Expected future proof:

- Unit: pure simulation math, allocation validation, idempotency keys, and attribution calculations.
- Integration: Supabase RLS, server actions, database constraints, worker enqueue/process behavior, and realtime events.
- E2E: student order submission, instructor class management, live turn advancement, and post-turn refresh.
- Platform: Vercel cron trigger and deployed worker integration.
- Release: full regression plus deployment smoke once implementation exists.
