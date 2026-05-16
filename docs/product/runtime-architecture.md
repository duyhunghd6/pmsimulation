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
