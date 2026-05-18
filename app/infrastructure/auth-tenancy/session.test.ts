import { describe, expect, it } from 'vitest';

import {
  buildSafeAuthorizationEvent,
  parseAuthTenancyScopeInput,
  parseSupabaseAuthTenancySession,
  serializeSafeAuthorizationEvent,
} from './session';

const studentId = '11111111-1111-4111-8111-111111111111';
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

describe('parseSupabaseAuthTenancySession', () => {
  it('accepts trusted Supabase Auth subject and app role claims', () => {
    expect(parseSupabaseAuthTenancySession({ sub: studentId, app_role: 'student' })).toEqual({
      ok: true,
      session: { subjectId: studentId, role: 'student' },
    });
  });

  it('rejects malformed or missing claims before authorization work', () => {
    expect(parseSupabaseAuthTenancySession(undefined)).toEqual({
      ok: false,
      code: 'claims_not_object',
    });
    expect(parseSupabaseAuthTenancySession({ app_role: 'student' })).toEqual({
      ok: false,
      code: 'missing_subject',
    });
    expect(parseSupabaseAuthTenancySession({ sub: 'not-a-uuid', app_role: 'student' })).toEqual({
      ok: false,
      code: 'invalid_subject',
    });
    expect(parseSupabaseAuthTenancySession({ sub: studentId })).toEqual({
      ok: false,
      code: 'missing_role',
    });
    expect(parseSupabaseAuthTenancySession({ sub: studentId, app_role: 'service_role' })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
  });
});

describe('parseAuthTenancyScopeInput', () => {
  it('accepts scoped class, fund, and month boundary inputs', () => {
    expect(parseAuthTenancyScopeInput({ classId, fundId, monthIndex: 1 })).toEqual({
      ok: true,
      scope: { classId, fundId, monthIndex: 1 },
    });
  });

  it('rejects malformed scope inputs before database access', () => {
    expect(parseAuthTenancyScopeInput(null)).toEqual({ ok: false, code: 'scope_not_object' });
    expect(parseAuthTenancyScopeInput({ classId: 'bad', fundId, monthIndex: 1 })).toEqual({
      ok: false,
      code: 'invalid_class_id',
    });
    expect(parseAuthTenancyScopeInput({ classId, fundId: 'bad', monthIndex: 1 })).toEqual({
      ok: false,
      code: 'invalid_fund_id',
    });
    expect(parseAuthTenancyScopeInput({ classId, fundId, monthIndex: -1 })).toEqual({
      ok: false,
      code: 'invalid_month_index',
    });
  });
});

describe('buildSafeAuthorizationEvent', () => {
  it('logs only safe denial metadata', () => {
    const event = buildSafeAuthorizationEvent({
      session: { subjectId: studentId, role: 'student' },
      classId,
      resourceKind: 'asset_holdings',
      action: 'select',
      decision: 'deny',
      reasonCode: 'other_student_holdings_denied',
      requestId: 'req-auth-tenancy-001',
    });

    expect(event).toEqual({
      actorId: studentId,
      role: 'student',
      classId,
      resourceKind: 'asset_holdings',
      action: 'select',
      decision: 'deny',
      reasonCode: 'other_student_holdings_denied',
      requestId: 'req-auth-tenancy-001',
    });
    expect(Object.keys(event).sort()).toEqual([
      'action',
      'actorId',
      'classId',
      'decision',
      'reasonCode',
      'requestId',
      'resourceKind',
      'role',
    ]);
  });

  it('serializes authorization events with fixed fields only', () => {
    const eventWithUnsafePayload = {
      ...buildSafeAuthorizationEvent({
        session: { subjectId: studentId, role: 'student' },
        classId,
        resourceKind: 'macro_narratives',
        action: 'select',
        decision: 'deny',
        reasonCode: 'future_scenario_denied',
        requestId: 'req-auth-tenancy-002',
      }),
      databaseUrl: 'postgresql://postgres:secret@127.0.0.1:54322/postgres',
      forbiddenScenario: { monthIndex: 3, headline: 'Future leak' },
    };

    const line = serializeSafeAuthorizationEvent(eventWithUnsafePayload);

    expect(JSON.parse(line)).toEqual({
      eventType: 'auth_tenancy_authorization',
      actorId: studentId,
      role: 'student',
      classId,
      resourceKind: 'macro_narratives',
      action: 'select',
      decision: 'deny',
      reasonCode: 'future_scenario_denied',
      requestId: 'req-auth-tenancy-002',
    });
    expect(line).not.toContain('postgresql://');
    expect(line).not.toContain('Future leak');
  });
});
