import { describe, expect, it } from 'vitest';

import { createTaraOrderDraft } from './order';

const defaultInput = {
  fundId: 'fund-001',
  monthIndex: 2,
  currentAum: 50_000_000,
  currentWeights: { Base: 30, Core: 40, Apex: 30 },
  targetWeights: { Base: 40, Core: 45, Apex: 15 },
  apexUnrealizedGainPct: 10,
};

function errorCodesFor(input: Parameters<typeof createTaraOrderDraft>[0]): string[] {
  const result = createTaraOrderDraft(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createTaraOrderDraft', () => {
  it('creates a pending TARA order draft with validated target weights and estimated tax drag', () => {
    const result = createTaraOrderDraft(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual({
      fundId: 'fund-001',
      monthIndex: 2,
      targetWeights: { Base: 40, Core: 45, Apex: 15 },
      estimatedTaxDrag: {
        apexReductionWeightPct: 15,
        apexSaleAmount: 7_500_000,
        taxableGain: 750_000,
        estimatedTaxPaid: 150_000,
        taxDragPct: 0.3,
      },
      rebalanceTrigger: 'student_tara_submission',
      status: 'pending',
    });
  });

  it('keeps the draft pending when no Apex sale tax is due', () => {
    const result = createTaraOrderDraft({
      ...defaultInput,
      targetWeights: { Base: 25, Core: 40, Apex: 35 },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.status).toBe('pending');
    expect(result.value.estimatedTaxDrag.estimatedTaxPaid).toBe(0);
  });

  it('rejects blank fund ids', () => {
    expect(errorCodesFor({ ...defaultInput, fundId: '   ' })).toContain('invalid_fund_id');
  });

  it('rejects invalid month indexes', () => {
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid target allocations before creating a draft', () => {
    const result = createTaraOrderDraft({
      ...defaultInput,
      targetWeights: { Base: 40, Core: 45, Apex: 14.9 },
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'invalid_tax_drag_preview',
        allocationErrors: [expect.objectContaining({ code: 'total_must_equal_100' })],
      }),
    ]);
  });

  it('rejects invalid tax-drag inputs before creating a draft', () => {
    expect(errorCodesFor({ ...defaultInput, currentAum: Number.NaN })).toContain('invalid_tax_drag_preview');
    expect(errorCodesFor({ ...defaultInput, apexUnrealizedGainPct: Number.POSITIVE_INFINITY })).toContain(
      'invalid_tax_drag_preview',
    );
  });
});
