# 0004 Accept Apex Alpha PRD

Date: 2026-05-16

## Status

Accepted

## Context

The repository started as Harness v0 with no application implementation and no living product contract beyond placeholder docs. The human directed agents to start with `AGENTS.md`, read `docs/prd/PRD-01.md`, and ingest it as `SPEC.md`.

The PRD defines a concrete product, stack, security model, simulation rules, MVP scope, and data model blueprint.

## Decision

Accept `docs/prd/PRD-01.md` as the seed specification for Apex Alpha Portfolio Simulator.

Create `SPEC.md` as a stable snapshot and pointer to the ingested source because the human explicitly requested that artifact. The snapshot is not the living product plan.

The living product contract is decomposed into `docs/product/`, `docs/stories/backlog.md`, `docs/TEST_MATRIX.md`, and future story packets.

Also accept the PRD's target architecture direction for future stories:

- Next.js App Router on Vercel.
- Supabase PostgreSQL/Auth/RLS and Supabase Realtime.
- Drizzle ORM.
- Inngest or Upstash QStash for background turn processing.
- Tailwind CSS, shadcn/ui, Apache ECharts, and Tremor.

## Consequences

Positive:

- Future agents can work from smaller product docs instead of the full PRD.
- The PRD remains available as historical source material.
- Security, authorization, data model, and validation expectations are visible before implementation begins.
- The harness stays documentation-first and avoids premature app scaffolding.

Tradeoffs:

- `SPEC.md` exists even though Harness v0 normally avoids a project-specific spec file.
- Future agents must treat `SPEC.md` as an intake snapshot, not a place to keep evolving product behavior.
- Background worker choice remains open until a specific implementation story selects Inngest or Upstash QStash.
