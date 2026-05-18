# 0005 Approve Full-Stack MVP Track

Date: 2026-05-18

## Status

Accepted

## Context

The repository had completed many pure TypeScript domain and descriptor slices from the accepted Apex Alpha PRD, but autonomous sprint rounds began reselecting the same blocked high-risk provider stories. The remaining product work needs the actual application stack: auth, database, RLS, web UI, worker, realtime, and release proof.

`SPEC.md` and `docs/prd/PRD-01.md` already name the intended stack. The living docs needed explicit approval to move from descriptor-only work into bounded full-stack implementation stories.

## Decision

Approve the full-stack MVP implementation track through selected stories using:

- Next.js App Router on Vercel.
- Supabase Auth, PostgreSQL, Row Level Security, and Realtime.
- Drizzle ORM.
- Inngest for month-advance background processing.
- Tailwind CSS and shadcn/ui.
- Apache ECharts and Tremor.
- Unit, integration, E2E, platform, and release proof as those layers are introduced.

US-038 may introduce the first provider-backed proof slice with Supabase Auth JWT claims, local Supabase, Drizzle schema/migrations, Supabase RLS, deterministic fixtures, safe denied-access observability, and `npm run test:integration:auth-tenancy`.

Keep `SPEC.md` and `docs/prd/PRD-01.md` as stable accepted snapshots. Future behavior changes should update product docs, story packets, the test matrix, and decision records.

## Consequences

Positive:

- Future agents can stop rechecking the same generic high-risk blocker and begin the approved auth/tenancy foundation.
- The stack is now selected for implementation, not merely described as future intent.
- Security proof becomes the first provider-backed foundation before browser UI, worker, realtime, or deployment work.

Tradeoffs:

- The project moves beyond pure TypeScript domain slices and will need local provider tooling, environment boundaries, and integration validation.
- Agents must still avoid broad uncontrolled scaffolding; each layer must arrive through a selected bounded story.
- Hosted production resources, CI, deployment, browser UI, worker execution, and realtime publication remain separate stories unless explicitly selected.
