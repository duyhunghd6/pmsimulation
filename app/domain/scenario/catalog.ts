import type { MacroNarrativeRow, MarketMetricRow } from './macro-news';

export type ScenarioCatalogRevealWindow = {
  macroNarratives: MacroNarrativeRow[];
  marketMetrics: MarketMetricRow[];
};

export type ScenarioCatalogErrorCode = 'invalid_current_month_index';

export type ScenarioCatalogError = {
  code: ScenarioCatalogErrorCode;
  message: string;
};

export type ScenarioCatalogRevealWindowResult =
  | { ok: true; value: ScenarioCatalogRevealWindow }
  | { ok: false; errors: ScenarioCatalogError[] };

export const MVP_SCENARIO_MONTH_COUNT = 12;

export const MVP_MACRO_NARRATIVE_CATALOG = [
  macroNarrative(0, 'Liquidity thaw supports early risk appetite', 'Recovery', 50.8, 4.1, 7.2, 5.0, 2.4, 4.0, 3.8, 3.6, -0.2, 18, 'Liquidity improves before growth confirms'),
  macroNarrative(1, 'Growth confirmation broadens the rally', 'Expansion', 52.1, 4.8, 8.0, 5.4, 2.6, 4.0, 3.9, 3.7, 0.1, 17, 'Leading indicators strengthen while inflation remains delayed'),
  macroNarrative(2, 'Inflation catches up with earlier liquidity', 'Late Expansion', 51.4, 4.4, 7.6, 5.8, 3.1, 4.5, 4.4, 4.1, 0.4, 24, 'Rate pressure appears after prior liquidity growth'),
  macroNarrative(3, 'Policy tightening slows speculative flows', 'Slowdown', 49.6, 3.7, 6.4, 5.3, 3.4, 5.0, 4.9, 4.7, 0.8, 29, 'Tighter rates begin weighing on liquidity-sensitive assets'),
  macroNarrative(4, 'Defensive balance sheets regain favor', 'Slowdown', 48.7, 3.1, 5.6, 4.9, 3.2, 5.0, 5.1, 4.9, 0.6, 27, 'Growth cools while inflation remains sticky'),
  macroNarrative(5, 'Disinflation begins but credit stays selective', 'Contraction', 47.9, 2.6, 5.0, 4.4, 2.9, 5.0, 4.8, 4.5, 0.2, 25, 'Lagged policy pressure restrains risk appetite'),
  macroNarrative(6, 'Policy pause steadies investor expectations', 'Early Recovery', 49.1, 3.0, 5.4, 4.2, 2.7, 5.0, 4.5, 4.1, -0.1, 22, 'Inflation cools before growth momentum returns'),
  macroNarrative(7, 'Liquidity channels reopen gradually', 'Recovery', 50.4, 3.8, 6.1, 4.6, 2.5, 4.5, 4.2, 3.8, -0.3, 20, 'Rate relief starts before earnings upgrades broaden'),
  macroNarrative(8, 'Earnings breadth confirms the recovery', 'Expansion', 52.0, 4.6, 6.8, 5.1, 2.4, 4.5, 4.0, 3.6, -0.4, 18, 'Growth confirmation follows earlier liquidity improvement'),
  macroNarrative(9, 'Momentum attracts crowded risk taking', 'Late Expansion', 53.2, 5.0, 7.4, 5.7, 2.8, 4.5, 4.1, 3.7, -0.1, 21, 'Strong flows raise crowding risk before inflation pressure returns'),
  macroNarrative(10, 'Second inflation pulse tests discipline', 'Late Expansion', 51.8, 4.5, 7.0, 5.9, 3.1, 5.0, 4.6, 4.2, 0.5, 26, 'Another CPI threshold breach tightens the policy reaction function'),
  macroNarrative(11, 'Final debrief month rewards balanced risk', 'Cooldown', 50.1, 3.9, 6.2, 5.2, 3.0, 5.0, 4.7, 4.3, 0.3, 24, 'Terminal month tests whether portfolios absorbed the full cycle'),
] as const satisfies readonly MacroNarrativeRow[];

