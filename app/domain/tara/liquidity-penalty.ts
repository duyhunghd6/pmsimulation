import {
  ASSET_TIERS,
  type AllocationValidationError,
  type AllocationWeights,
  type AssetTier,
  validateTaraAllocationWeights,
} from './allocation';

export const CROWDED_SELL_CONCENTRATION_THRESHOLD_PCT = 50;
export const CROWDED_SELL_LIQUIDITY_PENALTY_RATE_PCT = 5;

export type TaraLiquidityPenaltyInput = {
  currentAum: number;
  currentWeights: Record<string, number>;
  targetWeights: Record<string, number>;
  classroomSellConcentrationPct: Record<string, number>;
};

export type TaraLiquidityPenaltyTierImpact = {
  tier: AssetTier;
  sellWeightPct: number;
  sellAmount: number;
  classroomSellConcentrationPct: number;
  pvpSlippagePaid: number;
};

export type TaraLiquidityPenaltyPreview = {
  tierImpacts: TaraLiquidityPenaltyTierImpact[];
  pvpSlippagePaid: number;
  liquidityPenaltyPct: number;
};

export type TaraLiquidityPenaltyConcentrationErrorCode = 'missing_tier' | 'unknown_tier' | 'invalid_percentage';

export type TaraLiquidityPenaltyConcentrationError = {
  code: TaraLiquidityPenaltyConcentrationErrorCode;
  message: string;
  tier?: string;
};

export type TaraLiquidityPenaltyErrorCode =
  | 'invalid_current_aum'
  | 'invalid_current_weights'
  | 'invalid_target_weights'
  | 'invalid_classroom_sell_concentration';

export type TaraLiquidityPenaltyError = {
  code: TaraLiquidityPenaltyErrorCode;
  message: string;
  allocationErrors?: AllocationValidationError[];
  concentrationErrors?: TaraLiquidityPenaltyConcentrationError[];
};

export type TaraLiquidityPenaltyResult =
  | { ok: true; value: TaraLiquidityPenaltyPreview }
  | { ok: false; errors: TaraLiquidityPenaltyError[] };

const ASSET_TIER_SET = new Set<string>(ASSET_TIERS);

export function estimateTaraLiquidityPenalty(input: TaraLiquidityPenaltyInput): TaraLiquidityPenaltyResult {
  const errors: TaraLiquidityPenaltyError[] = [];

  if (!Number.isFinite(input.currentAum) || input.currentAum < 0) {
    errors.push({
      code: 'invalid_current_aum',
      message: 'Current AUM must be a finite, non-negative number.',
    });
  }

  const currentWeightsResult = validateWeights(input.currentWeights, 'invalid_current_weights', 'Current allocation is invalid.');
  const targetWeightsResult = validateWeights(input.targetWeights, 'invalid_target_weights', 'Target allocation is invalid.');
  const concentrationResult = validateClassroomSellConcentration(input.classroomSellConcentrationPct);
  let currentWeights: AllocationWeights | null = null;
  let targetWeights: AllocationWeights | null = null;
  let classroomSellConcentrationPct: AllocationWeights | null = null;

  if (currentWeightsResult.ok) {
    currentWeights = currentWeightsResult.value;
  } else {
    errors.push(currentWeightsResult.error);
  }

  if (targetWeightsResult.ok) {
    targetWeights = targetWeightsResult.value;
  } else {
    errors.push(targetWeightsResult.error);
  }

  if (concentrationResult.ok) {
    classroomSellConcentrationPct = concentrationResult.value;
  } else {
    errors.push(concentrationResult.error);
  }

  if (errors.length > 0 || currentWeights === null || targetWeights === null || classroomSellConcentrationPct === null) {
    return { ok: false, errors };
  }

  const tierImpacts = ASSET_TIERS.map((tier) => {
    const sellWeightPct = Math.max(0, currentWeights[tier] - targetWeights[tier]);
    const sellAmount = input.currentAum * (sellWeightPct / 100);
    const isCrowdedSell =
      sellWeightPct > 0 && classroomSellConcentrationPct[tier] > CROWDED_SELL_CONCENTRATION_THRESHOLD_PCT;
    const pvpSlippagePaid = isCrowdedSell ? sellAmount * (CROWDED_SELL_LIQUIDITY_PENALTY_RATE_PCT / 100) : 0;

    return {
      tier,
      sellWeightPct,
      sellAmount,
      classroomSellConcentrationPct: classroomSellConcentrationPct[tier],
      pvpSlippagePaid,
    };
  });

  const pvpSlippagePaid = tierImpacts.reduce((sum, impact) => sum + impact.pvpSlippagePaid, 0);
  const liquidityPenaltyPct = input.currentAum === 0 ? 0 : (pvpSlippagePaid / input.currentAum) * 100;

  return {
    ok: true,
    value: {
      tierImpacts,
      pvpSlippagePaid,
      liquidityPenaltyPct,
    },
  };
}

function validateWeights(
  weights: Record<string, number>,
  code: 'invalid_current_weights' | 'invalid_target_weights',
  message: string,
): { ok: true; value: AllocationWeights } | { ok: false; error: TaraLiquidityPenaltyError } {
  const result = validateTaraAllocationWeights(weights);

  if (result.ok) {
    return { ok: true, value: result.value };
  }

  return {
    ok: false,
    error: {
      code,
      message,
      allocationErrors: result.errors,
    },
  };
}

function validateClassroomSellConcentration(
  input: Record<string, number>,
): { ok: true; value: AllocationWeights } | { ok: false; error: TaraLiquidityPenaltyError } {
  const concentrationErrors: TaraLiquidityPenaltyConcentrationError[] = [];
  const normalizedConcentration: Partial<AllocationWeights> = {};

  for (const tier of Object.keys(input)) {
    if (!ASSET_TIER_SET.has(tier)) {
      concentrationErrors.push({
        code: 'unknown_tier',
        message: `${tier} is not an MVP asset tier.`,
        tier,
      });
    }
  }

  for (const tier of ASSET_TIERS) {
    if (!(tier in input)) {
      concentrationErrors.push({
        code: 'missing_tier',
        message: `${tier} classroom sell concentration is required.`,
        tier,
      });
      continue;
    }

    const concentrationPct = input[tier];

    if (!Number.isFinite(concentrationPct) || concentrationPct < 0 || concentrationPct > 100) {
      concentrationErrors.push({
        code: 'invalid_percentage',
        message: `${tier} classroom sell concentration must be a finite percentage from 0 to 100.`,
        tier,
      });
      continue;
    }

    normalizedConcentration[tier] = concentrationPct;
  }

  if (concentrationErrors.length > 0) {
    return {
      ok: false,
      error: {
        code: 'invalid_classroom_sell_concentration',
        message: 'Classroom sell concentration is invalid.',
        concentrationErrors,
      },
    };
  }

  return { ok: true, value: normalizedConcentration as AllocationWeights };
}
