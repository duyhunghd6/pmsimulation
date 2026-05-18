export type StudentLeaderboardRankFundInput = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
};

export type StudentLeaderboardRankInput = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  funds: StudentLeaderboardRankFundInput[];
};

export type StudentLeaderboardRankRow = {
  rank: number;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  isViewerFund: boolean;
};

export type StudentLeaderboardRankSnapshot = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  viewerRank: number;
  rankedFundCount: number;
  rows: StudentLeaderboardRankRow[];
};

export type StudentLeaderboardRankErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_viewer_fund_id'
  | 'viewer_fund_not_found'
  | 'invalid_fund_id'
  | 'duplicate_fund_id'
  | 'invalid_student_display_name'
  | 'invalid_current_aum'
  | 'invalid_sharpe_ratio';

export type StudentLeaderboardRankError = {
  code: StudentLeaderboardRankErrorCode;
  message: string;
  fundId?: string;
};

export type StudentLeaderboardRankResult =
  | { ok: true; value: StudentLeaderboardRankSnapshot }
  | { ok: false; errors: StudentLeaderboardRankError[] };

export type StudentLeaderboardRankQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
};

export type StudentLeaderboardRankQueryDescriptor = {
  descriptorType: 'student_leaderboard_rank_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_student_leaderboard_rank';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includePendingOrderStatus: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
};

export type StudentLeaderboardRankQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_current_month_index'
  | 'invalid_viewer_fund_id';

export type StudentLeaderboardRankQueryDescriptorError = {
  code: StudentLeaderboardRankQueryDescriptorErrorCode;
  message: string;
};

export type StudentLeaderboardRankQueryDescriptorResult =
  | { ok: true; value: StudentLeaderboardRankQueryDescriptor }
  | { ok: false; errors: StudentLeaderboardRankQueryDescriptorError[] };

export type StudentLeaderboardRankQueryResultEnvelope = {
  envelopeType: 'student_leaderboard_rank_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_leaderboard_rank';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includePendingOrderStatus: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  snapshot: StudentLeaderboardRankSnapshot;
};

export type StudentLeaderboardRankQueryResultValidationFailureEnvelope = {
  envelopeType: 'student_leaderboard_rank_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_leaderboard_rank';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includePendingOrderStatus: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  validationErrors: StudentLeaderboardRankQueryResultEnvelopeError[];
};

export type StudentLeaderboardRankQueryResultEnvelopeInput = {
  descriptor: StudentLeaderboardRankQueryDescriptor;
  snapshot?: StudentLeaderboardRankSnapshot;
};

export type StudentLeaderboardRankQueryResultEnvelopeErrorCode =
  | 'missing_student_leaderboard_rank_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index'
  | 'mismatched_viewer_fund_id';

export type StudentLeaderboardRankQueryResultEnvelopeError = {
  code: StudentLeaderboardRankQueryResultEnvelopeErrorCode;
  message: string;
};

export type StudentLeaderboardRankQueryResultEnvelopeResult =
  | { ok: true; value: StudentLeaderboardRankQueryResultEnvelope }
  | { ok: false; errors: StudentLeaderboardRankQueryResultEnvelopeError[] };

export type StudentLeaderboardRankQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type StudentLeaderboardRankQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: StudentLeaderboardRankQueryResultValidationFailureEnvelope }
  | { ok: false; errors: StudentLeaderboardRankQueryResultValidationFailureEnvelopeError[] };

export function createStudentLeaderboardRankQueryDescriptor(
  input: StudentLeaderboardRankQueryDescriptorInput,
): StudentLeaderboardRankQueryDescriptorResult {
  const errors: StudentLeaderboardRankQueryDescriptorError[] = [];
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
      descriptorType: 'student_leaderboard_rank_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:fund:${viewerFundId}:student-leaderboard-rank-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_student_leaderboard_rank',
      requiredScope: 'viewer_fund_in_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      viewerFundId,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundIds: false,
      includeExactHoldings: false,
      includePendingOrderStatus: false,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeEstimatedTaxDrag: false,
      includeLedgerDrafts: false,
      includeProviderPayload: false,
    },
  };
}

export function createStudentLeaderboardRankQueryResultValidationFailureEnvelope(
  input: StudentLeaderboardRankQueryResultEnvelopeInput,
): StudentLeaderboardRankQueryResultValidationFailureEnvelopeResult {
  const result = createStudentLeaderboardRankQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student leaderboard rank query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_leaderboard_rank_query_result_validation_failure',
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
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeExactHoldings: input.descriptor.includeExactHoldings,
      includePendingOrderStatus: input.descriptor.includePendingOrderStatus,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createStudentLeaderboardRankQueryResultEnvelope(
  input: StudentLeaderboardRankQueryResultEnvelopeInput,
): StudentLeaderboardRankQueryResultEnvelopeResult {
  const errors: StudentLeaderboardRankQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_student_leaderboard_rank_snapshot',
          message: 'Student leaderboard rank query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Student leaderboard rank query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Student leaderboard rank query result month must match the descriptor current month.',
    });
  }

  if (input.snapshot.viewerFundId !== input.descriptor.viewerFundId) {
    errors.push({
      code: 'mismatched_viewer_fund_id',
      message: 'Student leaderboard rank query result viewer fund must match the descriptor viewer fund.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_leaderboard_rank_query_result',
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
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeExactHoldings: input.descriptor.includeExactHoldings,
      includePendingOrderStatus: input.descriptor.includePendingOrderStatus,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function createStudentLeaderboardRankSnapshot(
  input: StudentLeaderboardRankInput,
): StudentLeaderboardRankResult {
  const errors: StudentLeaderboardRankError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const seenFundIds = new Set<string>();
  const rows: Array<Omit<StudentLeaderboardRankRow, 'rank' | 'isViewerFund'> & { fundId: string }> = [];

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
        message: 'Student leaderboard rank view cannot include the same fund more than once.',
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

    rows.push({
      fundId,
      studentDisplayName,
      currentAum: fund.currentAum,
      sharpeRatio: fund.sharpeRatio,
    });
  }

  if (viewerFundId !== '' && !seenFundIds.has(viewerFundId)) {
    errors.push({
      code: 'viewer_fund_not_found',
      message: 'Viewer fund id must match one fund in the scoped leaderboard input.',
      fundId: viewerFundId,
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
      studentDisplayName: row.studentDisplayName,
      currentAum: row.currentAum,
      sharpeRatio: row.sharpeRatio,
      isViewerFund: row.fundId === viewerFundId,
    }));

  const viewerRow = rankedRows.find((row) => row.isViewerFund);

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      viewerFundId,
      viewerRank: viewerRow?.rank ?? 0,
      rankedFundCount: rankedRows.length,
      rows: rankedRows,
    },
  };
}
