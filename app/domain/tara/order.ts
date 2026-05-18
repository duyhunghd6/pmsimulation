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

export type StudentTaraOrderEntryQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
};

export type StudentTaraOrderEntryQueryDescriptor = {
  descriptorType: 'student_tara_order_entry_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_student_tara_order_entry';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  currentTurnOnly: true;
  includeOtherFundOrderData: false;
  includeClassroomOrderList: false;
  includeProviderPayload: false;
  requestedSurface: 'tara_order_entry';
};

export type StudentTaraOrderEntryQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_current_month_index'
  | 'invalid_viewer_fund_id';

export type StudentTaraOrderEntryQueryDescriptorError = {
  code: StudentTaraOrderEntryQueryDescriptorErrorCode;
  message: string;
};

export type StudentTaraOrderEntryQueryDescriptorResult =
  | { ok: true; value: StudentTaraOrderEntryQueryDescriptor }
  | { ok: false; errors: StudentTaraOrderEntryQueryDescriptorError[] };

export type StudentTaraOrderEntryQueryResultEnvelope = {
  envelopeType: 'student_tara_order_entry_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_tara_order_entry';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeOtherFundOrderData: false;
  includeClassroomOrderList: false;
  includeProviderPayload: false;
  snapshot: StudentTaraOrderEntrySnapshot;
};

export type StudentTaraOrderEntryQueryResultValidationFailureEnvelope = {
  envelopeType: 'student_tara_order_entry_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_tara_order_entry';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeOtherFundOrderData: false;
  includeClassroomOrderList: false;
  includeProviderPayload: false;
  validationErrors: StudentTaraOrderEntryQueryResultEnvelopeError[];
};

export type StudentTaraOrderEntryQueryResultEnvelopeInput = {
  descriptor: StudentTaraOrderEntryQueryDescriptor;
  snapshot?: StudentTaraOrderEntrySnapshot;
};

export type StudentTaraOrderEntryQueryResultEnvelopeErrorCode =
  | 'missing_tara_order_entry_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index'
  | 'mismatched_viewer_fund_id';

export type StudentTaraOrderEntryQueryResultEnvelopeError = {
  code: StudentTaraOrderEntryQueryResultEnvelopeErrorCode;
  message: string;
};

export type StudentTaraOrderEntryQueryResultEnvelopeResult =
  | { ok: true; value: StudentTaraOrderEntryQueryResultEnvelope }
  | { ok: false; errors: StudentTaraOrderEntryQueryResultEnvelopeError[] };

export type StudentTaraOrderEntryQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type StudentTaraOrderEntryQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: StudentTaraOrderEntryQueryResultValidationFailureEnvelope }
  | { ok: false; errors: StudentTaraOrderEntryQueryResultValidationFailureEnvelopeError[] };

export type StudentTaraOrderSubmissionReceiptInput = Omit<TaraOrderDraftInput, 'fundId'> & {
  classId: string;
  viewerFundId: string;
};

export type StudentTaraOrderSubmissionReceipt = {
  receiptType: 'student_tara_order_submission_receipt';
  submissionKey: string;
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  targetWeights: AllocationWeights;
  estimatedTaxDrag: TaraTaxDragPreview;
  rebalanceTrigger: typeof TARA_ORDER_REBALANCE_TRIGGER;
  status: typeof TARA_ORDER_PENDING_STATUS;
};

export type StudentTaraOrderSubmissionReceiptErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_viewer_fund_id'
  | 'invalid_order_draft';

export type StudentTaraOrderSubmissionReceiptError = {
  code: StudentTaraOrderSubmissionReceiptErrorCode;
  message: string;
  draftErrors?: TaraOrderDraftError[];
  allocationErrors?: AllocationValidationError[];
};

export type StudentTaraOrderSubmissionReceiptResult =
  | { ok: true; value: StudentTaraOrderSubmissionReceipt }
  | { ok: false; errors: StudentTaraOrderSubmissionReceiptError[] };

export type StudentTaraOrderServerActionCommandDescriptor = {
  descriptorType: 'student_tara_order_server_action_command';
  commandKey: string;
  commandBoundary: 'server_action_command_boundary';
  commandName: 'submit_student_tara_order';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  idempotencyKey: string;
  targetWeights: AllocationWeights;
  estimatedTaxDrag: TaraTaxDragPreview;
  rebalanceTrigger: typeof TARA_ORDER_REBALANCE_TRIGGER;
  status: typeof TARA_ORDER_PENDING_STATUS;
  persistenceIntent: 'create_pending_tara_order';
};

