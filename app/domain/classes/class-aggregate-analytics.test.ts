import { describe, expect, it } from 'vitest';

import {
  createInstructorClassAggregateAnalyticsQueryDescriptor,
  createInstructorClassAggregateAnalyticsQueryResultEnvelope,
  createInstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope,
  createInstructorClassAggregateAnalyticsSnapshot,
} from './class-aggregate-analytics';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  funds: [
    {
      fundId: 'fund-001',
      currentAum: 50_000_000,
      sharpeRatio: 1.1,
      orderStatus: 'pending' as const,
    },
    {
      fundId: 'fund-002',
      currentAum: 55_000_000,
      sharpeRatio: 0.7,
      orderStatus: 'missing' as const,
    },
    {
      fundId: 'fund-003',
      currentAum: 45_000_000,
      sharpeRatio: -0.3,
      orderStatus: 'pending' as const,
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createInstructorClassAggregateAnalyticsSnapshot>[0]): string[] {
  const result = createInstructorClassAggregateAnalyticsSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

function defaultSnapshot() {
  const result = createInstructorClassAggregateAnalyticsSnapshot(defaultInput);

  if (!result.ok) {
    throw new Error('Expected default aggregate analytics snapshot to be valid.');
  }

  return result.value;
}

describe('createInstructorClassAggregateAnalyticsQueryDescriptor', () => {
  it('creates a future server-query descriptor for instructor class aggregate analytics', () => {
    const result = createInstructorClassAggregateAnalyticsQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 4,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'instructor_class_aggregate_analytics_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:4:instructor-class-aggregate-analytics-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_instructor_class_aggregate_analytics',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includePerFundRows: false,
        includeHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
      },
    });
  });

  it('rejects invalid query descriptor scope inputs', () => {
    expect(createInstructorClassAggregateAnalyticsQueryDescriptor({ classId: '   ', currentMonthIndex: 1 })).toEqual({
      ok: false,
      errors: [{ code: 'invalid_class_id', message: 'Class id is required.' }],
    });
    expect(createInstructorClassAggregateAnalyticsQueryDescriptor({ classId: 'class-001', currentMonthIndex: -1 })).toEqual({
      ok: false,
      errors: [
        {
          code: 'invalid_current_month_index',
          message: 'Current month index must be a non-negative integer.',
        },
      ],
    });
  });
});

describe('createInstructorClassAggregateAnalyticsQueryResultEnvelope', () => {
  it('wraps an already-authorized aggregate analytics snapshot matching descriptor scope', () => {
    const descriptorResult = createInstructorClassAggregateAnalyticsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptorResult.ok).toBe(true);

    if (!descriptorResult.ok) {
      return;
    }

    const snapshot = defaultSnapshot();
    const result = createInstructorClassAggregateAnalyticsQueryResultEnvelope({
      descriptor: descriptorResult.value,
      snapshot,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_class_aggregate_analytics_query_result',
        queryResultKey: 'class:class-001:month:4:instructor-class-aggregate-analytics-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptorResult.value.queryDescriptorKey,
        queryName: 'get_instructor_class_aggregate_analytics',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includePerFundRows: false,
        includeHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        snapshot,
      },
    });
  });

  it('rejects missing or mismatched aggregate analytics snapshots', () => {
    const descriptorResult = createInstructorClassAggregateAnalyticsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptorResult.ok).toBe(true);

    if (!descriptorResult.ok) {
      return;
    }

    expect(createInstructorClassAggregateAnalyticsQueryResultEnvelope({ descriptor: descriptorResult.value })).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_class_aggregate_analytics_snapshot',
          message: 'Instructor class aggregate analytics query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createInstructorClassAggregateAnalyticsQueryResultEnvelope({
        descriptor: descriptorResult.value,
        snapshot: { ...defaultSnapshot(), classId: 'class-002', monthIndex: 5 },
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'mismatched_class_id',
          message: 'Instructor class aggregate analytics query result class must match the descriptor class.',
        },
        {
          code: 'mismatched_current_month_index',
          message: 'Instructor class aggregate analytics query result month must match the descriptor current month.',
        },
      ],
    });
  });

  it('does not expose per-fund rows, holdings, target weights, tax drag, provider payloads, or execution metadata', () => {
    const descriptorResult = createInstructorClassAggregateAnalyticsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptorResult.ok).toBe(true);

    if (!descriptorResult.ok) {
      return;
    }

    const result = createInstructorClassAggregateAnalyticsQueryResultEnvelope({
      descriptor: descriptorResult.value,
      snapshot: defaultSnapshot(),
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.includePerFundRows).toBe(false);
    expect(result.value.includeHoldings).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('rows' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('providerClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('executedQueryMetadata' in result.value).toBe(false);
  });
});

