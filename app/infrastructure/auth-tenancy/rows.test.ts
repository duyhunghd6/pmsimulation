import { describe, expect, it } from 'vitest';

import {
  parseInstructorGodModeHoldingRow,
  parseStudentFundStateRow,
  parseStudentRevealedMacroNarrativeRow,
  parseStudentRevealedMarketMetricRow,
  parseStudentSimulationLedgerRow,
  parseStudentTaraOrderRow,
} from './rows';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherClassId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const otherStudentId = '22222222-2222-4222-8222-222222222222';
const scope = { classId, fundId, monthIndex: 1 };

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