export type StudentTaraOrderServerActionResultEnvelope = {
  envelopeType: 'student_tara_order_server_action_result';
  resultKey: string;
  commandKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'submit_student_tara_order';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  idempotencyKey: string;
  resultStatus: 'accepted_pending_order';
  persistenceIntent: 'create_pending_tara_order';
  deliverySemantics: 'student_safe_order_receipt';
  receipt: StudentTaraOrderSubmissionReceipt;
};

export type StudentTaraOrderServerActionValidationFailureEnvelope = {
  envelopeType: 'student_tara_order_server_action_validation_failure';
  resultKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'submit_student_tara_order';
  requiredScope: 'viewer_fund_in_class';
  classId: string | null;
  monthIndex: number | null;
  viewerFundId: string | null;
  resultStatus: 'validation_failed';
  persistenceIntent: 'none_validation_failed';
  deliverySemantics: 'student_safe_validation_errors';
  validationErrors: StudentTaraOrderSubmissionReceiptError[];
};

export type StudentTaraOrderServerActionValidationFailureEnvelopeError = {
  code: 'submission_is_valid';
  message: string;
};

export type StudentTaraOrderServerActionValidationFailureEnvelopeResult =
  | { ok: true; value: StudentTaraOrderServerActionValidationFailureEnvelope }
  | { ok: false; errors: StudentTaraOrderServerActionValidationFailureEnvelopeError[] };

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

