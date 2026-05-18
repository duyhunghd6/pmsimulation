# Agent Operating Guide

This repository started as Harness v0 and now has minimal pure TypeScript
domain slices for accepted story packets. The human approved the full-stack MVP
implementation track on 2026-05-18 so the accepted stack can now be introduced
through selected stories: Next.js App Router, Vercel, Supabase Auth/PostgreSQL/RLS/Realtime,
Drizzle ORM, Inngest, Tailwind CSS, shadcn/ui, Apache ECharts, Tremor, and
release proof. It still has no implemented Next.js app, UI, CI, deployment automation,
worker, or realtime provider code. US-038 has started a bounded Supabase/Drizzle
auth-tenancy foundation, but no live database runtime, browser auth flow, hosted
Supabase project, or production migration path is wired yet. Its RLS helpers and direct policies now require trusted student/instructor `app_role` paths for the bounded local proof, its local RLS proof harness parses `AUTH_TENANCY_DATABASE_URL` as a server-only PostgreSQL URL before execution, and its server-side database row parsers preserve student fund/order/ledger/macro-narrative/market-metric and instructor God Mode holding scopes before result delivery.

The current job of agents is to preserve and grow the collaboration harness
while adding story-selected, bounded implementation slices toward the complete
full-stack simulation game. Do not scaffold broad unrelated shells, but do not
keep reporting auth, UI, database, worker, realtime, CI, or deployment as
categorically unattempted once the backlog selects a story for that layer.

When an autonomous sprint continues the full-stack MVP, select the earliest
unimplemented slice from the full-stack sprint sequence in `docs/stories/backlog.md`.
If local Supabase RLS execution is blocked only because `AUTH_TENANCY_DATABASE_URL`
is not configured, record that specific blocker and move to the next bounded slice
that can proceed safely, such as the Next.js app shell or browser auth flow that
does not expose gameplay data.

## Source Of Truth

Read in this order:

1. `README.md` for project status.
2. `docs/HARNESS.md` for the human-agent operating model.
3. `docs/FEATURE_INTAKE.md` before turning any prompt into work.
4. `SPEC.md` and `docs/prd/PRD-01.md` for the accepted seed specification snapshot.
5. `docs/product/` for current product contracts.
6. `docs/ARCHITECTURE.md` before proposing implementation shape.
7. `docs/stories/` for story packets and backlog.
8. `docs/TEST_MATRIX.md` for proof status.
9. `docs/decisions/` for why important choices were made.

This harness did not ship with a project-specific `SPEC.md`; this project now
has one because the human supplied a spec and explicitly requested that artifact.
Treat `SPEC.md` as a stable intake snapshot, not the living product plan. Product
docs, stories, tests, and decisions are the living contract that agents should
update as the system evolves.

## Task Loop

For every task:

1. Classify the request with `docs/FEATURE_INTAKE.md`.
2. Identify whether the input is a new spec, spec slice, change request, new
   initiative, maintenance request, or harness improvement.
3. Locate the affected product docs and story files.
4. Check `docs/TEST_MATRIX.md` for existing proof and gaps.
5. Work only inside the selected lane: tiny, normal, or high-risk.
6. Before finishing, ask:
   - Did product truth change?
   - Did validation expectations change?
   - Did architecture rules change?
   - Did we discover a repeated failure pattern?
   - Did the next agent need a clearer instruction?
7. Update routine harness files directly, or add a proposal to
   `docs/HARNESS_BACKLOG.md` when the change is structural.

## Harness Change Policy

Agents may update directly:

- Story status and evidence.
- `docs/TEST_MATRIX.md` rows.
- Links from story packets to product docs.
- Validation notes and reports.
- Small clarifications tied to the current task.

Agents should ask for human confirmation before:

- Changing architecture direction.
- Removing validation requirements.
- Changing the source-of-truth hierarchy.
- Changing risk classification rules.
- Replacing the feature workflow.

## Done Definition

A task is done only when:

- The requested change is completed or the blocker is documented.
- Relevant docs, stories, and test matrix entries remain current.
- Validation commands were run when they exist.
- Missing harness capabilities were added to `docs/HARNESS_BACKLOG.md`.
- The final response says what changed and what was not attempted.
