import { describe, expect, it } from 'vitest';

import {
  buildInstructorDashboardCurrentTurnSnapshot,
  createInstructorDashboardCurrentTurnQueryDescriptor,
  createInstructorDashboardCurrentTurnQueryResultEnvelope,
  createInstructorDashboardCurrentTurnQueryResultValidationFailureEnvelope,
} from './dashboard-snapshot';

const defaultFunds = [
  {
    fundId: 'fund-001',
    studentDisplayName: 'An Nguyen',
    currentAum: 52_000_000,
    sharpeRatio: 1.2,
    holdings: {
      Base: 20,
      Core: 50,
      Apex: 30,
    },
  },
  {
    fundId: 'fund-002',
    studentDisplayName: 'Bao Tran',
    currentAum: 49_500_000,
    sharpeRatio: 0.9,
    holdings: {
      Base: 35,
      Core: 45,
      Apex: 20,
    },
  },
];

const defaultInput = {
  classId: 'class-001',
  currentMonthIndex: 4,
  triggerMode: 'manual',
  totalMonths: 12,
  funds: defaultFunds,
  pendingOrders: [
    {
      fundId: 'fund-001',
      monthIndex: 4,
      status: 'pending',
    },
  ],
};

function errorSourcesFor(input: Parameters<typeof buildInstructorDashboardCurrentTurnSnapshot>[0]): string[] {
  const result = buildInstructorDashboardCurrentTurnSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.source);
}

describe('createInstructorDashboardCurrentTurnQueryDescriptor', () => {
  it('creates a server-query descriptor for a scoped instructor current-turn dashboard', () => {
    const result = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 4,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'instructor_dashboard_current_turn_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:4:instructor-dashboard-current-turn-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_instructor_dashboard_current_turn',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeStudentExactHoldingsForInstructor: true,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeProviderPayload: false,
        requestedSections: [
          'pending_order_visibility',
          'live_leaderboard',
          'god_mode_portfolio_visibility',
          'class_aggregate_analytics',
          'live_month_advance_control',
        ],
      },
    });
  });

  it('keeps the descriptor free of query results, order details, and provider clients', () => {
    const result = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('instructor_scoped_class');
    expect(result.value.includeStudentExactHoldingsForInstructor).toBe(true);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
  });

  it('rejects invalid instructor dashboard query descriptor scope inputs', () => {
    const result = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: ' ',
      currentMonthIndex: 1.5,
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_current_month_index', message: 'Current month index must be a non-negative integer.' },
      ],
    });
  });
});

describe('createInstructorDashboardCurrentTurnQueryResultEnvelope', () => {
  it('wraps an already-authorized instructor current-turn dashboard snapshot for the descriptor scope', () => {
    const descriptor = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorDashboardCurrentTurnQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_dashboard_current_turn_query_result',
        queryResultKey: 'class:class-001:month:4:instructor-dashboard-current-turn-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:4:instructor-dashboard-current-turn-query',
        queryName: 'get_instructor_dashboard_current_turn',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeStudentExactHoldingsForInstructor: true,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeProviderPayload: false,
        snapshot: snapshot.value,
      },
    });
  });

  it('keeps the query result envelope scoped to instructor dashboard payloads', () => {
    const descriptor = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorDashboardCurrentTurnQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: snapshot.value,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('instructor_scoped_class');
    expect(result.value.currentTurnOnly).toBe(true);
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeStudentExactHoldingsForInstructor).toBe(true);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(result.value.snapshot.godModePortfolioVisibility.rows[0]).toEqual(
      expect.objectContaining({
        holdings: [
          { tier: 'Base', allocationWeightPct: 20 },
          { tier: 'Core', allocationWeightPct: 50 },
          { tier: 'Apex', allocationWeightPct: 30 },
        ],
      }),
    );
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('targetWeights' in result.value.snapshot.godModePortfolioVisibility.rows[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.snapshot.liveLeaderboard.rows[0]).toBe(false);
  });

  it('rejects missing or mismatched instructor current-turn dashboard query results', () => {
    const descriptor = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorDashboardCurrentTurnQueryResultEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_instructor_dashboard_snapshot',
          message: 'Instructor dashboard query result envelopes require the already-authorized current-turn snapshot.',
        },
      ],
    });

    expect(
      createInstructorDashboardCurrentTurnQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: {
          ...snapshot.value,
          classId: 'class-999',
          monthIndex: 5,
        },
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'mismatched_class_id', message: 'Instructor dashboard query result class must match the descriptor class.' },
        {
          code: 'mismatched_current_month_index',
          message: 'Instructor dashboard query result month must match the descriptor current month.',
        },
      ],
    });
  });

  it('creates a validation failure envelope for an invalid instructor current-turn dashboard query result', () => {
    const descriptor = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createInstructorDashboardCurrentTurnQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_dashboard_current_turn_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:4:instructor-dashboard-current-turn-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:4:instructor-dashboard-current-turn-query',
        queryName: 'get_instructor_dashboard_current_turn',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeStudentExactHoldingsForInstructor: true,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_instructor_dashboard_snapshot',
            message: 'Instructor dashboard query result envelopes require the already-authorized current-turn snapshot.',
          },
        ],
      },
    });
  });

  it('keeps instructor query result validation failures free of snapshots, database rows, and provider clients', () => {
    const descriptor = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorDashboardCurrentTurnQueryResultValidationFailureEnvelope({
      descriptor: descriptor.value,
      snapshot: {
        ...snapshot.value,
        classId: 'class-999',
      },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect(result.value.validationErrors).toEqual([
      {
        code: 'mismatched_class_id',
        message: 'Instructor dashboard query result class must match the descriptor class.',
      },
    ]);
    expect(result.value.includeStudentExactHoldingsForInstructor).toBe(true);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('instructorDashboard' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for a valid instructor dashboard query result', () => {
    const descriptor = createInstructorDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorDashboardCurrentTurnQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor dashboard current-turn query result.',
        },
      ],
    });
  });
});

