# Roles and Permissions

## Roles

### Student / Fund Manager

Students manage one fund inside a class simulation.

Allowed capabilities:

- View their own dashboard.
- View current and past macro news available to the class.
- View their own holdings, AUM, Sharpe ratio, allocation drift, and attribution reports.
- Submit TARA rebalancing orders for the current month.
- View a TARA order-entry snapshot for their own fund with current allocation, target allocation, pending draft status, and tax-drag preview.
- View their leaderboard rank and permitted class leaderboard metrics without exact holdings or pending-order details for other students.
- View a post-turn dashboard snapshot that combines their own attribution report with permitted leaderboard-rank metrics.

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
- View all student portfolios in God Mode for their classes.
- View pending-order status for students in their classes.
- View class-wide aggregate analytics.
- View live class leaderboard rows with fund AUM, Sharpe ratio, and pending-order status.
- View live month-advance control status for instructor-scoped classes.
- View a current-turn instructor dashboard snapshot for an already-scoped class, including pending-order visibility, live leaderboard, God Mode portfolio visibility, aggregate analytics, and live month-advance control sections.
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

Future implementation should include integration proof for tenant isolation and role-scoped reads/writes before any user-visible implementation is considered complete.
