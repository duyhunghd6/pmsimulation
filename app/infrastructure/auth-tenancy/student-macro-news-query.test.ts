import { describe, expect, it } from 'vitest';

import { executeStudentMacroNewsQuery, type StudentMacroNewsQueryRowReader } from './student-macro-news-query';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const scope = { classId, fundId, monthIndex: 1 };

const currentMacroNarrativeRow = {
  id: '40000000-0000-4000-8000-000000000001',
  class_id: classId,
  month_index: 1,
  news_headline: 'Credit growth accelerates while inflation remains contained',
  investment_clock_phase: 'expansion',
  pmi: '52.10',
  iip: '7.20',
  m2_growth: '9.50',
  gdp_growth_yoy: '6.10',
  inflation_cpi: '2.80',
  policy_rate: '4.50',
  bond_yield: '5.20',
  interbank_rate: '4.10',
  usd_vnd_movement: '0.40',
  vix: '18.00',
  scenario_persistence: 'soft landing',
};

const currentMarketMetricRow = {
  id: '50000000-0000-4000-8000-000000000001',
  class_id: classId,
  month_index: 1,
  vn_index_level: '1250.50',
  equity_market_trading_value: '1500000000.00',
  foreign_investor_net_trading_value: '-25000000.00',
  retail_investor_net_trading_value: '45000000.00',
  market_earnings_growth_expectation: '8.25',
  valuation_sentiment: 'fair',
  business_cycle_phase: 'mid_cycle',
};

function rowReader(rows: {
  macroNarratives: readonly unknown[];
  marketMetrics: readonly unknown[];
}): StudentMacroNewsQueryRowReader {
  return {
    async readStudentMacroNewsRows() {
      return rows;
    },
  };
}

describe('executeStudentMacroNewsQuery', () => {
  it('returns a student macro news query result envelope from parsed RLS-backed rows', async () => {
    await expect(
      executeStudentMacroNewsQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ macroNarratives: [currentMacroNarrativeRow], marketMetrics: [currentMarketMetricRow] }),
      }),
    ).resolves.toEqual({
      ok: true,
      value: {
        envelopeType: 'student_macro_news_query_result',
        queryResultKey: `class:${classId}:month:1:fund:${fundId}:student-macro-news-query:result-envelope`,
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: `class:${classId}:month:1:fund:${fundId}:student-macro-news-query`,
        queryName: 'get_student_macro_news',
        requiredScope: 'viewer_fund_in_class',
        classId,
        currentMonthIndex: 1,
        viewerFundId: fundId,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeExactHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
        snapshot: {
          monthIndex: 1,
          newsHeadline: 'Credit growth accelerates while inflation remains contained',
          investmentClockPhase: 'expansion',
          scenarioPersistence: 'soft landing',
          macroDrivers: {
            pmi: 52.1,
            iip: 7.2,
            m2Growth: 9.5,
            gdpGrowthYoy: 6.1,
            inflationCpi: 2.8,
            policyRate: 4.5,
            bondYield: 5.2,
            interbankRate: 4.1,
            usdVndMovement: 0.4,
            vix: 18,
          },
          marketStrings: {
            vnIndexLevel: 1250.5,
            equityMarketTradingValue: 1500000000,
            foreignInvestorNetTradingValue: -25000000,
            retailInvestorNetTradingValue: 45000000,
            marketEarningsGrowthExpectation: 8.25,
            valuationSentiment: 'fair',
            businessCyclePhase: 'mid_cycle',
          },
        },
      },
    });
  });

  it('rejects non-student sessions before reading rows', async () => {
    const reader: StudentMacroNewsQueryRowReader = {
      async readStudentMacroNewsRows() {
        throw new Error('rows should not be read for invalid roles');
      },
    };

    await expect(executeStudentMacroNewsQuery({ session: instructorSession, scope, rowReader: reader })).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
  });

  it('rejects future scenario rows before result delivery', async () => {
    await expect(
      executeStudentMacroNewsQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({
          macroNarratives: [{ ...currentMacroNarrativeRow, id: '40000000-0000-4000-8000-000000000002', month_index: 2 }],
          marketMetrics: [currentMarketMetricRow],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'macro_narrative_row_rejected', rowFailureCode: 'future_scenario_row' },
    });
  });

  it('rejects missing current rows without returning raw database rows', async () => {
    await expect(
      executeStudentMacroNewsQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ macroNarratives: [], marketMetrics: [currentMarketMetricRow] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: {
        code: 'invalid_snapshot',
        validationErrors: [
          {
            code: 'missing_current_macro_narrative',
            message: 'A current-month macro narrative row is required.',
          },
        ],
      },
    });
  });
});
