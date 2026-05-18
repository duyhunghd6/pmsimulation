export type AuthTenancyRole = 'student' | 'instructor';

export type AuthTenancySession = {
  subjectId: string;
  role: AuthTenancyRole;
};

export type AuthTenancyParseFailureCode =
  | 'claims_not_object'
  | 'missing_subject'
  | 'invalid_subject'
  | 'missing_role'
  | 'invalid_role';

export type AuthTenancyParseResult =
  | { ok: true; session: AuthTenancySession }
  | { ok: false; code: AuthTenancyParseFailureCode };

export type AuthTenancyScopeInput = {
  classId: string;
  fundId?: string;
  monthIndex?: number;
};

export type ParsedAuthTenancyScope = {
  classId: string;
  fundId?: string;
  monthIndex?: number;
};

export type AuthTenancyScopeParseFailureCode =
  | 'scope_not_object'
  | 'invalid_class_id'
  | 'invalid_fund_id'
  | 'invalid_month_index';

export type AuthTenancyScopeParseResult =
  | { ok: true; scope: ParsedAuthTenancyScope }
  | { ok: false; code: AuthTenancyScopeParseFailureCode };

export type AuthorizationDecision = 'allow' | 'deny';

export type AuthorizationResourceKind =
  | 'profiles'
  | 'classes'
  | 'class_administrators'
  | 'class_enrollments'
  | 'funds'
  | 'asset_holdings'
  | 'macro_narratives'
  | 'market_metrics'
  | 'tracked_metrics'
  | 'tara_orders'
  | 'risk_register_entries'
  | 'simulation_ledger';

export type AuthorizationAction = 'select' | 'insert' | 'update' | 'delete';

export type AuthorizationDecisionReason =
  | 'student_own_fund'
  | 'student_enrolled_class'
  | 'future_scenario_denied'
  | 'other_student_holdings_denied'
  | 'instructor_owned_class'
  | 'unowned_class_denied'
  | 'malformed_boundary_input';

export type SafeAuthorizationEvent = {
  actorId: string;
  role: AuthTenancyRole;
  classId: string;
  resourceKind: AuthorizationResourceKind;
  action: AuthorizationAction;
  decision: AuthorizationDecision;
  reasonCode: AuthorizationDecisionReason;
  requestId: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAuthRole(value: unknown): value is AuthTenancyRole {
  return value === 'student' || value === 'instructor';
}

export function parseSupabaseAuthTenancySession(claims: unknown): AuthTenancyParseResult {
  if (!isRecord(claims)) {
    return { ok: false, code: 'claims_not_object' };
  }

  const subject = claims.sub;
  if (subject === undefined) {
    return { ok: false, code: 'missing_subject' };
  }
  if (typeof subject !== 'string' || !uuidPattern.test(subject)) {
    return { ok: false, code: 'invalid_subject' };
  }

  const role = claims.app_role;
  if (role === undefined) {
    return { ok: false, code: 'missing_role' };
  }
  if (!isAuthRole(role)) {
    return { ok: false, code: 'invalid_role' };
  }

  return { ok: true, session: { subjectId: subject, role } };
}

export function parseAuthTenancyScopeInput(input: unknown): AuthTenancyScopeParseResult {
  if (!isRecord(input)) {
    return { ok: false, code: 'scope_not_object' };
  }

  if (typeof input.classId !== 'string' || !uuidPattern.test(input.classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }

  const fundId = input.fundId;
  if (fundId !== undefined && (typeof fundId !== 'string' || !uuidPattern.test(fundId))) {
    return { ok: false, code: 'invalid_fund_id' };
  }

  const monthIndex = input.monthIndex;
  if (monthIndex !== undefined && (typeof monthIndex !== 'number' || !Number.isInteger(monthIndex) || monthIndex < 0)) {
    return { ok: false, code: 'invalid_month_index' };
  }

  return {
    ok: true,
    scope: {
      classId: input.classId,
      fundId,
      monthIndex,
    },
  };
}

export function buildSafeAuthorizationEvent(input: {
  session: AuthTenancySession;
  classId: string;
  resourceKind: AuthorizationResourceKind;
  action: AuthorizationAction;
  decision: AuthorizationDecision;
  reasonCode: AuthorizationDecisionReason;
  requestId: string;
}): SafeAuthorizationEvent {
  return {
    actorId: input.session.subjectId,
    role: input.session.role,
    classId: input.classId,
    resourceKind: input.resourceKind,
    action: input.action,
    decision: input.decision,
    reasonCode: input.reasonCode,
    requestId: input.requestId,
  };
}

export function serializeSafeAuthorizationEvent(event: SafeAuthorizationEvent): string {
  return JSON.stringify({
    eventType: 'auth_tenancy_authorization',
    actorId: event.actorId,
    role: event.role,
    classId: event.classId,
    resourceKind: event.resourceKind,
    action: event.action,
    decision: event.decision,
    reasonCode: event.reasonCode,
    requestId: event.requestId,
  });
}
