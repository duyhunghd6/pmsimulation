import { describe, expect, it } from 'vitest';

import { estimateTaraLiquidityPenalty } from './liquidity-penalty';

const defaultInput = {
  currentAum: 50_000_000,
  currentWeights: { Base: 30, Core: 40, Apex: 30 },
  targetWeights: { Base: 40, Core: 45, Apex: 15 },
  classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: 60 },
};

function errorCodesFor(input: Parameters<typeof estimateTaraLiquidityPenalty>[0]): string[] {
  const result = estimateTaraLiquidityPenalty(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('estimateTaraLiquidityPenalty', () => {
  it('applies 5% extra slippage when a sold tier has more than 50% classroom sell concentration', () => {
    const result = estimateTaraLiquidityPenalty(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual({
      tierImpacts: [
        {
          tier: 'Base',
          sellWeightPct: 0,
          sellAmount: 0,
          classroomSellConcentrationPct: 20,
          pvpSlippagePaid: 0,
        },
        {
          tier: 'Core',
          sellWeightPct: 0,
          sellAmount: 0,
          classroomSellConcentrationPct: 30,
          pvpSlippagePaid: 0,
        },
        {
          tier: 'Apex',
          sellWeightPct: 15,
          sellAmount: 7_500_000,
          classroomSellConcentrationPct: 60,
          pvpSlippagePaid: 375_000,
        },
      ],
      pvpSlippagePaid: 375_000,
      liquidityPenaltyPct: 0.75,
    });
  });

  it('does not apply a penalty at exactly 50% classroom sell concentration', () => {
    const result = estimateTaraLiquidityPenalty({
      ...defaultInput,
      classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: 50 },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.pvpSlippagePaid).toBe(0);
    expect(result.value.liquidityPenaltyPct).toBe(0);
  });

  it('does not apply a penalty to crowded tiers that the fund is not selling', () => {
    const result = estimateTaraLiquidityPenalty({
      ...defaultInput,
      targetWeights: { Base: 25, Core: 40, Apex: 35 },
      classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: 90 },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.pvpSlippagePaid).toBe(0);
  });

  it('returns zero liquidity penalty percentage for zero AUM', () => {
    const result = estimateTaraLiquidityPenalty({
      ...defaultInput,
      currentAum: 0,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.pvpSlippagePaid).toBe(0);
    expect(result.value.liquidityPenaltyPct).toBe(0);
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

  it('rejects invalid classroom sell concentration maps', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        classroomSellConcentrationPct: { Base: 20, Core: 30 },
      }),
    ).toContain('invalid_classroom_sell_concentration');
    expect(
      errorCodesFor({
        ...defaultInput,
        classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: 60, Crypto: 1 },
      }),
    ).toContain('invalid_classroom_sell_concentration');
    expect(
      errorCodesFor({
        ...defaultInput,
        classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: 101 },
      }),
    ).toContain('invalid_classroom_sell_concentration');
    expect(
      errorCodesFor({
        ...defaultInput,
        classroomSellConcentrationPct: { Base: 20, Core: 30, Apex: Number.POSITIVE_INFINITY },
      }),
    ).toContain('invalid_classroom_sell_concentration');
  });
});
