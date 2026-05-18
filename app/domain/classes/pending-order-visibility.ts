import { TARA_ORDER_PENDING_STATUS } from '../tara/order';

export type PendingOrderVisibilityOrderInput = {
  fundId: string;
  monthIndex: number;
  status: string;
};

export type InstructorPendingOrderVisibilityInput = {
  classId: string;
  monthIndex: number;
  enrolledFundIds: string[];
  pendingOrders: PendingOrderVisibilityOrderInput[];
};

export type PendingOrderFundStatus = {
  fundId: string;
  orderStatus: 'pending' | 'missing';
};

export type InstructorPendingOrderVisibilitySnapshot = {
  classId: string;
  monthIndex: number;
  totalFundCount: number;
  pendingOrderCount: number;
  missingOrderCount: number;
  fundStatuses: PendingOrderFundStatus[];
};

export type InstructorPendingOrderVisibilityErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_fund_id'
  | 'duplicate_fund_id'
  | 'invalid_order_month'
  | 'invalid_order_status'
  | 'unknown_order_fund'
  | 'duplicate_order_fund';

export type InstructorPendingOrderVisibilityError = {
  code: InstructorPendingOrderVisibilityErrorCode;
  message: string;
  fundId?: string;
};

export type InstructorPendingOrderVisibilityResult =
  | { ok: true; value: InstructorPendingOrderVisibilitySnapshot }
  | { ok: false; errors: InstructorPendingOrderVisibilityError[] };

export type InstructorPendingOrderVisibilityQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
};

export type InstructorPendingOrderVisibilityQueryDescriptor = {
  descriptorType: 'instructor_pending_order_visibility_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_instructor_pending_order_visibility';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
};

export type InstructorPendingOrderVisibilityQueryDescriptorErrorCode = 'invalid_class_id' | 'invalid_current_month_index';

export type InstructorPendingOrderVisibilityQueryDescriptorError = {
  code: InstructorPendingOrderVisibilityQueryDescriptorErrorCode;
  message: string;
};

export type InstructorPendingOrderVisibilityQueryDescriptorResult =
  | { ok: true; value: InstructorPendingOrderVisibilityQueryDescriptor }
  | { ok: false; errors: InstructorPendingOrderVisibilityQueryDescriptorError[] };

export type InstructorPendingOrderVisibilityQueryResultEnvelope = {
  envelopeType: 'instructor_pending_order_visibility_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_pending_order_visibility';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  snapshot: InstructorPendingOrderVisibilitySnapshot;
};

export type InstructorPendingOrderVisibilityQueryResultValidationFailureEnvelope = {
  envelopeType: 'instructor_pending_order_visibility_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_pending_order_visibility';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  validationErrors: InstructorPendingOrderVisibilityQueryResultEnvelopeError[];
};

export type InstructorPendingOrderVisibilityQueryResultEnvelopeInput = {
  descriptor: InstructorPendingOrderVisibilityQueryDescriptor;
  snapshot?: InstructorPendingOrderVisibilitySnapshot;
};

export type InstructorPendingOrderVisibilityQueryResultEnvelopeErrorCode =
  | 'missing_pending_order_visibility_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index';

export type InstructorPendingOrderVisibilityQueryResultEnvelopeError = {
  code: InstructorPendingOrderVisibilityQueryResultEnvelopeErrorCode;
  message: string;
};

export type InstructorPendingOrderVisibilityQueryResultEnvelopeResult =
  | { ok: true; value: InstructorPendingOrderVisibilityQueryResultEnvelope }
  | { ok: false; errors: InstructorPendingOrderVisibilityQueryResultEnvelopeError[] };

export type InstructorPendingOrderVisibilityQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type InstructorPendingOrderVisibilityQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: InstructorPendingOrderVisibilityQueryResultValidationFailureEnvelope }
  | { ok: false; errors: InstructorPendingOrderVisibilityQueryResultValidationFailureEnvelopeError[] };

