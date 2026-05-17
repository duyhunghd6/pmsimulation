import { describe, expect, it } from 'vitest';

import { estimateTaraTaxDragPreview } from './tax-drag';

const defaultInput = {
  currentAum: 50_000_000,
  currentWeights: { Base: 30, Core: 40, Apex: 30 },
  targetWeights: { Base: 40, Core: 45, Apex: 15 },
  apexUnrealizedGainPct: 10,
};

function errorCodesFor(input: Parameters<typeof estimateTaraTaxDragPreview>[0]): string[] {
  const result = estimateTaraTaxDragPreview(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('estimateTaraTaxDragPreview', () => {
  it('estimates 20% capital gains tax on profitable Apex reductions', () => {
    const result = estimateTaraTaxDragPreview(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual({
      apexReductionWeightPct: 15,
      apexSaleAmount: 7_500_000,
      taxableGain: 750_000,
      estimatedTaxPaid: 150_000,
      taxDragPct: 0.3,
    });
  });

  it('returns zero tax when Apex allocation is not reduced', () => {
    const result = estimateTaraTaxDragPreview({
      ...defaultInput,
      targetWeights: { Base: 25, Core: 40, Apex: 35 },
    });

    expect(result).toEqual({
      ok: true,
      value: {
        apexReductionWeightPct: 0,
        apexSaleAmount: 0,
        taxableGain: 0,
        estimatedTaxPaid: 0,
        taxDragPct: 0,
      },
    });
  });

  it('returns zero tax when reduced Apex assets are not profitable', () => {
    const result = estimateTaraTaxDragPreview({
      ...defaultInput,
      apexUnrealizedGainPct: -5,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        apexReductionWeightPct: 15,
        apexSaleAmount: 7_500_000,
        taxableGain: 0,
        estimatedTaxPaid: 0,
        taxDragPct: 0,
      },
    });
  });

  it('returns zero tax drag percentage for zero AUM', () => {
    const result = estimateTaraTaxDragPreview({
      ...defaultInput,
      currentAum: 0,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        apexReductionWeightPct: 15,
        apexSaleAmount: 0,
        taxableGain: 0,
        estimatedTaxPaid: 0,
        taxDragPct: 0,
      },
    });
  });

  it('rejects invalid current AUM', () => {
    expect(errorCodesFor({ ...defaultInput, currentAum: -1 })).toContain('invalid_current_aum');
    expect(errorCodesFor({ ...defaultInput, currentAum: Number.NaN })).toContain('invalid_current_aum');
  });

  it('rejects invalid current and target allocations', () => {
    expect(errorCodesFor({ ...defaultInput, currentWeights: { Base: 30, Core: 40, Apex: 29.9 } })).toContain(
      'invalid_current_weights',
    );
    expect(errorCodesFor({ ...defaultInput, targetWeights: { Base: 40, Core: 45, Apex: 14.9 } })).toContain(
      'invalid_target_weights',
    );
  });

  it('rejects non-finite Apex gain inputs', () => {
    expect(errorCodesFor({ ...defaultInput, apexUnrealizedGainPct: Number.POSITIVE_INFINITY })).toContain(
      'invalid_apex_unrealized_gain',
    );
  });
});
