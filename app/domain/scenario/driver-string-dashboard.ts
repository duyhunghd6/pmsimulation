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
