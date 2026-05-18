# Roles and Permissions

## Approved Auth and Tenancy Direction

Supabase Auth JWT claims are the trusted session source for the full-stack MVP. Server boundaries must parse session claims, request inputs, and database rows before returning typed student or instructor outcomes. Supabase RLS is the primary tenant enforcement layer for persisted gameplay records, with server-side guards preserving the same class, fund, role, and month scope before database access. RLS helpers and direct policies must honor the trusted `app_role` claim so student and instructor subjects cannot use persisted membership/admin rows through the wrong role path.

The first integration proof must show that students can read their own fund state and current/past class scenario data, cannot read future rows or other students' exact holdings, and cannot cross class tenants. Instructors can read God Mode data only for classes they administer and cannot access unowned classes.

## Roles

### Student / Fund Manager

Students manage one fund inside a class simulation.

Allowed capabilities:

- View their own dashboard.
- View current and past macro news available to the class.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn macro news scope before server query execution exists.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn Driver/String dashboard scope before server query execution exists.
- View their own holdings, AUM, Sharpe ratio, allocation drift, and attribution reports.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn portfolio pyramid scope before server query execution exists.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own attribution report scope before server query execution exists.
- Submit TARA rebalancing orders for the current month.
- Receive a student-safe TARA submission receipt, future server-command descriptor, future server-action accepted result envelope, and future server-action validation failure envelope for their own current-month order submission boundary.
- View a TARA order-entry snapshot for their own fund with current allocation, target allocation, pending draft status, and tax-drag preview.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own current-turn TARA order-entry scope before server query execution exists.
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

- Create isolated class instances.
- Generate student join links.
- Receive future server-action command, result, and validation failure envelopes for creating an instructor-scoped class from class draft inputs.
- View all student portfolios in God Mode for their classes.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own God Mode portfolio visibility scope before server query execution exists.
- View pending-order status for students in their classes.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own pending-order visibility scope before server query execution exists.
- View class-wide aggregate analytics.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own class aggregate analytics scope before server query execution exists.
- View live class leaderboard rows with fund AUM, Sharpe ratio, and pending-order status.
- Receive a future server-query descriptor, result envelope, and validation failure envelope for their own live leaderboard scope before server query execution exists.
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

Future implementation should include integration proof for tenant isolation and role-scoped reads/writes before any user-visible implementation is considered complete. US-038 now includes a fixed-field safe authorization event serializer for denied-access observability and server-side database row parsers for scoped student fund/order/ledger/macro-narrative/market-metric and instructor God Mode holding result delivery; local Supabase RLS execution proof remains pending before user-visible auth or tenancy flows are marked implemented.
