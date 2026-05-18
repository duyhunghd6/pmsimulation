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
- An instructor dashboard current-turn query descriptor can record the future server-scoped current-turn instructor dashboard query without server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or query result delivery.
- An instructor dashboard current-turn query result envelope can wrap an already-authorized instructor dashboard snapshot after the future query boundary while still avoiding server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or unscoped gameplay delivery.
- An instructor dashboard current-turn query result validation failure envelope can represent missing or mismatched instructor dashboard query results without returning snapshots, database rows, provider clients, UI state, target weights, order details, ledger drafts, or executed query metadata.
- Before actual cron or platform scheduling exists, an auto month-advance scheduled trigger descriptor can preserve auto trigger metadata and point to the shared month-advance processing path without introducing Vercel, worker, auth, database, provider, or UI code. An auto scheduled-trigger result envelope can represent accepted scheduled-trigger handoff metadata without introducing platform execution, worker dispatch, persistence, realtime publication, or UI code. An auto scheduled-trigger validation failure envelope can represent invalid scheduled-trigger inputs without exposing raw advancement payloads or introducing platform execution code.
- Before the future worker boundary, both trigger paths should create the same shared month-advance processing request shape.
- Before the future worker boundary, invalid shared processing inputs can become a processing-safe validation failure envelope without raw trigger payloads or downstream execution data.
- Before the future worker provider boundary, the shared processing request can become a provider-neutral worker job envelope with class/month idempotency metadata and no fund-level payload.
- Before actual worker provider execution exists, a provider-neutral worker job result envelope can acknowledge accepted worker-boundary handoff without provider events, queue messages, database rows, realtime payloads, ledger drafts, or fund-level processing data.
- Invalid per-fund processing inputs can become fund-processing-safe validation failure envelopes without returning raw attribution inputs, allocation weights, ledger drafts, database rows, worker jobs, provider execution details, or realtime payloads.
- Invalid class-month processing batches can become class-processing-safe validation failure envelopes without returning fund inputs, ledger drafts, processing results, database rows, worker jobs, or realtime payloads.
- Turn-completion refresh should publish a provider-neutral aggregate event derived from the shared class-month processing result.
- Before the future realtime provider boundary, a refresh signal can be derived from the turn-completion event with class/month dedupe metadata and no fund-level or aggregate financial totals.
- A provider-neutral publication envelope can wrap the refresh signal with class-channel, event, audience, and delivery semantics before future Supabase Realtime code exists.
- A Supabase Realtime publication descriptor can map that provider-neutral envelope to a typed broadcast boundary contract before future Supabase clients, subscriptions, auth, or platform publication code exists.
- A Supabase Realtime subscription descriptor can map the broadcast descriptor to a future client subscription boundary contract before future Supabase clients, auth, UI refetch code, or platform publication code exists.
- A realtime authorized current-turn refetch descriptor can map the subscription descriptor to future client refetch instructions before future UI, server query, Supabase client, auth, or platform subscription code exists.
- A realtime authorized current-turn query descriptor can map the refetch plan to future server-scoped current-turn query instructions before server query execution, auth/session enforcement, database clients, UI refetch code, or provider subscriptions exist.
- A realtime authorized current-turn query result envelope can wrap already-authorized current-turn dashboard snapshots after the future query boundary while still avoiding server query execution, auth/session enforcement, database clients, UI refetch code, or provider subscriptions.
- A realtime authorized current-turn query result validation failure envelope can represent missing or mismatched dashboard query results without returning snapshots, database rows, provider clients, UI state, or provider execution details.
- A student dashboard current-turn query descriptor can record the future server-query boundary for one already-scoped class/current-month/viewer-fund dashboard request before server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or query result delivery exists.
- A student dashboard current-turn query result envelope can wrap an already-authorized current-turn dashboard snapshot for that descriptor before server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or query result delivery exists.
- A student dashboard current-turn query result validation failure envelope can represent missing or mismatched student dashboard query results without returning snapshots, database rows, provider clients, UI state, other-fund exact holdings, instructor God Mode data, future scenario rows, ledger drafts, or executed query metadata.
- A student post-turn dashboard query descriptor can record the future server-query boundary for one already-scoped class/processed-month/viewer-fund dashboard request before server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, result delivery, or attribution payload delivery exists. A student post-turn dashboard query result envelope can wrap an already-authorized post-turn dashboard snapshot after that future query boundary while still avoiding server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, result delivery, or attribution payload delivery. A student post-turn dashboard query result validation failure envelope can represent missing or mismatched post-turn dashboard query results without returning snapshots, attribution reports, database rows, provider clients, UI state, other-fund ids, exact holdings, order details, class aggregate payloads, instructor God Mode data, ledger draft collections, or executed query metadata.
- A student attribution report query descriptor can record the future server-query boundary for one already-scoped class/processed-month/viewer-fund attribution report before server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, result delivery, raw ledger delivery, or UI state exists. A student attribution report query result envelope can wrap an already-authorized attribution report snapshot after that future query boundary while still avoiding server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, raw ledger delivery, or UI state. A student attribution report query result validation failure envelope can represent missing or mismatched attribution report query results without returning snapshots, database rows, provider clients, UI state, raw ledger drafts, other-fund ledger drafts, target weights, order details, or executed query metadata.
- A student TARA order server-action command descriptor can map a validated submission receipt to future command-boundary metadata before actual server actions, auth/session enforcement, database clients, worker dispatch, realtime publication, or UI execution exists.
- A student TARA order server-action result envelope can map that command descriptor to a student-safe accepted-pending-order result before actual server actions, auth/session enforcement, database clients, worker dispatch, realtime publication, processed order execution, or UI state changes exist.
- A student TARA order server-action validation failure envelope can map invalid submission inputs to student-safe validation errors before actual server actions, auth/session enforcement, database clients, worker dispatch, realtime publication, processed order execution, or UI state changes exist.
- A student TARA order-entry query descriptor can record the future server-query boundary for one already-scoped current-turn order-entry request before server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or result delivery exists. A student TARA order-entry query result envelope can wrap an already-authorized order-entry snapshot after that future query boundary while avoiding server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or result delivery. A student TARA order-entry query result validation failure envelope can represent missing or mismatched order-entry query results without returning snapshots, target weights, current weights, estimated tax drag, other-fund order data, classroom order lists, database rows, provider clients, UI state, or executed query metadata.
- An instructor class server-action command descriptor can map a validated class draft to future class-creation command metadata before actual server actions, auth/session enforcement, database clients, join-code generation, realtime publication, or UI state changes exist.
- An instructor dashboard current-turn query result envelope can map an already-authorized instructor dashboard snapshot to future server-query result metadata before actual server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or result delivery exists.
- An instructor dashboard current-turn query result validation failure envelope can map invalid instructor dashboard query result inputs to future server-query result validation metadata before actual server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or result delivery exists.
- An instructor pending-order visibility query descriptor, result envelope, and validation failure envelope can record the future server-query boundary for one already-scoped class/current-month request before actual server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or order detail delivery exists.
- An instructor live leaderboard query descriptor, result envelope, and validation failure envelope can record the future server-query boundary for one already-scoped class/current-month request before actual server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, holdings delivery, or order detail delivery exists.
- An instructor God Mode portfolio visibility query descriptor, result envelope, and validation failure envelope can record the future server-query boundary for one already-scoped class/current-month request before actual server query execution, auth/session enforcement, RLS, database clients, UI rendering, provider clients, or unscoped holdings delivery exists.
- An instructor live month-advance server-action command descriptor can map a validated live advancement request to future command-boundary metadata before actual server actions, auth/session enforcement, database clients, worker dispatch, realtime publication, ledger writes, or UI state changes exist.
- An instructor live month-advance server-action result envelope can map that command descriptor to an instructor-safe accepted live month-advance receipt before actual server actions, auth/session enforcement, database clients, worker dispatch, realtime publication, ledger writes, month processing, or UI state changes exist.
- An instructor live month-advance server-action validation failure envelope can map invalid live advancement inputs to instructor-safe validation errors before actual server actions, auth/session enforcement, database clients, worker dispatch, realtime publication, ledger writes, month processing, or UI state changes exist.
- An instructor class server-action result envelope can map that command descriptor to an instructor-safe accepted class-creation receipt before actual server actions, auth/session enforcement, database clients, join-code generation, realtime publication, or UI state changes exist.
- An instructor class server-action validation failure envelope can map invalid class draft inputs to instructor-safe validation errors before actual server actions, auth/session enforcement, database clients, join-code generation, realtime publication, or UI state changes exist.
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
