import {
  buildCurrentTurnDriverStringDashboard,
  createCurrentTurnDriverStringDashboardQueryDescriptor,
  createCurrentTurnDriverStringDashboardQueryResultEnvelope,
  type CurrentTurnDriverStringDashboardQueryResultEnvelope,
} from '../../domain/scenario/driver-string-dashboard';
import type { MacroNarrativeRow, MarketMetricRow, StudentMacroNewsSnapshotError } from '../../domain/scenario/macro-news';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseStudentRevealedMacroNarrativeRow,
  parseStudentRevealedMarketMetricRow,
  type AuthTenancyDatabaseRowFailureCode,
} from './rows';

export type StudentDriverStringDashboardQueryScope = {
  classId: string;
  fundId: string;
  monthIndex: number;
};

export type StudentDriverStringDashboardQueryRowSet = {
  macroNarratives: readonly unknown[];
  marketMetrics: readonly unknown[];
};

export type StudentDriverStringDashboardQueryRowReader = {
  readStudentDriverStringDashboardRows(input: {
    session: AuthTenancySession;
    scope: StudentDriverStringDashboardQueryScope;
  }): Promise<StudentDriverStringDashboardQueryRowSet>;
};

export type StudentDriverStringDashboardQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_fund_scope'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'macro_narrative_row_rejected'
  | 'market_metric_row_rejected'
  | 'invalid_dashboard'
  | 'invalid_result_envelope';

export type StudentDriverStringDashboardQueryExecutionFailure = {
  code: StudentDriverStringDashboardQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly StudentMacroNewsSnapshotError[];
};

export type StudentDriverStringDashboardQueryExecutionResult =
  | { ok: true; value: CurrentTurnDriverStringDashboardQueryResultEnvelope }
  | { ok: false; failure: StudentDriverStringDashboardQueryExecutionFailure };

export async function executeStudentDriverStringDashboardQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: StudentDriverStringDashboardQueryRowReader;
}): Promise<StudentDriverStringDashboardQueryExecutionResult> {
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
  const descriptorResult = createCurrentTurnDriverStringDashboardQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
    viewerFundId: scope.fundId,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  const rows = await input.rowReader.readStudentDriverStringDashboardRows({ session: input.session, scope });
  const macroNarratives: MacroNarrativeRow[] = [];
  const marketMetrics: MarketMetricRow[] = [];

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

  const dashboardResult = buildCurrentTurnDriverStringDashboard({
    currentMonthIndex: scope.monthIndex,
    macroNarratives,
    marketMetrics,
  });
  if (!dashboardResult.ok) {
    return { ok: false, failure: { code: 'invalid_dashboard', validationErrors: dashboardResult.errors } };
  }

  const envelopeResult = createCurrentTurnDriverStringDashboardQueryResultEnvelope({
    descriptor: descriptorResult.value,
    dashboard: dashboardResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
