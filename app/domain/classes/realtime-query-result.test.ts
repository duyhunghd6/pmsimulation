import { describe, expect, it } from 'vitest';

import { type InstructorDashboardCurrentTurnSnapshot } from './dashboard-snapshot';
import {
  createMonthAdvanceRealtimePublicationEnvelope,
  createMonthAdvanceRealtimeRefreshSignal,
  createRealtimeAuthorizedCurrentTurnQueryDescriptor,
  createRealtimeAuthorizedCurrentTurnRefetchPlan,
  createSupabaseRealtimePublicationDescriptor,
  createSupabaseRealtimeSubscriptionDescriptor,
} from './month-advancement';
import {
  createRealtimeAuthorizedCurrentTurnQueryResultEnvelope,
  createRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope,
} from './realtime-query-result';
import { type StudentDashboardCurrentTurnSnapshot } from '../student/dashboard-snapshot';

function createDescriptor() {
  const signal = createMonthAdvanceRealtimeRefreshSignal({
    eventType: 'month_advance_completed',
    turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
    classId: 'class-001',
    triggerMode: 'manual',
    triggerSource: 'live',
    processedMonthIndex: 3,
    advancedToMonthIndex: 4,
    totalMonths: 12,
    idempotencyKey: 'class:class-001:advance:3->4',
    processingPath: 'shared_month_advance',
    processedFundCount: 2,
    totalStartingAum: 100_000_000,
    totalMarketBetaImpact: 3_000_000,
    totalFeeDrag: 500_000,
    totalTaxPaid: 600_000,
    totalPvpSlippagePaid: 400_000,
    totalEndingAum: 101_500_000,
  });

  return createRealtimeAuthorizedCurrentTurnQueryDescriptor(
    createRealtimeAuthorizedCurrentTurnRefetchPlan(
      createSupabaseRealtimeSubscriptionDescriptor(
        createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
      ),
    ),
  );
}

const studentDashboard = {
  snapshotType: 'student_dashboard_current_turn',
  classId: 'class-001',
  monthIndex: 4,
  viewerFundId: 'fund-001',
  macroNews: {},
  driverStringDashboard: {},
  portfolioPyramid: {},
  taraOrderEntry: {},
  leaderboardRank: {},
} as StudentDashboardCurrentTurnSnapshot;

const instructorDashboard = {
  snapshotType: 'instructor_dashboard_current_turn',
  classId: 'class-001',
  monthIndex: 4,
  pendingOrderVisibility: {},
  liveLeaderboard: {},
  godModePortfolioVisibility: {},
  classAggregateAnalytics: {},
  liveMonthAdvanceControl: {},
} as InstructorDashboardCurrentTurnSnapshot;

