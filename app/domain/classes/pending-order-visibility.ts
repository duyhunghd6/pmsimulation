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
