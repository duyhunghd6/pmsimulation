import { describe, expect, it } from 'vitest';

import { createStudentAttributionReportSnapshot } from './attribution-report';

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
