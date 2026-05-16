# Product Docs

This directory contains the living product contract derived from the accepted Apex Alpha PRD.

Source snapshot:

- `../../SPEC.md`
- `../prd/PRD-01.md`

## Current Product Contract

- `overview.md` — product vision, goals, scope, and MVP boundaries.
- `roles-and-permissions.md` — student/instructor capabilities and security invariants.
- `simulation-engine.md` — deterministic macro engine, TARA rules, friction, and attribution.
- `user-surfaces.md` — student and instructor dashboards plus realtime refresh expectations.
- `data-model.md` — future entity blueprint and data invariants.
- `runtime-architecture.md` — target stack and runtime constraints.

## Update Rule

When behavior changes:

1. Update the affected product doc.
2. Update or create the story packet.
3. Update `docs/TEST_MATRIX.md`.
4. Record a decision if the change affects architecture, scope, risk, or a previously settled product rule.

Do not extend `SPEC.md` as the living product plan.
