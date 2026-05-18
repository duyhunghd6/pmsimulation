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

export type InstructorClassAggregateAnalyticsQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
};

export type InstructorClassAggregateAnalyticsQueryDescriptor = {
  descriptorType: 'instructor_class_aggregate_analytics_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_instructor_class_aggregate_analytics';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includePerFundRows: false;
  includeHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
};

export type InstructorClassAggregateAnalyticsQueryDescriptorErrorCode = 'invalid_class_id' | 'invalid_current_month_index';

export type InstructorClassAggregateAnalyticsQueryDescriptorError = {
  code: InstructorClassAggregateAnalyticsQueryDescriptorErrorCode;
  message: string;
};

export type InstructorClassAggregateAnalyticsQueryDescriptorResult =
  | { ok: true; value: InstructorClassAggregateAnalyticsQueryDescriptor }
  | { ok: false; errors: InstructorClassAggregateAnalyticsQueryDescriptorError[] };

export type InstructorClassAggregateAnalyticsQueryResultEnvelope = {
  envelopeType: 'instructor_class_aggregate_analytics_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_class_aggregate_analytics';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includePerFundRows: false;
  includeHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  snapshot: InstructorClassAggregateAnalyticsSnapshot;
};

export type InstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope = {
  envelopeType: 'instructor_class_aggregate_analytics_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_class_aggregate_analytics';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includePerFundRows: false;
  includeHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  validationErrors: InstructorClassAggregateAnalyticsQueryResultEnvelopeError[];
};

export type InstructorClassAggregateAnalyticsQueryResultEnvelopeInput = {
  descriptor: InstructorClassAggregateAnalyticsQueryDescriptor;
  snapshot?: InstructorClassAggregateAnalyticsSnapshot;
};

export type InstructorClassAggregateAnalyticsQueryResultEnvelopeErrorCode =
  | 'missing_class_aggregate_analytics_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index';

export type InstructorClassAggregateAnalyticsQueryResultEnvelopeError = {
  code: InstructorClassAggregateAnalyticsQueryResultEnvelopeErrorCode;
  message: string;
};

export type InstructorClassAggregateAnalyticsQueryResultEnvelopeResult =
  | { ok: true; value: InstructorClassAggregateAnalyticsQueryResultEnvelope }
  | { ok: false; errors: InstructorClassAggregateAnalyticsQueryResultEnvelopeError[] };

export type InstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type InstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: InstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope }
  | { ok: false; errors: InstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelopeError[] };

export function createInstructorClassAggregateAnalyticsQueryDescriptor(
  input: InstructorClassAggregateAnalyticsQueryDescriptorInput,
): InstructorClassAggregateAnalyticsQueryDescriptorResult {
  const errors: InstructorClassAggregateAnalyticsQueryDescriptorError[] = [];
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
      descriptorType: 'instructor_class_aggregate_analytics_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:instructor-class-aggregate-analytics-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_instructor_class_aggregate_analytics',
      requiredScope: 'instructor_scoped_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includePerFundRows: false,
      includeHoldings: false,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeEstimatedTaxDrag: false,
      includeProviderPayload: false,
    },
  };
}

export function createInstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelope(
  input: InstructorClassAggregateAnalyticsQueryResultEnvelopeInput,
): InstructorClassAggregateAnalyticsQueryResultValidationFailureEnvelopeResult {
  const result = createInstructorClassAggregateAnalyticsQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor class aggregate analytics query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_class_aggregate_analytics_query_result_validation_failure',
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
      includePerFundRows: input.descriptor.includePerFundRows,
      includeHoldings: input.descriptor.includeHoldings,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createInstructorClassAggregateAnalyticsQueryResultEnvelope(
  input: InstructorClassAggregateAnalyticsQueryResultEnvelopeInput,
): InstructorClassAggregateAnalyticsQueryResultEnvelopeResult {
  const errors: InstructorClassAggregateAnalyticsQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_class_aggregate_analytics_snapshot',
          message: 'Instructor class aggregate analytics query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Instructor class aggregate analytics query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Instructor class aggregate analytics query result month must match the descriptor current month.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_class_aggregate_analytics_query_result',
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
      includePerFundRows: input.descriptor.includePerFundRows,
      includeHoldings: input.descriptor.includeHoldings,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

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
