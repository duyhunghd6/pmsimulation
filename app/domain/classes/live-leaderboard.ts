import { type PendingOrderFundStatus } from './pending-order-visibility';

export type InstructorLiveLeaderboardFundInput = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  orderStatus: PendingOrderFundStatus['orderStatus'];
};

export type InstructorLiveLeaderboardInput = {
  classId: string;
  monthIndex: number;
  funds: InstructorLiveLeaderboardFundInput[];
};

export type InstructorLiveLeaderboardRow = {
  rank: number;
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  orderStatus: PendingOrderFundStatus['orderStatus'];
};

export type InstructorLiveLeaderboardSnapshot = {
  classId: string;
  monthIndex: number;
  rankedFundCount: number;
  pendingOrderCount: number;
  missingOrderCount: number;
  rows: InstructorLiveLeaderboardRow[];
};

export type InstructorLiveLeaderboardErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_fund_id'
  | 'duplicate_fund_id'
  | 'invalid_student_display_name'
  | 'invalid_current_aum'
  | 'invalid_sharpe_ratio'
  | 'invalid_order_status';

export type InstructorLiveLeaderboardError = {
  code: InstructorLiveLeaderboardErrorCode;
  message: string;
  fundId?: string;
};

export type InstructorLiveLeaderboardResult =
  | { ok: true; value: InstructorLiveLeaderboardSnapshot }
  | { ok: false; errors: InstructorLiveLeaderboardError[] };

export type InstructorLiveLeaderboardQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
};

export type InstructorLiveLeaderboardQueryDescriptor = {
  descriptorType: 'instructor_live_leaderboard_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_instructor_live_leaderboard';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
};

export type InstructorLiveLeaderboardQueryDescriptorErrorCode = 'invalid_class_id' | 'invalid_current_month_index';

export type InstructorLiveLeaderboardQueryDescriptorError = {
  code: InstructorLiveLeaderboardQueryDescriptorErrorCode;
  message: string;
};

export type InstructorLiveLeaderboardQueryDescriptorResult =
  | { ok: true; value: InstructorLiveLeaderboardQueryDescriptor }
  | { ok: false; errors: InstructorLiveLeaderboardQueryDescriptorError[] };

export type InstructorLiveLeaderboardQueryResultEnvelope = {
  envelopeType: 'instructor_live_leaderboard_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_live_leaderboard';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  snapshot: InstructorLiveLeaderboardSnapshot;
};

export type InstructorLiveLeaderboardQueryResultValidationFailureEnvelope = {
  envelopeType: 'instructor_live_leaderboard_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_live_leaderboard';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  validationErrors: InstructorLiveLeaderboardQueryResultEnvelopeError[];
};

export type InstructorLiveLeaderboardQueryResultEnvelopeInput = {
  descriptor: InstructorLiveLeaderboardQueryDescriptor;
  snapshot?: InstructorLiveLeaderboardSnapshot;
};

export type InstructorLiveLeaderboardQueryResultEnvelopeErrorCode =
  | 'missing_live_leaderboard_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index';

export type InstructorLiveLeaderboardQueryResultEnvelopeError = {
  code: InstructorLiveLeaderboardQueryResultEnvelopeErrorCode;
  message: string;
};

export type InstructorLiveLeaderboardQueryResultEnvelopeResult =
  | { ok: true; value: InstructorLiveLeaderboardQueryResultEnvelope }
  | { ok: false; errors: InstructorLiveLeaderboardQueryResultEnvelopeError[] };

export type InstructorLiveLeaderboardQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type InstructorLiveLeaderboardQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: InstructorLiveLeaderboardQueryResultValidationFailureEnvelope }
  | { ok: false; errors: InstructorLiveLeaderboardQueryResultValidationFailureEnvelopeError[] };

export function createInstructorLiveLeaderboardQueryDescriptor(
  input: InstructorLiveLeaderboardQueryDescriptorInput,
): InstructorLiveLeaderboardQueryDescriptorResult {
  const errors: InstructorLiveLeaderboardQueryDescriptorError[] = [];
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
      descriptorType: 'instructor_live_leaderboard_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:instructor-live-leaderboard-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_instructor_live_leaderboard',
      requiredScope: 'instructor_scoped_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeHoldings: false,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeEstimatedTaxDrag: false,
      includeProviderPayload: false,
    },
  };
}

export function createInstructorLiveLeaderboardQueryResultValidationFailureEnvelope(
  input: InstructorLiveLeaderboardQueryResultEnvelopeInput,
): InstructorLiveLeaderboardQueryResultValidationFailureEnvelopeResult {
  const result = createInstructorLiveLeaderboardQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor live leaderboard query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_live_leaderboard_query_result_validation_failure',
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
      includeHoldings: input.descriptor.includeHoldings,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createInstructorLiveLeaderboardQueryResultEnvelope(
  input: InstructorLiveLeaderboardQueryResultEnvelopeInput,
): InstructorLiveLeaderboardQueryResultEnvelopeResult {
  const errors: InstructorLiveLeaderboardQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_live_leaderboard_snapshot',
          message: 'Instructor live leaderboard query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Instructor live leaderboard query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Instructor live leaderboard query result month must match the descriptor current month.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_live_leaderboard_query_result',
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
      includeHoldings: input.descriptor.includeHoldings,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function createInstructorLiveLeaderboardSnapshot(
  input: InstructorLiveLeaderboardInput,
): InstructorLiveLeaderboardResult {
  const errors: InstructorLiveLeaderboardError[] = [];
  const classId = input.classId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const seenFundIds = new Set<string>();
  const rows: Omit<InstructorLiveLeaderboardRow, 'rank'>[] = [];

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
    const studentDisplayName = fund.studentDisplayName.trim();

    if (fundId === '') {
      errors.push({
        code: 'invalid_fund_id',
        message: 'Leaderboard fund id is required.',
      });
    } else if (seenFundIds.has(fundId)) {
      errors.push({
        code: 'duplicate_fund_id',
        message: 'Leaderboard cannot include the same fund more than once.',
        fundId,
      });
    } else {
      seenFundIds.add(fundId);
    }

    if (studentDisplayName === '') {
      errors.push({
        code: 'invalid_student_display_name',
        message: 'Student display name is required.',
        fundId: fundId || undefined,
      });
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
        message: 'Leaderboard order status must be pending or missing.',
        fundId: fundId || undefined,
      });
    }

    rows.push({
      fundId,
      studentDisplayName,
      currentAum: fund.currentAum,
      sharpeRatio: fund.sharpeRatio,
      orderStatus: fund.orderStatus,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const rankedRows = rows
    .sort((left, right) => {
      if (right.currentAum !== left.currentAum) {
        return right.currentAum - left.currentAum;
      }

      if (right.sharpeRatio !== left.sharpeRatio) {
        return right.sharpeRatio - left.sharpeRatio;
      }

      return left.fundId.localeCompare(right.fundId);
    })
    .map((row, index) => ({
      rank: index + 1,
      ...row,
    }));

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      rankedFundCount: rankedRows.length,
      pendingOrderCount: rankedRows.filter((row) => row.orderStatus === 'pending').length,
      missingOrderCount: rankedRows.filter((row) => row.orderStatus === 'missing').length,
      rows: rankedRows,
    },
  };
}
