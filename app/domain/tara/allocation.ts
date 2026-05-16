export const ASSET_TIERS = ['Base', 'Core', 'Apex'] as const;

export type AssetTier = (typeof ASSET_TIERS)[number];

export type AllocationWeights = Record<AssetTier, number>;

export type AllocationValidationErrorCode =
  | 'missing_tier'
  | 'unknown_tier'
  | 'invalid_weight'
  | 'total_must_equal_100';

export type AllocationValidationError = {
  code: AllocationValidationErrorCode;
  message: string;
  tier?: string;
  total?: number;
};

export type AllocationValidationResult =
  | { ok: true; value: AllocationWeights }
  | { ok: false; errors: AllocationValidationError[] };

const REQUIRED_TOTAL_TENTHS = 1000;
const ASSET_TIER_SET = new Set<string>(ASSET_TIERS);

export function validateTaraAllocationWeights(
  input: Record<string, number>,
): AllocationValidationResult {
  const errors: AllocationValidationError[] = [];
  const normalizedWeights: Partial<AllocationWeights> = {};
  let totalTenths = 0;

  for (const tier of Object.keys(input)) {
    if (!ASSET_TIER_SET.has(tier)) {
      errors.push({
        code: 'unknown_tier',
        message: `${tier} is not an MVP asset tier.`,
        tier,
      });
    }
  }

  for (const tier of ASSET_TIERS) {
    if (!(tier in input)) {
      errors.push({
        code: 'missing_tier',
        message: `${tier} allocation is required.`,
        tier,
      });
      continue;
    }

    const tenths = toTenthsPercent(input[tier]);

    if (tenths === null) {
      errors.push({
        code: 'invalid_weight',
        message: `${tier} allocation must be a finite, non-negative percentage with at most one decimal place.`,
        tier,
      });
      continue;
    }

    totalTenths += tenths;
    normalizedWeights[tier] = tenths / 10;
  }

  if (totalTenths !== REQUIRED_TOTAL_TENTHS) {
    errors.push({
      code: 'total_must_equal_100',
      message: 'TARA target allocations must total exactly 100.0%.',
      total: totalTenths / 10,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: normalizedWeights as AllocationWeights };
}

function toTenthsPercent(weight: number): number | null {
  if (!Number.isFinite(weight) || weight < 0) {
    return null;
  }

  const tenths = weight * 10;

  if (!Number.isInteger(tenths)) {
    return null;
  }

  return tenths;
}