describe('createRealtimeAuthorizedCurrentTurnQueryResultEnvelope', () => {
  it('wraps already-authorized current-turn dashboard snapshots for descriptor surfaces', () => {
    const descriptor = createDescriptor();
    const result = createRealtimeAuthorizedCurrentTurnQueryResultEnvelope({
      descriptor,
      studentDashboard,
      instructorDashboard,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'authorized_current_turn_query_result',
        queryResultKey:
          'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription:authorized-current-turn-refetch:server-query-descriptor:result-envelope',
        providerBoundary: 'server_query_result_boundary',
        queryDescriptorKey:
          'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription:authorized-current-turn-refetch:server-query-descriptor',
        requiredAuthorization: 'server_scoped_current_turn_queries',
        classId: 'class-001',
        processedMonthIndex: 3,
        currentMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
        deliverySemantics: 'authorized_current_turn_surfaces_only',
        surfaces: [
          expect.objectContaining({
            surface: 'student_dashboard_current_turn',
            requiredScope: 'viewer_fund_in_class',
            resultStatus: 'ready',
            snapshot: studentDashboard,
          }),
          expect.objectContaining({
            surface: 'instructor_dashboard_current_turn',
            requiredScope: 'instructor_administered_class',
            resultStatus: 'ready',
            snapshot: instructorDashboard,
          }),
        ],
        payload: descriptor.payload,
      },
    });
  });

  it('keeps the result envelope tied to authorized current-turn scope without provider or database payloads', () => {
    const descriptor = createDescriptor();
    const result = createRealtimeAuthorizedCurrentTurnQueryResultEnvelope({
      descriptor,
      studentDashboard,
      instructorDashboard,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.surfaces.map((surface) => surface.currentTurnOnly)).toEqual([true, true]);
    expect(result.value.surfaces.every((surface) => surface.includeFutureScenarioRows === false)).toBe(true);
    expect(result.value.surfaces.every((surface) => surface.includeOtherFundExactHoldingsForStudents === false)).toBe(true);
    expect(result.value.surfaces.every((surface) => surface.includeProviderPayload === false)).toBe(true);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value.payload).toBe(false);
    expect('fundProcessingKeys' in result.value.payload).toBe(false);
    expect('totalEndingAum' in result.value.payload).toBe(false);
  });

  it('rejects missing or mismatched dashboard snapshots for requested surfaces', () => {
    const descriptor = createDescriptor();
    const missingResult = createRealtimeAuthorizedCurrentTurnQueryResultEnvelope({ descriptor });
    const mismatchedResult = createRealtimeAuthorizedCurrentTurnQueryResultEnvelope({
      descriptor,
      studentDashboard: {
        ...studentDashboard,
        monthIndex: 3,
      },
      instructorDashboard: {
        ...instructorDashboard,
        classId: 'class-002',
      },
    });

    expect(missingResult).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({ code: 'missing_student_dashboard_result', surface: 'student_dashboard_current_turn' }),
        expect.objectContaining({ code: 'missing_instructor_dashboard_result', surface: 'instructor_dashboard_current_turn' }),
      ],
    });
    expect(mismatchedResult).toEqual({
      ok: false,
      errors: [
        expect.objectContaining({ code: 'mismatched_student_dashboard_scope', surface: 'student_dashboard_current_turn' }),
        expect.objectContaining({ code: 'mismatched_instructor_dashboard_scope', surface: 'instructor_dashboard_current_turn' }),
      ],
    });
  });

  it('creates a query-result validation failure envelope for missing dashboard snapshots', () => {
    const descriptor = createDescriptor();
    const result = createRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope({ descriptor });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'authorized_current_turn_query_result_validation_failure',
        queryResultKey:
          'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription:authorized-current-turn-refetch:server-query-descriptor:validation-failure',
        providerBoundary: 'server_query_result_boundary',
        queryDescriptorKey:
          'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription:authorized-current-turn-refetch:server-query-descriptor',
        requiredAuthorization: 'server_scoped_current_turn_queries',
        classId: 'class-001',
        processedMonthIndex: 3,
        currentMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
        resultStatus: 'validation_failed',
        deliverySemantics: 'authorized_current_turn_query_validation_errors_only',
        validationErrors: [
          expect.objectContaining({ code: 'missing_student_dashboard_result', surface: 'student_dashboard_current_turn' }),
          expect.objectContaining({ code: 'missing_instructor_dashboard_result', surface: 'instructor_dashboard_current_turn' }),
        ],
        payload: descriptor.payload,
      },
    });
  });

  it('keeps query-result validation failures free of snapshots, database rows, and provider clients', () => {
    const descriptor = createDescriptor();
    const result = createRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope({
      descriptor,
      studentDashboard: {
        ...studentDashboard,
        classId: 'class-002',
      },
      instructorDashboard,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect(result.value.validationErrors).toEqual([
      expect.objectContaining({ code: 'mismatched_student_dashboard_scope', surface: 'student_dashboard_current_turn' }),
    ]);
    expect('surfaces' in result.value).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('studentDashboard' in result.value).toBe(false);
    expect('instructorDashboard' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value.payload).toBe(false);
    expect('fundProcessingKeys' in result.value.payload).toBe(false);
    expect('totalEndingAum' in result.value.payload).toBe(false);
  });

  it('does not create a query-result validation failure envelope for valid dashboard snapshots', () => {
    const descriptor = createDescriptor();
    const result = createRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope({
      descriptor,
      studentDashboard,
      instructorDashboard,
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid authorized current-turn query result.',
        },
      ],
    });
  });
});
