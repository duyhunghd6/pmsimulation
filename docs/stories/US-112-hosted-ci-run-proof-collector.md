# US-112 Hosted CI Run Proof Collector

## Status

implemented

## Lane

normal

## Product Contract

The release proof track needs a non-mutating way to collect hosted GitHub Actions evidence for the existing local release validation workflow. The collector must read recent workflow runs, record a successful hosted run when one exists, and otherwise write the exact read-only blocker without triggering workflows, deploying, or mutating provider state.

## Relevant Product Docs

- `docs/product/runtime-architecture.md`
- `docs/TEST_MATRIX.md`

## Acceptance Criteria

- Add a local command that queries hosted GitHub Actions workflow run status through the `gh` CLI without dispatching, rerunning, cancelling, approving, or editing workflows.
- Write a structured report that marks proof as `passed` only when a completed successful run for the local release validation workflow is found.
- When hosted CI evidence cannot be collected, write a safe `blocked` report with the exact blocker and sanitized command output.
- Keep deployment, Supabase, Inngest, and Vercel provider mutation out of scope.

## Design Notes

- Commands: `npm run proof:hosted-ci` runs `scripts/hosted-ci-proof.mjs`.
- Queries: read-only `gh run list --workflow local-release-validation.yml --limit 10 --json ...`.
- API: none.
- Tables: none.
- Domain rules: no gameplay data or provider credentials are read or written.
- UI surfaces: none.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `npm run validate:quick` covers TypeScript and existing unit suite after adding the command. |
| Integration | Not applicable; the command uses read-only hosted CI metadata and writes a local report. |
| E2E | Not applicable; no browser surface changes. |
| Platform | `npm run proof:hosted-ci` writes `reports/hosted-ci-proof.json` with `passed` hosted CI evidence or a blocked reason. |
| Release | `npm run release:local` remains the local gate; this story adds hosted CI evidence collection beside it. |

## Harness Delta

The sprint log records item-9 selection and the non-UI gate in `.claude/sprint-runs/round-186-20260519-hosted-ci-proof-collector.log`.

## Evidence

- `scripts/hosted-ci-proof.mjs` added a read-only hosted CI run evidence collector.
- `package.json` added `npm run proof:hosted-ci`.
- `npm run proof:hosted-ci` completed and wrote `reports/hosted-ci-proof.json` with `status=blocked`, because `gh run list` succeeded read-only but found only a cancelled hosted workflow run and no completed successful hosted CI run.
- `npm run validate:quick` passed with 57 test files and 548 tests.
- `npm run smoke:routes` passed for `/`, `/login`, `/join/ALPHA01`, `/dashboard`, and `/instructor/dashboard` with protected-route sign-in redirects.
