# Spec Intake: Apex Alpha Portfolio Simulator

Date: 2026-05-16

## Source

- User prompt: ingest `docs/prd/PRD-01.md` as `SPEC.md`.
- Attached file: none.
- Repository source: `docs/prd/PRD-01.md`.

## Intake Classification

Input type: new spec
Lane: high-risk documentation intake

Risk flags:

- Auth.
- Authorization.
- Data model.
- Audit/security.
- External systems.
- Public contracts.
- Cross-platform browser/runtime behavior.
- Weak proof.
- Multi-domain.

Implementation status: not started. This intake only derives product contracts, candidate epics, validation shape, and architecture direction from the PRD.

## Project Summary

Apex Alpha Portfolio Simulator is a deterministic classroom portfolio simulation. Students manage virtual funds over monthly turns while instructors control class pacing, review aggregate outcomes, and debrief student decisions.

The product teaches portfolio structure, macroeconomic signal timing, and disciplined TARA rebalancing under tax and liquidity friction.

## Candidate Product Docs

| File | Purpose | Source sections |
| --- | --- | --- |
| `docs/product/overview.md` | Product vision, scope, principles, and MVP boundary | PRD 1, 2, 8 |
| `docs/product/roles-and-permissions.md` | Student/instructor capabilities and anti-cheat security invariants | PRD 3, 6 |
| `docs/product/simulation-engine.md` | Deterministic engine, macro lag rules, asset factors, friction, attribution | PRD 4, 5.1, 5.3 |
| `docs/product/user-surfaces.md` | Student and instructor dashboard surfaces and realtime refresh | PRD 5 |
| `docs/product/data-model.md` | Future database entities and invariants | PRD 7 |
| `docs/product/runtime-architecture.md` | Target stack and runtime constraints | PRD 6 |

## Candidate Epics

| Epic | Description | Status |
| --- | --- | --- |
| E00 | Data, auth, tenant, and scenario foundation | unsliced |
| E01 | Student Bloomberg dashboard | unsliced |
| E02 | Instructor management and leaderboard | unsliced |
| E03 | Dual-trigger execution engine | unsliced |
| E04 | Validation, deployment, and operational proof | unsliced |

## Architecture Questions

- Runtime stack: Next.js App Router, Vercel, Supabase, Drizzle ORM, Inngest or Upstash QStash, Tailwind CSS, shadcn/ui, Apache ECharts, Tremor.
- Product surfaces: browser app, server-side actions/queries, scheduled cron trigger, background worker, realtime event channel.
- Storage: Supabase PostgreSQL with RLS.
- External providers: Vercel, Supabase, Inngest or Upstash QStash.
- Deployment target: Vercel, with automated triggers defaulting to UTC+7.
- Security model: authenticated users, class tenancy, role-scoped queries, no future scenario data in student browser, no cross-student exact holdings access.

## Validation Shape

| Layer | Expected proof |
| --- | --- |
| Unit | Simulation math, macro lag calculations, allocation validation, tax/slippage rules, idempotency decisions. |
| Integration | Supabase RLS, Drizzle schema constraints, server actions, background worker processing, realtime event publish/subscribe. |
| E2E | Student submits TARA order, instructor creates class and advances month, connected student refreshes after processing. |
| Platform | Vercel cron trigger, worker queue integration, deployed environment smoke. |
| Release | Full regression plus security/tenant isolation checks before launch. |

## Open Decisions

- Choose Inngest or Upstash QStash as the accepted background processing provider.
- Define exact Sharpe ratio calculation window and risk-free-rate assumptions.
- Define seeded macro scenario data shape and authoring process.
- Define join-link lifecycle and invitation security model.
- Decide whether instructor God Mode requires explicit audit logging in MVP.

## First Story Candidates

- Establish Supabase auth, class tenancy, and RLS baseline.
- Seed deterministic macro narratives and asset DNA.
- Implement student current-month macro terminal.
- Implement TARA order validation and submission.
- Implement deterministic month-processing worker.
- Implement instructor class creation and live month advancement.
- Implement realtime turn-completion refresh.

## Harness Delta

Created a root `SPEC.md` snapshot because the user explicitly requested that wording, but marked it as source material rather than the living product plan. Living product truth was decomposed into product docs, candidate epics, validation expectations, and a decision record.
