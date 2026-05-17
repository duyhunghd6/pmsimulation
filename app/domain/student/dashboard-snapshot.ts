import {
  buildCurrentTurnDriverStringDashboard,
  type CurrentTurnDriverStringDashboard,
} from '../scenario/driver-string-dashboard';
import {
  buildStudentMacroNewsSnapshot,
  type MacroNarrativeRow,
  type MarketMetricRow,
  type StudentMacroNewsSnapshot,
} from '../scenario/macro-news';
import { buildPortfolioPyramidSnapshot, type PortfolioPyramidSnapshot } from '../portfolio/pyramid';
import { createStudentTaraOrderEntrySnapshot, type StudentTaraOrderEntrySnapshot } from '../tara/order';
import {
  createStudentAttributionReportSnapshot,
  type StudentAttributionReportLedgerDraftInput,
  type StudentAttributionReportSnapshot,
} from './attribution-report';
import {
  createStudentLeaderboardRankSnapshot,
  type StudentLeaderboardRankFundInput,
  type StudentLeaderboardRankSnapshot,
} from './leaderboard-rank';

export type StudentDashboardCurrentTurnSnapshotInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  macroNarratives: readonly MacroNarrativeRow[];
  marketMetrics: readonly MarketMetricRow[];
  currentWeights: Record<string, number>;
  intendedWeights: Record<string, number>;
  dangerousDriftThresholdPct: number;
  targetWeights: Record<string, number>;
  currentAum: number;
  apexUnrealizedGainPct: number;
  leaderboardFunds: StudentLeaderboardRankFundInput[];
};

export type StudentDashboardCurrentTurnSnapshot = {
  snapshotType: 'student_dashboard_current_turn';
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  macroNews: StudentMacroNewsSnapshot;
  driverStringDashboard: CurrentTurnDriverStringDashboard;
  portfolioPyramid: PortfolioPyramidSnapshot;
  taraOrderEntry: StudentTaraOrderEntrySnapshot;
  leaderboardRank: StudentLeaderboardRankSnapshot;
};

export type StudentDashboardCurrentTurnSnapshotErrorSource =
  | 'macro_news'
  | 'driver_string_dashboard'
  | 'portfolio_pyramid'
  | 'tara_order_entry'
  | 'leaderboard_rank';

export type StudentDashboardCurrentTurnSnapshotError = {
  source: StudentDashboardCurrentTurnSnapshotErrorSource;
  code: string;
  message: string;
};

export type StudentDashboardCurrentTurnSnapshotResult =
  | { ok: true; value: StudentDashboardCurrentTurnSnapshot }
  | { ok: false; errors: StudentDashboardCurrentTurnSnapshotError[] };

