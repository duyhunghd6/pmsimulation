# Validation

## Proof Strategy

Use unit tests to prove the executor enforces instructor role and current-month class scope before returning the existing status-only envelope. Provider-backed integration and browser proof remain pending because no live Supabase runtime or protected instructor UI is wired in this slice.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Instructor happy path; wrong-role denial before row access; missing month denial before row access; cross-class fund rejection; cross-class/future-month order rejection; duplicate pending order rejection; non-pending order rejection; forbidden target weight/tax/provider payload exclusion. |
| Integration | Pending; future Supabase-backed reader and RLS proof. |
| E2E | Pending; no instructor browser UI in this slice. |
| Platform | Not applicable. |
| Performance | Not applicable. |
| Logs/Audit | Existing safe authorization event contract unchanged. |

## Fixtures

Unit fixtures use deterministic instructor, class, fund, and TARA order ids matching the auth-tenancy parser shape.

## Commands

```text
npm run test:unit -- app/infrastructure/auth-tenancy/instructor-pending-order-visibility-query.test.ts app/infrastructure/auth-tenancy/rows.test.ts
npm run validate:quick
```

## Acceptance Evidence

- `npm run test:unit -- app/infrastructure/auth-tenancy/instructor-pending-order-visibility-query.test.ts app/infrastructure/auth-tenancy/rows.test.ts` — passed; 2 test files and 32 tests passed.
- `npm run validate:quick` — passed; 35 test files and 440 tests passed.
