# Agent Operating Guide

This repository started as Harness v0 and now has minimal pure TypeScript
domain slices for accepted story packets. The human approved the full-stack MVP
implementation track on 2026-05-18 so the accepted stack can now be introduced
through selected stories: Next.js App Router, Vercel, Supabase Auth/PostgreSQL/RLS/Realtime,
Drizzle ORM, Inngest, Tailwind CSS, shadcn/ui, Apache ECharts, Tremor, and
release proof. It now has a minimal Next.js App Router shell with public home, Supabase magic-link login/logout actions, student/instructor route-group dashboard shells protected by Supabase session plus trusted `app_role` claim checks, a protected student current-turn dashboard UI with a Supabase-backed row reader when the App Router Supabase server client is available, a bounded browser TARA order form, and first bounded post-turn attribution panel, a bounded instructor class creation server-action executor, protected instructor class creation UI, protected instructor pending-order visibility, live leaderboard, class aggregate analytics with a Supabase-backed aggregate-safe row reader when the App Router Supabase server client is available, and God Mode portfolio visibility UI with a Supabase-backed privileged row reader when that server client is available, a first bounded Inngest month-advance worker handoff route, a first bounded `/api/cron/month-advance` scheduled-trigger route that requires `CRON_SECRET` and dispatches valid auto requests into that Inngest handoff, a first bounded injected server-only Supabase Realtime publication boundary, a first browser-visible Supabase Realtime subscription/refetch status panel with parse-first refresh-only payload validation and safe public-env fallback, a bounded local release proof command that aggregates validate, route smoke, and build evidence without deploying, and a bounded non-deploying CI workflow that runs the local release proof with read-only repository permissions, but no hosted-proven live provider-backed gameplay database runtime, live provider-backed browser order form, hosted CI run proof, deployment automation,
durable auto-class discovery, hosted Vercel cron execution, hosted worker execution, hosted realtime provider execution, hosted Supabase subscription/publication proof, live server query execution after realtime refetch, hosted Supabase project, or provider-backed browser E2E auth proof. US-038 has started a bounded Supabase/Drizzle
auth-tenancy foundation, but no hosted
Supabase project or production migration path is wired yet. Its RLS helpers and direct policies now require trusted student/instructor `app_role` paths for the bounded local proof, its local RLS proof harness parses `AUTH_TENANCY_DATABASE_URL` as a server-only PostgreSQL URL before execution, its future browser auth setup parses only public Supabase URL/anon-key values, its server-side database row parsers preserve student fund/holding/order/risk-register/ledger/macro-narrative/market-metric/tracked-metric and instructor owned-class/God Mode holding scopes before result delivery, its injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, and TARA order-entry query executors return safe envelopes from parsed RLS-backed rows, its protected student dashboard renders a bounded post-turn attribution panel from existing safe post-turn snapshot/query-result envelope builders, its injected instructor class creation executor validates trusted-session class drafts through a parsed persisted class row before returning the existing instructor-safe class creation envelope, its injected instructor pending-order visibility executor returns the existing status-only instructor envelope from parsed scoped class fund and TARA order status rows, its injected instructor live leaderboard executor returns the existing leaderboard-safe envelope from parsed scoped class fund and TARA order status rows, its injected instructor class aggregate analytics executor returns the existing aggregate-safe envelope from parsed scoped class fund and TARA order status rows, its injected instructor God Mode portfolio visibility executor returns the existing privileged envelope from parsed scoped class fund, current holding, and TARA order status rows, and the protected instructor dashboard renders those status-only, leaderboard-safe, aggregate-safe, and privileged God Mode envelopes through bounded parsed rows, preferring Supabase-backed readers for pending-order visibility, live leaderboard, aggregate analytics, and God Mode when the App Router server client is available.

The current job of agents is to preserve and grow the collaboration harness
while adding story-selected, bounded implementation slices toward the complete
full-stack simulation game. Do not scaffold broad unrelated shells, but the
approved full-stack sprint sequence now explicitly permits bounded auth,
database, UI, worker, realtime, CI, deployment, and release-proof work when that
layer is the selected backlog slice. Do not keep reporting those layers as
categorically unattempted.

When an autonomous sprint continues the full-stack MVP, select the earliest
unimplemented slice from the full-stack sprint sequence in `docs/stories/backlog.md`.
Do not fall back to the old pure-domain "smallest unblocked" queue, and do not
follow stale progression notes from previous sprint logs or older prompts when
they conflict with the backlog and test matrix. If local Supabase RLS execution
is blocked only because `AUTH_TENANCY_DATABASE_URL` is not configured, record
that specific blocker once, do not select more US-038 parser-only or
query-executor-only work unless a concrete security gap blocks browser exposure,
and move to the next bounded full-stack slice. Before implementing a non-UI
slice, explicitly verify that no earlier or already-backed browser-visible UI is
missing; if an unblocked UI over a safe server boundary is missing, implement the
UI slice first.

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
- Browser-visible UI changes used `npm run smoke:routes` when practical, or named the exact smoke blocker.
- Dependency audit findings introduced or surfaced by the slice were recorded with severity/count; force fixes or dependency downgrades were not run without human approval.
- Missing harness capabilities were added to `docs/HARNESS_BACKLOG.md`.
- The final response says what changed, validation status, and only what was intentionally out of scope for the selected slice.
