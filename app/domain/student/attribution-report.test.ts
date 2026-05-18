import { describe, expect, it } from 'vitest';

import {
  createStudentAttributionReportQueryDescriptor,
  createStudentAttributionReportQueryResultEnvelope,
  createStudentAttributionReportQueryResultValidationFailureEnvelope,
  createStudentAttributionReportSnapshot,
} from './attribution-report';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 6,
  viewerFundId: 'fund-001',
  ledgerDraft: {
    fundId: 'fund-001',
    monthIndex: 6,
    startingAum: 50_000_000,
    marketBetaImpact: 2_500_000,
    feeDrag: 250_000,
    taxPaid: 120_000,
    taxDragPct: 0.24,
    pvpSlippagePaid: 80_000,
    liquidityPenaltyPct: 0.16,
    classroomSellConcentrationPct: 62,
    endingAum: 52_050_000,
  },
};

function errorCodesFor(input: Parameters<typeof createStudentAttributionReportSnapshot>[0]): string[] {
  const result = createStudentAttributionReportSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createStudentAttributionReportQueryDescriptor', () => {
  it('creates a server-query descriptor for a scoped student attribution report', () => {
    const result = createStudentAttributionReportQueryDescriptor({
      classId: ' class-001 ',
      processedMonthIndex: 6,
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'student_attribution_report_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:6:fund:fund-001:student-attribution-report-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_student_attribution_report',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        processedMonthIndex: 6,
        viewerFundId: 'fund-001',
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeOtherFundLedgerDrafts: false,
        includeDatabaseRows: false,
        includeProviderPayload: false,
      },
    });
  });

  it('keeps the descriptor free of result payloads, provider clients, and unsafe ledger data', () => {
    const result = createStudentAttributionReportQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 6,
      viewerFundId: 'fund-001',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('viewer_fund_in_class');
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeOtherFundLedgerDrafts).toBe(false);
    expect(result.value.includeDatabaseRows).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
  });

  it('rejects invalid student attribution report query descriptor scope inputs', () => {
    const result = createStudentAttributionReportQueryDescriptor({
      classId: ' ',
      processedMonthIndex: 1.5,
      viewerFundId: ' ',
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_processed_month_index', message: 'Processed month index must be a non-negative integer.' },
        { code: 'invalid_viewer_fund_id', message: 'Viewer fund id is required.' },
      ],
    });
  });
});

describe('createStudentAttributionReportQueryResultEnvelope', () => {
  it('wraps an already-authorized student attribution report snapshot for the descriptor scope', () => {
    const descriptor = createStudentAttributionReportQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 6,
      viewerFundId: 'fund-001',
    });
    const snapshot = createStudentAttributionReportSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentAttributionReportQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_attribution_report_query_result',
        queryResultKey: 'class:class-001:month:6:fund:fund-001:student-attribution-report-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:6:fund:fund-001:student-attribution-report-query',
        queryName: 'get_student_attribution_report',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        processedMonthIndex: 6,
        viewerFundId: 'fund-001',
        resultStatus: 'ready',
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeOtherFundLedgerDrafts: false,
        includeDatabaseRows: false,
        includeProviderPayload: false,
        snapshot: snapshot.value,
      },
    });
  });

  it('keeps the query result envelope scoped to safe attribution report payloads', () => {
    const descriptor = createStudentAttributionReportQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 6,
      viewerFundId: 'fund-001',
    });
    const snapshot = createStudentAttributionReportSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createStudentAttributionReportQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: snapshot.value,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeOtherFundLedgerDrafts).toBe(false);
    expect(result.value.includeDatabaseRows).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('otherFundId' in result.value.snapshot).toBe(false);
  });

  it('rejects missing or mismatched student attribution report query results', () => {
    const descriptor = createStudentAttributionReportQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 6,
      viewerFundId: 'fund-001',
    });
    const snapshot = createStudentAttributionReportSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentAttributionReportQueryResultEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_student_attribution_report_snapshot',
          message: 'Student attribution report query result envelopes require the already-authorized report snapshot.',
        },
      ],
    });

    expect(
      createStudentAttributionReportQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: {
          ...snapshot.value,
          classId: 'class-999',
          monthIndex: 7,
          viewerFundId: 'fund-999',
        },
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'mismatched_class_id', message: 'Student attribution report query result class must match the descriptor class.' },
        {
          code: 'mismatched_processed_month_index',
          message: 'Student attribution report query result month must match the descriptor processed month.',
        },
        {
          code: 'mismatched_viewer_fund_id',
          message: 'Student attribution report query result viewer fund must match the descriptor viewer fund.',
        },
      ],
    });
  });

  it('creates a validation failure envelope for an invalid student attribution report query result', () => {
    const descriptor = createStudentAttributionReportQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 6,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createStudentAttributionReportQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_attribution_report_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:6:fund:fund-001:student-attribution-report-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:6:fund:fund-001:student-attribution-report-query',
        queryName: 'get_student_attribution_report',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        processedMonthIndex: 6,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeOtherFundLedgerDrafts: false,
        includeDatabaseRows: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_student_attribution_report_snapshot',
            message: 'Student attribution report query result envelopes require the already-authorized report snapshot.',
          },
        ],
      },
    });
  });

  it('rejects validation failure envelopes when the attribution report query result is valid', () => {
    const descriptor = createStudentAttributionReportQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 6,
      viewerFundId: 'fund-001',
    });
    const snapshot = createStudentAttributionReportSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentAttributionReportQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student attribution report query result.',
        },
      ],
    });
  });
});

