import { describe, expect, it } from 'vitest';

import {
  buildStudentMacroNewsSnapshot,
  type MacroNarrativeRow,
  type MarketMetricRow,
} from './macro-news';

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

describe('student macro news snapshot', () => {
  it('returns the current-month headline, macro drivers, and market strings', () => {
    const result = buildStudentMacroNewsSnapshot({
      currentMonthIndex: 0,
      macroNarratives,
      marketMetrics,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        monthIndex: 0,
        newsHeadline: 'Liquidity starts improving',
        investmentClockPhase: 'recovery',
        scenarioPersistence: 'early-cycle liquidity impulse',
        macroDrivers: {
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
        },
        marketStrings: {
          vnIndexLevel: 1250,
          equityMarketTradingValue: 18000,
          foreignInvestorNetTradingValue: 450,
          retailInvestorNetTradingValue: 700,
          marketEarningsGrowthExpectation: 'earnings revisions stable',
          valuationSentiment: 'neutral',
          businessCyclePhase: 'early expansion',
        },
      },
    });
  });

  it('does not expose future macro narrative or market metric values', () => {
    const result = buildStudentMacroNewsSnapshot({
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

  it('rejects invalid current month indexes', () => {
    const result = buildStudentMacroNewsSnapshot({
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

  it('requires exactly one current-month macro narrative row', () => {
    const missingResult = buildStudentMacroNewsSnapshot({
      currentMonthIndex: 2,
      macroNarratives,
      marketMetrics: [...marketMetrics, { ...marketMetrics[0], monthIndex: 2 }],
    });

    expect(missingResult).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_current_macro_narrative',
          message: 'A current-month macro narrative row is required.',
        },
      ],
    });

    const duplicateResult = buildStudentMacroNewsSnapshot({
      currentMonthIndex: 0,
      macroNarratives: [...macroNarratives, macroNarratives[0]],
      marketMetrics,
    });

    expect(duplicateResult).toEqual({
      ok: false,
      errors: [
        {
          code: 'duplicate_current_macro_narrative',
          message: 'Only one current-month macro narrative row may be shown to students.',
        },
      ],
    });
  });

  it('requires exactly one current-month market metrics row', () => {
    const missingResult = buildStudentMacroNewsSnapshot({
      currentMonthIndex: 2,
      macroNarratives: [...macroNarratives, { ...macroNarratives[0], monthIndex: 2 }],
      marketMetrics,
    });

    expect(missingResult).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_current_market_metrics',
          message: 'A current-month market metrics row is required.',
        },
      ],
    });

    const duplicateResult = buildStudentMacroNewsSnapshot({
      currentMonthIndex: 0,
      macroNarratives,
      marketMetrics: [...marketMetrics, marketMetrics[0]],
    });

    expect(duplicateResult).toEqual({
      ok: false,
      errors: [
        {
          code: 'duplicate_current_market_metrics',
          message: 'Only one current-month market metrics row may be shown to students.',
        },
      ],
    });
  });
});
