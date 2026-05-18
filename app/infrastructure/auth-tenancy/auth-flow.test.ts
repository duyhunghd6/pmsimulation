import { describe, expect, it } from 'vitest';

import { classifyAuthTenancyProtectedRouteAccess } from './auth-flow';

const studentSession = {
  subjectId: '11111111-1111-4111-8111-111111111111',
  role: 'student' as const,
};

const instructorSession = {
  subjectId: '22222222-2222-4222-8222-222222222222',
  role: 'instructor' as const,
};

describe('classifyAuthTenancyProtectedRouteAccess', () => {
  it('allows a session with the expected app role', () => {
    expect(
      classifyAuthTenancyProtectedRouteAccess({
        expectedRole: 'student',
        routeSession: { ok: true, session: studentSession },
      }),
    ).toEqual({ decision: 'allow', session: studentSession });
  });

  it('blocks authenticated users with the wrong role claim', () => {
    expect(
      classifyAuthTenancyProtectedRouteAccess({
        expectedRole: 'instructor',
        routeSession: { ok: true, session: studentSession },
      }),
    ).toEqual({ decision: 'block_role', code: 'wrong_role' });
    expect(
      classifyAuthTenancyProtectedRouteAccess({
        expectedRole: 'student',
        routeSession: { ok: true, session: instructorSession },
      }),
    ).toEqual({ decision: 'block_role', code: 'wrong_role' });
  });

  it('keeps missing public Supabase configuration inside a safe blocked route state', () => {
    expect(
      classifyAuthTenancyProtectedRouteAccess({
        expectedRole: 'student',
        routeSession: { ok: false, code: 'missing_supabase_url' },
      }),
    ).toEqual({ decision: 'block_configuration', code: 'missing_supabase_url' });
  });

  it('redirects missing or provider-error sessions to the public login route', () => {
    expect(
      classifyAuthTenancyProtectedRouteAccess({
        expectedRole: 'student',
        routeSession: { ok: false, code: 'not_authenticated' },
      }),
    ).toEqual({ decision: 'redirect_to_login' });
    expect(
      classifyAuthTenancyProtectedRouteAccess({
        expectedRole: 'student',
        routeSession: { ok: false, code: 'auth_provider_error' },
      }),
    ).toEqual({ decision: 'redirect_to_login' });
  });

  it('blocks malformed or missing app-role claims without rendering a protected shell', () => {
    expect(
      classifyAuthTenancyProtectedRouteAccess({
        expectedRole: 'instructor',
        routeSession: { ok: false, code: 'missing_role' },
      }),
    ).toEqual({ decision: 'block_role', code: 'missing_role' });
  });
});
