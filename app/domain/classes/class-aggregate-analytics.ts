import { type PendingOrderFundStatus } from './pending-order-visibility';

export type InstructorClassAggregateFundInput = {
  fundId: string;
  currentAum: number;
  sharpeRatio: number;
  orderStatus: PendingOrderFundStatus['orderStatus'];
};

export type InstructorClassAggregateAnalyticsInput = {
  classId: string;
  monthIndex: number;
  funds: InstructorClassAggregateFundInput[];
};

export type InstructorClassAggregateAnalyticsSnapshot = {
  classId: string;
  monthIndex: number;
  fundCount: number;
  totalCurrentAum: number;
  averageCurrentAum: number;
  averageSharpeRatio: number | null;
  pendingOrderCount: number;
  missingOrderCount: number;
  pendingOrderAum: number;
  missingOrderAum: number;
};

export type InstructorClassAggregateAnalyticsErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_fund_id'
  | 'duplicate_fund_id'
  | 'invalid_current_aum'
  | 'invalid_sharpe_ratio'
  | 'invalid_order_status';

export type InstructorClassAggregateAnalyticsError = {
  code: InstructorClassAggregateAnalyticsErrorCode;
  message: string;
  fundId?: string;
};

export type InstructorClassAggregateAnalyticsResult =
  | { ok: true; value: InstructorClassAggregateAnalyticsSnapshot }
  | { ok: false; errors: InstructorClassAggregateAnalyticsError[] };

export function createInstructorClassAggregateAnalyticsSnapshot(
  input: InstructorClassAggregateAnalyticsInput,
): InstructorClassAggregateAnalyticsResult {
  const errors: InstructorClassAggregateAnalyticsError[] = [];
  const classId = input.classId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const seenFundIds = new Set<string>();
  const funds: InstructorClassAggregateFundInput[] = [];

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

  for (const fund of input.funds) {
    const fundId = fund.fundId.trim();

    if (fundId === '') {
      errors.push({
        code: 'invalid_fund_id',
        message: 'Aggregate analytics fund id is required.',
      });
    } else if (seenFundIds.has(fundId)) {
      errors.push({
        code: 'duplicate_fund_id',
        message: 'Aggregate analytics cannot include the same fund more than once.',
        fundId,
      });
    } else {
      seenFundIds.add(fundId);
    }

    if (!Number.isFinite(fund.currentAum) || fund.currentAum < 0) {
      errors.push({
        code: 'invalid_current_aum',
        message: 'Current AUM must be a non-negative finite number.',
        fundId: fundId || undefined,
      });
    }

    if (!Number.isFinite(fund.sharpeRatio)) {
      errors.push({
        code: 'invalid_sharpe_ratio',
        message: 'Sharpe ratio must be a finite number.',
        fundId: fundId || undefined,
      });
    }

    if (fund.orderStatus !== 'pending' && fund.orderStatus !== 'missing') {
      errors.push({
        code: 'invalid_order_status',
        message: 'Aggregate analytics order status must be pending or missing.',
        fundId: fundId || undefined,
      });
    }

    funds.push({
      fundId,
      currentAum: fund.currentAum,
      sharpeRatio: fund.sharpeRatio,
      orderStatus: fund.orderStatus,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const totalCurrentAum = funds.reduce((total, fund) => total + fund.currentAum, 0);
  const pendingOrderAum = funds
    .filter((fund) => fund.orderStatus === 'pending')
    .reduce((total, fund) => total + fund.currentAum, 0);
  const missingOrderAum = totalCurrentAum - pendingOrderAum;
  const pendingOrderCount = funds.filter((fund) => fund.orderStatus === 'pending').length;
  const fundCount = funds.length;

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      fundCount,
      totalCurrentAum,
      averageCurrentAum: fundCount === 0 ? 0 : totalCurrentAum / fundCount,
      averageSharpeRatio:
        fundCount === 0 ? null : funds.reduce((total, fund) => total + fund.sharpeRatio, 0) / fundCount,
      pendingOrderCount,
      missingOrderCount: fundCount - pendingOrderCount,
      pendingOrderAum,
      missingOrderAum,
    },
  };
}
