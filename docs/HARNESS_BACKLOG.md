# Harness Backlog

Use this file when an agent discovers a missing harness capability but should
not change the operating model immediately.

## Template

```md
## Missing Harness Capability

### Title

Short name.

### Discovered While

Task or story that exposed the gap.

### Current Pain

What was hard, repeated, ambiguous, or unsafe?

### Suggested Improvement

What should be added or changed?

### Risk

Tiny, normal, or high-risk.

### Status

proposed | accepted | implemented | rejected
```

## Items

## Missing Harness Capability

### Title

Blocked high-risk story reselection guard.

### Discovered While

US-038 data, auth, and tenancy foundation autonomous sprint on 2026-05-17.

### Current Pain

After pure-domain descriptor slices are exhausted, autonomous sprint rounds can keep reselecting the same high-risk provider-backed prerequisite and only restate blocker evidence. That is safe, but it creates churn and makes it harder to tell when human approval is the only remaining path forward.

### Suggested Improvement

Add a blocked-story stop rule or backlog marker that tells future autonomous rounds to stop after recording the blocker once, unless the user has supplied the missing approval inputs or explicitly asks for another blocker refinement.

Implemented in `docs/HARNESS.md` as the blocked high-risk reselection guard, and reinforced with current queue markers in `docs/stories/backlog.md` and `docs/TEST_MATRIX.md`.

### Risk

Normal.

### Status

implemented

