import { type AllocationValidationError, type AllocationWeights } from './allocation';
import {
  estimateTaraTaxDragPreview,
  type TaraTaxDragPreview,
  type TaraTaxDragPreviewError,
} from './tax-drag';

export const TARA_ORDER_PENDING_STATUS = 'pending';
export const TARA_ORDER_REBALANCE_TRIGGER = 'student_tara_submission';

export type TaraOrderDraftInput = {
  fundId: string;
  monthIndex: number;
  currentAum: number;
  currentWeights: Record<string, number>;
  targetWeights: Record<string, number>;
  apexUnrealizedGainPct: number;
};

export type TaraOrderDraft = {
  fundId: string;
  monthIndex: number;
  targetWeights: AllocationWeights;
  estimatedTaxDrag: TaraTaxDragPreview;
  rebalanceTrigger: typeof TARA_ORDER_REBALANCE_TRIGGER;
  status: typeof TARA_ORDER_PENDING_STATUS;
};

export type TaraOrderDraftErrorCode = 'invalid_fund_id' | 'invalid_month_index' | 'invalid_tax_drag_preview';

export type TaraOrderDraftError = {
  code: TaraOrderDraftErrorCode;
  message: string;
  previewErrors?: TaraTaxDragPreviewError[];
  allocationErrors?: AllocationValidationError[];
};

export type TaraOrderDraftResult =
  | { ok: true; value: TaraOrderDraft }
  | { ok: false; errors: TaraOrderDraftError[] };

export function createTaraOrderDraft(input: TaraOrderDraftInput): TaraOrderDraftResult {
  const errors: TaraOrderDraftError[] = [];

  if (input.fundId.trim() === '') {
    errors.push({
      code: 'invalid_fund_id',
      message: 'Fund id is required.',
    });
  }

  if (!Number.isInteger(input.monthIndex) || input.monthIndex < 0) {
    errors.push({
      code: 'invalid_month_index',
      message: 'Month index must be a non-negative integer.',
    });
  }

  const previewResult = estimateTaraTaxDragPreview({
    currentAum: input.currentAum,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    apexUnrealizedGainPct: input.apexUnrealizedGainPct,
  });

  if (!previewResult.ok) {
    errors.push({
      code: 'invalid_tax_drag_preview',
      message: 'TARA order draft requires a valid tax-drag preview.',
      previewErrors: previewResult.errors,
      allocationErrors: previewResult.errors.flatMap((error) => error.allocationErrors ?? []),
    });
  }

  if (errors.length > 0 || !previewResult.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      fundId: input.fundId,
      monthIndex: input.monthIndex,
      targetWeights: input.targetWeights as AllocationWeights,
      estimatedTaxDrag: previewResult.value,
      rebalanceTrigger: TARA_ORDER_REBALANCE_TRIGGER,
      status: TARA_ORDER_PENDING_STATUS,
    },
  };
}