export function createInstructorPendingOrderVisibilityQueryDescriptor(
  input: InstructorPendingOrderVisibilityQueryDescriptorInput,
): InstructorPendingOrderVisibilityQueryDescriptorResult {
  const errors: InstructorPendingOrderVisibilityQueryDescriptorError[] = [];
  const classId = input.classId.trim();

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

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      descriptorType: 'instructor_pending_order_visibility_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:instructor-pending-order-visibility-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_instructor_pending_order_visibility',
      requiredScope: 'instructor_scoped_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeEstimatedTaxDrag: false,
      includeProviderPayload: false,
    },
  };
}

export function createInstructorPendingOrderVisibilityQueryResultValidationFailureEnvelope(
  input: InstructorPendingOrderVisibilityQueryResultEnvelopeInput,
): InstructorPendingOrderVisibilityQueryResultValidationFailureEnvelopeResult {
  const result = createInstructorPendingOrderVisibilityQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor pending-order visibility query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_pending_order_visibility_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      resultStatus: 'validation_failed',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createInstructorPendingOrderVisibilityQueryResultEnvelope(
  input: InstructorPendingOrderVisibilityQueryResultEnvelopeInput,
): InstructorPendingOrderVisibilityQueryResultEnvelopeResult {
  const errors: InstructorPendingOrderVisibilityQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_pending_order_visibility_snapshot',
          message: 'Instructor pending-order visibility query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Instructor pending-order visibility query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Instructor pending-order visibility query result month must match the descriptor current month.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_pending_order_visibility_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      resultStatus: 'ready',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function createInstructorPendingOrderVisibilitySnapshot(
  input: InstructorPendingOrderVisibilityInput,
): InstructorPendingOrderVisibilityResult {
  const errors: InstructorPendingOrderVisibilityError[] = [];
  const classId = input.classId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const enrolledFundIds: string[] = [];
  const enrolledFundIdSet = new Set<string>();
  const pendingOrderFundIdSet = new Set<string>();

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

  for (const enrolledFundIdInput of input.enrolledFundIds) {
    const fundId = enrolledFundIdInput.trim();

    if (fundId === '') {
      errors.push({
        code: 'invalid_fund_id',
        message: 'Enrolled fund id is required.',
      });
      continue;
    }

    if (enrolledFundIdSet.has(fundId)) {
      errors.push({
        code: 'duplicate_fund_id',
        message: 'Enrolled funds cannot contain the same fund more than once.',
        fundId,
      });
      continue;
    }

    enrolledFundIdSet.add(fundId);
    enrolledFundIds.push(fundId);
  }

  for (const pendingOrder of input.pendingOrders) {
    const fundId = pendingOrder.fundId.trim();

    if (fundId === '') {
      errors.push({
        code: 'invalid_fund_id',
        message: 'Pending order fund id is required.',
      });
      continue;
    }

    if (!Number.isInteger(pendingOrder.monthIndex) || pendingOrder.monthIndex < 0) {
      errors.push({
        code: 'invalid_order_month',
        message: 'Pending order month index must be a non-negative integer.',
        fundId,
      });
    } else if (monthIndexIsValid && pendingOrder.monthIndex !== input.monthIndex) {
      errors.push({
        code: 'invalid_order_month',
        message: 'Pending order month index must match the visibility snapshot month.',
        fundId,
      });
    }

    if (pendingOrder.status !== TARA_ORDER_PENDING_STATUS) {
      errors.push({
        code: 'invalid_order_status',
        message: 'Pending order visibility only accepts pending TARA orders.',
        fundId,
      });
    }

    if (!enrolledFundIdSet.has(fundId)) {
      errors.push({
        code: 'unknown_order_fund',
        message: 'Pending order fund must belong to the enrolled class fund set.',
        fundId,
      });
      continue;
    }

    if (pendingOrderFundIdSet.has(fundId)) {
      errors.push({
        code: 'duplicate_order_fund',
        message: 'Pending order visibility cannot include more than one order for the same fund.',
        fundId,
      });
      continue;
    }

    pendingOrderFundIdSet.add(fundId);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const fundStatuses = enrolledFundIds.map((fundId) => ({
    fundId,
    orderStatus: pendingOrderFundIdSet.has(fundId) ? ('pending' as const) : ('missing' as const),
  }));

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      totalFundCount: fundStatuses.length,
      pendingOrderCount: pendingOrderFundIdSet.size,
      missingOrderCount: fundStatuses.length - pendingOrderFundIdSet.size,
      fundStatuses,
    },
  };
}