describe('createInstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope', () => {
  it('wraps invalid query results without returning the snapshot', () => {
    const descriptorResult = createInstructorClassAggregateAnalyticsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptorResult.ok).toBe(true);

    if (!descriptorResult.ok) {
      return;
    }

    const result = createInstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope({
      descriptor: descriptorResult.value,
      snapshot: { ...defaultSnapshot(), monthIndex: 5 },
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_class_aggregate_analytics_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:4:instructor-class-aggregate-analytics-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptorResult.value.queryDescriptorKey,
        queryName: 'get_instructor_class_aggregate_analytics',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includePerFundRows: false,
        includeHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'mismatched_current_month_index',
            message: 'Instructor class aggregate analytics query result month must match the descriptor current month.',
          },
        ],
      },
    });

    if (result.ok) {
      expect('snapshot' in result.value).toBe(false);
    }
  });

  it('does not expose snapshots, provider payloads, database rows, UI state, or execution metadata in validation failures', () => {
    const descriptorResult = createInstructorClassAggregateAnalyticsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptorResult.ok).toBe(true);

    if (!descriptorResult.ok) {
      return;
    }

    const result = createInstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope({
      descriptor: descriptorResult.value,
      snapshot: { ...defaultSnapshot(), classId: 'class-002' },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.includePerFundRows).toBe(false);
    expect(result.value.includeHoldings).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('providerClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('executedQueryMetadata' in result.value).toBe(false);
  });

  it('rejects validation failure envelopes for valid query results', () => {
    const descriptorResult = createInstructorClassAggregateAnalyticsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptorResult.ok).toBe(true);

    if (!descriptorResult.ok) {
      return;
    }

    expect(
      createInstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope({
        descriptor: descriptorResult.value,
        snapshot: defaultSnapshot(),
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor class aggregate analytics query result.',
        },
      ],
    });
  });
});

describe('createInstructorClassAggregateAnalyticsSnapshot', () => {
  it('creates class-wide aggregate analytics from fund summaries', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 4,
        fundCount: 3,
        totalCurrentAum: 150_000_000,
        averageCurrentAum: 50_000_000,
        averageSharpeRatio: 0.5,
        pendingOrderCount: 2,
        missingOrderCount: 1,
        pendingOrderAum: 95_000_000,
        missingOrderAum: 55_000_000,
      },
    });
  });

  it('trims class and fund ids before aggregating', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot({
      classId: ' class-001 ',
      monthIndex: 1,
      funds: [
        {
          fundId: ' fund-001 ',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'pending',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        fundCount: 1,
      }),
    });
  });

  it('does not expose per-fund rows, holdings, target weights, or tax drag details', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('rows' in result.value).toBe(false);
    expect('funds' in result.value).toBe(false);
    expect('holdings' in result.value).toBe(false);
    expect('targetWeights' in result.value).toBe(false);
    expect('estimatedTaxDrag' in result.value).toBe(false);
  });

  it('supports an empty class aggregate snapshot', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot({
      classId: 'class-001',
      monthIndex: 0,
      funds: [],
    });

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 0,
        fundCount: 0,
        totalCurrentAum: 0,
        averageCurrentAum: 0,
        averageSharpeRatio: null,
        pendingOrderCount: 0,
        missingOrderCount: 0,
        pendingOrderAum: 0,
        missingOrderAum: 0,
      },
    });
  });

  it('rejects invalid class and month inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid and duplicate fund ids', () => {
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
  });

  it('rejects invalid aggregate metric and order-status fields', () => {
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
