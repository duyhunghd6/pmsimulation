import { type AssetTier } from '../tara/allocation';
import { getAssetDnaDefinition, listAssetDnaDefinitions, type AssetDnaDefinition } from './catalog';

export type AssetReturnFactorDeltas = {
  m2GrowthDeltaPct: number;
  inflationCpiDeltaPct: number;
  gdpGrowthYoyDeltaPct: number;
  vixDeltaPct: number;
  policyRateDeltaPct: number;
  usdVndMovementDeltaPct: number;
  marketLiquidityDeltaPct: number;
};

export type AssetTierReturn = {
  assetTier: AssetTier;
  grossReturnPct: number;
  baseFeePct: number;
};

export type AssetTierReturnErrorCode = 'unknown_asset_tier' | 'invalid_factor_delta';

export type AssetTierReturnError = {
  code: AssetTierReturnErrorCode;
  message: string;
  field?: keyof AssetReturnFactorDeltas;
};

export type AssetTierReturnResult =
  | { ok: true; value: AssetTierReturn }
  | { ok: false; errors: AssetTierReturnError[] };

export type MvpAssetTierReturnsResult =
  | { ok: true; value: AssetTierReturn[] }
  | { ok: false; errors: AssetTierReturnError[] };

export function calculateAssetTierReturn(
  assetTier: string,
  deltas: AssetReturnFactorDeltas,
): AssetTierReturnResult {
  const definition = getAssetDnaDefinition(assetTier);
  const errors = validateFactorDeltas(deltas);

  if (definition === null) {
    errors.push({
      code: 'unknown_asset_tier',
      message: 'Asset return calculation requires a known MVP asset tier.',
    });
  }

  if (errors.length > 0 || definition === null) {
    return { ok: false, errors };
  }

  return { ok: true, value: calculateReturnFromDefinition(definition, deltas) };
}

export function calculateMvpAssetTierReturns(deltas: AssetReturnFactorDeltas): MvpAssetTierReturnsResult {
  const errors = validateFactorDeltas(deltas);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: listAssetDnaDefinitions().map((definition) => calculateReturnFromDefinition(definition, deltas)),
  };
}

function calculateReturnFromDefinition(
  definition: AssetDnaDefinition,
  deltas: AssetReturnFactorDeltas,
): AssetTierReturn {
  return {
    assetTier: definition.assetTier,
    grossReturnPct:
      definition.betaM2 * deltas.m2GrowthDeltaPct +
      definition.betaCpi * deltas.inflationCpiDeltaPct +
      definition.betaGdp * deltas.gdpGrowthYoyDeltaPct +
      definition.betaVix * deltas.vixDeltaPct +
      definition.betaPolicyRate * deltas.policyRateDeltaPct +
      definition.betaUsdVnd * deltas.usdVndMovementDeltaPct +
      definition.betaMarketLiquidity * deltas.marketLiquidityDeltaPct,
    baseFeePct: definition.baseFeePct,
  };
}

function validateFactorDeltas(deltas: AssetReturnFactorDeltas): AssetTierReturnError[] {
  return (Object.entries(deltas) as [keyof AssetReturnFactorDeltas, number][])
    .filter(([, value]) => !Number.isFinite(value))
    .map(([field]) => ({
      code: 'invalid_factor_delta',
      message: 'Asset return factor deltas must be finite numbers.',
      field,
    }));
}
