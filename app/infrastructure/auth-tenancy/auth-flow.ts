import type { AuthTenancyParseFailureCode, AuthTenancyRole, AuthTenancySession } from './session';

import type { AuthTenancyBrowserAuthEnvironmentFailureCode } from './environment';

export type AuthTenancyRouteSessionFailureCode =
  | AuthTenancyBrowserAuthEnvironmentFailureCode
  | AuthTenancyParseFailureCode
  | 'auth_provider_error'
  | 'not_authenticated';

export type AuthTenancyRouteSessionResult =
  | { ok: true; session: AuthTenancySession }
  | { ok: false; code: AuthTenancyRouteSessionFailureCode };

export type AuthTenancyProtectedRouteAccess =
  | { decision: 'allow'; session: AuthTenancySession }
  | { decision: 'redirect_to_login' }
  | { decision: 'block_configuration'; code: AuthTenancyRouteSessionFailureCode }
  | { decision: 'block_role'; code: AuthTenancyRouteSessionFailureCode | 'wrong_role' };

const configurationFailureCodes = new Set<AuthTenancyRouteSessionFailureCode>([
  'environment_not_object',
  'missing_supabase_url',
  'invalid_supabase_url',
  'missing_supabase_anon_key',
  'invalid_supabase_anon_key',
]);

const roleFailureCodes = new Set<AuthTenancyRouteSessionFailureCode>([
  'claims_not_object',
  'missing_subject',
  'invalid_subject',
  'missing_role',
  'invalid_role',
]);

export function classifyAuthTenancyProtectedRouteAccess(input: {
  expectedRole: AuthTenancyRole;
  routeSession: AuthTenancyRouteSessionResult;
}): AuthTenancyProtectedRouteAccess {
  if (input.routeSession.ok) {
    if (input.routeSession.session.role !== input.expectedRole) {
      return { decision: 'block_role', code: 'wrong_role' };
    }

    return { decision: 'allow', session: input.routeSession.session };
  }

  if (configurationFailureCodes.has(input.routeSession.code)) {
    return { decision: 'block_configuration', code: input.routeSession.code };
  }

  if (roleFailureCodes.has(input.routeSession.code)) {
    return { decision: 'block_role', code: input.routeSession.code };
  }

  return { decision: 'redirect_to_login' };
}
