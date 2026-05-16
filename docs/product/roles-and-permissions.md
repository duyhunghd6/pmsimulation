# Roles and Permissions

## Roles

### Student / Fund Manager

Students manage one fund inside a class simulation.

Allowed capabilities:

- View their own dashboard.
- View current and past macro news available to the class.
- View their own holdings, AUM, Sharpe ratio, allocation drift, and attribution reports.
- Submit TARA rebalancing orders for the current month.
- View their leaderboard rank and class leaderboard summary.

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
- Row Level Security policies are part of the product contract when Supabase is introduced.

## Authorization Proof Expectations

Future implementation should include integration proof for tenant isolation and role-scoped reads/writes before any user-visible implementation is considered complete.
