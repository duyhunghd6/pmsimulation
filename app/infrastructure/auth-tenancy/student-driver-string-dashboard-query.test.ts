import { describe, expect, it } from 'vitest';

import {
  executeStudentDriverStringDashboardQuery,
  type StudentDriverStringDashboardQueryRowReader,
} from './student-driver-string-dashboard-query';

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
}): StudentDriverStringDashboardQueryRowReader {
  return {
    async readStudentDriverStringDashboardRows() {
      return rows;
    },
  };
}

describe('executeStudentDriverStringDashboardQuery', () => {
  it('returns a current-turn Driver/String dashboard query result envelope from parsed RLS-backed rows', async () => {
    await expect(
      executeStudentDriverStringDashboardQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ macroNarratives: [currentMacroNarrativeRow], marketMetrics: [currentMarketMetricRow] }),
      }),
    ).resolves.toEqual({
      ok: true,
      value: {
        envelopeType: 'current_turn_driver_string_dashboard_query_result',
        queryResultKey: `class:${classId}:month:1:fund:${fundId}:current-turn-driver-string-dashboard-query:result-envelope`,
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: `class:${classId}:month:1:fund:${fundId}:current-turn-driver-string-dashboard-query`,
        queryName: 'get_current_turn_driver_string_dashboard',
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
        dashboard: {
          monthIndex: 1,
          context: {
            investmentClockPhase: 'expansion',
            scenarioPersistence: 'soft landing',
            businessCyclePhase: 'mid_cycle',
          },
          driverMetrics: [
            { metricId: 'pmi', displayLabel: 'PMI', timing: 'leading', value: 52.1 },
            { metricId: 'iip', displayLabel: 'IIP', timing: 'leading', value: 7.2 },
            { metricId: 'm2_growth', displayLabel: 'M2 growth', timing: 'leading', value: 9.5 },
            { metricId: 'gdp_growth_yoy', displayLabel: 'GDP growth YoY', timing: 'coincident', value: 6.1 },
            { metricId: 'usd_vnd_movement', displayLabel: 'USD/VND movement', timing: 'coincident', value: 0.4 },
            { metricId: 'vix', displayLabel: 'VIX', timing: 'coincident', value: 18 },
            { metricId: 'inflation_cpi', displayLabel: 'Inflation CPI', timing: 'lagging', value: 2.8 },
            { metricId: 'policy_rate', displayLabel: 'Policy rate', timing: 'lagging', value: 4.5 },
            { metricId: 'bond_yield', displayLabel: 'Bond yield', timing: 'lagging', value: 5.2 },
            { metricId: 'interbank_rate', displayLabel: 'Interbank rate', timing: 'lagging', value: 4.1 },
          ],
          marketStringMetrics: [
            { metricId: 'vn_index_level', displayLabel: 'VN Index level', value: 1250.5 },
            { metricId: 'equity_market_trading_value', displayLabel: 'Equity market trading value', value: 1500000000 },
            {
              metricId: 'foreign_investor_net_trading_value',
              displayLabel: 'Foreign investor net trading value',
              value: -25000000,
            },
            { metricId: 'retail_investor_net_trading_value', displayLabel: 'Retail investor net trading value', value: 45000000 },
            {
              metricId: 'market_earnings_growth_expectation',
              displayLabel: 'Market earnings growth expectation',
              value: 8.25,
            },
            { metricId: 'valuation_sentiment', displayLabel: 'Valuation sentiment', value: 'fair' },
          ],
        },
      },
    });
  });

  it('rejects non-student sessions before reading rows', async () => {
    const reader: StudentDriverStringDashboardQueryRowReader = {
      async readStudentDriverStringDashboardRows() {
        throw new Error('rows should not be read for invalid roles');
      },
    };

    await expect(
      executeStudentDriverStringDashboardQuery({ session: instructorSession, scope, rowReader: reader }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
  });

  it('rejects missing fund scope before reading rows', async () => {
    const reader: StudentDriverStringDashboardQueryRowReader = {
      async readStudentDriverStringDashboardRows() {
        throw new Error('rows should not be read without a fund scope');
      },
    };

    await expect(
      executeStudentDriverStringDashboardQuery({
        session: studentSession,
        scope: { classId, monthIndex: 1 },
        rowReader: reader,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_fund_scope' },
    });
  });

  it('rejects future market metric rows before result delivery', async () => {
    await expect(
      executeStudentDriverStringDashboardQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({
          macroNarratives: [currentMacroNarrativeRow],
          marketMetrics: [{ ...currentMarketMetricRow, id: '50000000-0000-4000-8000-000000000002', month_index: 2 }],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'market_metric_row_rejected', rowFailureCode: 'future_scenario_row' },
    });
  });

  it('rejects missing current dashboard rows without returning raw database rows', async () => {
    await expect(
      executeStudentDriverStringDashboardQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ macroNarratives: [currentMacroNarrativeRow], marketMetrics: [] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: {
        code: 'invalid_dashboard',
        validationErrors: [
          {
            code: 'missing_current_market_metrics',
            message: 'A current-month market metrics row is required.',
          },
        ],
      },
    });
  });
});
