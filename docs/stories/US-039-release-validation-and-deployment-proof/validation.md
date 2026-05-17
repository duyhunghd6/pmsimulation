# Validation

## Proof Strategy

This story cannot be implemented until a deployable app/runtime and lower-layer validation suites exist. When unblocked, release proof must aggregate unit, integration, E2E, and platform evidence rather than substituting one layer for another.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Existing pure domain validation continues to pass through `npm run validate:quick`. |
| Integration | Auth/RLS, database constraints, worker enqueue/process behavior, and realtime provider contracts pass their accepted integration commands. |
| E2E | Student order submission, instructor class management, live turn advancement, and post-turn refresh pass in a deployed or deployment-equivalent environment. |
| Platform | Deployment smoke confirms server-only secrets, scheduled trigger availability, worker reachability, realtime channel readiness, and current-turn access protection. |
| Performance | Release smoke confirms month advancement and dashboard refresh stay within accepted runtime budgets after those budgets are defined. |
| Logs/Audit | Release checks verify operational logs/audit records are present and do not leak secrets, future scenario rows, unauthorized holdings, or gameplay payloads. |

## Fixtures

- Accepted integration fixtures from auth/RLS, database, worker, and realtime stories.
- A deterministic class with instructor, students, funds, current/past/future scenario rows, pending order, processed ledger, and realtime refresh signal after those persistence stories exist.
- A deployed or deployment-equivalent environment with server-only provider credentials after platform setup exists.

## Commands

```text
npm run validate:quick
TBD: integration validation command after provider/data boundaries exist
TBD: E2E validation command after browser app surfaces exist
TBD: platform/release smoke command after deployment configuration exists
```

## Acceptance Evidence

Blocked in this sprint. No app runtime, CI, deployment platform, provider environment, integration suite, E2E suite, or platform smoke command exists yet.
