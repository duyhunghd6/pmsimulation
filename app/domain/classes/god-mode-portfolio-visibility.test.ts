import { describe, expect, it } from 'vitest';

import {
  createInstructorGodModePortfolioVisibilityQueryDescriptor,
  createInstructorGodModePortfolioVisibilityQueryResultEnvelope,
  createInstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelope,
  createInstructorGodModePortfolioVisibilitySnapshot,
} from './god-mode-portfolio-visibility';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 5,
  funds: [
    {
      fundId: 'fund-002',
      studentDisplayName: 'Bao Tran',
      currentAum: 54_000_000,
      sharpeRatio: 1.2,
      orderStatus: 'missing' as const,
      holdings: {
        Base: 20,
        Core: 50,
        Apex: 30,
      },
    },
    {
      fundId: 'fund-001',
      studentDisplayName: 'An Nguyen',
      currentAum: 51_000_000,
      sharpeRatio: 0.8,
      orderStatus: 'pending' as const,
      holdings: {
        Base: 35,
        Core: 45,
        Apex: 20,
      },
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createInstructorGodModePortfolioVisibilitySnapshot>[0]): string[] {
  const result = createInstructorGodModePortfolioVisibilitySnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorGodModePortfolioVisibilityQueryDescriptor', () => {
  it('creates a server-query descriptor for scoped instructor God Mode portfolio visibility', () => {
    const result = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 5,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'instructor_god_mode_portfolio_visibility_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:5:instructor-god-mode-portfolio-visibility-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_instructor_god_mode_portfolio_visibility',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 5,
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeStudentExactHoldingsForInstructor: true,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
      },
    });
  });

  it('keeps the descriptor free of snapshots, database rows, and provider clients', () => {
    const result = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 5,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('instructor_scoped_class');
    expect(result.value.includeStudentExactHoldingsForInstructor).toBe(true);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
  });

  it('rejects invalid descriptor scope inputs', () => {
    const result = createInstructorGodModePortfolioVisibilityQueryDescriptor({
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

describe('createInstructorGodModePortfolioVisibilityQueryResultEnvelope', () => {
  it('wraps an already-authorized God Mode portfolio visibility snapshot for the descriptor scope', () => {
    const descriptor = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 5,
    });
    const snapshot = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorGodModePortfolioVisibilityQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_god_mode_portfolio_visibility_query_result',
        queryResultKey: 'class:class-001:month:5:instructor-god-mode-portfolio-visibility-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:5:instructor-god-mode-portfolio-visibility-query',
        queryName: 'get_instructor_god_mode_portfolio_visibility',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 5,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeStudentExactHoldingsForInstructor: true,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        snapshot: snapshot.value,
      },
    });
  });

  it('keeps the query result envelope scoped to privileged instructor holdings only', () => {
    const descriptor = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 5,
    });
    const snapshot = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorGodModePortfolioVisibilityQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: snapshot.value,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('instructor_scoped_class');
    expect(result.value.currentTurnOnly).toBe(true);
    expect(result.value.includeStudentExactHoldingsForInstructor).toBe(true);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(result.value.snapshot.rows[0].holdings).toEqual([
      { tier: 'Base', allocationWeightPct: 35 },
      { tier: 'Core', allocationWeightPct: 45 },
      { tier: 'Apex', allocationWeightPct: 20 },
    ]);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('targetWeights' in result.value.snapshot.rows[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.snapshot.rows[0]).toBe(false);
  });

  it('rejects missing or mismatched God Mode portfolio visibility query results', () => {
    const descriptor = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 5,
    });
    const snapshot = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorGodModePortfolioVisibilityQueryResultEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_god_mode_portfolio_visibility_snapshot',
          message: 'Instructor God Mode portfolio visibility query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createInstructorGodModePortfolioVisibilityQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: {
          ...snapshot.value,
          classId: 'class-999',
          monthIndex: 6,
        },
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'mismatched_class_id',
          message: 'Instructor God Mode portfolio visibility query result class must match the descriptor class.',
        },
        {
          code: 'mismatched_current_month_index',
          message: 'Instructor God Mode portfolio visibility query result month must match the descriptor current month.',
        },
      ],
    });
  });

  it('creates a validation failure envelope for an invalid God Mode portfolio visibility query result', () => {
    const descriptor = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 5,
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createInstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_god_mode_portfolio_visibility_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:5:instructor-god-mode-portfolio-visibility-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:5:instructor-god-mode-portfolio-visibility-query',
        queryName: 'get_instructor_god_mode_portfolio_visibility',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 5,
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeStudentExactHoldingsForInstructor: true,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_god_mode_portfolio_visibility_snapshot',
            message: 'Instructor God Mode portfolio visibility query result envelopes require the already-authorized snapshot.',
          },
        ],
      },
    });
  });

  it('keeps validation failures free of snapshots, database rows, and provider clients', () => {
    const descriptor = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 5,
    });
    const snapshot = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelope({
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
        message: 'Instructor God Mode portfolio visibility query result class must match the descriptor class.',
      },
    ]);
    expect(result.value.includeStudentExactHoldingsForInstructor).toBe(true);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for a valid God Mode portfolio visibility query result', () => {
    const descriptor = createInstructorGodModePortfolioVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 5,
    });
    const snapshot = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor God Mode portfolio visibility query result.',
        },
      ],
    });
  });
});

