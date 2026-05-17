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
