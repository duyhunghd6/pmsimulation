#!/usr/bin/env bash
set -euo pipefail

ROUNDS="${1:-10}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${LOG_DIR:-${ROOT_DIR}/.claude/sprint-runs}"

if ! [[ "${ROUNDS}" =~ ^[0-9]+$ ]]; then
  echo "Usage: $0 [rounds>=10]" >&2
  exit 2
fi

if (( ROUNDS < 10 )); then
  echo "This runner is intended for at least 10 implementation rounds." >&2
  echo "Usage: $0 [rounds>=10]" >&2
  exit 2
fi

if ! command -v "${CLAUDE_BIN}" >/dev/null 2>&1; then
  echo "Claude Code command not found: ${CLAUDE_BIN}" >&2
  echo "Set CLAUDE_BIN=/path/to/claude or install Claude Code." >&2
  exit 127
fi

mkdir -p "${LOG_DIR}"
cd "${ROOT_DIR}"

for round in $(seq 1 "${ROUNDS}"); do
  stamp="$(date +%Y%m%d-%H%M%S)"
  log_file="${LOG_DIR}/round-$(printf '%02d' "${round}")-${stamp}.log"

  prompt="$(cat <<'PROMPT'
Read @AGENTS.md first and follow it exactly. This is one autonomous implementation sprint for the Apex Alpha Portfolio Simulator repository.

Start by reading, in AGENTS.md order, the source-of-truth docs that are relevant to choosing the next work:
- README.md
- docs/HARNESS.md
- docs/FEATURE_INTAKE.md
- SPEC.md and docs/prd/PRD-01.md only as needed
- docs/product/
- docs/ARCHITECTURE.md before implementation-shape decisions
- docs/stories/
- docs/TEST_MATRIX.md
- docs/decisions/

Select the next smallest unblocked sprint from docs/stories/backlog.md and docs/TEST_MATRIX.md. Prefer continuing existing story packets before creating new ones. Work in the correct intake lane. Keep the blast radius small. Do not scaffold broad app/platform shells, package scripts, CI, database migrations, auth, UI, or deployment unless an accepted story explicitly requires it.

For this single round:
1. State the selected story/work item and lane.
2. Implement only one bounded vertical slice or document the blocker.
3. Update relevant docs, story status/evidence, and docs/TEST_MATRIX.md when they change.
4. Run available validation commands when they exist, especially npm run validate:quick after code changes.
5. Stop after this one sprint and summarize what changed, validation run, and what was not attempted.

Do not commit, push, or create a pull request.
PROMPT
)"

  echo "==> Claude sprint round ${round}/${ROUNDS}"
  echo "==> Log: ${log_file}"

  if [[ -n "${CLAUDE_EXTRA_ARGS:-}" ]]; then
    # Intentional word splitting lets callers pass Claude Code flags, for example:
    # CLAUDE_EXTRA_ARGS="--permission-mode acceptEdits"
    # shellcheck disable=SC2086
    "${CLAUDE_BIN}" ${CLAUDE_EXTRA_ARGS} -p "${prompt}" 2>&1 | tee "${log_file}"
  else
    "${CLAUDE_BIN}" -p "${prompt}" 2>&1 | tee "${log_file}"
  fi

  echo "==> Completed round ${round}/${ROUNDS}"
done

echo "==> Completed ${ROUNDS} Claude sprint rounds. Logs are in ${LOG_DIR}."
