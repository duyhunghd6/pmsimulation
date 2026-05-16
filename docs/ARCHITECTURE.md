# Architecture

The accepted Apex Alpha PRD selects a web application direction, but no application code exists yet. This document captures architecture rules future implementation should follow when selected stories begin.

Source decision: `docs/decisions/0004-accept-apex-alpha-prd.md`.

## Selected Stack Direction

| Layer | Technology |
| --- | --- |
| Frontend framework | Next.js App Router |
| Hosting and cron | Vercel |
| Database and auth | Supabase PostgreSQL/Auth/RLS |
| Realtime | Supabase Realtime |
| ORM | Drizzle ORM |
| Background worker | Inngest or Upstash QStash |
| UI | Tailwind CSS and shadcn/ui |
| Visualization | Apache ECharts and Tremor |

The final worker choice remains open until the execution-engine implementation story selects Inngest or Upstash QStash.

## Discovery Before Shape

Before proposing implementation shape for a selected story, identify:

- Product surface: student browser, instructor browser, server action/query, cron trigger, background worker, realtime channel, or deployment platform.
- Runtime stack details needed by that story.
- Core domains: class, fund, macro narrative, asset DNA, holding, TARA order, ledger, attribution.
- Boundary inputs: user input, server actions, auth/session claims, database rows, cron payloads, worker events, realtime payloads, environment configuration.
- Validation ladder: the smallest checks that can prove the selected slice.

Record stack choices in `docs/decisions/` when they meaningfully constrain future work.

## Default Layering

```text
domain
  <- application
      <- infrastructure
          <- interface
              <- app surfaces
```

## Candidate Structure

```text
app/
  domain/
    entities/
    value-objects/
    repositories/
    services/

  application/
    commands/
    queries/
    handlers/

  infrastructure/
    database/
    logging/
    notifications/

  interface/
    controllers/
    dto/
    presenters/
    routes/
    middlewares/

surfaces/
  browser/
```

This is a thinking template, not a scaffold. Create real folders only when a story enters implementation and the selected stack needs them.

## Dependency Rule

Inner layers must not depend on outer layers.

| Layer | May depend on | Must not depend on |
| --- | --- | --- |
| domain | nothing project-external except tiny pure utilities | framework, database, UI, provider, process/env |
| application | domain | framework, UI, provider, database concrete clients |
| infrastructure | domain, application | interface controllers or UI |
| interface | all backend layers | UI state or platform shell assumptions |
| app surfaces | API contracts and app-facing clients | domain internals directly |

## Parse-First Boundary Rule

Unknown data must be parsed at boundaries before it enters inner code.

Boundaries include:

- HTTP request bodies, params, and query strings.
- Server Action inputs.
- Session payloads and identity claims.
- Environment variables.
- Database rows returned from external clients.
- Cron requests.
- Worker events.
- Realtime payloads.

Target flow:

```text
unknown input
  -> parser
  -> typed DTO or command
  -> application use case
  -> domain object/value object
```

Inner layers should work with meaningful product types such as `ClassId`, `FundId`, `StudentId`, `InstructorId`, `MonthIndex`, `AssetTier`, and `AllocationWeight` rather than repeatedly validating raw strings.

## Command/Query Boundary

Keep command/query separation clear at the code level even when the storage layer is simple:

- Commands mutate state and own audit side effects.
- Queries read state and format for consumers.
- Shared domain rules live in domain/application, not controllers.

## Security Boundaries

- Future macro narrative rows must never be sent to the student browser.
- Student query paths must not return exact holdings for other students.
- Instructor God Mode must be separated from student data paths.
- RLS policies are part of the product contract, not optional infrastructure.
- End-of-month processing must be idempotent across cron and instructor-triggered paths.

## Observability Contract

The future server should emit one canonical JSON log line per request with:

- timestamp
- level
- request_id
- user_id when known
- action
- duration_ms
- status_code
- message

Audit logs are product records. Application logs are operational records. Do not use one as a substitute for the other.
