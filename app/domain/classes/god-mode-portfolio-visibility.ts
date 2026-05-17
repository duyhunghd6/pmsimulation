import {
  ASSET_TIERS,
  validateTaraAllocationWeights,
  type AllocationValidationError,
  type AssetTier,
} from '../tara/allocation';
import { type PendingOrderFundStatus } from './pending-order-visibility';

export type InstructorGodModePortfolioFundInput = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  orderStatus: PendingOrderFundStatus['orderStatus'];
  holdings: Record<string, number>;
};

export type InstructorGodModePortfolioVisibilityInput = {
  classId: string;
  monthIndex: number;
  funds: InstructorGodModePortfolioFundInput[];
};

export type InstructorGodModePortfolioHolding = {
  tier: AssetTier;
  allocationWeightPct: number;
};

export type InstructorGodModePortfolioRow = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  orderStatus: PendingOrderFundStatus['orderStatus'];
  holdings: InstructorGodModePortfolioHolding[];
};

export type InstructorGodModePortfolioVisibilitySnapshot = {
  classId: string;
  monthIndex: number;
  fundCount: number;
  pendingOrderCount: number;
  missingOrderCount: number;
  rows: InstructorGodModePortfolioRow[];
};

export type InstructorGodModePortfolioVisibilityErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_fund_id'
  | 'duplicate_fund_id'
  | 'invalid_student_display_name'
  | 'invalid_current_aum'
  | 'invalid_sharpe_ratio'
  | 'invalid_order_status'
  | AllocationValidationError['code'];

export type InstructorGodModePortfolioVisibilityError = {
  code: InstructorGodModePortfolioVisibilityErrorCode;
  message: string;
  fundId?: string;
  tier?: string;
  total?: number;
  source?: 'holdings';
};

export type InstructorGodModePortfolioVisibilityResult =
  | { ok: true; value: InstructorGodModePortfolioVisibilitySnapshot }
  | { ok: false; errors: InstructorGodModePortfolioVisibilityError[] };

export function createInstructorGodModePortfolioVisibilitySnapshot(
  input: InstructorGodModePortfolioVisibilityInput,
): InstructorGodModePortfolioVisibilityResult {
  const errors: InstructorGodModePortfolioVisibilityError[] = [];
  const classId = input.classId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const seenFundIds = new Set<string>();
  const rows: InstructorGodModePortfolioRow[] = [];

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
    const holdingsResult = validateTaraAllocationWeights(fund.holdings);

    if (fundId === '') {
      errors.push({
        code: 'invalid_fund_id',
        message: 'God Mode portfolio fund id is required.',
      });
    } else if (seenFundIds.has(fundId)) {
      errors.push({
        code: 'duplicate_fund_id',
        message: 'God Mode portfolio visibility cannot include the same fund more than once.',
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
        message: 'God Mode portfolio order status must be pending or missing.',
        fundId: fundId || undefined,
      });
    }

    if (!holdingsResult.ok) {
      errors.push(
        ...holdingsResult.errors.map((error) => ({
          ...error,
          fundId: fundId || undefined,
          source: 'holdings' as const,
        })),
      );
      continue;
    }

    rows.push({
      fundId,
      studentDisplayName,
      currentAum: fund.currentAum,
      sharpeRatio: fund.sharpeRatio,
      orderStatus: fund.orderStatus,
      holdings: ASSET_TIERS.map((tier) => ({
        tier,
        allocationWeightPct: holdingsResult.value[tier],
      })),
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const sortedRows = rows.sort((left, right) => {
    const displayNameComparison = left.studentDisplayName.localeCompare(right.studentDisplayName);

    if (displayNameComparison !== 0) {
      return displayNameComparison;
    }

    return left.fundId.localeCompare(right.fundId);
  });

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      fundCount: sortedRows.length,
      pendingOrderCount: sortedRows.filter((row) => row.orderStatus === 'pending').length,
      missingOrderCount: sortedRows.filter((row) => row.orderStatus === 'missing').length,
      rows: sortedRows,
    },
  };
}
