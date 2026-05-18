import {
  buildStudentMacroNewsSnapshot,
  type StudentMacroNewsSnapshotError,
  type StudentMacroNewsSnapshotInput,
} from './macro-news';

export type DriverIndicatorTiming = 'leading' | 'coincident' | 'lagging';

export type DriverDashboardMetric = {
  metricId: string;
  displayLabel: string;
  timing: DriverIndicatorTiming;
  value: number;
};

export type MarketStringDashboardMetric = {
  metricId: string;
  displayLabel: string;
  value: number | string;
};

export type CurrentTurnDriverStringDashboard = {
  monthIndex: number;
  context: {
    investmentClockPhase: string;
    scenarioPersistence: string;
    businessCyclePhase: string;
  };
  driverMetrics: DriverDashboardMetric[];
  marketStringMetrics: MarketStringDashboardMetric[];
};

export type CurrentTurnDriverStringDashboardInput = StudentMacroNewsSnapshotInput;

export type CurrentTurnDriverStringDashboardResult =
  | { ok: true; value: CurrentTurnDriverStringDashboard }
  | { ok: false; errors: StudentMacroNewsSnapshotError[] };

export type CurrentTurnDriverStringDashboardQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
};

export type CurrentTurnDriverStringDashboardQueryDescriptor = {
  descriptorType: 'current_turn_driver_string_dashboard_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_current_turn_driver_string_dashboard';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
};

export type CurrentTurnDriverStringDashboardQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_current_month_index'
  | 'invalid_viewer_fund_id';

export type CurrentTurnDriverStringDashboardQueryDescriptorError = {
  code: CurrentTurnDriverStringDashboardQueryDescriptorErrorCode;
  message: string;
};

export type CurrentTurnDriverStringDashboardQueryDescriptorResult =
  | { ok: true; value: CurrentTurnDriverStringDashboardQueryDescriptor }
  | { ok: false; errors: CurrentTurnDriverStringDashboardQueryDescriptorError[] };

export type CurrentTurnDriverStringDashboardQueryResultEnvelope = {
  envelopeType: 'current_turn_driver_string_dashboard_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_current_turn_driver_string_dashboard';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  dashboard: CurrentTurnDriverStringDashboard;
};

export type CurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelope = {
  envelopeType: 'current_turn_driver_string_dashboard_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_current_turn_driver_string_dashboard';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  validationErrors: CurrentTurnDriverStringDashboardQueryResultEnvelopeError[];
};

export type CurrentTurnDriverStringDashboardQueryResultEnvelopeInput = {
  descriptor: CurrentTurnDriverStringDashboardQueryDescriptor;
  dashboard?: CurrentTurnDriverStringDashboard;
};

export type CurrentTurnDriverStringDashboardQueryResultEnvelopeErrorCode =
  | 'missing_current_turn_driver_string_dashboard'
  | 'mismatched_current_month_index';

export type CurrentTurnDriverStringDashboardQueryResultEnvelopeError = {
  code: CurrentTurnDriverStringDashboardQueryResultEnvelopeErrorCode;
  message: string;
};

export type CurrentTurnDriverStringDashboardQueryResultEnvelopeResult =
  | { ok: true; value: CurrentTurnDriverStringDashboardQueryResultEnvelope }
  | { ok: false; errors: CurrentTurnDriverStringDashboardQueryResultEnvelopeError[] };

export type CurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type CurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: CurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelope }
  | { ok: false; errors: CurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelopeError[] };

export function createCurrentTurnDriverStringDashboardQueryDescriptor(
  input: CurrentTurnDriverStringDashboardQueryDescriptorInput,
): CurrentTurnDriverStringDashboardQueryDescriptorResult {
  const errors: CurrentTurnDriverStringDashboardQueryDescriptorError[] = [];
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
      descriptorType: 'current_turn_driver_string_dashboard_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:fund:${viewerFundId}:current-turn-driver-string-dashboard-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_current_turn_driver_string_dashboard',
      requiredScope: 'viewer_fund_in_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      viewerFundId,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundIds: false,
      includeExactHoldings: false,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeLedgerDrafts: false,
      includeProviderPayload: false,
    },
  };
}

