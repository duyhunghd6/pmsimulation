# Roles and Permissions

## Approved Auth and Tenancy Direction

Supabase Auth JWT claims are the trusted session source for the full-stack MVP. The no-gameplay App Router shell now starts a bounded Supabase magic-link login/logout flow and protects student/instructor route groups with parsed session id plus trusted `app_role` checks before rendering shell placeholders. Server boundaries must parse session claims, request inputs, and database rows before returning typed student or instructor outcomes. Supabase RLS is the primary tenant enforcement layer for persisted gameplay records, with server-side guards preserving the same class, fund, role, and month scope before database access. RLS helpers and direct policies must honor the trusted `app_role` claim so student and instructor subjects cannot use persisted membership/admin rows through the wrong role path.

The first integration proof must show that students can read their own fund state and current/past class scenario data, cannot read future rows or other students' exact holdings, and cannot cross class tenants. Instructors can read God Mode data only for classes they administer and cannot access unowned classes.

## Roles

### Student / Fund Manager

Students manage one fund inside a class simulation.

Allowed capabilities:

- Sign in through the bounded Supabase magic-link login flow before opening the no-gameplay student shell.
- View their own dashboard.
- View current and past macro news available to the class.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn macro news scope before server query execution exists.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn Driver/String dashboard scope before server query execution exists.
- View their own holdings, AUM, Sharpe ratio, allocation drift, and attribution reports.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn portfolio pyramid scope before server query execution exists.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own attribution report scope before server query execution exists.
- Submit TARA rebalancing orders for the current month.
- Receive a student-safe TARA submission receipt, future server-command descriptor, future server-action accepted result envelope, and future server-action validation failure envelope for their own current-month order submission boundary.
- Submit through the first protected browser TARA order form on `/dashboard`, which posts Base/Core/Apex target weights to the bounded server-side TARA order submission executor. The executor requires student role plus class/fund/month scope, validates authoritative current rows, rejects duplicate pending orders, and returns only the existing student-safe accepted-pending-order envelope; the server action now prefers a Supabase-backed pending-order read/write store when the App Router Supabase server client is available, while hosted Supabase execution proof, local RLS execution proof, worker dispatch, realtime publication, and provider-backed E2E remain pending.
- Enroll from a valid `/join/[joinCode]` route after signing in as a student. The join server action validates the student session and join request, writes through a bounded `join_class_by_code` RPC when the App Router Supabase server client is available, parses the persisted membership/fund receipt row before delivery, and returns only a student-safe enrollment receipt; hosted Supabase execution proof, provider-backed browser E2E, and local RLS execution proof remain pending.
- View a TARA order-entry snapshot for their own fund with current allocation, target allocation, pending draft status, and tax-drag preview.
- Receive a parsed server-query result envelope for their own current-turn TARA order-entry scope through the first injected US-038 executor, while live provider execution, browser delivery, and server actions remain unwired.
- View their leaderboard rank and permitted class leaderboard metrics without exact holdings or pending-order details for other students.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own leaderboard-rank scope before server query execution exists.
- View a post-turn dashboard snapshot that combines their own attribution report with permitted leaderboard-rank metrics.
- View a first protected post-turn attribution panel on `/dashboard` from the existing safe student post-turn dashboard snapshot/query-result envelope, without target weights, order details, raw ledger drafts, other-fund ledger rows, provider payloads, future scenario rows, class aggregate payloads, or instructor God Mode data.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own post-turn dashboard scope before server query execution or provider result delivery exists.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn dashboard scope before server query execution exists.

Forbidden capabilities:

- View future macro narrative rows.
- View exact holdings of other students.
- Advance simulation turns.
- Access another class tenant.

### Instructor / Game Master

Instructors control one or more class simulations.

Allowed capabilities:

