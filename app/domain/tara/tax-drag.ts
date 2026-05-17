import { validateTaraAllocationWeights, type AllocationValidationError, type AllocationWeights } from './allocation';

export const APEX_CAPITAL_GAINS_TAX_RATE = 0.2;

export type TaraTaxDragPreviewInput = {
  currentAum: number;
  currentWeights: Record<string, number>;
  targetWeights: Record<string, number>;
  apexUnrealizedGainPct: number;
};

export type TaraTaxDragPreview = {
  apexReductionWeightPct: number;
  apexSaleAmount: number;
  taxableGain: number;
  estimatedTaxPaid: number;
  taxDragPct: number;
};

export type TaraTaxDragPreviewErrorCode =
  | 'invalid_current_aum'
  | 'invalid_current_weights'
  | 'invalid_target_weights'
  | 'invalid_apex_unrealized_gain';

export type TaraTaxDragPreviewError = {
  code: TaraTaxDragPreviewErrorCode;
  message: string;
  allocationErrors?: AllocationValidationError[];
};

export type TaraTaxDragPreviewResult =
  | { ok: true; value: TaraTaxDragPreview }
  | { ok: false; errors: TaraTaxDragPreviewError[] };

export function estimateTaraTaxDragPreview(input: TaraTaxDragPreviewInput): TaraTaxDragPreviewResult {
  const errors: TaraTaxDragPreviewError[] = [];

  if (!Number.isFinite(input.currentAum) || input.currentAum < 0) {
    errors.push({
      code: 'invalid_current_aum',
      message: 'Current AUM must be a finite, non-negative number.',
    });
  }

  const currentWeightsResult = validateWeights(input.currentWeights, 'invalid_current_weights', 'Current allocation is invalid.');
  const targetWeightsResult = validateWeights(input.targetWeights, 'invalid_target_weights', 'Target allocation is invalid.');
  let currentWeights: AllocationWeights | null = null;
  let targetWeights: AllocationWeights | null = null;

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

  if (!Number.isFinite(input.apexUnrealizedGainPct)) {
    errors.push({
      code: 'invalid_apex_unrealized_gain',
      message: 'Apex unrealized gain must be finite.',
    });
  }

  if (errors.length > 0 || currentWeights === null || targetWeights === null) {
    return { ok: false, errors };
  }

  const apexReductionWeightPct = Math.max(0, currentWeights.Apex - targetWeights.Apex);
  const profitableGainPct = Math.max(0, input.apexUnrealizedGainPct);
  const apexSaleAmount = input.currentAum * (apexReductionWeightPct / 100);
  const taxableGain = apexSaleAmount * (profitableGainPct / 100);
  const estimatedTaxPaid = taxableGain * APEX_CAPITAL_GAINS_TAX_RATE;
  const taxDragPct = input.currentAum === 0 ? 0 : (estimatedTaxPaid / input.currentAum) * 100;

  return {
    ok: true,
    value: {
      apexReductionWeightPct,
      apexSaleAmount,
      taxableGain,
      estimatedTaxPaid,
      taxDragPct,
    },
  };
}

function validateWeights(
  weights: Record<string, number>,
  code: 'invalid_current_weights' | 'invalid_target_weights',
  message: string,
): { ok: true; value: AllocationWeights } | { ok: false; error: TaraTaxDragPreviewError } {
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
