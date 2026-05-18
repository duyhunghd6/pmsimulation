#!/usr/bin/env bash
set -euo pipefail

ROUNDS="${1:-30}"
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

Select the next sprint from the Full-Stack MVP Sprint Sequence in docs/stories/backlog.md, not from the old pure-domain queue. Choose the earliest sequence item that is not already implemented and is not blocked by an unavailable external credential or hosted runtime. The old "smallest unblocked" rule must not keep selecting US-038 parser-only, descriptor-only, or docs-only work when the full-stack sequence has an available UI/server slice.

US-038 local RLS execution is blocked when AUTH_TENANCY_DATABASE_URL is not configured. In that case, record that exact blocker once, do not select more US-038 parser-only/query-executor-only work unless a concrete security gap blocks browser exposure, and move to the next safe bounded full-stack slice. The no-gameplay Next.js shell and Supabase auth route guard already exist, so current autonomous rounds should normally advance to current-turn student dashboard server composition and then actual student dashboard UI. If the selected sequence item is UI, implement UI code; do not end the round by reporting "No browser UI" as the main outcome.

The approved full-stack sequence explicitly allows bounded Next.js App Router, Supabase Auth/PostgreSQL/RLS, Drizzle, Inngest, Tailwind/shadcn, charting, realtime, E2E, deployment, and release-proof work when selected by docs/stories/backlog.md. Keep each slice narrow, but do not treat auth, database, UI, worker, realtime, CI, or deployment as categorically forbidden.

For this single round:
1. State the selected Full-Stack MVP Sprint Sequence item, story/work item, and lane.
2. Implement one bounded vertical slice from that sequence item, or document the exact credential/runtime/decision blocker and immediately select the next safe sequence item.
3. Update relevant docs, story status/evidence, and docs/TEST_MATRIX.md when they change.
4. Run available validation commands when they exist, especially npm run validate:quick after code changes.
5. Stop after this one sprint and summarize what changed, validation run, and only the out-of-scope work that was not attempted for this selected slice.

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

  echo "==> Completed sprint round ${round} (${iteration}/${ROUNDS} this run)"
done

echo "==> Completed ${ROUNDS} Claude sprint rounds (${start_round}-${end_round}). Logs are in ${LOG_DIR}."