- Sign in through the bounded Supabase magic-link login flow before opening the no-gameplay instructor shell.
- Create isolated class instances.
- Generate student join links.
- Receive future server-action command, result, and validation failure envelopes for creating an instructor-scoped class from class draft inputs.
- Create a class through the first bounded server-side executor, which uses the trusted instructor session as draft scope, validates draft input, parses the persisted class row, and returns only an instructor-safe receipt; the protected instructor dashboard now includes a browser form that posts to this bounded executor, prefers a Supabase-backed class creation writer when the App Router Supabase server client is available, renders server-refreshed parsed class-list and roster visibility panels on protected renders, and derives browser-visible `/join/[joinCode]` paths for safe join codes, while hosted Supabase execution proof, roster editing, and provider-backed browser proof remain pending.
- View all student portfolios in God Mode for their classes.
- Receive a parsed privileged server-query result envelope for their own God Mode portfolio visibility scope through the first injected executor, and view that privileged envelope on the protected instructor dashboard through a Supabase-backed privileged row reader when the App Router server client is available, while hosted provider proof, target weights, estimated tax drag, and order details remain unwired.
- View pending-order status for students in their classes.
- Receive a parsed status-only server-query result envelope for their own pending-order visibility scope through the first injected executor, and view that status-only envelope on the protected instructor dashboard through a Supabase-backed status-only row reader when the App Router server client is available, while hosted provider proof, target weights, estimated tax drag, and order details remain unwired.
- View class-wide aggregate analytics.
- Receive a parsed aggregate-safe server-query result envelope for their own class aggregate analytics scope through the first injected executor, and view that aggregate-safe envelope on the protected instructor dashboard through a Supabase-backed aggregate-safe row reader when the App Router server client is available, while hosted provider proof, per-fund rows, holdings, target weights, estimated tax drag, and order details remain unwired.
- View live class leaderboard rows with fund AUM, Sharpe ratio, and pending-order status.
- Receive a parsed leaderboard-safe server-query result envelope for their own live leaderboard scope through the first injected executor, and view that leaderboard-safe envelope on the protected instructor dashboard through a Supabase-backed leaderboard-safe row reader when the App Router server client is available, while hosted provider proof, holdings, target weights, estimated tax drag, and order details remain unwired.
- View live month-advance control status for instructor-scoped classes.
- View a current-turn instructor dashboard snapshot for an already-scoped class, including pending-order visibility, live leaderboard, God Mode portfolio visibility, aggregate analytics, and live month-advance control sections.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn instructor dashboard scope before server query execution exists.
- Receive future server-action command, result, and validation failure envelopes for an instructor-scoped live month-advance request.
- Trigger live month advancement through the protected dashboard, which dispatches valid manual/live requests into the bounded Inngest handoff before returning a browser-safe receipt while keeping worker jobs, ledger drafts, realtime payloads, and processed month results out of browser delivery.
- Configure whether a class uses auto or manual trigger mode.
- Have auto-mode classes enter the first bounded scheduled-trigger handoff through `/api/cron/month-advance` when a server-side cron request provides valid `CRON_SECRET`; the route still supports explicit class/month metadata for targeted proof, discovers ready auto-mode classes through a Supabase-backed class reader when no explicit class/month params are supplied, and is declared in `vercel.json` for midnight UTC+7 auto-mode execution, while hosted Vercel cron/Supabase discovery proof remains pending.
- Have bounded month-advance events processed through an injected worker executor that returns only aggregate turn-completion metadata plus a safe persistence receipt and dispatches successful completions through the injected server-only Supabase Realtime publisher with refresh-only metadata. The first Supabase-backed processing store can read class-scoped processing inputs and persist ledger, fund AUM, processed pending-order target weights into asset holdings, pending-order processed status, and class month advancement through the existing injected contracts, while hosted worker wiring, live RLS write proof, hosted realtime proof, and provider-backed browser proof remain pending.

Forbidden capabilities:

- Access classes they do not own or administer.
- Mutate processed historical ledger rows except through future explicit administrative workflows.

## Security Invariants

- Every gameplay record is scoped by class, fund, user, or instructor ownership.
- Students only receive current and past data they are allowed to know.
- Future scenario data must remain server-side.
- Other students' exact holdings must not be sent to the student browser.
- Instructor God Mode is privileged and must be separated from student query paths.
- God Mode portfolio visibility may include exact current holdings only after an instructor-scoped class boundary has already been enforced.
- Row Level Security policies are part of the product contract when Supabase is introduced.

## Authorization Proof Expectations

