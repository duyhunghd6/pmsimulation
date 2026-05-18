import { describe, expect, it } from 'vitest';

import {
  executeStudentDashboardCurrentTurnQuery,
  type StudentDashboardCurrentTurnQueryRowReader,
} from './student-dashboard-current-turn-query';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherClassId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const otherFundId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const scope = { classId, fundId, monthIndex: 2 };

const currentMacroNarrativeRow = {
  id: '10000000-0000-4000-8000-000000000001',
  class_id: classId,
  month_index: 2,
  news_headline: 'Liquidity tightens as policy rates rise',
  investment_clock_phase: 'slowdown',
  pmi: '49.20',
  iip: '51.10',
  m2_growth: '8.40',
  gdp_growth_yoy: '5.70',
  inflation_cpi: '3.20',
  policy_rate: '5.00',
  bond_yield: '4.80',
  interbank_rate: '4.20',
  usd_vnd_movement: '1.10',
  vix: '28.00',
  scenario_persistence: 'rate_hike_stress',
};

const currentMarketMetricRow = {
  id: '20000000-0000-4000-8000-000000000001',
  class_id: classId,
  month_index: 2,
  vn_index_level: '1175.00',
  equity_market_trading_value: '14000.00',
  foreign_investor_net_trading_value: '-900.00',
  retail_investor_net_trading_value: '500.00',
  market_earnings_growth_expectation: '-1.50',
  valuation_sentiment: 'cautious',
  business_cycle_phase: 'late_cycle',
};

const fundRow = {
  id: fundId,
  class_id: classId,
  student_id: studentSession.subjectId,
  current_aum: '50000000.00',
  sharpe_ratio: '1.20',
};

const holdingRows = [
  {
    id: '30000000-0000-4000-8000-000000000001',
    class_id: classId,
    fund_id: fundId,
    tier: 'Base',
    allocation_weight_pct: '40.00',
  },
  {
    id: '30000000-0000-4000-8000-000000000002',
    class_id: classId,
    fund_id: fundId,
    tier: 'Core',
    allocation_weight_pct: '30.00',
  },
  {
    id: '30000000-0000-4000-8000-000000000003',
    class_id: classId,
    fund_id: fundId,
    tier: 'Apex',
    allocation_weight_pct: '30.00',
  },
];

const pendingOrderRow = {
  id: '40000000-0000-4000-8000-000000000001',
  class_id: classId,
  fund_id: fundId,
  month_index: 2,
  target_weights_json: { Base: 50, Core: 30, Apex: 20 },
  estimated_tax_drag: '0.20',
  rebalance_trigger: 'student_tara_submission',
  status: 'pending',
};

const apexUnrealizedGainMetricRow = {
  id: '50000000-0000-4000-8000-000000000001',
  class_id: classId,
  fund_id: fundId,
  scope_type: 'fund',
  scope_id: fundId,
  month_index: 2,
  metric_id: 'apex_unrealized_gain_pct',
  display_label: 'Apex unrealized gain',
  metric_family: 'portfolio_state',
  value_numeric: '10.00',
  value_text: null,
  unit: 'percent',
  source_type: 'computed',
  source_note: 'Current unrealized gain for Apex tax preview.',
  convention_note: 'Percentage gain over cost basis.',
};

const leaderboardFundRows = [
  {
    id: otherFundId,
    class_id: classId,
    student_display_name: 'Beta Fund',
    current_aum: '52000000.00',
    sharpe_ratio: '1.10',
  },
  {
    id: fundId,
    class_id: classId,
    student_display_name: 'Viewer Fund',
    current_aum: '50000000.00',
    sharpe_ratio: '1.20',
  },
];

function rowReader(rows: Partial<Awaited<ReturnType<StudentDashboardCurrentTurnQueryRowReader['readStudentDashboardCurrentTurnRows']>>>): StudentDashboardCurrentTurnQueryRowReader {
  return {
    async readStudentDashboardCurrentTurnRows() {
      return {
        macroNarratives: rows.macroNarratives ?? [currentMacroNarrativeRow],
        marketMetrics: rows.marketMetrics ?? [currentMarketMetricRow],
        funds: rows.funds ?? [fundRow],
        holdings: rows.holdings ?? holdingRows,
        orders: rows.orders ?? [pendingOrderRow],
        trackedMetrics: rows.trackedMetrics ?? [apexUnrealizedGainMetricRow],
        leaderboardFunds: rows.leaderboardFunds ?? leaderboardFundRows,
      };
    },
  };
}

