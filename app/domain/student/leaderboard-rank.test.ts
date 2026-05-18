import { describe, expect, it } from 'vitest';

import {
  createStudentLeaderboardRankQueryDescriptor,
  createStudentLeaderboardRankQueryResultEnvelope,
  createStudentLeaderboardRankQueryResultValidationFailureEnvelope,
  createStudentLeaderboardRankSnapshot,
} from './leaderboard-rank';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  viewerFundId: 'fund-001',
  funds: [
    {
      fundId: 'fund-001',
      studentDisplayName: 'An Fund',
      currentAum: 51_000_000,
      sharpeRatio: 1.1,
    },
    {
      fundId: 'fund-002',
      studentDisplayName: 'Binh Fund',
      currentAum: 54_000_000,
      sharpeRatio: 0.8,
    },
    {
      fundId: 'fund-003',
      studentDisplayName: 'Chi Fund',
      currentAum: 54_000_000,
      sharpeRatio: 1.2,
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createStudentLeaderboardRankSnapshot>[0]): string[] {
  const result = createStudentLeaderboardRankSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

function defaultSnapshot() {
  const result = createStudentLeaderboardRankSnapshot(defaultInput);

  if (!result.ok) {
    throw new Error('Expected default student leaderboard rank snapshot to be valid.');
  }

  return result.value;
}

describe('createStudentLeaderboardRankQueryDescriptor', () => {
  it('creates a future server-query descriptor for a scoped student leaderboard rank view', () => {
    const result = createStudentLeaderboardRankQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 4,
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'student_leaderboard_rank_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:4:fund:fund-001:student-leaderboard-rank-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_student_leaderboard_rank',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        viewerFundId: 'fund-001',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeExactHoldings: false,
        includePendingOrderStatus: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
      },
    });
  });

  it('rejects invalid query descriptor scope inputs', () => {
    expect(
      createStudentLeaderboardRankQueryDescriptor({
        classId: ' ',
        currentMonthIndex: 1.5,
        viewerFundId: ' ',
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_current_month_index', message: 'Current month index must be a non-negative integer.' },
        { code: 'invalid_viewer_fund_id', message: 'Viewer fund id is required.' },
      ],
    });
  });

  it('keeps descriptors free of query results, provider clients, and sensitive leaderboard payloads', () => {
    const result = createStudentLeaderboardRankQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('viewer_fund_in_class');
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeExactHoldings).toBe(false);
    expect(result.value.includePendingOrderStatus).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeLedgerDrafts).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });
});

describe('createStudentLeaderboardRankQueryResultEnvelope', () => {
  it('wraps an already-authorized leaderboard rank snapshot matching descriptor scope', () => {
    const descriptor = createStudentLeaderboardRankQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const snapshot = defaultSnapshot();

    expect(createStudentLeaderboardRankQueryResultEnvelope({ descriptor: descriptor.value, snapshot })).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_leaderboard_rank_query_result',
        queryResultKey: 'class:class-001:month:4:fund:fund-001:student-leaderboard-rank-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_student_leaderboard_rank',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        viewerFundId: 'fund-001',
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeExactHoldings: false,
        includePendingOrderStatus: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
        snapshot,
      },
    });
  });

  it('rejects missing or mismatched leaderboard rank snapshots', () => {
    const descriptor = createStudentLeaderboardRankQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(createStudentLeaderboardRankQueryResultEnvelope({ descriptor: descriptor.value })).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_student_leaderboard_rank_snapshot',
          message: 'Student leaderboard rank query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createStudentLeaderboardRankQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: { ...defaultSnapshot(), classId: 'class-002', monthIndex: 5, viewerFundId: 'fund-002' },
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'mismatched_class_id', message: 'Student leaderboard rank query result class must match the descriptor class.' },
        {
          code: 'mismatched_current_month_index',
          message: 'Student leaderboard rank query result month must match the descriptor current month.',
        },
        {
          code: 'mismatched_viewer_fund_id',
          message: 'Student leaderboard rank query result viewer fund must match the descriptor viewer fund.',
        },
      ],
    });
  });

  it('keeps query result envelopes scoped to safe leaderboard payloads', () => {
    const descriptor = createStudentLeaderboardRankQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const result = createStudentLeaderboardRankQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: defaultSnapshot(),
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeExactHoldings).toBe(false);
    expect(result.value.includePendingOrderStatus).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeLedgerDrafts).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('executedQueryMetadata' in result.value).toBe(false);
  });
});