describe('buildInstructorDashboardCurrentTurnSnapshot', () => {
  it('composes current-turn instructor dashboard sections for an already-scoped class', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        snapshotType: 'instructor_dashboard_current_turn',
        classId: 'class-001',
        monthIndex: 4,
        pendingOrderVisibility: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          totalFundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
        }),
        liveLeaderboard: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          rankedFundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          rows: [
            expect.objectContaining({ rank: 1, fundId: 'fund-001', orderStatus: 'pending' }),
            expect.objectContaining({ rank: 2, fundId: 'fund-002', orderStatus: 'missing' }),
          ],
        }),
        godModePortfolioVisibility: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          fundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          rows: [
            expect.objectContaining({ fundId: 'fund-001', orderStatus: 'pending' }),
            expect.objectContaining({ fundId: 'fund-002', orderStatus: 'missing' }),
          ],
        }),
        classAggregateAnalytics: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          fundCount: 2,
          totalCurrentAum: 101_500_000,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          pendingOrderAum: 52_000_000,
          missingOrderAum: 49_500_000,
        }),
        liveMonthAdvanceControl: expect.objectContaining({
          controlType: 'instructor_live_month_advance_control',
          classId: 'class-001',
          triggerMode: 'manual',
          currentMonthIndex: 4,
          nextMonthIndex: 5,
          canAdvance: true,
          requestIdempotencyKey: 'class:class-001:advance:4->5',
        }),
      },
    });
  });

  it('trims class and fund ids through the child section snapshots', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot({
      ...defaultInput,
      classId: ' class-001 ',
      funds: [{ ...defaultFunds[0], fundId: ' fund-001 ' }],
      pendingOrders: [{ fundId: ' fund-001 ', monthIndex: 4, status: 'pending' }],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        pendingOrderVisibility: expect.objectContaining({
          fundStatuses: [{ fundId: 'fund-001', orderStatus: 'pending' }],
        }),
        liveLeaderboard: expect.objectContaining({
          rows: [expect.objectContaining({ fundId: 'fund-001' })],
        }),
        godModePortfolioVisibility: expect.objectContaining({
          rows: [expect.objectContaining({ fundId: 'fund-001' })],
        }),
      }),
    });
  });

  it('keeps the composed instructor dashboard free of target weights, tax previews, ledger, worker, and realtime payloads', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('targetWeights' in result.value).toBe(false);
    expect('estimatedTaxDrag' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('workerJobKey' in result.value).toBe(false);
    expect('channelName' in result.value).toBe(false);
    expect('targetWeights' in result.value.pendingOrderVisibility.fundStatuses[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.liveLeaderboard.rows[0]).toBe(false);
    expect('ledgerDrafts' in result.value.classAggregateAnalytics).toBe(false);
  });

  it('returns source-tagged pending-order and control errors', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot({
      ...defaultInput,
      classId: '   ',
      triggerMode: 'live',
      pendingOrders: [{ fundId: 'fund-001', monthIndex: 5, status: 'pending' }],
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'pending_order_visibility', code: 'invalid_class_id' }),
        expect.objectContaining({ source: 'pending_order_visibility', code: 'invalid_order_month', fundId: 'fund-001' }),
        expect.objectContaining({ source: 'live_month_advance_control', code: 'invalid_class_id' }),
        expect.objectContaining({ source: 'live_month_advance_control', code: 'invalid_trigger_mode' }),
      ]),
    );
  });

  it('returns source-tagged child section errors after pending-order status composition succeeds', () => {
    expect(
      errorSourcesFor({
        ...defaultInput,
        funds: [{ ...defaultFunds[0], studentDisplayName: '   ', holdings: { Base: 70, Core: 20, Apex: 20 } }],
        pendingOrders: [{ fundId: 'fund-001', monthIndex: 4, status: 'pending' }],
      }),
    ).toEqual(expect.arrayContaining(['live_leaderboard', 'god_mode_portfolio_visibility']));
  });
});
