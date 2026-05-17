import { describe, expect, it } from 'vitest';

import { calculateTaraTurnAttribution } from './attribution';

const defaultInput = {
  currentAum: 50_000_000,
  grossMarketReturnPct: 2,
  feeDragPct: 0.1,
  currentWeights: { Base: 30, Core: 40, Apex: 30 },
  targetWeights: { Base: 40, Core: 45, Apex: 15 },
  apexUnrealizedGainPct: 10,
  classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: 60 },
};

function errorCodesFor(input: Parameters<typeof calculateTaraTurnAttribution>[0]): string[] {
  const result = calculateTaraTurnAttribution(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('calculateTaraTurnAttribution', () => {
  it('summarizes market impact, fees, tax drag, liquidity penalty, and ending AUM', () => {
    const result = calculateTaraTurnAttribution(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toMatchObject({
      startingAum: 50_000_000,
      marketBetaImpact: 1_000_000,
      feeDrag: 50_000,
      taxPaid: 150_000,
      taxDragPct: 0.3,
      pvpSlippagePaid: 375_000,
      liquidityPenaltyPct: 0.75,
      classroomSellConcentrationPct: 60,
      endingAum: 50_425_000,
    });
    expect(result.value.taxDragPreview.estimatedTaxPaid).toBe(150_000);
    expect(result.value.liquidityPenaltyPreview.pvpSlippagePaid).toBe(375_000);
  });

  it('supports negative market returns without adding tax or liquidity costs when no tier is sold', () => {
    const result = calculateTaraTurnAttribution({
      ...defaultInput,
      grossMarketReturnPct: -1,
      feeDragPct: 0.2,
      targetWeights: { Base: 30, Core: 40, Apex: 30 },
      classroomSellConcentrationPct: { Base: 90, Core: 90, Apex: 90 },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toMatchObject({
      marketBetaImpact: -500_000,
      feeDrag: 100_000,
      taxPaid: 0,
      pvpSlippagePaid: 0,
      classroomSellConcentrationPct: 0,
      endingAum: 49_400_000,
    });
  });

  it('reports the highest classroom concentration among tiers the fund sold', () => {
    const result = calculateTaraTurnAttribution({
      ...defaultInput,
      classroomSellConcentrationPct: { Base: 55, Core: 80, Apex: 60 },
      currentWeights: { Base: 30, Core: 40, Apex: 30 },
      targetWeights: { Base: 20, Core: 45, Apex: 35 },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.classroomSellConcentrationPct).toBe(55);
    expect(result.value.pvpSlippagePaid).toBe(250_000);
  });

  it('rejects invalid attribution-level inputs', () => {
    expect(errorCodesFor({ ...defaultInput, currentAum: -1 })).toContain('invalid_current_aum');
    expect(errorCodesFor({ ...defaultInput, grossMarketReturnPct: Number.NaN })).toContain('invalid_market_return');
    expect(errorCodesFor({ ...defaultInput, feeDragPct: -0.1 })).toContain('invalid_fee_drag');
    expect(errorCodesFor({ ...defaultInput, feeDragPct: Number.POSITIVE_INFINITY })).toContain('invalid_fee_drag');
  });

  it('rejects invalid tax-drag and liquidity inputs before returning attribution', () => {
    expect(errorCodesFor({ ...defaultInput, targetWeights: { Base: 40, Core: 45, Apex: 14.9 } })).toContain(
      'invalid_tax_drag_preview',
    );
    expect(
      errorCodesFor({
        ...defaultInput,
        classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: 101 },
      }),
    ).toContain('invalid_liquidity_penalty');
  });
});
