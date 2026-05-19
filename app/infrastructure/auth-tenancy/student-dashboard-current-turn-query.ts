import {
  buildStudentDashboardCurrentTurnSnapshot,
  createStudentDashboardCurrentTurnQueryDescriptor,
  createStudentDashboardCurrentTurnQueryResultEnvelope,
  type StudentDashboardCurrentTurnQueryResultEnvelope,
  type StudentDashboardCurrentTurnSnapshotError,
} from '../../domain/student/dashboard-snapshot';
import type { MacroNarrativeRow, MarketMetricRow } from '../../domain/scenario/macro-news';
import type { StudentLeaderboardRankFundInput } from '../../domain/student/leaderboard-rank';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseStudentFundStateRow,
  parseStudentLeaderboardFundRow,
  parseStudentOwnHoldingRow,
  parseStudentRevealedMacroNarrativeRow,
  parseStudentRevealedMarketMetricRow,
  parseStudentTaraOrderRow,
  parseStudentTrackedMetricRow,
  type AuthTenancyDatabaseRowFailureCode,
} from './rows';

const apexUnrealizedGainMetricId = 'apex_unrealized_gain_pct';

export type StudentDashboardCurrentTurnQueryScope = {
  classId: string;
  fundId: string;
  monthIndex: number;
};

export type StudentDashboardCurrentTurnQueryRowSet = {
  macroNarratives: readonly unknown[];
  marketMetrics: readonly unknown[];
  funds: readonly unknown[];
  holdings: readonly unknown[];
  orders: readonly unknown[];
  trackedMetrics: readonly unknown[];
  leaderboardFunds: readonly unknown[];
};

export type StudentDashboardCurrentTurnQueryRowReader = {
  readStudentDashboardCurrentTurnRows(input: {
    session: AuthTenancySession;
    scope: StudentDashboardCurrentTurnQueryScope;
  }): Promise<StudentDashboardCurrentTurnQueryRowSet>;
};

export type StudentDashboardCurrentTurnQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_fund_scope'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'macro_narrative_row_rejected'
  | 'market_metric_row_rejected'
  | 'fund_row_rejected'
  | 'missing_fund_row'
  | 'duplicate_fund_row'
  | 'holding_row_rejected'
  | 'duplicate_holding_tier'
  | 'order_row_rejected'
  | 'duplicate_pending_order'
  | 'tracked_metric_row_rejected'
  | 'missing_apex_unrealized_gain_pct'
  | 'duplicate_apex_unrealized_gain_pct'
  | 'invalid_apex_unrealized_gain_pct'
  | 'leaderboard_fund_row_rejected'
  | 'row_reader_failed'
  | 'invalid_snapshot'
  | 'invalid_result_envelope';

export type StudentDashboardCurrentTurnQueryExecutionFailure = {
  code: StudentDashboardCurrentTurnQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly StudentDashboardCurrentTurnSnapshotError[];
};

export type StudentDashboardCurrentTurnQueryExecutionResult =
  | { ok: true; value: StudentDashboardCurrentTurnQueryResultEnvelope }
  | { ok: false; failure: StudentDashboardCurrentTurnQueryExecutionFailure };

export async function executeStudentDashboardCurrentTurnQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: StudentDashboardCurrentTurnQueryRowReader;
  intendedWeights: Record<string, number>;
  dangerousDriftThresholdPct: number;
}): Promise<StudentDashboardCurrentTurnQueryExecutionResult> {
  if (input.session.role !== 'student') {
    return { ok: false, failure: { code: 'invalid_role' } };
  }
  if (input.scope.fundId === undefined) {
    return { ok: false, failure: { code: 'missing_fund_scope' } };
  }
  if (input.scope.monthIndex === undefined) {
    return { ok: false, failure: { code: 'missing_month_scope' } };
  }

  const scope = {
    classId: input.scope.classId,
    fundId: input.scope.fundId,
    monthIndex: input.scope.monthIndex,
  };
  const descriptorResult = createStudentDashboardCurrentTurnQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
    viewerFundId: scope.fundId,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  let rows: StudentDashboardCurrentTurnQueryRowSet;
  try {
    rows = await input.rowReader.readStudentDashboardCurrentTurnRows({ session: input.session, scope });
  } catch {
    return { ok: false, failure: { code: 'row_reader_failed' } };
  }

  const macroNarratives: MacroNarrativeRow[] = [];
  const marketMetrics: MarketMetricRow[] = [];
  let currentAum: number | undefined;
  const currentWeights: Record<string, number> = {};
  let pendingTargetWeights: Record<string, number> | undefined;
  let apexUnrealizedGainPct: number | undefined;
  const leaderboardFunds: StudentLeaderboardRankFundInput[] = [];

  for (const row of rows.macroNarratives) {
    const parsed = parseStudentRevealedMacroNarrativeRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'macro_narrative_row_rejected', rowFailureCode: parsed.code } };
    }
    macroNarratives.push({
      monthIndex: parsed.row.monthIndex,
      newsHeadline: parsed.row.newsHeadline,
      investmentClockPhase: parsed.row.investmentClockPhase,
      pmi: parsed.row.pmi,
      iip: parsed.row.iip,
      m2Growth: parsed.row.m2Growth,
      gdpGrowthYoy: parsed.row.gdpGrowthYoy,
      inflationCpi: parsed.row.inflationCpi,
      policyRate: parsed.row.policyRate,
      bondYield: parsed.row.bondYield,
      interbankRate: parsed.row.interbankRate,
      usdVndMovement: parsed.row.usdVndMovement,
      vix: parsed.row.vix,
      scenarioPersistence: parsed.row.scenarioPersistence,
    });
  }

  for (const row of rows.marketMetrics) {
    const parsed = parseStudentRevealedMarketMetricRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'market_metric_row_rejected', rowFailureCode: parsed.code } };
    }
    marketMetrics.push({
      monthIndex: parsed.row.monthIndex,
      vnIndexLevel: parsed.row.vnIndexLevel,
      equityMarketTradingValue: parsed.row.equityMarketTradingValue,
      foreignInvestorNetTradingValue: parsed.row.foreignInvestorNetTradingValue,
      retailInvestorNetTradingValue: parsed.row.retailInvestorNetTradingValue,
      marketEarningsGrowthExpectation: parsed.row.marketEarningsGrowthExpectation,
      valuationSentiment: parsed.row.valuationSentiment,
      businessCyclePhase: parsed.row.businessCyclePhase,
    });
  }

  for (const row of rows.funds) {
    const parsed = parseStudentFundStateRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'fund_row_rejected', rowFailureCode: parsed.code } };
    }
    if (currentAum !== undefined) {
      return { ok: false, failure: { code: 'duplicate_fund_row' } };
    }
    currentAum = parsed.row.currentAum;
  }
  if (currentAum === undefined) {
    return { ok: false, failure: { code: 'missing_fund_row' } };
  }

  for (const row of rows.holdings) {
    const parsed = parseStudentOwnHoldingRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'holding_row_rejected', rowFailureCode: parsed.code } };
    }
    if (currentWeights[parsed.row.tier] !== undefined) {
      return { ok: false, failure: { code: 'duplicate_holding_tier' } };
    }
    currentWeights[parsed.row.tier] = parsed.row.allocationWeightPct;
  }

  for (const row of rows.orders) {
    const parsed = parseStudentTaraOrderRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'order_row_rejected', rowFailureCode: parsed.code } };
    }
    if (parsed.row.status !== 'pending') {
      continue;
    }
    if (pendingTargetWeights !== undefined) {
      return { ok: false, failure: { code: 'duplicate_pending_order' } };
    }
    pendingTargetWeights = { ...parsed.row.targetWeights };
  }

  for (const row of rows.trackedMetrics) {
    const parsed = parseStudentTrackedMetricRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'tracked_metric_row_rejected', rowFailureCode: parsed.code } };
    }
    if (
      parsed.row.metricId !== apexUnrealizedGainMetricId ||
      parsed.row.scopeType !== 'fund' ||
      parsed.row.fundId !== scope.fundId ||
      parsed.row.monthIndex !== scope.monthIndex
    ) {
      continue;
    }
    if (parsed.row.valueNumeric === undefined) {
      return { ok: false, failure: { code: 'invalid_apex_unrealized_gain_pct' } };
    }
    if (apexUnrealizedGainPct !== undefined) {
      return { ok: false, failure: { code: 'duplicate_apex_unrealized_gain_pct' } };
    }
    apexUnrealizedGainPct = parsed.row.valueNumeric;
  }
  if (apexUnrealizedGainPct === undefined) {
    return { ok: false, failure: { code: 'missing_apex_unrealized_gain_pct' } };
  }

  for (const row of rows.leaderboardFunds) {
    const parsed = parseStudentLeaderboardFundRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'leaderboard_fund_row_rejected', rowFailureCode: parsed.code } };
    }
    leaderboardFunds.push({
      fundId: parsed.row.fundId,
      studentDisplayName: parsed.row.studentDisplayName,
      currentAum: parsed.row.currentAum,
      sharpeRatio: parsed.row.sharpeRatio,
    });
  }

  const snapshotResult = buildStudentDashboardCurrentTurnSnapshot({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
    viewerFundId: scope.fundId,
    macroNarratives,
    marketMetrics,
    currentWeights,
    intendedWeights: input.intendedWeights,
    dangerousDriftThresholdPct: input.dangerousDriftThresholdPct,
    targetWeights: pendingTargetWeights ?? currentWeights,
    currentAum,
    apexUnrealizedGainPct,
    leaderboardFunds,
  });
  if (!snapshotResult.ok) {
    return { ok: false, failure: { code: 'invalid_snapshot', validationErrors: snapshotResult.errors } };
  }

  const envelopeResult = createStudentDashboardCurrentTurnQueryResultEnvelope({
    descriptor: descriptorResult.value,
    snapshot: snapshotResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
