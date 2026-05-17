import { describe, expect, it } from 'vitest';

import { buildInstructorDashboardCurrentTurnSnapshot } from './dashboard-snapshot';

const defaultFunds = [
  {
    fundId: 'fund-001',
    studentDisplayName: 'An Nguyen',
    currentAum: 52_000_000,
    sharpeRatio: 1.2,
    holdings: {
      Base: 20,
      Core: 50,
      Apex: 30,
    },
  },
  {
    fundId: 'fund-002',
    studentDisplayName: 'Bao Tran',
    currentAum: 49_500_000,
    sharpeRatio: 0.9,
    holdings: {
      Base: 35,
      Core: 45,
      Apex: 20,
    },
  },
];

const defaultInput = {
  classId: 'class-001',
  currentMonthIndex: 4,
  triggerMode: 'manual',
  totalMonths: 12,
  funds: defaultFunds,
  pendingOrders: [
    {
      fundId: 'fund-001',
      monthIndex: 4,
      status: 'pending',
    },
  ],
};

function errorSourcesFor(input: Parameters<typeof buildInstructorDashboardCurrentTurnSnapshot>[0]): string[] {
  const result = buildInstructorDashboardCurrentTurnSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.source);
}

describe('buildInstructorDashboardCurrentTurnSnapshot', () => {
  it('composes current-turn instructor dashboard sections for an already-scoped class', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        snapshotType: 'instructor_dashboard_current_turn',
        classId: 'class-001',
        monthIndex: 4,
        pendingOrderVisibility: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          totalFundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
        }),
        liveLeaderboard: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          rankedFundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          rows: [
            expect.objectContaining({ rank: 1, fundId: 'fund-001', orderStatus: 'pending' }),
            expect.objectContaining({ rank: 2, fundId: 'fund-002', orderStatus: 'missing' }),
          ],
        }),
        godModePortfolioVisibility: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          fundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          rows: [
            expect.objectContaining({ fundId: 'fund-001', orderStatus: 'pending' }),
            expect.objectContaining({ fundId: 'fund-002', orderStatus: 'missing' }),
          ],
        }),
        classAggregateAnalytics: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 4,
          fundCount: 2,
          totalCurrentAum: 101_500_000,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          pendingOrderAum: 52_000_000,
          missingOrderAum: 49_500_000,
        }),
        liveMonthAdvanceControl: expect.objectContaining({
          controlType: 'instructor_live_month_advance_control',
          classId: 'class-001',
          triggerMode: 'manual',
          currentMonthIndex: 4,
          nextMonthIndex: 5,
          canAdvance: true,
          requestIdempotencyKey: 'class:class-001:advance:4->5',
        }),
      },
    });
  });

  it('trims class and fund ids through the child section snapshots', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot({
      ...defaultInput,
      classId: ' class-001 ',
      funds: [{ ...defaultFunds[0], fundId: ' fund-001 ' }],
      pendingOrders: [{ fundId: ' fund-001 ', monthIndex: 4, status: 'pending' }],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        pendingOrderVisibility: expect.objectContaining({
          fundStatuses: [{ fundId: 'fund-001', orderStatus: 'pending' }],
        }),
        liveLeaderboard: expect.objectContaining({
          rows: [expect.objectContaining({ fundId: 'fund-001' })],
        }),
        godModePortfolioVisibility: expect.objectContaining({
          rows: [expect.objectContaining({ fundId: 'fund-001' })],
        }),
      }),
    });
  });

  it('keeps the composed instructor dashboard free of target weights, tax previews, ledger, worker, and realtime payloads', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('targetWeights' in result.value).toBe(false);
    expect('estimatedTaxDrag' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('workerJobKey' in result.value).toBe(false);
    expect('channelName' in result.value).toBe(false);
    expect('targetWeights' in result.value.pendingOrderVisibility.fundStatuses[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.liveLeaderboard.rows[0]).toBe(false);
    expect('ledgerDrafts' in result.value.classAggregateAnalytics).toBe(false);
  });

  it('returns source-tagged pending-order and control errors', () => {
    const result = buildInstructorDashboardCurrentTurnSnapshot({
      ...defaultInput,
      classId: '   ',
      triggerMode: 'live',
      pendingOrders: [{ fundId: 'fund-001', monthIndex: 5, status: 'pending' }],
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'pending_order_visibility', code: 'invalid_class_id' }),
        expect.objectContaining({ source: 'pending_order_visibility', code: 'invalid_order_month', fundId: 'fund-001' }),
        expect.objectContaining({ source: 'live_month_advance_control', code: 'invalid_class_id' }),
        expect.objectContaining({ source: 'live_month_advance_control', code: 'invalid_trigger_mode' }),
      ]),
    );
  });

  it('returns source-tagged child section errors after pending-order status composition succeeds', () => {
    expect(
      errorSourcesFor({
        ...defaultInput,
        funds: [{ ...defaultFunds[0], studentDisplayName: '   ', holdings: { Base: 70, Core: 20, Apex: 20 } }],
        pendingOrders: [{ fundId: 'fund-001', monthIndex: 4, status: 'pending' }],
      }),
    ).toEqual(expect.arrayContaining(['live_leaderboard', 'god_mode_portfolio_visibility']));
  });
});
