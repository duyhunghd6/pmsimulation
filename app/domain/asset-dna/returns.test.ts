import { describe, expect, it } from 'vitest';

import { calculateAssetTierReturn, calculateMvpAssetTierReturns } from './returns';

const expansionDeltas = {
  m2GrowthDeltaPct: 2,
  inflationCpiDeltaPct: 1,
  gdpGrowthYoyDeltaPct: 3,
  vixDeltaPct: 4,
  policyRateDeltaPct: 0.5,
  usdVndMovementDeltaPct: 1,
  marketLiquidityDeltaPct: 5,
};

describe('asset tier return calculation', () => {
  it('calculates gross returns from Asset DNA beta coefficients and factor deltas', () => {
    const result = calculateMvpAssetTierReturns(expansionDeltas);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual([
      { assetTier: 'Base', grossReturnPct: 0.45, baseFeePct: 0.1 },
      { assetTier: 'Core', grossReturnPct: 1.875, baseFeePct: 0.5 },
      { assetTier: 'Apex', grossReturnPct: 4.1, baseFeePct: 1 },
    ]);
  });

  it('uses the known tier lookup for a single return projection', () => {
    const result = calculateAssetTierReturn('Core', expansionDeltas);

    expect(result).toEqual({
      ok: true,
      value: { assetTier: 'Core', grossReturnPct: 1.875, baseFeePct: 0.5 },
    });
  });

  it('models rate and volatility shocks as most harmful to Apex returns', () => {
    const result = calculateMvpAssetTierReturns({
      m2GrowthDeltaPct: 0,
      inflationCpiDeltaPct: 0,
      gdpGrowthYoyDeltaPct: 0,
      vixDeltaPct: 10,
      policyRateDeltaPct: 1,
      usdVndMovementDeltaPct: 0,
      marketLiquidityDeltaPct: 0,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const [base, core, apex] = result.value;

    expect(apex.grossReturnPct).toBeLessThan(core.grossReturnPct);
    expect(core.grossReturnPct).toBeLessThan(base.grossReturnPct);
  });

  it('does not calculate returns for unknown asset tiers', () => {
    const result = calculateAssetTierReturn('Satellite', expansionDeltas);

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'unknown_asset_tier',
          message: 'Asset return calculation requires a known MVP asset tier.',
        },
      ],
    });
  });

  it('rejects non-finite factor deltas', () => {
    const result = calculateMvpAssetTierReturns({
      ...expansionDeltas,
      vixDeltaPct: Number.NaN,
      marketLiquidityDeltaPct: Number.POSITIVE_INFINITY,
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'invalid_factor_delta',
          message: 'Asset return factor deltas must be finite numbers.',
          field: 'vixDeltaPct',
        },
        {
          code: 'invalid_factor_delta',
          message: 'Asset return factor deltas must be finite numbers.',
          field: 'marketLiquidityDeltaPct',
        },
      ],
    });
  });
});