describe('createStudentAttributionReportSnapshot', () => {
  it('creates a student attribution report snapshot from the viewer fund ledger', () => {
    const result = createStudentAttributionReportSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 6,
        viewerFundId: 'fund-001',
        reportKey: 'class:class-001:month:6:fund:fund-001:attribution-report',
        startingAum: 50_000_000,
        marketBetaImpact: 2_500_000,
        feeDrag: 250_000,
        taxPaid: 120_000,
        taxDragPct: 0.24,
        pvpSlippagePaid: 80_000,
        liquidityPenaltyPct: 0.16,
        classroomSellConcentrationPct: 62,
        endingAum: 52_050_000,
      },
    });
  });

  it('trims class id, viewer fund id, and ledger fund id before creating the snapshot', () => {
    const result = createStudentAttributionReportSnapshot({
      ...defaultInput,
      classId: ' class-001 ',
      viewerFundId: ' fund-001 ',
      ledgerDraft: {
        ...defaultInput.ledgerDraft,
        fundId: ' fund-001 ',
      },
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        viewerFundId: 'fund-001',
        reportKey: 'class:class-001:month:6:fund:fund-001:attribution-report',
      }),
    });
  });

  it('supports negative market beta impact while preserving cost categories', () => {
    const result = createStudentAttributionReportSnapshot({
      ...defaultInput,
      ledgerDraft: {
        ...defaultInput.ledgerDraft,
        marketBetaImpact: -1_000_000,
        feeDrag: 150_000,
        taxPaid: 0,
        taxDragPct: 0,
        pvpSlippagePaid: 0,
        liquidityPenaltyPct: 0,
        classroomSellConcentrationPct: 0,
        endingAum: 48_850_000,
      },
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        marketBetaImpact: -1_000_000,
        feeDrag: 150_000,
        taxPaid: 0,
        pvpSlippagePaid: 0,
        endingAum: 48_850_000,
      }),
    });
  });

  it('does not expose target weights, order details, tax previews, or other fund details', () => {
    const result = createStudentAttributionReportSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('targetWeights' in result.value).toBe(false);
    expect('orderDetails' in result.value).toBe(false);
    expect('taxDragPreview' in result.value).toBe(false);
    expect('liquidityPenaltyPreview' in result.value).toBe(false);
    expect('otherFundId' in result.value).toBe(false);
  });

  it('rejects invalid class, month, and fund-scope inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, viewerFundId: '   ' })).toContain('invalid_viewer_fund_id');
    expect(errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, fundId: '   ' } })).toContain(
      'invalid_ledger_fund_id',
    );
    expect(errorCodesFor({ ...defaultInput, viewerFundId: 'fund-002' })).toContain('ledger_fund_mismatch');
    expect(
      errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, monthIndex: 7 } }),
    ).toContain('ledger_month_mismatch');
  });

  it('rejects invalid attribution values', () => {
    expect(
      errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, startingAum: -1 } }),
    ).toContain('invalid_starting_aum');
    expect(
      errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, marketBetaImpact: Number.NaN } }),
    ).toContain('invalid_market_beta_impact');
    expect(errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, feeDrag: -1 } })).toContain(
      'invalid_fee_drag',
    );
    expect(errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, taxPaid: -1 } })).toContain(
      'invalid_tax_paid',
    );
    expect(errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, taxDragPct: -1 } })).toContain(
      'invalid_tax_drag_pct',
    );
    expect(
      errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, pvpSlippagePaid: -1 } }),
    ).toContain('invalid_pvp_slippage_paid');
    expect(
      errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, liquidityPenaltyPct: -1 } }),
    ).toContain('invalid_liquidity_penalty_pct');
    expect(
      errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, classroomSellConcentrationPct: 101 } }),
    ).toContain('invalid_classroom_sell_concentration_pct');
    expect(errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, endingAum: -1 } })).toContain(
      'invalid_ending_aum',
    );
  });

  it('rejects attribution reports whose ending AUM does not match the ledger formula', () => {
    expect(
      errorCodesFor({ ...defaultInput, ledgerDraft: { ...defaultInput.ledgerDraft, endingAum: 52_000_000 } }),
    ).toContain('inconsistent_ending_aum');
  });
});
