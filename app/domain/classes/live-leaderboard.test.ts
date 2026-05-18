import { describe, expect, it } from 'vitest';

import {
  createInstructorLiveLeaderboardQueryDescriptor,
  createInstructorLiveLeaderboardQueryResultEnvelope,
  createInstructorLiveLeaderboardQueryResultValidationFailureEnvelope,
  createInstructorLiveLeaderboardSnapshot,
} from './live-leaderboard';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  funds: [
    {
      fundId: 'fund-001',
      studentDisplayName: 'An Fund',
      currentAum: 51_000_000,
      sharpeRatio: 1.1,
      orderStatus: 'pending' as const,
    },
    {
      fundId: 'fund-002',
      studentDisplayName: 'Binh Fund',
      currentAum: 54_000_000,
      sharpeRatio: 0.8,
      orderStatus: 'missing' as const,
    },
    {
      fundId: 'fund-003',
      studentDisplayName: 'Chi Fund',
      currentAum: 54_000_000,
      sharpeRatio: 1.2,
      orderStatus: 'pending' as const,
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createInstructorLiveLeaderboardSnapshot>[0]): string[] {
  const result = createInstructorLiveLeaderboardSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorLiveLeaderboardQueryDescriptor', () => {
  it('creates a server-query descriptor for scoped instructor live leaderboard access', () => {
    const result = createInstructorLiveLeaderboardQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 4,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'instructor_live_leaderboard_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:4:instructor-live-leaderboard-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_instructor_live_leaderboard',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
      },
    });
  });

  it('keeps the descriptor free of snapshots, holdings, order details, and provider clients', () => {
    const result = createInstructorLiveLeaderboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('instructor_scoped_class');
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeHoldings).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
  });

  it('rejects invalid descriptor scope inputs', () => {
    const result = createInstructorLiveLeaderboardQueryDescriptor({
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

describe('createInstructorLiveLeaderboardQueryResultEnvelope', () => {
  it('wraps an already-authorized live leaderboard snapshot for the descriptor scope', () => {
    const descriptor = createInstructorLiveLeaderboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorLiveLeaderboardQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_live_leaderboard_query_result',
        queryResultKey: 'class:class-001:month:4:instructor-live-leaderboard-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:4:instructor-live-leaderboard-query',
        queryName: 'get_instructor_live_leaderboard',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        snapshot: snapshot.value,
      },
    });
  });

  it('keeps the query result envelope scoped to leaderboard-safe instructor payloads', () => {
    const descriptor = createInstructorLiveLeaderboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorLiveLeaderboardQueryResultEnvelope({
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
    expect(result.value.includeHoldings).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(result.value.snapshot.rows[0]).toEqual({
      rank: 1,
      fundId: 'fund-003',
      studentDisplayName: 'Chi Fund',
      currentAum: 54_000_000,
      sharpeRatio: 1.2,
      orderStatus: 'pending',
    });
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('holdings' in result.value.snapshot.rows[0]).toBe(false);
    expect('targetWeights' in result.value.snapshot.rows[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.snapshot.rows[0]).toBe(false);
  });

  it('rejects missing or mismatched live leaderboard query results', () => {
    const descriptor = createInstructorLiveLeaderboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorLiveLeaderboardQueryResultEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_live_leaderboard_snapshot',
          message: 'Instructor live leaderboard query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createInstructorLiveLeaderboardQueryResultEnvelope({
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
        {
          code: 'mismatched_class_id',
          message: 'Instructor live leaderboard query result class must match the descriptor class.',
        },
        {
          code: 'mismatched_current_month_index',
          message: 'Instructor live leaderboard query result month must match the descriptor current month.',
        },
      ],
    });
  });

  it('creates a validation failure envelope for an invalid live leaderboard query result', () => {
    const descriptor = createInstructorLiveLeaderboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createInstructorLiveLeaderboardQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_live_leaderboard_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:4:instructor-live-leaderboard-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:4:instructor-live-leaderboard-query',
        queryName: 'get_instructor_live_leaderboard',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_live_leaderboard_snapshot',
            message: 'Instructor live leaderboard query result envelopes require the already-authorized snapshot.',
          },
        ],
      },
    });
  });

  it('keeps validation failures free of snapshots, database rows, and provider clients', () => {
    const descriptor = createInstructorLiveLeaderboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorLiveLeaderboardQueryResultValidationFailureEnvelope({
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
        message: 'Instructor live leaderboard query result class must match the descriptor class.',
      },
    ]);
    expect(result.value.includeHoldings).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for a valid live leaderboard query result', () => {
    const descriptor = createInstructorLiveLeaderboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorLiveLeaderboardQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor live leaderboard query result.',
        },
      ],
    });
  });
});