export const MVP_MARKET_METRIC_CATALOG = [
  marketMetric(0, 1240, 8500, -120, 260, 1.2, 'Discounted', 'Early recovery'),
  marketMetric(1, 1295, 10200, 80, 420, 2.5, 'Constructive', 'Expansion'),
  marketMetric(2, 1265, 9100, -260, 180, -0.8, 'Stretched', 'Late expansion'),
  marketMetric(3, 1210, 7800, -520, -80, -2.4, 'Risk-off', 'Slowdown'),
  marketMetric(4, 1188, 7200, -430, -120, -1.5, 'Cheap but cautious', 'Slowdown'),
  marketMetric(5, 1165, 6800, -300, -220, -3.0, 'Capitulation', 'Contraction'),
  marketMetric(6, 1195, 7600, -80, 90, -0.4, 'Selective', 'Early recovery'),
  marketMetric(7, 1248, 8900, 160, 310, 1.7, 'Constructive', 'Recovery'),
  marketMetric(8, 1310, 11200, 340, 520, 3.1, 'Expansionary', 'Expansion'),
  marketMetric(9, 1368, 13000, 220, 760, 4.0, 'Crowded', 'Late expansion'),
  marketMetric(10, 1322, 10500, -180, 340, -1.2, 'Volatile', 'Late expansion'),
  marketMetric(11, 1340, 9800, 40, 280, 0.8, 'Fair value', 'Cooldown'),
] as const satisfies readonly MarketMetricRow[];

const macroNarrativesByMonth = new Map(MVP_MACRO_NARRATIVE_CATALOG.map((row) => [row.monthIndex, row]));
const marketMetricsByMonth = new Map(MVP_MARKET_METRIC_CATALOG.map((row) => [row.monthIndex, row]));

export function listMvpMacroNarratives(): MacroNarrativeRow[] {
  return MVP_MACRO_NARRATIVE_CATALOG.map(cloneMacroNarrative);
}

export function listMvpMarketMetrics(): MarketMetricRow[] {
  return MVP_MARKET_METRIC_CATALOG.map(cloneMarketMetric);
}

export function getMvpMacroNarrative(monthIndex: number): MacroNarrativeRow | null {
  const row = macroNarrativesByMonth.get(monthIndex);

  return row === undefined ? null : cloneMacroNarrative(row);
}

export function getMvpMarketMetric(monthIndex: number): MarketMetricRow | null {
  const row = marketMetricsByMonth.get(monthIndex);

  return row === undefined ? null : cloneMarketMetric(row);
}

export function listRevealedMvpScenarioRows(currentMonthIndex: number): ScenarioCatalogRevealWindowResult {
  if (!Number.isInteger(currentMonthIndex) || currentMonthIndex < 0) {
    return {
      ok: false,
      errors: [
        {
          code: 'invalid_current_month_index',
          message: 'Current month index must be a non-negative integer.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      macroNarratives: MVP_MACRO_NARRATIVE_CATALOG.filter((row) => row.monthIndex <= currentMonthIndex).map(
        cloneMacroNarrative,
      ),
      marketMetrics: MVP_MARKET_METRIC_CATALOG.filter((row) => row.monthIndex <= currentMonthIndex).map(
        cloneMarketMetric,
      ),
    },
  };
}

function macroNarrative(
  monthIndex: number,
  newsHeadline: string,
  investmentClockPhase: string,
  pmi: number,
  iip: number,
  m2Growth: number,
  gdpGrowthYoy: number,
  inflationCpi: number,
  policyRate: number,
  bondYield: number,
  interbankRate: number,
  usdVndMovement: number,
  vix: number,
  scenarioPersistence: string,
): MacroNarrativeRow {
  return {
    monthIndex,
    newsHeadline,
    investmentClockPhase,
    pmi,
    iip,
    m2Growth,
    gdpGrowthYoy,
    inflationCpi,
    policyRate,
    bondYield,
    interbankRate,
    usdVndMovement,
    vix,
    scenarioPersistence,
  };
}

function marketMetric(
  monthIndex: number,
  vnIndexLevel: number,
  equityMarketTradingValue: number,
  foreignInvestorNetTradingValue: number,
  retailInvestorNetTradingValue: number,
  marketEarningsGrowthExpectation: number,
  valuationSentiment: string,
  businessCyclePhase: string,
): MarketMetricRow {
  return {
    monthIndex,
    vnIndexLevel,
    equityMarketTradingValue,
    foreignInvestorNetTradingValue,
    retailInvestorNetTradingValue,
    marketEarningsGrowthExpectation,
    valuationSentiment,
    businessCyclePhase,
  };
}

function cloneMacroNarrative(row: MacroNarrativeRow): MacroNarrativeRow {
  return { ...row };
}

function cloneMarketMetric(row: MarketMetricRow): MarketMetricRow {
  return { ...row };
}
