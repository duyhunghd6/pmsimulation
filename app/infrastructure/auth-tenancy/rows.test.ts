import { describe, expect, it } from 'vitest';

import {
  parseInstructorClassAggregateFundRow,
  parseInstructorClassFundRow,
  parseInstructorClassRosterRow,
  parseInstructorCreatedClassRow,
  parseInstructorGodModeHoldingRow,
  parseInstructorLiveLeaderboardFundRow,
  parseInstructorOwnedClassRow,
  parseInstructorPendingTaraOrderStatusRow,
  parseStudentClassEnrollmentRow,
  parseStudentFundStateRow,
  parseStudentLeaderboardFundRow,
  parseStudentOwnHoldingRow,
  parseStudentRevealedMacroNarrativeRow,
  parseStudentRevealedMarketMetricRow,
  parseStudentRiskRegisterEntryRow,
  parseStudentSimulationLedgerRow,
  parseStudentTaraOrderRow,
  parseStudentTrackedMetricRow,
} from './rows';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherClassId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const otherStudentId = '22222222-2222-4222-8222-222222222222';
const scope = { classId, fundId, monthIndex: 1 };

describe('parseInstructorOwnedClassRow', () => {
  const row = {
    id: classId,
    instructor_id: instructorSession.subjectId,
    display_name: 'Alpha Capital Lab',
    trigger_mode: 'manual',
    current_month_index: 1,
    total_months: 12,
    student_join_code: 'ALPHA01',
  };

  it('accepts a scoped instructor-owned class row after RLS', () => {
    expect(parseInstructorOwnedClassRow(row, { session: instructorSession, scope })).toEqual({
      ok: true,
      row: {
        classId,
        instructorId: instructorSession.subjectId,
        displayName: 'Alpha Capital Lab',
        triggerMode: 'manual',
        currentMonthIndex: 1,
        totalMonths: 12,
        studentJoinCode: 'ALPHA01',
      },
    });
  });

  it('rejects unowned, malformed, or wrong-role class rows before result delivery', () => {
    expect(parseInstructorOwnedClassRow(row, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorOwnedClassRow({ ...row, instructor_id: 'bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorOwnedClassRow({ ...row, id: otherClassId }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorOwnedClassRow({ ...row, trigger_mode: 'live' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_trigger_mode',
    });
    expect(parseInstructorOwnedClassRow({ ...row, current_month_index: 12 }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_month_index',
    });
    expect(parseInstructorOwnedClassRow({ ...row, student_join_code: 'join-link-secret' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_join_code',
    });
  });
});

describe('parseInstructorCreatedClassRow', () => {
  const row = {
    id: classId,
    instructor_id: instructorSession.subjectId,
    display_name: 'Alpha Capital Lab',
    trigger_mode: 'manual',
    current_month_index: 0,
    total_months: 12,
    student_join_code: 'ALPHA01',
  };

  it('accepts an instructor-created class row after insertion', () => {
    expect(parseInstructorCreatedClassRow(row, { session: instructorSession })).toEqual({
      ok: true,
      row: {
        classId,
        instructorId: instructorSession.subjectId,
        displayName: 'Alpha Capital Lab',
        triggerMode: 'manual',
        currentMonthIndex: 0,
        totalMonths: 12,
        studentJoinCode: 'ALPHA01',
      },
    });
  });

  it('rejects malformed, wrong-role, or non-initial created class rows before result delivery', () => {
    expect(parseInstructorCreatedClassRow(row, { session: studentSession })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorCreatedClassRow({ ...row, instructor_id: 'bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb' }, { session: instructorSession })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorCreatedClassRow({ ...row, current_month_index: 1 }, { session: instructorSession })).toEqual({
      ok: false,
      code: 'invalid_month_index',
    });
    expect(parseInstructorCreatedClassRow({ ...row, total_months: 99 }, { session: instructorSession })).toEqual({
      ok: false,
      code: 'invalid_total_months',
    });
  });
});

describe('parseStudentClassEnrollmentRow', () => {
  const row = {
    class_id: classId,
    student_id: studentSession.subjectId,
    fund_id: fundId,
    display_name: 'Alpha Capital Lab',
    current_month_index: 0,
    student_join_code: 'ALPHA01',
  };

  it('accepts a student enrollment receipt row after the join RPC', () => {
    expect(parseStudentClassEnrollmentRow(row, { session: studentSession, joinCode: 'ALPHA01' })).toEqual({
      ok: true,
      row: {
        classId,
        studentId: studentSession.subjectId,
        fundId,
        displayName: 'Alpha Capital Lab',
        currentMonthIndex: 0,
        studentJoinCode: 'ALPHA01',
      },
    });
  });

  it('rejects wrong-role, wrong-student, malformed, or wrong-code enrollment rows', () => {
    expect(parseStudentClassEnrollmentRow(row, { session: instructorSession, joinCode: 'ALPHA01' })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(
      parseStudentClassEnrollmentRow({ ...row, student_id: otherStudentId }, { session: studentSession, joinCode: 'ALPHA01' }),
    ).toEqual({ ok: false, code: 'scope_mismatch' });
    expect(parseStudentClassEnrollmentRow({ ...row, fund_id: 'not-a-fund' }, { session: studentSession, joinCode: 'ALPHA01' })).toEqual({
      ok: false,
      code: 'invalid_fund_id',
    });
    expect(parseStudentClassEnrollmentRow({ ...row, student_join_code: 'BETA02' }, { session: studentSession, joinCode: 'ALPHA01' })).toEqual({
      ok: false,
      code: 'invalid_join_code',
    });
  });
});

describe('parseInstructorClassRosterRow', () => {
  const row = {
    id: fundId,
    class_id: classId,
    student_id: otherStudentId,
    current_aum: '50000000.00',
  };

  it('accepts an instructor-scoped roster row after RLS', () => {
    expect(parseInstructorClassRosterRow(row, { session: instructorSession, scope })).toEqual({
      ok: true,
      row: {
        fundId,
        classId,
        studentId: otherStudentId,
        currentAum: 50000000,
      },
    });
  });

  it('rejects wrong-role, cross-class, malformed, or negative roster rows before result delivery', () => {
    expect(parseInstructorClassRosterRow(row, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorClassRosterRow({ ...row, class_id: otherClassId }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorClassRosterRow({ ...row, student_id: 'not-a-student-id' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_student_id',
    });
    expect(parseInstructorClassRosterRow({ ...row, current_aum: '-1.00' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_numeric_value',
    });
    expect('holdings' in parseInstructorClassRosterRow(row, { session: instructorSession, scope })).toBe(false);
    expect('targetWeights' in parseInstructorClassRosterRow(row, { session: instructorSession, scope })).toBe(false);
  });
});

describe('parseStudentFundStateRow', () => {
  it('accepts a scoped own-fund database row after RLS', () => {
    expect(
      parseStudentFundStateRow(
        {
          id: fundId,
          class_id: classId,
          student_id: studentSession.subjectId,
          current_aum: '50000000.00',
          sharpe_ratio: '1.1000',
        },
        { session: studentSession, scope },
      ),
    ).toEqual({
      ok: true,
      row: {
        fundId,
        classId,
        studentId: studentSession.subjectId,
        currentAum: 50000000,
        sharpeRatio: 1.1,
      },
    });
  });

  it('rejects other-student or cross-class fund rows before result delivery', () => {
    expect(
      parseStudentFundStateRow(
        {
          id: fundId,
          class_id: classId,
          student_id: otherStudentId,
          current_aum: '50500000.00',
          sharpe_ratio: '1.2500',
        },
        { session: studentSession, scope },
      ),
    ).toEqual({ ok: false, code: 'scope_mismatch' });

    expect(
      parseStudentFundStateRow(
        {
          id: fundId,
          class_id: otherClassId,
          student_id: studentSession.subjectId,
          current_aum: '50000000.00',
          sharpe_ratio: '1.1000',
        },
        { session: studentSession, scope },
      ),
    ).toEqual({ ok: false, code: 'scope_mismatch' });
  });
});

describe('parseStudentLeaderboardFundRow', () => {
  const row = {
    id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    class_id: classId,
    student_display_name: 'Beta Fund',
    current_aum: '52000000.00',
    sharpe_ratio: '1.2500',
  };

  it('accepts a same-class leaderboard fund row after RLS without returning student ids or holdings', () => {
    expect(parseStudentLeaderboardFundRow(row, { session: studentSession, scope })).toEqual({
      ok: true,
      row: {
        fundId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        classId,
        studentDisplayName: 'Beta Fund',
        currentAum: 52000000,
        sharpeRatio: 1.25,
      },
    });
  });

  it('rejects cross-class, malformed, or wrong-role leaderboard fund rows before result delivery', () => {
    expect(parseStudentLeaderboardFundRow(row, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseStudentLeaderboardFundRow({ ...row, class_id: otherClassId }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentLeaderboardFundRow({ ...row, student_display_name: ' ' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_display_name',
    });
    expect(parseStudentLeaderboardFundRow({ ...row, current_aum: '-1.00' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_numeric_value',
    });
  });
});

describe('parseInstructorClassFundRow', () => {
  const row = {
    id: fundId,
    class_id: classId,
  };

  it('accepts an instructor-scoped class fund row after RLS', () => {
    expect(parseInstructorClassFundRow(row, { session: instructorSession, scope })).toEqual({
      ok: true,
      row: {
        fundId,
        classId,
      },
    });
  });

  it('rejects wrong-role, cross-class, or malformed class fund rows before result delivery', () => {
    expect(parseInstructorClassFundRow(row, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorClassFundRow({ ...row, class_id: otherClassId }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorClassFundRow({ ...row, id: 'not-a-fund-id' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_id',
    });
  });
});

describe('parseInstructorClassAggregateFundRow', () => {
  const row = {
    id: fundId,
    class_id: classId,
    current_aum: '51000000.00',
    sharpe_ratio: '1.1500',
  };

  it('accepts an instructor-scoped aggregate analytics fund row after RLS', () => {
    expect(parseInstructorClassAggregateFundRow(row, { session: instructorSession, scope })).toEqual({
      ok: true,
      row: {
        fundId,
        classId,
        currentAum: 51000000,
        sharpeRatio: 1.15,
      },
    });
  });

  it('rejects wrong-role, cross-class, malformed, or negative aggregate fund rows before result delivery', () => {
    expect(parseInstructorClassAggregateFundRow(row, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorClassAggregateFundRow({ ...row, class_id: otherClassId }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorClassAggregateFundRow({ ...row, id: 'not-a-fund-id' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_id',
    });
    expect(parseInstructorClassAggregateFundRow({ ...row, current_aum: '-1.00' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_numeric_value',
    });
    expect('studentDisplayName' in parseInstructorClassAggregateFundRow(row, { session: instructorSession, scope })).toBe(false);
  });
});

describe('parseInstructorLiveLeaderboardFundRow', () => {
  const row = {
    id: fundId,
    class_id: classId,
    student_display_name: 'Alpha Fund',
    current_aum: '51000000.00',
    sharpe_ratio: '1.1500',
  };

  it('accepts an instructor-scoped live leaderboard fund row after RLS', () => {
    expect(parseInstructorLiveLeaderboardFundRow(row, { session: instructorSession, scope })).toEqual({
      ok: true,
      row: {
        fundId,
        classId,
        studentDisplayName: 'Alpha Fund',
        currentAum: 51000000,
        sharpeRatio: 1.15,
      },
    });
  });

  it('rejects wrong-role, cross-class, malformed, or negative leaderboard fund rows before result delivery', () => {
    expect(parseInstructorLiveLeaderboardFundRow(row, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorLiveLeaderboardFundRow({ ...row, class_id: otherClassId }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorLiveLeaderboardFundRow({ ...row, student_display_name: ' ' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_display_name',
    });
    expect(parseInstructorLiveLeaderboardFundRow({ ...row, current_aum: '-1.00' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_numeric_value',
    });
    expect('holdings' in parseInstructorLiveLeaderboardFundRow(row, { session: instructorSession, scope })).toBe(false);
  });
});

describe('parseStudentOwnHoldingRow', () => {
  const row = {
    id: '10000000-0000-4000-8000-000000000002',
    fund_id: fundId,
    class_id: classId,
    tier: 'Core',
    allocation_weight_pct: '35.0000',
  };

  it('accepts a scoped student own-holding row after RLS', () => {
    expect(parseStudentOwnHoldingRow(row, { session: studentSession, scope })).toEqual({
      ok: true,
      row: {
        holdingId: '10000000-0000-4000-8000-000000000002',
        fundId,
        classId,
        tier: 'Core',
        allocationWeightPct: 35,
      },
    });
  });

  it('rejects unscoped, malformed, or wrong-role student holding rows before result delivery', () => {
    expect(parseStudentOwnHoldingRow(row, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseStudentOwnHoldingRow({ ...row, fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentOwnHoldingRow({ ...row, class_id: otherClassId }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentOwnHoldingRow({ ...row, tier: 'Cash' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_tier',
    });
    expect(parseStudentOwnHoldingRow({ ...row, allocation_weight_pct: '125.0000' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_numeric_value',
    });
  });
});

describe('parseInstructorGodModeHoldingRow', () => {
  it('accepts a scoped instructor God Mode holding row after RLS', () => {
    expect(
      parseInstructorGodModeHoldingRow(
        {
          id: '10000000-0000-4000-8000-000000000003',
          fund_id: fundId,
          class_id: classId,
          tier: 'Apex',
          allocation_weight_pct: '20.0000',
        },
        { session: instructorSession, scope },
      ),
    ).toEqual({
      ok: true,
      row: {
        holdingId: '10000000-0000-4000-8000-000000000003',
        fundId,
        classId,
        tier: 'Apex',
        allocationWeightPct: 20,
      },
    });
  });

  it('rejects student-role access and unscoped holding rows before result delivery', () => {
    const row = {
      id: '10000000-0000-4000-8000-000000000003',
      fund_id: fundId,
      class_id: classId,
      tier: 'Apex',
      allocation_weight_pct: '20.0000',
    };

    expect(parseInstructorGodModeHoldingRow(row, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorGodModeHoldingRow({ ...row, class_id: otherClassId }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
  });
});

describe('parseStudentRevealedMacroNarrativeRow', () => {
  it('accepts a current-or-past scenario row for the student class scope', () => {
    expect(
      parseStudentRevealedMacroNarrativeRow(
        {
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
        },
        { session: studentSession, scope },
      ),
    ).toEqual({
      ok: true,
      row: {
        narrativeId: '40000000-0000-4000-8000-000000000001',
        classId,
        monthIndex: 1,
        newsHeadline: 'Credit growth accelerates while inflation remains contained',
        investmentClockPhase: 'expansion',
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
        scenarioPersistence: 'soft landing',
      },
    });
  });

  it('rejects future scenario rows before result delivery', () => {
    expect(
      parseStudentRevealedMacroNarrativeRow(
        {
          id: '40000000-0000-4000-8000-000000000002',
          class_id: classId,
          month_index: 2,
          news_headline: 'Future inflation shock tests crowded Apex exposure',
        },
        { session: studentSession, scope },
      ),
    ).toEqual({ ok: false, code: 'future_scenario_row' });
  });
});

describe('parseStudentRevealedMarketMetricRow', () => {
  const row = {
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

  it('accepts a current-or-past market metric row for the student class scope', () => {
    expect(parseStudentRevealedMarketMetricRow(row, { session: studentSession, scope })).toEqual({
      ok: true,
      row: {
        metricId: '50000000-0000-4000-8000-000000000001',
        classId,
        monthIndex: 1,
        vnIndexLevel: 1250.5,
        equityMarketTradingValue: 1500000000,
        foreignInvestorNetTradingValue: -25000000,
        retailInvestorNetTradingValue: 45000000,
        marketEarningsGrowthExpectation: 8.25,
        valuationSentiment: 'fair',
        businessCyclePhase: 'mid_cycle',
      },
    });
  });

  it('rejects future, cross-class, or malformed market metric rows before result delivery', () => {
    expect(parseStudentRevealedMarketMetricRow({ ...row, month_index: 2 }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'future_scenario_row',
    });
    expect(parseStudentRevealedMarketMetricRow({ ...row, class_id: otherClassId }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentRevealedMarketMetricRow({ ...row, vn_index_level: 'not-a-number' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_numeric_value',
    });
  });
});

describe('parseStudentTrackedMetricRow', () => {
  const row = {
    id: '60000000-0000-4000-8000-000000000001',
    class_id: classId,
    fund_id: fundId,
    scope_type: 'fund',
    scope_id: fundId,
    month_index: 1,
    metric_id: 'sharpe_ratio',
    display_label: 'Sharpe Ratio',
    metric_family: 'performance',
    value_numeric: '1.2500',
    value_text: null,
    unit: 'ratio',
    source_type: 'computed',
    source_note: 'month-end attribution',
    convention_note: 'monthly return annualized with risk-free proxy',
  };

  it('accepts a scoped current-or-past student tracked metric row after RLS', () => {
    expect(parseStudentTrackedMetricRow(row, { session: studentSession, scope })).toEqual({
      ok: true,
      row: {
        trackedMetricId: '60000000-0000-4000-8000-000000000001',
        classId,
        fundId,
        scopeType: 'fund',
        scopeId: fundId,
        monthIndex: 1,
        metricId: 'sharpe_ratio',
        displayLabel: 'Sharpe Ratio',
        metricFamily: 'performance',
        valueNumeric: 1.25,
        valueText: undefined,
        unit: 'ratio',
        sourceType: 'computed',
        sourceNote: 'month-end attribution',
        conventionNote: 'monthly return annualized with risk-free proxy',
      },
    });
  });

  it('rejects future, unscoped, or malformed tracked metric rows before result delivery', () => {
    expect(parseStudentTrackedMetricRow({ ...row, month_index: 2 }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'future_scenario_row',
    });
    expect(parseStudentTrackedMetricRow({ ...row, fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentTrackedMetricRow({ ...row, value_numeric: null, value_text: null }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_metric_value',
    });
    expect(parseStudentTrackedMetricRow(row, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
  });
});

describe('parseStudentTaraOrderRow', () => {
  it('accepts a scoped student TARA order row after RLS', () => {
    expect(
      parseStudentTaraOrderRow(
        {
          id: '70000000-0000-4000-8000-000000000001',
          fund_id: fundId,
          class_id: classId,
          month_index: 1,
          target_weights_json: { Base: 45, Core: 40, Apex: 15 },
          estimated_tax_drag: '12500.00',
          rebalance_trigger: 'Reduce Apex after CPI risk',
          status: 'pending',
        },
        { session: studentSession, scope },
      ),
    ).toEqual({
      ok: true,
      row: {
        orderId: '70000000-0000-4000-8000-000000000001',
        fundId,
        classId,
        monthIndex: 1,
        targetWeights: { Base: 45, Core: 40, Apex: 15 },
        estimatedTaxDrag: 12500,
        rebalanceTrigger: 'Reduce Apex after CPI risk',
        status: 'pending',
      },
    });
  });

  it('rejects unscoped, malformed, or wrong-role TARA order rows before result delivery', () => {
    const row = {
      id: '70000000-0000-4000-8000-000000000001',
      fund_id: fundId,
      class_id: classId,
      month_index: 1,
      target_weights_json: { Base: 45, Core: 40, Apex: 15 },
      estimated_tax_drag: '12500.00',
      rebalance_trigger: 'Reduce Apex after CPI risk',
      status: 'pending',
    };

    expect(parseStudentTaraOrderRow(row, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseStudentTaraOrderRow({ ...row, fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentTaraOrderRow({ ...row, target_weights_json: { Base: 45, Core: 40, Apex: 20 } }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_target_weights',
    });
  });
});

describe('parseInstructorPendingTaraOrderStatusRow', () => {
  const row = {
    id: '70000000-0000-4000-8000-000000000001',
    fund_id: fundId,
    class_id: classId,
    month_index: 1,
    status: 'pending',
  };

  it('accepts an instructor-scoped status-only TARA order row after RLS', () => {
    expect(parseInstructorPendingTaraOrderStatusRow(row, { session: instructorSession, scope })).toEqual({
      ok: true,
      row: {
        orderId: '70000000-0000-4000-8000-000000000001',
        fundId,
        classId,
        monthIndex: 1,
        status: 'pending',
      },
    });
  });

  it('rejects wrong-role, cross-class, future-month, or malformed order rows before result delivery', () => {
    expect(parseInstructorPendingTaraOrderStatusRow(row, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseInstructorPendingTaraOrderStatusRow({ ...row, class_id: otherClassId }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorPendingTaraOrderStatusRow({ ...row, month_index: 2 }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseInstructorPendingTaraOrderStatusRow({ ...row, status: 'draft' }, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_status',
    });
    expect('targetWeights' in parseInstructorPendingTaraOrderStatusRow(row, { session: instructorSession, scope })).toBe(false);
  });
});

describe('parseStudentRiskRegisterEntryRow', () => {
  it('accepts a scoped student risk register row after RLS', () => {
    expect(
      parseStudentRiskRegisterEntryRow(
        {
          id: '80000000-0000-4000-8000-000000000001',
          fund_id: fundId,
          class_id: classId,
          month_index: 1,
          risk_type: 'inflation',
          risk_direction: 'up',
          impact_weight: '0.7000',
          risk_time_lag: 2,
          risk_probability_score: 4,
          risk_impact_score: 4,
          tara_risk_treatment_class: 'Reduce',
          risk_treatment_action: 'Trim Apex and rebalance toward Base',
        },
        { session: studentSession, scope },
      ),
    ).toEqual({
      ok: true,
      row: {
        riskRegisterEntryId: '80000000-0000-4000-8000-000000000001',
        fundId,
        classId,
        monthIndex: 1,
        riskType: 'inflation',
        riskDirection: 'up',
        impactWeight: 0.7,
        riskTimeLag: 2,
        riskProbabilityScore: 4,
        riskImpactScore: 4,
        taraRiskTreatmentClass: 'reduce',
        riskTreatmentAction: 'Trim Apex and rebalance toward Base',
      },
    });
  });

  it('rejects unscoped, malformed, or wrong-role risk register rows before result delivery', () => {
    const row = {
      id: '80000000-0000-4000-8000-000000000001',
      fund_id: fundId,
      class_id: classId,
      month_index: 1,
      risk_type: 'inflation',
      risk_direction: 'up',
      impact_weight: '0.7000',
      risk_time_lag: 2,
      risk_probability_score: 4,
      risk_impact_score: 4,
      tara_risk_treatment_class: 'Reduce',
      risk_treatment_action: 'Trim Apex and rebalance toward Base',
    };

    expect(parseStudentRiskRegisterEntryRow(row, { session: instructorSession, scope })).toEqual({
      ok: false,
      code: 'invalid_role',
    });
    expect(parseStudentRiskRegisterEntryRow({ ...row, class_id: otherClassId }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentRiskRegisterEntryRow({ ...row, tara_risk_treatment_class: 'hedge' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_tara_risk_treatment_class',
    });
  });
});

describe('parseStudentSimulationLedgerRow', () => {
  it('accepts a scoped student simulation ledger row after RLS', () => {
    expect(
      parseStudentSimulationLedgerRow(
        {
          id: '90000000-0000-4000-8000-000000000001',
          fund_id: fundId,
          class_id: classId,
          month_index: 1,
          market_beta_impact: '300000.00',
          fee_drag: '45000.00',
          tax_paid: '0.00',
          tax_drag_pct: '0.0000',
          pvp_slippage_paid: '0.00',
          liquidity_penalty_pct: '0.0000',
          classroom_sell_concentration_pct: '0.0000',
          ending_aum: '50255000.00',
        },
        { session: studentSession, scope },
      ),
    ).toEqual({
      ok: true,
      row: {
        ledgerId: '90000000-0000-4000-8000-000000000001',
        fundId,
        classId,
        monthIndex: 1,
        marketBetaImpact: 300000,
        feeDrag: 45000,
        taxPaid: 0,
        taxDragPct: 0,
        pvpSlippagePaid: 0,
        liquidityPenaltyPct: 0,
        classroomSellConcentrationPct: 0,
        endingAum: 50255000,
      },
    });
  });

  it('rejects unscoped or malformed simulation ledger rows before result delivery', () => {
    const row = {
      id: '90000000-0000-4000-8000-000000000001',
      fund_id: fundId,
      class_id: classId,
      month_index: 1,
      market_beta_impact: '300000.00',
      fee_drag: '45000.00',
      tax_paid: '0.00',
      tax_drag_pct: '0.0000',
      pvp_slippage_paid: '0.00',
      liquidity_penalty_pct: '0.0000',
      classroom_sell_concentration_pct: '0.0000',
      ending_aum: '50255000.00',
    };

    expect(parseStudentSimulationLedgerRow({ ...row, class_id: otherClassId }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'scope_mismatch',
    });
    expect(parseStudentSimulationLedgerRow({ ...row, ending_aum: 'not-a-number' }, { session: studentSession, scope })).toEqual({
      ok: false,
      code: 'invalid_numeric_value',
    });
  });
});