describe('createStudentLeaderboardRankQueryResultValidationFailureEnvelope', () => {
  it('wraps invalid query results without returning the snapshot', () => {
    const descriptor = createStudentLeaderboardRankQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const result = createStudentLeaderboardRankQueryResultValidationFailureEnvelope({
      descriptor: descriptor.value,
      snapshot: { ...defaultSnapshot(), viewerFundId: 'fund-999' },
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_leaderboard_rank_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:4:fund:fund-001:student-leaderboard-rank-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_student_leaderboard_rank',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeExactHoldings: false,
        includePendingOrderStatus: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'mismatched_viewer_fund_id',
            message: 'Student leaderboard rank query result viewer fund must match the descriptor viewer fund.',
          },
        ],
      },
    });

    if (result.ok) {
      expect('snapshot' in result.value).toBe(false);
      expect('databaseRows' in result.value).toBe(false);
      expect('supabaseClient' in result.value).toBe(false);
      expect('uiState' in result.value).toBe(false);
    }
  });

  it('rejects validation failure envelopes for valid query results', () => {
    const descriptor = createStudentLeaderboardRankQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createStudentLeaderboardRankQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: defaultSnapshot(),
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student leaderboard rank query result.',
        },
      ],
    });
  });
});

describe('createStudentLeaderboardRankSnapshot', () => {
  it('creates a student leaderboard rank snapshot with the viewer rank marked', () => {
    const result = createStudentLeaderboardRankSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 4,
        viewerFundId: 'fund-001',
        viewerRank: 3,
        rankedFundCount: 3,
        rows: [
          {
            rank: 1,
            studentDisplayName: 'Chi Fund',
            currentAum: 54_000_000,
            sharpeRatio: 1.2,
            isViewerFund: false,
          },
          {
            rank: 2,
            studentDisplayName: 'Binh Fund',
            currentAum: 54_000_000,
            sharpeRatio: 0.8,
            isViewerFund: false,
          },
          {
            rank: 3,
            studentDisplayName: 'An Fund',
            currentAum: 51_000_000,
            sharpeRatio: 1.1,
            isViewerFund: true,
          },
        ],
      },
    });
  });

  it('trims class ids, fund ids, viewer fund ids, and display names before ranking', () => {
    const result = createStudentLeaderboardRankSnapshot({
      classId: ' class-001 ',
      monthIndex: 4,
      viewerFundId: ' fund-002 ',
      funds: [
        {
          fundId: ' fund-002 ',
          studentDisplayName: ' Binh Fund ',
          currentAum: 54_000_000,
          sharpeRatio: 1.2,
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        viewerFundId: 'fund-002',
        viewerRank: 1,
        rows: [
          expect.objectContaining({
            studentDisplayName: 'Binh Fund',
            isViewerFund: true,
          }),
        ],
      }),
    });
  });

  it('uses fund id as the final deterministic tie-breaker without exposing it in rows', () => {
    const result = createStudentLeaderboardRankSnapshot({
      classId: 'class-001',
      monthIndex: 4,
      viewerFundId: 'fund-b',
      funds: [
        {
          fundId: 'fund-b',
          studentDisplayName: 'B Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
        },
        {
          fundId: 'fund-a',
          studentDisplayName: 'A Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        viewerRank: 2,
        rows: [
          expect.objectContaining({ studentDisplayName: 'A Fund', isViewerFund: false }),
          expect.objectContaining({ studentDisplayName: 'B Fund', isViewerFund: true }),
        ],
      }),
    });

    if (!result.ok) {
      return;
    }

    expect('fundId' in result.value.rows[0]).toBe(false);
  });

  it('does not expose holdings, target weights, order status, or tax drag details', () => {
    const result = createStudentLeaderboardRankSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    for (const row of result.value.rows) {
      expect('holdings' in row).toBe(false);
      expect('targetWeights' in row).toBe(false);
      expect('orderStatus' in row).toBe(false);
      expect('estimatedTaxDrag' in row).toBe(false);
    }
  });

  it('rejects invalid class, month, and viewer fund inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, viewerFundId: '   ' })).toContain('invalid_viewer_fund_id');
    expect(errorCodesFor({ ...defaultInput, viewerFundId: 'fund-404' })).toContain('viewer_fund_not_found');
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

  it('rejects invalid leaderboard metrics', () => {
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
  });
});
