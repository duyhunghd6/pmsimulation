import {
  createInstructorClassAggregateAnalyticsSnapshot,
  type InstructorClassAggregateAnalyticsSnapshot,
} from './class-aggregate-analytics';
import {
  createInstructorGodModePortfolioVisibilitySnapshot,
  type InstructorGodModePortfolioVisibilitySnapshot,
} from './god-mode-portfolio-visibility';
import { createInstructorLiveMonthAdvanceControlSnapshot, type InstructorLiveMonthAdvanceControlSnapshot } from './month-advancement';
import {
  createInstructorLiveLeaderboardSnapshot,
  type InstructorLiveLeaderboardSnapshot,
} from './live-leaderboard';
import {
  createInstructorPendingOrderVisibilitySnapshot,
  type InstructorPendingOrderVisibilitySnapshot,
  type PendingOrderVisibilityOrderInput,
} from './pending-order-visibility';

export type InstructorDashboardCurrentTurnFundInput = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  holdings: Record<string, number>;
};

export type InstructorDashboardCurrentTurnSnapshotInput = {
  classId: string;
  currentMonthIndex: number;
  triggerMode: string;
  totalMonths: number;
  funds: InstructorDashboardCurrentTurnFundInput[];
  pendingOrders: PendingOrderVisibilityOrderInput[];
};

export type InstructorDashboardCurrentTurnSnapshot = {
  snapshotType: 'instructor_dashboard_current_turn';
  classId: string;
  monthIndex: number;
  pendingOrderVisibility: InstructorPendingOrderVisibilitySnapshot;
  liveLeaderboard: InstructorLiveLeaderboardSnapshot;
  godModePortfolioVisibility: InstructorGodModePortfolioVisibilitySnapshot;
  classAggregateAnalytics: InstructorClassAggregateAnalyticsSnapshot;
  liveMonthAdvanceControl: InstructorLiveMonthAdvanceControlSnapshot;
};

export type InstructorDashboardCurrentTurnSnapshotErrorSource =
  | 'pending_order_visibility'
  | 'live_leaderboard'
  | 'god_mode_portfolio_visibility'
  | 'class_aggregate_analytics'
  | 'live_month_advance_control';

export type InstructorDashboardCurrentTurnSnapshotError = {
  source: InstructorDashboardCurrentTurnSnapshotErrorSource;
  code: string;
  message: string;
  fundId?: string;
};

export type InstructorDashboardCurrentTurnSnapshotResult =
  | { ok: true; value: InstructorDashboardCurrentTurnSnapshot }
  | { ok: false; errors: InstructorDashboardCurrentTurnSnapshotError[] };

export function buildInstructorDashboardCurrentTurnSnapshot(
  input: InstructorDashboardCurrentTurnSnapshotInput,
): InstructorDashboardCurrentTurnSnapshotResult {
  const errors: InstructorDashboardCurrentTurnSnapshotError[] = [];
  const pendingOrderVisibilityResult = createInstructorPendingOrderVisibilitySnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    enrolledFundIds: input.funds.map((fund) => fund.fundId),
    pendingOrders: input.pendingOrders,
  });
  const liveMonthAdvanceControlResult = createInstructorLiveMonthAdvanceControlSnapshot({
    classId: input.classId,
    triggerMode: input.triggerMode,
    currentMonthIndex: input.currentMonthIndex,
    totalMonths: input.totalMonths,
  });

  if (!pendingOrderVisibilityResult.ok) {
    errors.push(
      ...pendingOrderVisibilityResult.errors.map((error) => ({
        source: 'pending_order_visibility' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (!liveMonthAdvanceControlResult.ok) {
    errors.push(
      ...liveMonthAdvanceControlResult.errors.map((error) => ({
        source: 'live_month_advance_control' as const,
        code: error.code,
        message: error.message,
      })),
    );
  }

  if (!pendingOrderVisibilityResult.ok) {
    return { ok: false, errors };
  }

  const orderStatusByFundId = new Map(
    pendingOrderVisibilityResult.value.fundStatuses.map((fundStatus) => [fundStatus.fundId, fundStatus.orderStatus]),
  );
  const fundsWithOrderStatus = input.funds.map((fund) => ({
    ...fund,
    orderStatus: orderStatusByFundId.get(fund.fundId.trim()) ?? 'missing',
  }));
  const liveLeaderboardResult = createInstructorLiveLeaderboardSnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    funds: fundsWithOrderStatus,
  });
  const godModePortfolioVisibilityResult = createInstructorGodModePortfolioVisibilitySnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    funds: fundsWithOrderStatus,
  });
  const classAggregateAnalyticsResult = createInstructorClassAggregateAnalyticsSnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    funds: fundsWithOrderStatus,
  });

  if (!liveLeaderboardResult.ok) {
    errors.push(
      ...liveLeaderboardResult.errors.map((error) => ({
        source: 'live_leaderboard' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (!godModePortfolioVisibilityResult.ok) {
    errors.push(
      ...godModePortfolioVisibilityResult.errors.map((error) => ({
        source: 'god_mode_portfolio_visibility' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (!classAggregateAnalyticsResult.ok) {
    errors.push(
      ...classAggregateAnalyticsResult.errors.map((error) => ({
        source: 'class_aggregate_analytics' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (
    !liveMonthAdvanceControlResult.ok ||
    !liveLeaderboardResult.ok ||
    !godModePortfolioVisibilityResult.ok ||
    !classAggregateAnalyticsResult.ok
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      snapshotType: 'instructor_dashboard_current_turn',
      classId: pendingOrderVisibilityResult.value.classId,
      monthIndex: input.currentMonthIndex,
      pendingOrderVisibility: pendingOrderVisibilityResult.value,
      liveLeaderboard: liveLeaderboardResult.value,
      godModePortfolioVisibility: godModePortfolioVisibilityResult.value,
      classAggregateAnalytics: classAggregateAnalyticsResult.value,
      liveMonthAdvanceControl: liveMonthAdvanceControlResult.value,
    },
  };
}
