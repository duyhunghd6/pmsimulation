import { describe, expect, it } from 'vitest';

import { buildCurrentTurnDriverStringDashboard } from './driver-string-dashboard';
import { type MacroNarrativeRow, type MarketMetricRow } from './macro-news';

const macroNarratives: MacroNarrativeRow[] = [
  {
    monthIndex: 0,
    newsHeadline: 'Liquidity starts improving',
    investmentClockPhase: 'recovery',
    pmi: 49.8,
    iip: 4.1,
    m2Growth: 8.2,
    gdpGrowthYoy: 5.4,
    inflationCpi: 2.7,
    policyRate: 4.5,
    bondYield: 5.1,
    interbankRate: 3.8,
    usdVndMovement: 0.2,
    vix: 17.3,
    scenarioPersistence: 'early-cycle liquidity impulse',
  },
  {
    monthIndex: 1,
    newsHeadline: 'Future shock not yet revealed',
    investmentClockPhase: 'slowdown',
    pmi: 46.4,
    iip: 2.9,
    m2Growth: 4.1,
    gdpGrowthYoy: 4.8,
    inflationCpi: 3.4,
    policyRate: 5,
    bondYield: 6.2,
    interbankRate: 4.7,
    usdVndMovement: 1.1,
    vix: 28.5,
    scenarioPersistence: 'future stress regime',
  },
];

const marketMetrics: MarketMetricRow[] = [
  {
    monthIndex: 0,
    vnIndexLevel: 1250,
    equityMarketTradingValue: 18000,
    foreignInvestorNetTradingValue: 450,
    retailInvestorNetTradingValue: 700,
    marketEarningsGrowthExpectation: 'earnings revisions stable',
    valuationSentiment: 'neutral',
    businessCyclePhase: 'early expansion',
  },
  {
    monthIndex: 1,
    vnIndexLevel: 1160,
    equityMarketTradingValue: 9500,
    foreignInvestorNetTradingValue: -1200,
    retailInvestorNetTradingValue: -800,
    marketEarningsGrowthExpectation: 'future earnings downgrade',
    valuationSentiment: 'future risk-off',
    businessCyclePhase: 'future contraction',
  },
];

describe('current-turn driver/string dashboard', () => {
  it('returns current driver metrics grouped by indicator timing', () => {
    const result = buildCurrentTurnDriverStringDashboard({
      currentMonthIndex: 0,
      macroNarratives,
      marketMetrics,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        monthIndex: 0,
        context: {
          investmentClockPhase: 'recovery',
          scenarioPersistence: 'early-cycle liquidity impulse',
          businessCyclePhase: 'early expansion',
        },
        driverMetrics: [
          { metricId: 'pmi', displayLabel: 'PMI', timing: 'leading', value: 49.8 },
          { metricId: 'iip', displayLabel: 'IIP', timing: 'leading', value: 4.1 },
          { metricId: 'm2_growth', displayLabel: 'M2 growth', timing: 'leading', value: 8.2 },
          { metricId: 'gdp_growth_yoy', displayLabel: 'GDP growth YoY', timing: 'coincident', value: 5.4 },
          { metricId: 'usd_vnd_movement', displayLabel: 'USD/VND movement', timing: 'coincident', value: 0.2 },
          { metricId: 'vix', displayLabel: 'VIX', timing: 'coincident', value: 17.3 },
          { metricId: 'inflation_cpi', displayLabel: 'Inflation CPI', timing: 'lagging', value: 2.7 },
          { metricId: 'policy_rate', displayLabel: 'Policy rate', timing: 'lagging', value: 4.5 },
          { metricId: 'bond_yield', displayLabel: 'Bond yield', timing: 'lagging', value: 5.1 },
          { metricId: 'interbank_rate', displayLabel: 'Interbank rate', timing: 'lagging', value: 3.8 },
        ],
        marketStringMetrics: [
          { metricId: 'vn_index_level', displayLabel: 'VN Index level', value: 1250 },
          { metricId: 'equity_market_trading_value', displayLabel: 'Equity market trading value', value: 18000 },
          {
            metricId: 'foreign_investor_net_trading_value',
            displayLabel: 'Foreign investor net trading value',
            value: 450,
          },
          { metricId: 'retail_investor_net_trading_value', displayLabel: 'Retail investor net trading value', value: 700 },
          {
            metricId: 'market_earnings_growth_expectation',
            displayLabel: 'Market earnings growth expectation',
            value: 'earnings revisions stable',
          },
          { metricId: 'valuation_sentiment', displayLabel: 'Valuation sentiment', value: 'neutral' },
        ],
      },
    });
  });

  it('does not expose future driver or market string values', () => {
    const result = buildCurrentTurnDriverStringDashboard({
      currentMonthIndex: 0,
      macroNarratives,
      marketMetrics,
    });

    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toContain('Future shock not yet revealed');
    expect(JSON.stringify(result)).not.toContain('future stress regime');
    expect(JSON.stringify(result)).not.toContain('future earnings downgrade');
    expect(JSON.stringify(result)).not.toContain('future risk-off');
    expect(JSON.stringify(result)).not.toContain('future contraction');
  });

  it('rejects invalid current month indexes through the current snapshot boundary', () => {
    const result = buildCurrentTurnDriverStringDashboard({
      currentMonthIndex: -1,
      macroNarratives,
      marketMetrics,
    });

    expect(result).toEqual({
      ok: false,
      errors: expect.arrayContaining([
        {
          code: 'invalid_current_month_index',
          message: 'Current month index must be a non-negative integer.',
        },
      ]),
    });
  });

  it('requires exactly one current macro narrative and market metrics row', () => {
    const duplicateResult = buildCurrentTurnDriverStringDashboard({
      currentMonthIndex: 0,
      macroNarratives: [...macroNarratives, macroNarratives[0]],
      marketMetrics: [...marketMetrics, marketMetrics[0]],
    });

    expect(duplicateResult).toEqual({
      ok: false,
      errors: [
        {
          code: 'duplicate_current_macro_narrative',
          message: 'Only one current-month macro narrative row may be shown to students.',
        },
        {
          code: 'duplicate_current_market_metrics',
          message: 'Only one current-month market metrics row may be shown to students.',
        },
      ],
    });
  });
});