Future implementation should include integration proof for tenant isolation and role-scoped reads/writes before any gameplay implementation is considered complete. US-038 now includes a fixed-field safe authorization event serializer for denied-access observability, server-side database row parsers for scoped student fund/holding/order/risk-register/ledger/macro-narrative/market-metric/tracked-metric and instructor owned-class/God Mode holding result delivery, injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, and TARA order-entry server query executors that require student role plus class/fund/month scope before returning safe result envelopes, and a browser-safe Supabase auth environment parser that returns no database URL or service-role credentials; local Supabase RLS execution proof remains pending before gameplay auth or tenancy flows are marked implemented. US-072 adds no-gameplay shell route protection by Supabase session plus trusted `app_role` claim, but does not prove provider-backed browser sign-in E2E. US-074 adds a bounded injected student TARA order submission executor with unit proof for role denial, scope-safe parsing, duplicate pending-order rejection, invalid allocation safe failure, persisted-row rejection, and persisted-command mismatch rejection; live Supabase write enforcement and browser order-form E2E remain pending. US-083 adds a bounded injected instructor class creation executor with unit proof for role denial, trusted-session draft scope, invalid draft safe failure, persisted-row rejection, and persisted-command mismatch rejection. US-084 renders a protected browser class creation form on `/instructor/dashboard` that posts to the bounded executor and shows empty, pending, success, validation-error, and authorization/error states. US-099 adds a Supabase-backed class creation writer behind that server action plus a bounded authenticated `create_instructor_class` RPC for creating the class and instructor admin rows; US-100 adds a protected server-refreshed class-list panel backed by parsed instructor-owned Supabase `classes` rows when the App Router server client is available; US-109 adds a bounded authenticated student join-code enrollment action plus `join_class_by_code` RPC for creating class membership, an initial fund, and default Base/Core/Apex holdings while returning only a student-safe receipt. US-110 adds a protected instructor roster visibility panel backed by parsed roster-safe `funds` rows and safe failure states; hosted Supabase execution proof, local RLS execution proof, roster editing, and browser class-creation/list/enrollment/roster E2E remain pending. US-075 adds a bounded injected instructor pending-order visibility query executor with unit proof for instructor role enforcement, current-month scope enforcement, cross-class row rejection, future-month order rejection, duplicate pending-order rejection, and status-only payload delivery. US-076 renders that status-only envelope on the protected instructor dashboard with bounded rows. US-102 adds a Supabase-backed status-only pending-order row reader behind that executor and wires the protected instructor dashboard to prefer it when the App Router server client is available, while preserving fail-closed provider behavior and bounded fallback rows. US-077 adds a bounded injected instructor live leaderboard query executor with unit proof for instructor role enforcement, current-month scope enforcement, cross-class and malformed fund rejection, future-month and invalid order rejection, duplicate pending-order rejection, and leaderboard-safe payload delivery. US-078 renders that leaderboard-safe envelope on the protected instructor dashboard with bounded rows. US-079 adds a bounded injected instructor class aggregate analytics query executor with unit proof for instructor role enforcement, current-month scope enforcement, aggregate-safe fund parsing, future-month and invalid order rejection, duplicate pending-order rejection, and aggregate-safe payload delivery. US-080 adds a bounded injected instructor God Mode portfolio visibility query executor with unit proof for instructor role enforcement, current-month scope enforcement, privileged holding parsing, order-status derivation, and forbidden payload exclusion. US-081 renders that privileged God Mode envelope on the protected instructor dashboard with bounded rows. US-082 renders the aggregate-safe class analytics envelope on the protected instructor dashboard with bounded rows. US-088 renders a protected student post-turn attribution panel from existing safe post-turn snapshot/query-result envelope builders without raw ledger drafts or provider payloads; live Supabase ledger read enforcement and provider-backed browser proof remain pending. US-092 dispatches successful injected class-month processing completions through the existing server-only Supabase Realtime publisher with refresh-only payloads and safe publication success/failure envelopes; US-101 adds a tested Supabase-backed class-month processing store for the existing injected worker reader/writer contracts, parsing class-scoped fund/holding/pending-order/tracked-metric rows and writing ledger rows, fund AUM updates, processed pending-order status, and class month advancement; US-107 wires the Inngest worker function to that Supabase processing store plus Supabase Realtime publisher when server-only worker runtime values are configured, with safe runtime-configuration and provider-failure statuses while hosted worker execution proof and live RLS write proof remain pending; US-093 renders a route-scoped authorized server query result status on the protected student and instructor realtime panels after each server render, including accepted refresh-triggered renders, without returning snapshots, database rows, provider clients, or gameplay payloads through Realtime; hosted Supabase publication/subscription proof and provider-backed execution remain pending.
