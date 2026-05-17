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

`scripts/run-claude-sprints.sh` runs Claude Code for at least 10 bounded implementation rounds. Each round passes an AGENTS.md-first prompt, asks Claude to choose the next smallest unblocked sprint from the harness, and tells it to stop after one bounded slice.

```bash
./scripts/run-claude-sprints.sh
./scripts/run-claude-sprints.sh 12
```

Optional environment variables:

- `CLAUDE_BIN` — Claude Code executable name or path. Defaults to `claude`.
- `CLAUDE_EXTRA_ARGS` — additional Claude Code flags, such as a permission mode.
- `LOG_DIR` — output directory for per-round logs. Defaults to `.claude/sprint-runs`.

The runner passes `--dangerously-skip-permissions` to Claude Code for unattended sprint execution. It does not set model, base URL, auth token, commit, push, or create PRs.

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