const executionInput = {
  session: studentSession,
  scope,
  rowReader: rowReader({}),
  intendedWeights: { Base: 35, Core: 45, Apex: 20 },
  dangerousDriftThresholdPct: 8,
};

describe('executeStudentDashboardCurrentTurnQuery', () => {
  it('returns a student current-turn dashboard query result envelope from parsed scoped rows', async () => {
    const result = await executeStudentDashboardCurrentTurnQuery(executionInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toMatchObject({
      envelopeType: 'student_dashboard_current_turn_query_result',
      queryResultKey: `class:${classId}:month:2:fund:${fundId}:student-dashboard-current-turn-query:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: `class:${classId}:month:2:fund:${fundId}:student-dashboard-current-turn-query`,
      queryName: 'get_student_dashboard_current_turn',
      requiredScope: 'viewer_fund_in_class',
      classId,
      currentMonthIndex: 2,
      viewerFundId: fundId,
      resultStatus: 'ready',
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundExactHoldingsForStudents: false,
      includeInstructorGodModeData: false,
      includeProviderPayload: false,
      snapshot: {
        snapshotType: 'student_dashboard_current_turn',
        classId,
        monthIndex: 2,
        viewerFundId: fundId,
        macroNews: {
          newsHeadline: 'Liquidity tightens as policy rates rise',
        },
        portfolioPyramid: {
          tiers: [
            { tier: 'Base', currentWeightPct: 40 },
            { tier: 'Core', currentWeightPct: 30 },
            { tier: 'Apex', currentWeightPct: 30 },
          ],
        },
        taraOrderEntry: {
          currentWeights: { Base: 40, Core: 30, Apex: 30 },
          targetWeights: { Base: 50, Core: 30, Apex: 20 },
          status: 'pending',
        },
        leaderboardRank: {
          viewerRank: 2,
          rankedFundCount: 2,
        },
      },
    });
  });

  it('keeps the composed result free of future rows, other-fund ids, database rows, and provider clients', async () => {
    const result = await executeStudentDashboardCurrentTurnQuery(executionInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const payload = JSON.stringify(result.value);

    expect(payload).not.toContain(otherFundId);
    expect(payload).not.toContain('Future CPI shock should stay hidden');
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });

  it('rejects non-student sessions before reading rows', async () => {
    const reader: StudentDashboardCurrentTurnQueryRowReader = {
      async readStudentDashboardCurrentTurnRows() {
        throw new Error('rows should not be read for invalid roles');
      },
    };

    await expect(
      executeStudentDashboardCurrentTurnQuery({
        ...executionInput,
        session: instructorSession,
        rowReader: reader,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
  });

  it('rejects missing fund scope before reading rows', async () => {
    const reader: StudentDashboardCurrentTurnQueryRowReader = {
      async readStudentDashboardCurrentTurnRows() {
        throw new Error('rows should not be read without a fund scope');
      },
    };

    await expect(
      executeStudentDashboardCurrentTurnQuery({
        ...executionInput,
        scope: { classId, monthIndex: 2 },
        rowReader: reader,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_fund_scope' },
    });
  });

  it('rejects future macro rows before composing the dashboard result', async () => {
    await expect(
      executeStudentDashboardCurrentTurnQuery({
        ...executionInput,
        rowReader: rowReader({
          macroNarratives: [
            currentMacroNarrativeRow,
            {
              ...currentMacroNarrativeRow,
              id: '10000000-0000-4000-8000-000000000002',
              month_index: 3,
              news_headline: 'Future CPI shock should stay hidden',
            },
          ],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'macro_narrative_row_rejected', rowFailureCode: 'future_scenario_row' },
    });
  });

  it('rejects cross-class leaderboard rows before result delivery', async () => {
    await expect(
      executeStudentDashboardCurrentTurnQuery({
        ...executionInput,
        rowReader: rowReader({
          leaderboardFunds: [{ ...leaderboardFundRows[0], class_id: otherClassId }, leaderboardFundRows[1]],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'leaderboard_fund_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects duplicate holding tiers before snapshot construction', async () => {
    await expect(
      executeStudentDashboardCurrentTurnQuery({
        ...executionInput,
        rowReader: rowReader({
          holdings: [holdingRows[0], { ...holdingRows[0], id: '30000000-0000-4000-8000-000000000004' }],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'duplicate_holding_tier' },
    });
  });
});
