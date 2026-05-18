import { describe, expect, it } from 'vitest';

import {
  buildStudentMacroNewsSnapshot,
  createStudentMacroNewsQueryDescriptor,
  createStudentMacroNewsQueryResultEnvelope,
  createStudentMacroNewsQueryResultValidationFailureEnvelope,
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

function defaultSnapshot() {
  const result = buildStudentMacroNewsSnapshot({
    currentMonthIndex: 0,
    macroNarratives,
    marketMetrics,
  });

  if (!result.ok) {
    throw new Error('Expected default student macro news snapshot to be valid.');
  }

  return result.value;
}

describe('createStudentMacroNewsQueryDescriptor', () => {
  it('creates a future server-query descriptor for a scoped student macro news view', () => {
    const result = createStudentMacroNewsQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 0,
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'student_macro_news_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:0:fund:fund-001:student-macro-news-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_student_macro_news',
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
      createStudentMacroNewsQueryDescriptor({
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
    const result = createStudentMacroNewsQueryDescriptor({
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
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });
});

describe('createStudentMacroNewsQueryResultEnvelope', () => {
  it('wraps an already-authorized macro news snapshot matching descriptor month scope', () => {
    const descriptor = createStudentMacroNewsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const snapshot = defaultSnapshot();

    expect(createStudentMacroNewsQueryResultEnvelope({ descriptor: descriptor.value, snapshot })).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_macro_news_query_result',
        queryResultKey: 'class:class-001:month:0:fund:fund-001:student-macro-news-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_student_macro_news',
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
        snapshot,
      },
    });
  });

  it('rejects missing or mismatched macro news snapshots', () => {
    const descriptor = createStudentMacroNewsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(createStudentMacroNewsQueryResultEnvelope({ descriptor: descriptor.value })).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_student_macro_news_snapshot',
          message: 'Student macro news query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createStudentMacroNewsQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: { ...defaultSnapshot(), monthIndex: 1 },
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'mismatched_current_month_index',
          message: 'Student macro news query result month must match the descriptor current month.',
        },
      ],
    });
  });

  it('keeps query result envelopes scoped to current macro news payloads', () => {
    const descriptor = createStudentMacroNewsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    const result = createStudentMacroNewsQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: defaultSnapshot(),
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

describe('createStudentMacroNewsQueryResultValidationFailureEnvelope', () => {
  it('wraps query result validation errors without returning a snapshot', () => {
    const descriptor = createStudentMacroNewsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(createStudentMacroNewsQueryResultValidationFailureEnvelope({ descriptor: descriptor.value })).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_macro_news_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:0:fund:fund-001:student-macro-news-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: descriptor.value.queryDescriptorKey,
        queryName: 'get_student_macro_news',
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
            code: 'missing_student_macro_news_snapshot',
            message: 'Student macro news query result envelopes require the already-authorized snapshot.',
          },
        ],
      },
    });
  });

  it('rejects validation failure envelopes for valid query results', () => {
    const descriptor = createStudentMacroNewsQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 0,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createStudentMacroNewsQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: defaultSnapshot(),
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student macro news query result.',
        },
      ],
    });
  });
});

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
          marketEarningsGrowthExpectation: 2.4,
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
