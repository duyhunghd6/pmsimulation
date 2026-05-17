import { describe, expect, it } from 'vitest';

import { buildStudentDashboardCurrentTurnSnapshot, buildStudentDashboardPostTurnSnapshot } from './dashboard-snapshot';

const currentMacroNarrative = {
  monthIndex: 2,
  newsHeadline: 'Liquidity tightens as policy rates rise',
  investmentClockPhase: 'slowdown',
  pmi: 49.2,
  iip: 51.1,
  m2Growth: 8.4,
  gdpGrowthYoy: 5.7,
  inflationCpi: 3.2,
  policyRate: 5,
  bondYield: 4.8,
  interbankRate: 4.2,
  usdVndMovement: 1.1,
  vix: 28,
  scenarioPersistence: 'rate_hike_stress',
};

const currentMarketMetric = {
  monthIndex: 2,
  vnIndexLevel: 1175,
  equityMarketTradingValue: 14_000,
  foreignInvestorNetTradingValue: -900,
  retailInvestorNetTradingValue: 500,
  marketEarningsGrowthExpectation: 'downgraded',
  valuationSentiment: 'cautious',
  businessCyclePhase: 'late_cycle',
};

const defaultInput = {
  classId: 'class-001',
  currentMonthIndex: 2,
  viewerFundId: 'fund-001',
  macroNarratives: [
    currentMacroNarrative,
    {
      ...currentMacroNarrative,
      monthIndex: 3,
      newsHeadline: 'Future CPI shock should stay hidden',
    },
  ],
  marketMetrics: [
    currentMarketMetric,
    {
      ...currentMarketMetric,
      monthIndex: 3,
      valuationSentiment: 'future panic',
    },
  ],
  currentWeights: {
    Base: 25,
    Core: 45,
    Apex: 30,
  },
  intendedWeights: {
    Base: 30,
    Core: 50,
    Apex: 20,
  },
  dangerousDriftThresholdPct: 8,
  targetWeights: {
    Base: 35,
    Core: 50,
    Apex: 15,
  },
  currentAum: 50_000_000,
  apexUnrealizedGainPct: 20,
  leaderboardFunds: [
    {
      fundId: 'fund-002',
      studentDisplayName: 'Beta Fund',
      currentAum: 52_000_000,
      sharpeRatio: 1.1,
    },
    {
      fundId: 'fund-001',
      studentDisplayName: 'Viewer Fund',
      currentAum: 50_000_000,
      sharpeRatio: 1.2,
    },
  ],
};

function errorSourcesFor(input: Parameters<typeof buildStudentDashboardCurrentTurnSnapshot>[0]): string[] {
  const result = buildStudentDashboardCurrentTurnSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.source);
}

describe('buildStudentDashboardCurrentTurnSnapshot', () => {
  it('composes current-turn student dashboard surfaces for the viewer fund', () => {
    const result = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        snapshotType: 'student_dashboard_current_turn',
        classId: 'class-001',
        monthIndex: 2,
        viewerFundId: 'fund-001',
        macroNews: expect.objectContaining({
          monthIndex: 2,
          newsHeadline: 'Liquidity tightens as policy rates rise',
        }),
        driverStringDashboard: expect.objectContaining({
          monthIndex: 2,
          context: expect.objectContaining({
            businessCyclePhase: 'late_cycle',
          }),
        }),
        portfolioPyramid: expect.objectContaining({
          hasDangerousDrift: true,
        }),
        taraOrderEntry: expect.objectContaining({
          classId: 'class-001',
          viewerFundId: 'fund-001',
          status: 'pending',
          targetWeights: {
            Base: 35,
            Core: 50,
            Apex: 15,
          },
        }),
        leaderboardRank: expect.objectContaining({
          viewerRank: 2,
          rankedFundCount: 2,
        }),
      }),
    });
  });

  it('keeps future scenario rows and other-fund sensitive fields out of the dashboard payload', () => {
    const result = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const payload = JSON.stringify(result.value);

    expect(payload).not.toContain('Future CPI shock should stay hidden');
    expect(payload).not.toContain('future panic');
    expect(payload).not.toContain('fund-002');
    expect('targetWeights' in result.value.leaderboardRank.rows[0]).toBe(false);
    expect('currentWeights' in result.value.leaderboardRank.rows[0]).toBe(false);
    expect('pendingOrderStatus' in result.value.leaderboardRank.rows[0]).toBe(false);
    expect('godModePortfolios' in result.value).toBe(false);
  });

  it('returns source-tagged errors from invalid child snapshots', () => {
    expect(
      errorSourcesFor({
        ...defaultInput,
        currentMonthIndex: 4,
        viewerFundId: 'fund-999',
        targetWeights: {
          Base: 30,
          Core: 30,
          Apex: 20,
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        'macro_news',
        'driver_string_dashboard',
        'tara_order_entry',
        'leaderboard_rank',
      ]),
    );
  });
});

const defaultPostTurnInput = {
  classId: ' class-001 ',
  monthIndex: 3,
  viewerFundId: ' fund-001 ',
  ledgerDraft: {
    fundId: ' fund-001 ',
    monthIndex: 3,
    startingAum: 50_000_000,
    marketBetaImpact: 1_000_000,
    feeDrag: 100_000,
    taxPaid: 200_000,
    taxDragPct: 0.4,
    pvpSlippagePaid: 50_000,
    liquidityPenaltyPct: 0.1,
    classroomSellConcentrationPct: 65,
    endingAum: 50_650_000,
  },
  leaderboardFunds: [
    {
      fundId: 'fund-002',
      studentDisplayName: 'Beta Fund',
      currentAum: 51_000_000,
      sharpeRatio: 1.1,
    },
    {
      fundId: 'fund-001',
      studentDisplayName: 'Viewer Fund',
      currentAum: 50_650_000,
      sharpeRatio: 1.2,
    },
  ],
};

function postTurnErrorSourcesFor(input: Parameters<typeof buildStudentDashboardPostTurnSnapshot>[0]): string[] {
  const result = buildStudentDashboardPostTurnSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.source);
}

describe('buildStudentDashboardPostTurnSnapshot', () => {
  it('composes post-turn student dashboard surfaces for the viewer fund', () => {
    const result = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        snapshotType: 'student_dashboard_post_turn',
        classId: 'class-001',
        monthIndex: 3,
        viewerFundId: 'fund-001',
        attributionReport: expect.objectContaining({
          reportKey: 'class:class-001:month:3:fund:fund-001:attribution-report',
          endingAum: 50_650_000,
        }),
        leaderboardRank: expect.objectContaining({
          viewerRank: 2,
          rankedFundCount: 2,
        }),
      }),
    });
  });

  it('keeps order, holdings, and other-fund ids out of the post-turn dashboard payload', () => {
    const result = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const payload = JSON.stringify(result.value);

    expect(payload).not.toContain('fund-002');
    expect('targetWeights' in result.value).toBe(false);
    expect('currentWeights' in result.value).toBe(false);
    expect('taraOrderEntry' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('fundId' in result.value.leaderboardRank.rows[0]).toBe(false);
  });

  it('returns source-tagged errors from invalid post-turn child snapshots', () => {
    expect(
      postTurnErrorSourcesFor({
        ...defaultPostTurnInput,
        viewerFundId: 'fund-999',
        ledgerDraft: {
          ...defaultPostTurnInput.ledgerDraft,
          endingAum: 1,
        },
      }),
    ).toEqual(expect.arrayContaining(['attribution_report', 'leaderboard_rank']));
  });
});