export function buildStudentDashboardCurrentTurnSnapshot(
  input: StudentDashboardCurrentTurnSnapshotInput,
): StudentDashboardCurrentTurnSnapshotResult {
  const macroNewsResult = buildStudentMacroNewsSnapshot({
    currentMonthIndex: input.currentMonthIndex,
    macroNarratives: input.macroNarratives,
    marketMetrics: input.marketMetrics,
  });
  const driverStringDashboardResult = buildCurrentTurnDriverStringDashboard({
    currentMonthIndex: input.currentMonthIndex,
    macroNarratives: input.macroNarratives,
    marketMetrics: input.marketMetrics,
  });
  const portfolioPyramidResult = buildPortfolioPyramidSnapshot({
    currentWeights: input.currentWeights,
    intendedWeights: input.intendedWeights,
    dangerousDriftThresholdPct: input.dangerousDriftThresholdPct,
  });
  const taraOrderEntryResult = createStudentTaraOrderEntrySnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    viewerFundId: input.viewerFundId,
    currentAum: input.currentAum,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    apexUnrealizedGainPct: input.apexUnrealizedGainPct,
  });
  const leaderboardRankResult = createStudentLeaderboardRankSnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    viewerFundId: input.viewerFundId,
    funds: input.leaderboardFunds,
  });
  const errors: StudentDashboardCurrentTurnSnapshotError[] = [];

  if (!macroNewsResult.ok) {
    errors.push(...macroNewsResult.errors.map((error) => ({ source: 'macro_news' as const, ...error })));
  }

  if (!driverStringDashboardResult.ok) {
    errors.push(...driverStringDashboardResult.errors.map((error) => ({ source: 'driver_string_dashboard' as const, ...error })));
  }

  if (!portfolioPyramidResult.ok) {
    errors.push(
      ...portfolioPyramidResult.errors.map(({ code, message }) => ({
        source: 'portfolio_pyramid' as const,
        code,
        message,
      })),
    );
  }

  if (!taraOrderEntryResult.ok) {
    errors.push(...taraOrderEntryResult.errors.map((error) => ({ source: 'tara_order_entry' as const, ...error })));
  }

  if (!leaderboardRankResult.ok) {
    errors.push(...leaderboardRankResult.errors.map((error) => ({ source: 'leaderboard_rank' as const, ...error })));
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (
    !macroNewsResult.ok ||
    !driverStringDashboardResult.ok ||
    !portfolioPyramidResult.ok ||
    !taraOrderEntryResult.ok ||
    !leaderboardRankResult.ok
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      snapshotType: 'student_dashboard_current_turn',
      classId: taraOrderEntryResult.value.classId,
      monthIndex: input.currentMonthIndex,
      viewerFundId: taraOrderEntryResult.value.viewerFundId,
      macroNews: macroNewsResult.value,
      driverStringDashboard: driverStringDashboardResult.value,
      portfolioPyramid: portfolioPyramidResult.value,
      taraOrderEntry: taraOrderEntryResult.value,
      leaderboardRank: leaderboardRankResult.value,
    },
  };
}

export type StudentDashboardPostTurnSnapshotInput = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  ledgerDraft: StudentAttributionReportLedgerDraftInput;
  leaderboardFunds: StudentLeaderboardRankFundInput[];
};

export type StudentDashboardPostTurnSnapshot = {
  snapshotType: 'student_dashboard_post_turn';
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  attributionReport: StudentAttributionReportSnapshot;
  leaderboardRank: StudentLeaderboardRankSnapshot;
};

export type StudentDashboardPostTurnSnapshotErrorSource = 'attribution_report' | 'leaderboard_rank';

export type StudentDashboardPostTurnSnapshotError = {
  source: StudentDashboardPostTurnSnapshotErrorSource;
  code: string;
  message: string;
};

export type StudentDashboardPostTurnSnapshotResult =
  | { ok: true; value: StudentDashboardPostTurnSnapshot }
  | { ok: false; errors: StudentDashboardPostTurnSnapshotError[] };

export function buildStudentDashboardPostTurnSnapshot(
  input: StudentDashboardPostTurnSnapshotInput,
): StudentDashboardPostTurnSnapshotResult {
  const attributionReportResult = createStudentAttributionReportSnapshot({
    classId: input.classId,
    monthIndex: input.monthIndex,
    viewerFundId: input.viewerFundId,
    ledgerDraft: input.ledgerDraft,
  });
  const leaderboardRankResult = createStudentLeaderboardRankSnapshot({
    classId: input.classId,
    monthIndex: input.monthIndex,
    viewerFundId: input.viewerFundId,
    funds: input.leaderboardFunds,
  });
  const errors: StudentDashboardPostTurnSnapshotError[] = [];

  if (!attributionReportResult.ok) {
    errors.push(...attributionReportResult.errors.map((error) => ({ source: 'attribution_report' as const, ...error })));
  }

  if (!leaderboardRankResult.ok) {
    errors.push(...leaderboardRankResult.errors.map((error) => ({ source: 'leaderboard_rank' as const, ...error })));
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (!attributionReportResult.ok || !leaderboardRankResult.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      snapshotType: 'student_dashboard_post_turn',
      classId: attributionReportResult.value.classId,
      monthIndex: attributionReportResult.value.monthIndex,
      viewerFundId: attributionReportResult.value.viewerFundId,
      attributionReport: attributionReportResult.value,
      leaderboardRank: leaderboardRankResult.value,
    },
  };
}