describe('createInstructorLiveLeaderboardSnapshot', () => {
  it('creates an instructor live leaderboard ranked by AUM and Sharpe ratio', () => {
    const result = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 4,
        rankedFundCount: 3,
        pendingOrderCount: 2,
        missingOrderCount: 1,
        rows: [
          {
            rank: 1,
            fundId: 'fund-003',
            studentDisplayName: 'Chi Fund',
            currentAum: 54_000_000,
            sharpeRatio: 1.2,
            orderStatus: 'pending',
          },
          {
            rank: 2,
            fundId: 'fund-002',
            studentDisplayName: 'Binh Fund',
            currentAum: 54_000_000,
            sharpeRatio: 0.8,
            orderStatus: 'missing',
          },
          {
            rank: 3,
            fundId: 'fund-001',
            studentDisplayName: 'An Fund',
            currentAum: 51_000_000,
            sharpeRatio: 1.1,
            orderStatus: 'pending',
          },
        ],
      },
    });
  });

  it('trims class ids, fund ids, and display names before ranking', () => {
    const result = createInstructorLiveLeaderboardSnapshot({
      classId: ' class-001 ',
      monthIndex: 4,
      funds: [
        {
          fundId: ' fund-002 ',
          studentDisplayName: ' Binh Fund ',
          currentAum: 54_000_000,
          sharpeRatio: 1.2,
          orderStatus: 'pending',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        rows: [
          expect.objectContaining({
            fundId: 'fund-002',
            studentDisplayName: 'Binh Fund',
          }),
        ],
      }),
    });
  });

  it('uses fund id as the final deterministic tie-breaker', () => {
    const result = createInstructorLiveLeaderboardSnapshot({
      classId: 'class-001',
      monthIndex: 4,
      funds: [
        {
          fundId: 'fund-b',
          studentDisplayName: 'B Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'pending',
        },
        {
          fundId: 'fund-a',
          studentDisplayName: 'A Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'missing',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        rows: [expect.objectContaining({ fundId: 'fund-a' }), expect.objectContaining({ fundId: 'fund-b' })],
      }),
    });
  });

  it('does not expose holdings, target weights, or tax drag details in leaderboard rows', () => {
    const result = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    for (const row of result.value.rows) {
      expect('holdings' in row).toBe(false);
      expect('targetWeights' in row).toBe(false);
      expect('estimatedTaxDrag' in row).toBe(false);
    }
  });

  it('supports an empty class leaderboard', () => {
    const result = createInstructorLiveLeaderboardSnapshot({
      classId: 'class-001',
      monthIndex: 0,
      funds: [],
    });

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 0,
        rankedFundCount: 0,
        pendingOrderCount: 0,
        missingOrderCount: 0,
        rows: [],
      },
    });
  });

  it('rejects invalid class and month inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid fund identity fields', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], fundId: '   ' }],
      }),
    ).toContain('invalid_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [defaultInput.funds[0], { ...defaultInput.funds[1], fundId: ' fund-001 ' }],
      }),
    ).toContain('duplicate_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], studentDisplayName: '   ' }],
      }),
    ).toContain('invalid_student_display_name');
  });

  it('rejects invalid leaderboard metric and order-status fields', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], currentAum: -1 }],
      }),
    ).toContain('invalid_current_aum');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], currentAum: Number.NaN }],
      }),
    ).toContain('invalid_current_aum');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], sharpeRatio: Number.POSITIVE_INFINITY }],
      }),
    ).toContain('invalid_sharpe_ratio');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], orderStatus: 'processed' as 'pending' }],
      }),
    ).toContain('invalid_order_status');
  });
});
