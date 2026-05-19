#!/usr/bin/env bash
set -euo pipefail

ROUNDS="${1:-5}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${LOG_DIR:-${ROOT_DIR}/.claude/sprint-runs}"
POSTFLIGHT_VALIDATE="${POSTFLIGHT_VALIDATE:-1}"

if ! [[ "${ROUNDS}" =~ ^[0-9]+$ ]]; then
  echo "Usage: $0 [rounds>=5]" >&2
  exit 2
fi

if (( ROUNDS < 5 )); then
  echo "This runner is intended for at least 5 implementation rounds." >&2
  echo "Usage: $0 [rounds>=5]" >&2
  exit 2
fi

if ! command -v "${CLAUDE_BIN}" >/dev/null 2>&1; then
  echo "Claude Code command not found: ${CLAUDE_BIN}" >&2
  echo "Set CLAUDE_BIN=/path/to/claude or install Claude Code." >&2
  exit 127
fi

mkdir -p "${LOG_DIR}"
cd "${ROOT_DIR}"

latest_round=0
shopt -s nullglob
for existing_log in "${LOG_DIR}"/round-[0-9]*-*.log; do
  existing_name="$(basename "${existing_log}")"
  if [[ "${existing_name}" =~ ^round-([0-9]+)-[0-9]{8}-[0-9]{6}\.log$ ]]; then
    round_number="$((10#${BASH_REMATCH[1]}))"
    if (( round_number > latest_round )); then
      latest_round="${round_number}"
    fi
  fi
done
shopt -u nullglob

start_round="$((latest_round + 1))"
end_round="$((latest_round + ROUNDS))"

for round in $(seq "${start_round}" "${end_round}"); do
  iteration="$((round - latest_round))"
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

Select the next sprint from the Full-Stack MVP Sprint Sequence in docs/stories/backlog.md, not from the old pure-domain queue. Derive current progress from AGENTS.md, docs/stories/backlog.md, docs/TEST_MATRIX.md, and existing story evidence; do not rely on stale progression notes embedded in old logs or prompts. Choose the earliest sequence item that is not already implemented and is not blocked by an unavailable external credential or hosted runtime. The old "smallest unblocked" rule must not keep selecting US-038 parser-only, descriptor-only, query-executor-only, action-executor-only, test-only, or docs-only work when the full-stack sequence has an available browser-visible UI slice.

US-038 local RLS execution is blocked when AUTH_TENANCY_DATABASE_URL is not configured. In that case, record that exact blocker once, do not select more US-038 parser-only/query-executor-only work unless a concrete security gap blocks browser exposure, and move to the next safe bounded full-stack slice.

UI-FIRST OVERRIDE: if a server query/action boundary already exists for a student or instructor feature and its browser UI is still missing, select the UI before selecting another backend-only slice in the same or later sequence item. A UI sprint must modify an App Router page or component that a user can reach in the browser, wire it to the existing safe server boundary when available, and provide loading/empty/error/success states appropriate to that slice. Do not report "browser UI not attempted" as the main outcome when a missing UI is unblocked.

Before implementation, write an auditable sequence preflight in the log using this exact shape:

Sequence preflight:
- Item 1: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 2: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 3: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 4: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 5: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 6: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 7: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 8: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Item 9: <implemented | skipped | blocked | selected candidate> — <specific evidence or blocker>
- Selected: item <N>, <story/work item>, because <why every earlier item is implemented or blocked>

If the selected item is non-UI, also write this exact gate before implementing:

Non-UI selection gate:
- Earlier or already-backed browser UI gaps checked: <list specific gaps checked, or "none found">
- Decision: <proceed with non-UI | switch to UI>, because <specific reason>

If that gate finds any unblocked missing UI over an existing safe server query/action boundary, switch to that browser-visible UI slice instead of continuing the non-UI slice.

The approved full-stack sequence explicitly allows bounded Next.js App Router, Supabase Auth/PostgreSQL/RLS, Drizzle, Inngest, Tailwind/shadcn, charting, realtime, E2E, deployment, and release-proof work when selected by docs/stories/backlog.md. Keep each slice narrow, but do not treat auth, database, UI, worker, realtime, CI, or deployment as categorically forbidden.

For this single round:
1. State the selected Full-Stack MVP Sprint Sequence item, story/work item, lane, and whether the work is browser-visible UI or non-UI.
2. Complete the sequence preflight, and complete the non-UI selection gate when applicable.
3. Implement one bounded vertical slice from that sequence item, or document the exact credential/runtime/decision blocker and immediately select the next safe sequence item.
4. For UI slices, modify reachable App Router UI and run npm run smoke:routes when practical; if browser/auth proof is blocked, still implement the reachable UI with safe fallback data and name the exact proof blocker.
5. Update relevant docs, story status/evidence, and docs/TEST_MATRIX.md when they change.
6. Run available validation commands when they exist, especially npm run validate:quick after code changes.
7. If npm install or dependency updates report audit findings, record the severity/count in the story evidence or final summary; do not run force fixes or dependency downgrades unless the human explicitly approves.
8. Stop after this one sprint and summarize what changed, validation run, and only the out-of-scope work that was not attempted for this selected slice.

Do not commit, push, or create a pull request.
PROMPT
)"

  echo "==> Claude sprint round ${round} (${iteration}/${ROUNDS} this run)"
  echo "==> Log: ${log_file}"

  if [[ -n "${CLAUDE_EXTRA_ARGS:-}" ]]; then
    # Intentional word splitting lets callers pass Claude Code flags, for example:
    # CLAUDE_EXTRA_ARGS="--permission-mode acceptEdits"
    # shellcheck disable=SC2086
    "${CLAUDE_BIN}" --dangerously-skip-permissions ${CLAUDE_EXTRA_ARGS} -p "${prompt}" 2>&1 | tee "${log_file}"
  else
    "${CLAUDE_BIN}" --dangerously-skip-permissions -p "${prompt}" 2>&1 | tee "${log_file}"
  fi

  {
    echo
    echo "==> Harness postflight for sprint round ${round}"
    echo "==> git status --short"
    git status --short
    echo
    echo "==> git diff --stat"
    git diff --stat
  } 2>&1 | tee -a "${log_file}"

  if [[ "${POSTFLIGHT_VALIDATE}" != "0" ]]; then
    echo "==> npm run validate:quick postflight" | tee -a "${log_file}"
    npm run validate:quick 2>&1 | tee -a "${log_file}"
  fi

  echo "==> Completed sprint round ${round} (${iteration}/${ROUNDS} this run)"
done

echo "==> Completed ${ROUNDS} Claude sprint rounds (${start_round}-${end_round}). Logs are in ${LOG_DIR}."
