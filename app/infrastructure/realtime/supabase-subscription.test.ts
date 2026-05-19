import { describe, expect, it } from 'vitest';

import {
  createMonthAdvanceRealtimePublicationEnvelope,
  createMonthAdvanceRealtimeRefreshSignal,
  createRealtimeAuthorizedCurrentTurnRefetchPlan,
  createSupabaseRealtimePublicationDescriptor,
  createSupabaseRealtimeSubscriptionDescriptor,
} from '../../domain/classes/month-advancement';

import { parseSupabaseRealtimeRefreshPayload } from './supabase-subscription';

function createRefetchPlan() {
  const signal = createMonthAdvanceRealtimeRefreshSignal({
    eventType: 'month_advance_completed',
    turnCompletionEventKey: 'class:class-001:advance:2->3:turn-completion',
    classId: 'class-001',
    triggerMode: 'manual',
    triggerSource: 'live',
    processedMonthIndex: 2,
    advancedToMonthIndex: 3,
    totalMonths: 12,
    idempotencyKey: 'class:class-001:advance:2->3',
    processingPath: 'shared_month_advance',
    processedFundCount: 2,
    totalStartingAum: 100_000_000,
    totalMarketBetaImpact: 3_000_000,
    totalFeeDrag: 500_000,
    totalTaxPaid: 600_000,
    totalPvpSlippagePaid: 400_000,
    totalEndingAum: 101_500_000,
  });

  return createRealtimeAuthorizedCurrentTurnRefetchPlan(
    createSupabaseRealtimeSubscriptionDescriptor(
      createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
    ),
  );
}

describe('parseSupabaseRealtimeRefreshPayload', () => {
  it('accepts refresh-only payloads that match the authorized refetch plan scope', () => {
    const refetchPlan = createRefetchPlan();

    expect(parseSupabaseRealtimeRefreshPayload(refetchPlan.payload, refetchPlan)).toEqual({
      ok: true,
      payload: {
        signalType: 'month_advance_refresh_available',
        classId: 'class-001',
        audience: 'class_participants',
        processedMonthIndex: 2,
        currentMonthIndex: 3,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:2->3',
      },
    });
  });

  it('rejects malformed, cross-class, stale-month, and wrong-idempotency realtime payloads before refetch', () => {
    const refetchPlan = createRefetchPlan();

    expect(parseSupabaseRealtimeRefreshPayload(null, refetchPlan)).toEqual({ ok: false, code: 'payload_not_object' });
    expect(parseSupabaseRealtimeRefreshPayload({ ...refetchPlan.payload, signalType: 'other' }, refetchPlan)).toEqual({
      ok: false,
      code: 'invalid_signal_type',
    });
    expect(parseSupabaseRealtimeRefreshPayload({ ...refetchPlan.payload, classId: 'class-002' }, refetchPlan)).toEqual({
      ok: false,
      code: 'mismatched_class',
    });
    expect(parseSupabaseRealtimeRefreshPayload({ ...refetchPlan.payload, currentMonthIndex: 2 }, refetchPlan)).toEqual({
      ok: false,
      code: 'mismatched_current_month',
    });
    expect(parseSupabaseRealtimeRefreshPayload({ ...refetchPlan.payload, idempotencyKey: 'wrong-key' }, refetchPlan)).toEqual({
      ok: false,
      code: 'mismatched_idempotency_key',
    });
  });

  it('does not require or return gameplay payload fields before router refetch', () => {
    const refetchPlan = createRefetchPlan();
    const result = parseSupabaseRealtimeRefreshPayload(
      {
        ...refetchPlan.payload,
        totalEndingAum: 101_500_000,
        ledgerDrafts: [{ fundId: 'fund-001' }],
        providerClient: 'unsafe',
      },
      refetchPlan,
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('totalEndingAum' in result.payload).toBe(false);
    expect('ledgerDrafts' in result.payload).toBe(false);
    expect('providerClient' in result.payload).toBe(false);
  });
});
