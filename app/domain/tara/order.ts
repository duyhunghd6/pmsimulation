import { validateTaraAllocationWeights, type AllocationValidationError, type AllocationWeights } from './allocation';
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

export type StudentTaraOrderEntrySnapshotInput = Omit<TaraOrderDraftInput, 'fundId'> & {
  classId: string;
  viewerFundId: string;
};

export type StudentTaraOrderEntrySnapshot = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  currentWeights: AllocationWeights;
  targetWeights: AllocationWeights;
  estimatedTaxDrag: TaraTaxDragPreview;
  rebalanceTrigger: typeof TARA_ORDER_REBALANCE_TRIGGER;
  status: typeof TARA_ORDER_PENDING_STATUS;
};

export type StudentTaraOrderEntrySnapshotErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_viewer_fund_id'
  | 'invalid_order_draft';

export type StudentTaraOrderEntrySnapshotError = {
  code: StudentTaraOrderEntrySnapshotErrorCode;
  message: string;
  draftErrors?: TaraOrderDraftError[];
  allocationErrors?: AllocationValidationError[];
};

export type StudentTaraOrderEntrySnapshotResult =
  | { ok: true; value: StudentTaraOrderEntrySnapshot }
  | { ok: false; errors: StudentTaraOrderEntrySnapshotError[] };

export function createTaraOrderDraft(input: TaraOrderDraftInput): TaraOrderDraftResult {
  const errors: TaraOrderDraftError[] = [];
  const fundId = input.fundId.trim();

  if (fundId === '') {
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
      fundId,
      monthIndex: input.monthIndex,
      targetWeights: input.targetWeights as AllocationWeights,
      estimatedTaxDrag: previewResult.value,
      rebalanceTrigger: TARA_ORDER_REBALANCE_TRIGGER,
      status: TARA_ORDER_PENDING_STATUS,
    },
  };
}

export function createStudentTaraOrderEntrySnapshot(
  input: StudentTaraOrderEntrySnapshotInput,
): StudentTaraOrderEntrySnapshotResult {
  const errors: StudentTaraOrderEntrySnapshotError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (!monthIndexIsValid) {
    errors.push({
      code: 'invalid_month_index',
      message: 'Month index must be a non-negative integer.',
    });
  }

  if (viewerFundId === '') {
    errors.push({
      code: 'invalid_viewer_fund_id',
      message: 'Viewer fund id is required.',
    });
  }

  const draftResult = createTaraOrderDraft({
    fundId: viewerFundId,
    monthIndex: input.monthIndex,
    currentAum: input.currentAum,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    apexUnrealizedGainPct: input.apexUnrealizedGainPct,
  });

  if (!draftResult.ok) {
    errors.push({
      code: 'invalid_order_draft',
      message: 'Student TARA order entry requires a valid pending order draft.',
      draftErrors: draftResult.errors,
      allocationErrors: draftResult.errors.flatMap((error) => error.allocationErrors ?? []),
    });
  }

  const currentWeightsResult = validateTaraAllocationWeights(input.currentWeights);

  if (!currentWeightsResult.ok && draftResult.ok) {
    errors.push({
      code: 'invalid_order_draft',
      message: 'Student TARA order entry requires valid current allocation weights.',
      allocationErrors: currentWeightsResult.errors,
    });
  }

  if (errors.length > 0 || !draftResult.ok || !currentWeightsResult.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      viewerFundId,
      currentWeights: currentWeightsResult.value,
      targetWeights: draftResult.value.targetWeights,
      estimatedTaxDrag: draftResult.value.estimatedTaxDrag,
      rebalanceTrigger: draftResult.value.rebalanceTrigger,
      status: draftResult.value.status,
    },
  };
}