export function createCurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelope(
  input: CurrentTurnDriverStringDashboardQueryResultEnvelopeInput,
): CurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelopeResult {
  const result = createCurrentTurnDriverStringDashboardQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid current-turn Driver/String dashboard query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'current_turn_driver_string_dashboard_query_result_validation_failure',
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
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createCurrentTurnDriverStringDashboardQueryResultEnvelope(
  input: CurrentTurnDriverStringDashboardQueryResultEnvelopeInput,
): CurrentTurnDriverStringDashboardQueryResultEnvelopeResult {
  const errors: CurrentTurnDriverStringDashboardQueryResultEnvelopeError[] = [];

  if (!input.dashboard) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_current_turn_driver_string_dashboard',
          message: 'Current-turn Driver/String dashboard query result envelopes require the already-authorized dashboard.',
        },
      ],
    };
  }

  if (input.dashboard.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Current-turn Driver/String dashboard query result month must match the descriptor current month.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'current_turn_driver_string_dashboard_query_result',
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
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      dashboard: input.dashboard,
    },
  };
}

export function buildCurrentTurnDriverStringDashboard(
  input: CurrentTurnDriverStringDashboardInput,
): CurrentTurnDriverStringDashboardResult {
  const snapshotResult = buildStudentMacroNewsSnapshot(input);

  if (!snapshotResult.ok) {
    return snapshotResult;
  }

  const snapshot = snapshotResult.value;

  return {
    ok: true,
    value: {
      monthIndex: snapshot.monthIndex,
      context: {
        investmentClockPhase: snapshot.investmentClockPhase,
        scenarioPersistence: snapshot.scenarioPersistence,
        businessCyclePhase: snapshot.marketStrings.businessCyclePhase,
      },
      driverMetrics: [
        driverMetric('pmi', 'PMI', 'leading', snapshot.macroDrivers.pmi),
        driverMetric('iip', 'IIP', 'leading', snapshot.macroDrivers.iip),
        driverMetric('m2_growth', 'M2 growth', 'leading', snapshot.macroDrivers.m2Growth),
        driverMetric('gdp_growth_yoy', 'GDP growth YoY', 'coincident', snapshot.macroDrivers.gdpGrowthYoy),
        driverMetric('usd_vnd_movement', 'USD/VND movement', 'coincident', snapshot.macroDrivers.usdVndMovement),
        driverMetric('vix', 'VIX', 'coincident', snapshot.macroDrivers.vix),
        driverMetric('inflation_cpi', 'Inflation CPI', 'lagging', snapshot.macroDrivers.inflationCpi),
        driverMetric('policy_rate', 'Policy rate', 'lagging', snapshot.macroDrivers.policyRate),
        driverMetric('bond_yield', 'Bond yield', 'lagging', snapshot.macroDrivers.bondYield),
        driverMetric('interbank_rate', 'Interbank rate', 'lagging', snapshot.macroDrivers.interbankRate),
      ],
      marketStringMetrics: [
        marketStringMetric('vn_index_level', 'VN Index level', snapshot.marketStrings.vnIndexLevel),
        marketStringMetric(
          'equity_market_trading_value',
          'Equity market trading value',
          snapshot.marketStrings.equityMarketTradingValue,
        ),
        marketStringMetric(
          'foreign_investor_net_trading_value',
          'Foreign investor net trading value',
          snapshot.marketStrings.foreignInvestorNetTradingValue,
        ),
        marketStringMetric(
          'retail_investor_net_trading_value',
          'Retail investor net trading value',
          snapshot.marketStrings.retailInvestorNetTradingValue,
        ),
        marketStringMetric(
          'market_earnings_growth_expectation',
          'Market earnings growth expectation',
          snapshot.marketStrings.marketEarningsGrowthExpectation,
        ),
        marketStringMetric('valuation_sentiment', 'Valuation sentiment', snapshot.marketStrings.valuationSentiment),
      ],
    },
  };
}

function driverMetric(
  metricId: string,
  displayLabel: string,
  timing: DriverIndicatorTiming,
  value: number,
): DriverDashboardMetric {
  return { metricId, displayLabel, timing, value };
}

function marketStringMetric(
  metricId: string,
  displayLabel: string,
  value: number | string,
): MarketStringDashboardMetric {
  return { metricId, displayLabel, value };
}
