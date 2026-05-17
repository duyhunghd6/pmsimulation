import {
  ASSET_TIERS,
  validateTaraAllocationWeights,
  type AllocationValidationError,
  type AssetTier,
} from '../tara/allocation';

export type PortfolioPyramidDriftDirection = 'underweight' | 'on_target' | 'overweight';

export type PortfolioPyramidTier = {
  tier: AssetTier;
  currentWeightPct: number;
  intendedWeightPct: number;
  driftPct: number;
  driftDirection: PortfolioPyramidDriftDirection;
  isDangerousDrift: boolean;
};

export type PortfolioPyramidSnapshot = {
  tiers: PortfolioPyramidTier[];
  hasDangerousDrift: boolean;
};

export type PortfolioPyramidSnapshotInput = {
  currentWeights: Record<string, number>;
  intendedWeights: Record<string, number>;
  dangerousDriftThresholdPct: number;
};

export type PortfolioPyramidSnapshotErrorCode = AllocationValidationError['code'] | 'invalid_drift_threshold';

export type PortfolioPyramidSnapshotError = {
  code: PortfolioPyramidSnapshotErrorCode;
  message: string;
  source: 'current_weights' | 'intended_weights' | 'drift_threshold';
  tier?: string;
  total?: number;
};

export type PortfolioPyramidSnapshotResult =
  | { ok: true; value: PortfolioPyramidSnapshot }
  | { ok: false; errors: PortfolioPyramidSnapshotError[] };

export function buildPortfolioPyramidSnapshot(
  input: PortfolioPyramidSnapshotInput,
): PortfolioPyramidSnapshotResult {
  const errors: PortfolioPyramidSnapshotError[] = [];
  const currentWeightsResult = validateTaraAllocationWeights(input.currentWeights);
  const intendedWeightsResult = validateTaraAllocationWeights(input.intendedWeights);

  if (!currentWeightsResult.ok) {
    errors.push(...tagAllocationErrors(currentWeightsResult.errors, 'current_weights'));
  }

  if (!intendedWeightsResult.ok) {
    errors.push(...tagAllocationErrors(intendedWeightsResult.errors, 'intended_weights'));
  }

  if (toTenthsPercent(input.dangerousDriftThresholdPct) === null || input.dangerousDriftThresholdPct <= 0) {
    errors.push({
      code: 'invalid_drift_threshold',
      message: 'Dangerous drift threshold must be a finite, positive percentage with at most one decimal place.',
      source: 'drift_threshold',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (!currentWeightsResult.ok || !intendedWeightsResult.ok) {
    return { ok: false, errors };
  }

  const currentWeights = currentWeightsResult.value;
  const intendedWeights = intendedWeightsResult.value;
  const tiers = ASSET_TIERS.map((tier): PortfolioPyramidTier => {
    const currentWeightPct = currentWeights[tier];
    const intendedWeightPct = intendedWeights[tier];
    const driftPct = roundToTenths(currentWeightPct - intendedWeightPct);

    return {
      tier,
      currentWeightPct,
      intendedWeightPct,
      driftPct,
      driftDirection: driftDirection(driftPct),
      isDangerousDrift: Math.abs(driftPct) > input.dangerousDriftThresholdPct,
    };
  });

  return {
    ok: true,
    value: {
      tiers,
      hasDangerousDrift: tiers.some((tier) => tier.isDangerousDrift),
    },
  };
}

function tagAllocationErrors(
  errors: AllocationValidationError[],
  source: 'current_weights' | 'intended_weights',
): PortfolioPyramidSnapshotError[] {
  return errors.map((error) => ({ ...error, source }));
}

function driftDirection(driftPct: number): PortfolioPyramidDriftDirection {
  if (driftPct < 0) {
    return 'underweight';
  }

  if (driftPct > 0) {
    return 'overweight';
  }

  return 'on_target';
}

function toTenthsPercent(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  const tenths = value * 10;

  if (!Number.isInteger(tenths)) {
    return null;
  }

  return tenths;
}

function roundToTenths(value: number): number {
  return Math.round(value * 10) / 10;
}
