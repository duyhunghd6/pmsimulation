export type MacroNarrativeRow = {
  monthIndex: number;
  newsHeadline: string;
  investmentClockPhase: string;
  pmi: number;
  iip: number;
  m2Growth: number;
  gdpGrowthYoy: number;
  inflationCpi: number;
  policyRate: number;
  bondYield: number;
  interbankRate: number;
  usdVndMovement: number;
  vix: number;
  scenarioPersistence: string;
};

export type MarketMetricRow = {
  monthIndex: number;
  vnIndexLevel: number;
  equityMarketTradingValue: number;
  foreignInvestorNetTradingValue: number;
  retailInvestorNetTradingValue: number;
  marketEarningsGrowthExpectation: string;
  valuationSentiment: string;
  businessCyclePhase: string;
};

export type StudentMacroNewsSnapshotInput = {
  currentMonthIndex: number;
  macroNarratives: readonly MacroNarrativeRow[];
  marketMetrics: readonly MarketMetricRow[];
};

export type StudentMacroNewsSnapshot = {
  monthIndex: number;
  newsHeadline: string;
  investmentClockPhase: string;
  scenarioPersistence: string;
  macroDrivers: {
    pmi: number;
    iip: number;
    m2Growth: number;
    gdpGrowthYoy: number;
    inflationCpi: number;
    policyRate: number;
    bondYield: number;
    interbankRate: number;
    usdVndMovement: number;
    vix: number;
  };
  marketStrings: {
    vnIndexLevel: number;
    equityMarketTradingValue: number;
    foreignInvestorNetTradingValue: number;
    retailInvestorNetTradingValue: number;
    marketEarningsGrowthExpectation: string;
    valuationSentiment: string;
    businessCyclePhase: string;
  };
};

export type StudentMacroNewsSnapshotErrorCode =
  | 'invalid_current_month_index'
  | 'missing_current_macro_narrative'
  | 'duplicate_current_macro_narrative'
  | 'missing_current_market_metrics'
  | 'duplicate_current_market_metrics';

export type StudentMacroNewsSnapshotError = {
  code: StudentMacroNewsSnapshotErrorCode;
  message: string;
};

export type StudentMacroNewsSnapshotResult =
  | { ok: true; value: StudentMacroNewsSnapshot }
  | { ok: false; errors: StudentMacroNewsSnapshotError[] };

export function buildStudentMacroNewsSnapshot(
  input: StudentMacroNewsSnapshotInput,
): StudentMacroNewsSnapshotResult {
  const errors: StudentMacroNewsSnapshotError[] = [];

  if (!Number.isInteger(input.currentMonthIndex) || input.currentMonthIndex < 0) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  const currentMacroNarratives = input.macroNarratives.filter(
    (row) => row.monthIndex === input.currentMonthIndex,
  );
  const currentMarketMetrics = input.marketMetrics.filter((row) => row.monthIndex === input.currentMonthIndex);

  if (currentMacroNarratives.length === 0) {
    errors.push({
      code: 'missing_current_macro_narrative',
      message: 'A current-month macro narrative row is required.',
    });
  }

  if (currentMacroNarratives.length > 1) {
    errors.push({
      code: 'duplicate_current_macro_narrative',
      message: 'Only one current-month macro narrative row may be shown to students.',
    });
  }

  if (currentMarketMetrics.length === 0) {
    errors.push({
      code: 'missing_current_market_metrics',
      message: 'A current-month market metrics row is required.',
    });
  }

  if (currentMarketMetrics.length > 1) {
    errors.push({
      code: 'duplicate_current_market_metrics',
      message: 'Only one current-month market metrics row may be shown to students.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const macroNarrative = currentMacroNarratives[0];
  const marketMetric = currentMarketMetrics[0];

  return {
    ok: true,
    value: {
      monthIndex: input.currentMonthIndex,
      newsHeadline: macroNarrative.newsHeadline,
      investmentClockPhase: macroNarrative.investmentClockPhase,
      scenarioPersistence: macroNarrative.scenarioPersistence,
      macroDrivers: {
        pmi: macroNarrative.pmi,
        iip: macroNarrative.iip,
        m2Growth: macroNarrative.m2Growth,
        gdpGrowthYoy: macroNarrative.gdpGrowthYoy,
        inflationCpi: macroNarrative.inflationCpi,
        policyRate: macroNarrative.policyRate,
        bondYield: macroNarrative.bondYield,
        interbankRate: macroNarrative.interbankRate,
        usdVndMovement: macroNarrative.usdVndMovement,
        vix: macroNarrative.vix,
      },
      marketStrings: {
        vnIndexLevel: marketMetric.vnIndexLevel,
        equityMarketTradingValue: marketMetric.equityMarketTradingValue,
        foreignInvestorNetTradingValue: marketMetric.foreignInvestorNetTradingValue,
        retailInvestorNetTradingValue: marketMetric.retailInvestorNetTradingValue,
        marketEarningsGrowthExpectation: marketMetric.marketEarningsGrowthExpectation,
        valuationSentiment: marketMetric.valuationSentiment,
        businessCyclePhase: marketMetric.businessCyclePhase,
      },
    },
  };
}
