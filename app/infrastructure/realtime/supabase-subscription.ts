import type { MonthAdvanceRealtimeRefreshSignal, RealtimeAuthorizedCurrentTurnRefetchPlan } from '../../domain/classes/month-advancement';

export type SupabaseRealtimeRefreshPayload = Pick<
  MonthAdvanceRealtimeRefreshSignal,
  'signalType' | 'classId' | 'audience' | 'processedMonthIndex' | 'currentMonthIndex' | 'totalMonths' | 'idempotencyKey'
>;

export type SupabaseRealtimeRefreshPayloadErrorCode =
  | 'payload_not_object'
  | 'invalid_signal_type'
  | 'invalid_audience'
  | 'mismatched_class'
  | 'mismatched_processed_month'
  | 'mismatched_current_month'
  | 'mismatched_total_months'
  | 'mismatched_idempotency_key';

export type SupabaseRealtimeRefreshPayloadParseResult =
  | { ok: true; payload: SupabaseRealtimeRefreshPayload }
  | { ok: false; code: SupabaseRealtimeRefreshPayloadErrorCode };

export type SupabaseRealtimeRefreshPayloadRefetchScope = Pick<
  RealtimeAuthorizedCurrentTurnRefetchPlan,
  'classId' | 'processedMonthIndex' | 'currentMonthIndex' | 'totalMonths' | 'idempotencyKey'
>;

export function parseSupabaseRealtimeRefreshPayload(
  input: unknown,
  refetchPlan: SupabaseRealtimeRefreshPayloadRefetchScope,
): SupabaseRealtimeRefreshPayloadParseResult {
  if (!isRecord(input)) {
    return { ok: false, code: 'payload_not_object' };
  }

  if (input.signalType !== 'month_advance_refresh_available') {
    return { ok: false, code: 'invalid_signal_type' };
  }
  if (input.audience !== 'class_participants') {
    return { ok: false, code: 'invalid_audience' };
  }
  if (input.classId !== refetchPlan.classId) {
    return { ok: false, code: 'mismatched_class' };
  }
  if (input.processedMonthIndex !== refetchPlan.processedMonthIndex) {
    return { ok: false, code: 'mismatched_processed_month' };
  }
  if (input.currentMonthIndex !== refetchPlan.currentMonthIndex) {
    return { ok: false, code: 'mismatched_current_month' };
  }
  if (input.totalMonths !== refetchPlan.totalMonths) {
    return { ok: false, code: 'mismatched_total_months' };
  }
  if (input.idempotencyKey !== refetchPlan.idempotencyKey) {
    return { ok: false, code: 'mismatched_idempotency_key' };
  }

  return {
    ok: true,
    payload: {
      signalType: input.signalType,
      classId: input.classId,
      audience: input.audience,
      processedMonthIndex: input.processedMonthIndex,
      currentMonthIndex: input.currentMonthIndex,
      totalMonths: input.totalMonths,
      idempotencyKey: input.idempotencyKey,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
