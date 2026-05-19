# Scripts

This directory is reserved for harness automation.

## Installer

The upstream installer applies the Harness v0 operating files and folder
structure to a target project directory. It defaults to the current directory,
accepts a target path, and asks interactive users whether to `1. Merge`,
`2. Override`, or `3. Stop` when the target already contains `AGENTS.md`,
`docs/`, or `scripts/`.
Non-interactive installs stop on those protected paths unless `--merge` or
`--override` is provided.

```bash
curl -fsSL "https://raw.githubusercontent.com/hoangnb24/harness-experimental/main/scripts/install-harness.sh?$(date +%s)" | bash -s -- --yes
```

```bash
curl -fsSL "https://raw.githubusercontent.com/hoangnb24/harness-experimental/main/scripts/install-harness.sh?$(date +%s)" | bash -s -- --merge --yes
```

The installer must stay limited to harness files. Do not use it to scaffold
application source folders, package scripts, CI, tests, platform shells, or fake
validation commands. The installer script is not part of the installed project
payload.

## Claude Sprint Runner

`scripts/run-claude-sprints.sh` runs Claude Code for at least 5 bounded implementation rounds. Each round passes an AGENTS.md-first prompt, requires an auditable Full-Stack MVP Sprint Sequence preflight from `docs/stories/backlog.md`, applies the UI-first override before non-UI work, and tells Claude to stop after one bounded slice.

```bash
./scripts/run-claude-sprints.sh
./scripts/run-claude-sprints.sh 12
```

Optional environment variables:

- `CLAUDE_BIN` — Claude Code executable name or path. Defaults to `claude`.
- `CLAUDE_EXTRA_ARGS` — additional Claude Code flags, such as a permission mode.
- `LOG_DIR` — output directory for per-round logs. Defaults to `.claude/sprint-runs`.
- `POSTFLIGHT_VALIDATE` — set to `0` to skip the runner-level `npm run validate:quick` postflight. Defaults to `1`.

The runner appends `git status --short`, `git diff --stat`, and runner-level validation output to each round log. It passes `--dangerously-skip-permissions` to Claude Code for unattended sprint execution. It does not set model, base URL, auth token, commit, push, or create PRs.

## Route Smoke

`npm run smoke:routes` checks the default App Router surfaces (`/`, `/login`, `/dashboard`, and `/instructor/dashboard`). It reuses an existing server at `SMOKE_BASE_URL` or starts `npm run dev` when none is reachable.

Optional environment variables:

- `SMOKE_BASE_URL` — base URL to smoke. Defaults to `http://127.0.0.1:3000`.
- `SMOKE_ROUTES` — comma-separated routes. Defaults to `/,/login,/dashboard,/instructor/dashboard`.
- `SMOKE_STARTUP_TIMEOUT_MS` — dev-server startup wait. Defaults to `30000`.
- `SMOKE_REQUEST_TIMEOUT_MS` — per-route fetch timeout. Defaults to `10000`.

## Local Release Proof

`npm run release:local` runs the current local release gate: `validate:quick`, route smoke, and `next build`. It writes a structured JSON report to `reports/local-release-proof.json` by default without deploying, requiring hosted provider credentials, or mutating CI/shared platform state.

Optional environment variables:

- `LOCAL_RELEASE_PROOF_REPORT` — report output path. Defaults to `reports/local-release-proof.json`.

## CI Release Validation

`.github/workflows/local-release-validation.yml` runs the same local release proof on pull requests, pushes to `main`, and manual dispatches. The workflow installs from `package-lock.json`, runs `npm run release:local`, and uploads `reports/local-release-proof.json` as an artifact without deploying or requiring hosted Supabase, Inngest, or Vercel credentials.

## Future Command Contract

Expected future checks:

```text
validate:quick
  format, lint, typecheck, unit tests, architecture check

test:integration
  backend contract and integration checks

test:e2e
  user-visible end-to-end flows

test:platform
  platform shell smoke checks, if the project has a native shell

test:release
  full suite, log checks, and performance smoke
```
