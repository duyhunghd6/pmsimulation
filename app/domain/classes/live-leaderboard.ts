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
