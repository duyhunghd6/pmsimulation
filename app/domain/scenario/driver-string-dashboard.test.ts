import { describe, expect, it } from 'vitest';

import {
  buildCurrentTurnDriverStringDashboard,
  createCurrentTurnDriverStringDashboardQueryDescriptor,
  createCurrentTurnDriverStringDashboardQueryResultEnvelope,
  createCurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelope,
} from './driver-string-dashboard';
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
    marketEarningsGrowthExpectation: 2.4,
    valuationSentiment: 'neutral',
    businessCyclePhase: 'early expansion',
  },
  {
    monthIndex: 1,
    vnIndexLevel: 1160,
    equityMarketTradingValue: 9500,
    foreignInvestorNetTradingValue: -1200,
    retailInvestorNetTradingValue: -800,
    marketEarningsGrowthExpectation: -1.8,
    valuationSentiment: 'future risk-off',
    businessCyclePhase: 'future contraction',
  },
];

function defaultDashboard() {
  const result = buildCurrentTurnDriverStringDashboard({
    currentMonthIndex: 0,
    macroNarratives,
    marketMetrics,
  });

  if (!result.ok) {
    throw new Error('Expected default current-turn Driver/String dashboard to be valid.');
  }

  return result.value;
}

describe('createCurrentTurnDriverStringDashboardQueryDescriptor', () => {
  it('creates a future server-query descriptor for a scoped current-turn Driver/String dashboard', () => {
    const result = createCurrentTurnDriverStringDashboardQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 0,
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'current_turn_driver_string_dashboard_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:0:fund:fund-001:current-turn-driver-string-dashboard-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_current_turn_driver_string_dashboard',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 0,
        viewerFundId: 'fund-001',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeExactHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
      },
    });
  });

  it('rejects invalid query descriptor scope inputs', () => {
    expect(
      createCurrentTurnDriverStringDashboardQueryDescriptor({
        classId: ' ',
        currentMonthIndex: 1.5,
        viewerFundId: ' ',
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_current_month_index', message: 'Current month index must be a non-negative integer.' },
        { code: 'invalid_viewer_fund_id', message: 'Viewer fund id is required.' },
      ],
    });
  });

  it('keeps descriptors free of query results, provider clients, and gameplay payloads', () => {
    const result = createCurrentTurnDriverStringDashboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('viewer_fund_in_class');
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeExactHoldings).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeLedgerDrafts).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('dashboard' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });
});

describe('createCurrentTurnDriverStringDashboardQueryResultEnvelope', () => {
  it('wraps an already-authorized current-turn Driver/String dashboard matching descriptor month scope', () => {
    const descriptor = createCurrentTurnDriverStringDashboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const dashboard = defaultDashboard();

    expect(createCurrentTurnDriverStringDashboardQueryResultEnvelope({ descriptor: descriptor.value, dashboard })).toEqual({
      ok: true,
      value: {
        envelopeType: 'current_turn_driver_string_dashboard_query_result',
        queryResultKey: 'class:class-001:month:0:fund:fund-001:current-turn-driver-string-dashboard-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_current_turn_driver_string_dashboard',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 0,
        viewerFundId: 'fund-001',
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeExactHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
        dashboard,
      },
    });
  });

  it('rejects missing or mismatched current-turn Driver/String dashboards', () => {
    const descriptor = createCurrentTurnDriverStringDashboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(createCurrentTurnDriverStringDashboardQueryResultEnvelope({ descriptor: descriptor.value })).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_current_turn_driver_string_dashboard',
          message: 'Current-turn Driver/String dashboard query result envelopes require the already-authorized dashboard.',
        },
      ],
    });

    expect(
      createCurrentTurnDriverStringDashboardQueryResultEnvelope({
        descriptor: descriptor.value,
        dashboard: { ...defaultDashboard(), monthIndex: 1 },
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'mismatched_current_month_index',
          message: 'Current-turn Driver/String dashboard query result month must match the descriptor current month.',
        },
      ],
    });
  });

  it('keeps query result envelopes scoped to current Driver/String dashboard payloads', () => {
    const descriptor = createCurrentTurnDriverStringDashboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const result = createCurrentTurnDriverStringDashboardQueryResultEnvelope({
      descriptor: descriptor.value,
      dashboard: defaultDashboard(),
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeExactHoldings).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeLedgerDrafts).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('executedQueryMetadata' in result.value).toBe(false);
    expect(JSON.stringify(result.value)).not.toContain('Future shock not yet revealed');
  });
});

describe('createCurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelope', () => {
  it('wraps query result validation errors without returning a dashboard', () => {
    const descriptor = createCurrentTurnDriverStringDashboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(createCurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelope({ descriptor: descriptor.value })).toEqual({
      ok: true,
      value: {
        envelopeType: 'current_turn_driver_string_dashboard_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:0:fund:fund-001:current-turn-driver-string-dashboard-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_current_turn_driver_string_dashboard',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 0,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeExactHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_current_turn_driver_string_dashboard',
            message: 'Current-turn Driver/String dashboard query result envelopes require the already-authorized dashboard.',
          },
        ],
      },
    });
  });

  it('rejects validation failure envelopes for valid query results', () => {
    const descriptor = createCurrentTurnDriverStringDashboardQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createCurrentTurnDriverStringDashboardQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        dashboard: defaultDashboard(),
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid current-turn Driver/String dashboard query result.',
        },
      ],
    });
  });
});

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
            value: 2.4,
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
