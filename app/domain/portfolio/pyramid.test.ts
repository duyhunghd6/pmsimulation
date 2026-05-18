import { describe, expect, it } from 'vitest';

import {
  buildPortfolioPyramidSnapshot,
  createStudentPortfolioPyramidQueryDescriptor,
  createStudentPortfolioPyramidQueryResultEnvelope,
  createStudentPortfolioPyramidQueryResultValidationFailureEnvelope,
} from './pyramid';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  viewerFundId: 'fund-001',
  currentWeights: { Base: 45, Core: 35, Apex: 20 },
  intendedWeights: { Base: 50, Core: 30, Apex: 20 },
  dangerousDriftThresholdPct: 5,
};

function defaultSnapshot() {
  const result = buildPortfolioPyramidSnapshot(defaultInput);

  if (!result.ok) {
    throw new Error('Expected default portfolio pyramid snapshot to be valid.');
  }

  return result.value;
}

describe('createStudentPortfolioPyramidQueryDescriptor', () => {
  it('creates a future server-query descriptor for a scoped student portfolio pyramid view', () => {
    const result = createStudentPortfolioPyramidQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 4,
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'student_portfolio_pyramid_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:4:fund:fund-001:student-portfolio-pyramid-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_student_portfolio_pyramid',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        viewerFundId: 'fund-001',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeOtherFundExactHoldings: false,
        includeInstructorGodModeData: false,
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
      createStudentPortfolioPyramidQueryDescriptor({
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

  it('keeps descriptors free of query results, provider clients, and other-fund holdings', () => {
    const result = createStudentPortfolioPyramidQueryDescriptor({
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
    expect(result.value.includeOtherFundExactHoldings).toBe(false);
    expect(result.value.includeInstructorGodModeData).toBe(false);
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

describe('createStudentPortfolioPyramidQueryResultEnvelope', () => {
  it('wraps an already-authorized portfolio pyramid snapshot matching descriptor scope', () => {
    const descriptor = createStudentPortfolioPyramidQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const snapshot = defaultSnapshot();

    expect(createStudentPortfolioPyramidQueryResultEnvelope({ descriptor: descriptor.value, snapshot })).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_portfolio_pyramid_query_result',
        queryResultKey: 'class:class-001:month:4:fund:fund-001:student-portfolio-pyramid-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_student_portfolio_pyramid',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        viewerFundId: 'fund-001',
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeOtherFundExactHoldings: false,
        includeInstructorGodModeData: false,
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

  it('rejects missing or mismatched portfolio pyramid snapshots', () => {
    const descriptor = createStudentPortfolioPyramidQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(createStudentPortfolioPyramidQueryResultEnvelope({ descriptor: descriptor.value })).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_student_portfolio_pyramid_snapshot',
          message: 'Student portfolio pyramid query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createStudentPortfolioPyramidQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: { ...defaultSnapshot(), classId: 'class-002', monthIndex: 5, viewerFundId: 'fund-002' },
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'mismatched_class_id', message: 'Student portfolio pyramid query result class must match the descriptor class.' },
        {
          code: 'mismatched_current_month_index',
          message: 'Student portfolio pyramid query result month must match the descriptor current month.',
        },
        {
          code: 'mismatched_viewer_fund_id',
          message: 'Student portfolio pyramid query result viewer fund must match the descriptor viewer fund.',
        },
      ],
    });
  });

  it('keeps query result envelopes scoped to the viewer fund portfolio payload', () => {
    const descriptor = createStudentPortfolioPyramidQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const result = createStudentPortfolioPyramidQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: defaultSnapshot(),
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeOtherFundExactHoldings).toBe(false);
    expect(result.value.includeInstructorGodModeData).toBe(false);
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

describe('createStudentPortfolioPyramidQueryResultValidationFailureEnvelope', () => {
  it('wraps invalid query results without returning the snapshot', () => {
    const descriptor = createStudentPortfolioPyramidQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const result = createStudentPortfolioPyramidQueryResultValidationFailureEnvelope({
      descriptor: descriptor.value,
      snapshot: { ...defaultSnapshot(), viewerFundId: 'fund-999' },
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_portfolio_pyramid_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:4:fund:fund-001:student-portfolio-pyramid-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_student_portfolio_pyramid',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeOtherFundExactHoldings: false,
        includeInstructorGodModeData: false,
        includePendingOrderStatus: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'mismatched_viewer_fund_id',
            message: 'Student portfolio pyramid query result viewer fund must match the descriptor viewer fund.',
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
    const descriptor = createStudentPortfolioPyramidQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createStudentPortfolioPyramidQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: defaultSnapshot(),
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student portfolio pyramid query result.',
        },
      ],
    });
  });
});

describe('portfolio pyramid snapshot', () => {
  it('projects current and intended tier weights with drift directions', () => {
    const result = buildPortfolioPyramidSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        snapshotType: 'student_portfolio_pyramid',
        classId: 'class-001',
        monthIndex: 4,
        viewerFundId: 'fund-001',
        tiers: [
          {
            tier: 'Base',
            currentWeightPct: 45,
            intendedWeightPct: 50,
            driftPct: -5,
            driftDirection: 'underweight',
            isDangerousDrift: false,
          },
          {
            tier: 'Core',
            currentWeightPct: 35,
            intendedWeightPct: 30,
            driftPct: 5,
            driftDirection: 'overweight',
            isDangerousDrift: false,
          },
          {
            tier: 'Apex',
            currentWeightPct: 20,
            intendedWeightPct: 20,
            driftPct: 0,
            driftDirection: 'on_target',
            isDangerousDrift: false,
          },
        ],
        hasDangerousDrift: false,
      },
    });
  });

  it('trims class and viewer fund scope on valid snapshots', () => {
    const result = buildPortfolioPyramidSnapshot({
      ...defaultInput,
      classId: ' class-001 ',
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        viewerFundId: 'fund-001',
      }),
    });
  });

  it('flags drift only when the absolute drift exceeds the supplied threshold', () => {
    const result = buildPortfolioPyramidSnapshot({
      ...defaultInput,
      currentWeights: { Base: 42, Core: 38, Apex: 20 },
      intendedWeights: { Base: 50, Core: 30, Apex: 20 },
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        tiers: [
          expect.objectContaining({
            tier: 'Base',
            driftPct: -8,
            driftDirection: 'underweight',
            isDangerousDrift: true,
          }),
          expect.objectContaining({
            tier: 'Core',
            driftPct: 8,
            driftDirection: 'overweight',
            isDangerousDrift: true,
          }),
          expect.objectContaining({
            tier: 'Apex',
            driftPct: 0,
            driftDirection: 'on_target',
            isDangerousDrift: false,
          }),
        ],
        hasDangerousDrift: true,
      }),
    });
  });

  it('rejects invalid scope inputs', () => {
    expect(
      buildPortfolioPyramidSnapshot({
        ...defaultInput,
        classId: ' ',
        monthIndex: 1.5,
        viewerFundId: ' ',
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.', source: 'class_id' },
        { code: 'invalid_month_index', message: 'Month index must be a non-negative integer.', source: 'month_index' },
        { code: 'invalid_viewer_fund_id', message: 'Viewer fund id is required.', source: 'viewer_fund_id' },
      ],
    });
  });

  it('rejects invalid current and intended weights through allocation validation', () => {
    const result = buildPortfolioPyramidSnapshot({
      ...defaultInput,
      currentWeights: { Base: 50, Core: 30, Apex: 25, Satellite: 5 },
      intendedWeights: { Base: 50, Core: 50 },
    });

    expect(result).toEqual({
      ok: false,
      errors: expect.arrayContaining([
        {
          code: 'unknown_tier',
          message: 'Satellite is not an MVP asset tier.',
          tier: 'Satellite',
          source: 'current_weights',
        },
        {
          code: 'total_must_equal_100',
          message: 'TARA target allocations must total exactly 100.0%.',
          total: 105,
          source: 'current_weights',
        },
        {
          code: 'missing_tier',
          message: 'Apex allocation is required.',
          tier: 'Apex',
          source: 'intended_weights',
        },
      ]),
    });
  });

  it('rejects invalid dangerous drift thresholds', () => {
    const result = buildPortfolioPyramidSnapshot({
      ...defaultInput,
      dangerousDriftThresholdPct: 0,
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'invalid_drift_threshold',
          message: 'Dangerous drift threshold must be a finite, positive percentage with at most one decimal place.',
          source: 'drift_threshold',
        },
      ],
    });
  });
});