export function createStudentTaraOrderEntryQueryDescriptor(
  input: StudentTaraOrderEntryQueryDescriptorInput,
): StudentTaraOrderEntryQueryDescriptorResult {
  const errors: StudentTaraOrderEntryQueryDescriptorError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (!Number.isInteger(input.currentMonthIndex) || input.currentMonthIndex < 0) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  if (viewerFundId === '') {
    errors.push({
      code: 'invalid_viewer_fund_id',
      message: 'Viewer fund id is required.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      descriptorType: 'student_tara_order_entry_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:fund:${viewerFundId}:student-tara-order-entry-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_student_tara_order_entry',
      requiredScope: 'viewer_fund_in_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      viewerFundId,
      currentTurnOnly: true,
      includeOtherFundOrderData: false,
      includeClassroomOrderList: false,
      includeProviderPayload: false,
      requestedSurface: 'tara_order_entry',
    },
  };
}

export function createStudentTaraOrderEntryQueryResultEnvelope(
  input: StudentTaraOrderEntryQueryResultEnvelopeInput,
): StudentTaraOrderEntryQueryResultEnvelopeResult {
  const errors: StudentTaraOrderEntryQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_tara_order_entry_snapshot',
          message: 'Student TARA order-entry query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Student TARA order-entry query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Student TARA order-entry query result month must match the descriptor current month.',
    });
  }

  if (input.snapshot.viewerFundId !== input.descriptor.viewerFundId) {
    errors.push({
      code: 'mismatched_viewer_fund_id',
      message: 'Student TARA order-entry query result viewer fund must match the descriptor viewer fund.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_tara_order_entry_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'ready',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeOtherFundOrderData: input.descriptor.includeOtherFundOrderData,
      includeClassroomOrderList: input.descriptor.includeClassroomOrderList,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function createStudentTaraOrderEntryQueryResultValidationFailureEnvelope(
  input: StudentTaraOrderEntryQueryResultEnvelopeInput,
): StudentTaraOrderEntryQueryResultValidationFailureEnvelopeResult {
  const result = createStudentTaraOrderEntryQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student TARA order-entry query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_tara_order_entry_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'validation_failed',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeOtherFundOrderData: input.descriptor.includeOtherFundOrderData,
      includeClassroomOrderList: input.descriptor.includeClassroomOrderList,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createStudentTaraOrderSubmissionReceipt(
  input: StudentTaraOrderSubmissionReceiptInput,
): StudentTaraOrderSubmissionReceiptResult {
  const errors: StudentTaraOrderSubmissionReceiptError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (!Number.isInteger(input.monthIndex) || input.monthIndex < 0) {
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
      message: 'Student TARA order submission requires a valid pending order draft.',
      draftErrors: draftResult.errors,
      allocationErrors: draftResult.errors.flatMap((error) => error.allocationErrors ?? []),
    });
  }

  if (errors.length > 0 || !draftResult.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      receiptType: 'student_tara_order_submission_receipt',
      submissionKey: `class:${classId}:fund:${viewerFundId}:month:${input.monthIndex}:tara-order-submission`,
      classId,
      monthIndex: input.monthIndex,
      viewerFundId,
      targetWeights: draftResult.value.targetWeights,
      estimatedTaxDrag: draftResult.value.estimatedTaxDrag,
      rebalanceTrigger: draftResult.value.rebalanceTrigger,
      status: draftResult.value.status,
    },
  };
}

export function createStudentTaraOrderServerActionCommandDescriptor(
  receipt: StudentTaraOrderSubmissionReceipt,
): StudentTaraOrderServerActionCommandDescriptor {
  return {
    descriptorType: 'student_tara_order_server_action_command',
    commandKey: `${receipt.submissionKey}:server-action-command`,
    commandBoundary: 'server_action_command_boundary',
    commandName: 'submit_student_tara_order',
    requiredScope: 'viewer_fund_in_class',
    classId: receipt.classId,
    monthIndex: receipt.monthIndex,
    viewerFundId: receipt.viewerFundId,
    idempotencyKey: receipt.submissionKey,
    targetWeights: receipt.targetWeights,
    estimatedTaxDrag: receipt.estimatedTaxDrag,
    rebalanceTrigger: receipt.rebalanceTrigger,
    status: receipt.status,
    persistenceIntent: 'create_pending_tara_order',
  };
}

export function createStudentTaraOrderServerActionResultEnvelope(
  descriptor: StudentTaraOrderServerActionCommandDescriptor,
): StudentTaraOrderServerActionResultEnvelope {
  return {
    envelopeType: 'student_tara_order_server_action_result',
    resultKey: `${descriptor.commandKey}:result-envelope`,
    commandKey: descriptor.commandKey,
    commandBoundary: 'server_action_result_boundary',
    commandName: descriptor.commandName,
    requiredScope: descriptor.requiredScope,
    classId: descriptor.classId,
    monthIndex: descriptor.monthIndex,
    viewerFundId: descriptor.viewerFundId,
    idempotencyKey: descriptor.idempotencyKey,
    resultStatus: 'accepted_pending_order',
    persistenceIntent: descriptor.persistenceIntent,
    deliverySemantics: 'student_safe_order_receipt',
    receipt: {
      receiptType: 'student_tara_order_submission_receipt',
      submissionKey: descriptor.idempotencyKey,
      classId: descriptor.classId,
      monthIndex: descriptor.monthIndex,
      viewerFundId: descriptor.viewerFundId,
      targetWeights: descriptor.targetWeights,
      estimatedTaxDrag: descriptor.estimatedTaxDrag,
      rebalanceTrigger: descriptor.rebalanceTrigger,
      status: descriptor.status,
    },
  };
}

export function createStudentTaraOrderServerActionValidationFailureEnvelope(
  input: StudentTaraOrderSubmissionReceiptInput,
): StudentTaraOrderServerActionValidationFailureEnvelopeResult {
  const receiptResult = createStudentTaraOrderSubmissionReceipt(input);

  if (receiptResult.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'submission_is_valid',
          message: 'Validation failure envelopes require an invalid student TARA order submission.',
        },
      ],
    };
  }

  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const classKeyPart = classId === '' ? 'unknown-class' : classId;
  const viewerFundKeyPart = viewerFundId === '' ? 'unknown-fund' : viewerFundId;
  const monthKeyPart = monthIndexIsValid ? String(input.monthIndex) : 'invalid-month';

  return {
    ok: true,
    value: {
      envelopeType: 'student_tara_order_server_action_validation_failure',
      resultKey: `class:${classKeyPart}:fund:${viewerFundKeyPart}:month:${monthKeyPart}:tara-order-submission:validation-failure`,
      commandBoundary: 'server_action_result_boundary',
      commandName: 'submit_student_tara_order',
      requiredScope: 'viewer_fund_in_class',
      classId: classId === '' ? null : classId,
      monthIndex: monthIndexIsValid ? input.monthIndex : null,
      viewerFundId: viewerFundId === '' ? null : viewerFundId,
      resultStatus: 'validation_failed',
      persistenceIntent: 'none_validation_failed',
      deliverySemantics: 'student_safe_validation_errors',
      validationErrors: receiptResult.errors,
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
