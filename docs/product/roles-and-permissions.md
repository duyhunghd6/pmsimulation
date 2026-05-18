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
- Submit through the first protected browser TARA order form on `/dashboard`, which posts Base/Core/Apex target weights to the bounded server-side TARA order submission executor. The executor requires student role plus class/fund/month scope, validates authoritative current rows, rejects duplicate pending orders, and returns only the existing student-safe accepted-pending-order envelope while live Supabase writes, durable provider persistence, worker dispatch, realtime publication, and provider-backed E2E remain unwired.
- View a TARA order-entry snapshot for their own fund with current allocation, target allocation, pending draft status, and tax-drag preview.
- Receive a parsed server-query result envelope for their own current-turn TARA order-entry scope through the first injected US-038 executor, while live provider execution, browser delivery, and server actions remain unwired.
- View their leaderboard rank and permitted class leaderboard metrics without exact holdings or pending-order details for other students.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own leaderboard-rank scope before server query execution exists.
- View a post-turn dashboard snapshot that combines their own attribution report with permitted leaderboard-rank metrics.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own post-turn dashboard scope before server query execution or result delivery exists.
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
- Create a class through the first bounded server-side executor, which uses the trusted instructor session as draft scope, validates draft input, parses the persisted class row, and returns only an instructor-safe receipt; the protected instructor dashboard now includes a browser form that posts to this bounded executor through an injected proof store while live Supabase writes remain unwired.
- View all student portfolios in God Mode for their classes.
- Receive a parsed privileged server-query result envelope for their own God Mode portfolio visibility scope through the first injected executor, and view that privileged envelope on the protected instructor dashboard while live provider execution, target weights, estimated tax drag, and order details remain unwired.
- View pending-order status for students in their classes.
- Receive a parsed status-only server-query result envelope for their own pending-order visibility scope through the first injected executor, and view that status-only envelope on the protected instructor dashboard while live provider execution, target weights, estimated tax drag, and order details remain unwired.
- View class-wide aggregate analytics.
- Receive a parsed aggregate-safe server-query result envelope for their own class aggregate analytics scope through the first injected executor, and view that aggregate-safe envelope on the protected instructor dashboard while live provider execution, per-fund rows, holdings, target weights, estimated tax drag, and order details remain unwired.
- View live class leaderboard rows with fund AUM, Sharpe ratio, and pending-order status.
- Receive a parsed leaderboard-safe server-query result envelope for their own live leaderboard scope through the first injected executor, and view that leaderboard-safe envelope on the protected instructor dashboard while live provider execution, holdings, target weights, estimated tax drag, and order details remain unwired.
- View live month-advance control status for instructor-scoped classes.
- View a current-turn instructor dashboard snapshot for an already-scoped class, including pending-order visibility, live leaderboard, God Mode portfolio visibility, aggregate analytics, and live month-advance control sections.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn instructor dashboard scope before server query execution exists.
- Receive future server-action command, result, and validation failure envelopes for an instructor-scoped live month-advance request.
- Trigger live month advancement.
- Configure whether a class uses auto or manual trigger mode.

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

Future implementation should include integration proof for tenant isolation and role-scoped reads/writes before any gameplay implementation is considered complete. US-038 now includes a fixed-field safe authorization event serializer for denied-access observability, server-side database row parsers for scoped student fund/holding/order/risk-register/ledger/macro-narrative/market-metric/tracked-metric and instructor owned-class/God Mode holding result delivery, injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, and TARA order-entry server query executors that require student role plus class/fund/month scope before returning safe result envelopes, and a browser-safe Supabase auth environment parser that returns no database URL or service-role credentials; local Supabase RLS execution proof remains pending before gameplay auth or tenancy flows are marked implemented. US-072 adds no-gameplay shell route protection by Supabase session plus trusted `app_role` claim, but does not prove provider-backed browser sign-in E2E. US-074 adds a bounded injected student TARA order submission executor with unit proof for role denial, scope-safe parsing, duplicate pending-order rejection, invalid allocation safe failure, persisted-row rejection, and persisted-command mismatch rejection; live Supabase write enforcement and browser order-form E2E remain pending. US-083 adds a bounded injected instructor class creation executor with unit proof for role denial, trusted-session draft scope, invalid draft safe failure, persisted-row rejection, and persisted-command mismatch rejection. US-084 renders a protected browser class creation form on `/instructor/dashboard` that posts to the bounded executor through an injected proof store and shows empty, pending, success, validation-error, and authorization/error states; live Supabase write enforcement and browser class-creation E2E remain pending. US-075 adds a bounded injected instructor pending-order visibility query executor with unit proof for instructor role enforcement, current-month scope enforcement, cross-class row rejection, future-month order rejection, duplicate pending-order rejection, and status-only payload delivery. US-076 renders that status-only envelope on the protected instructor dashboard with bounded rows. US-077 adds a bounded injected instructor live leaderboard query executor with unit proof for instructor role enforcement, current-month scope enforcement, cross-class and malformed fund rejection, future-month and invalid order rejection, duplicate pending-order rejection, and leaderboard-safe payload delivery. US-078 renders that leaderboard-safe envelope on the protected instructor dashboard with bounded rows. US-079 adds a bounded injected instructor class aggregate analytics query executor with unit proof for instructor role enforcement, current-month scope enforcement, aggregate-safe fund parsing, future-month and invalid order rejection, duplicate pending-order rejection, and aggregate-safe payload delivery. US-080 adds a bounded injected instructor God Mode portfolio visibility query executor with unit proof for instructor role enforcement, current-month scope enforcement, privileged holding parsing, order-status derivation, and forbidden payload exclusion. US-081 renders that privileged God Mode envelope on the protected instructor dashboard with bounded rows. US-082 renders the aggregate-safe class analytics envelope on the protected instructor dashboard with bounded rows; live Supabase read enforcement and provider-backed browser proof remain pending.