describe('createInstructorGodModePortfolioVisibilitySnapshot', () => {
  it('creates instructor God Mode portfolio rows with exact current tier holdings', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 5,
        fundCount: 2,
        pendingOrderCount: 1,
        missingOrderCount: 1,
        rows: [
          {
            fundId: 'fund-001',
            studentDisplayName: 'An Nguyen',
            currentAum: 51_000_000,
            sharpeRatio: 0.8,
            orderStatus: 'pending',
            holdings: [
              { tier: 'Base', allocationWeightPct: 35 },
              { tier: 'Core', allocationWeightPct: 45 },
              { tier: 'Apex', allocationWeightPct: 20 },
            ],
          },
          {
            fundId: 'fund-002',
            studentDisplayName: 'Bao Tran',
            currentAum: 54_000_000,
            sharpeRatio: 1.2,
            orderStatus: 'missing',
            holdings: [
              { tier: 'Base', allocationWeightPct: 20 },
              { tier: 'Core', allocationWeightPct: 50 },
              { tier: 'Apex', allocationWeightPct: 30 },
            ],
          },
        ],
      },
    });
  });

  it('trims class ids, fund ids, and display names before building rows', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot({
      classId: ' class-001 ',
      monthIndex: 2,
      funds: [
        {
          fundId: ' fund-001 ',
          studentDisplayName: ' An Nguyen ',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'pending',
          holdings: {
            Base: 40,
            Core: 40,
            Apex: 20,
          },
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        rows: [
          expect.objectContaining({
            fundId: 'fund-001',
            studentDisplayName: 'An Nguyen',
          }),
        ],
      }),
    });
  });

  it('does not expose target weights, tax drag details, order details, or ledger drafts', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('targetWeights' in result.value.rows[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.rows[0]).toBe(false);
    expect('orderDetails' in result.value.rows[0]).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
  });

  it('supports an empty class portfolio snapshot', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot({
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

  it('rejects invalid identity fields', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], fundId: '   ' }],
      }),
    ).toContain('invalid_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [defaultInput.funds[0], { ...defaultInput.funds[1], fundId: ' fund-002 ' }],
      }),
    ).toContain('duplicate_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], studentDisplayName: '   ' }],
      }),
    ).toContain('invalid_student_display_name');
  });

  it('rejects invalid portfolio metric and order-status fields', () => {
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

  it('rejects invalid current holding allocations', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 60 } }],
      }),
    ).toContain('missing_tier');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 40, Apex: 10, Gold: 10 } }],
      }),
    ).toContain('unknown_tier');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 40, Apex: 10 } }],
      }),
    ).toContain('total_must_equal_100');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 40, Apex: -20 } }],
      }),
    ).toContain('invalid_weight');
  });
});
