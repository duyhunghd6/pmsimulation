import { describe, expect, it } from 'vitest';

import { createInstructorLiveLeaderboardSnapshot } from './live-leaderboard';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  funds: [
    {
      fundId: 'fund-001',
      studentDisplayName: 'An Fund',
      currentAum: 51_000_000,
      sharpeRatio: 1.1,
      orderStatus: 'pending' as const,
    },
    {
      fundId: 'fund-002',
      studentDisplayName: 'Binh Fund',
      currentAum: 54_000_000,
      sharpeRatio: 0.8,
      orderStatus: 'missing' as const,
    },
    {
      fundId: 'fund-003',
      studentDisplayName: 'Chi Fund',
      currentAum: 54_000_000,
      sharpeRatio: 1.2,
      orderStatus: 'pending' as const,
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createInstructorLiveLeaderboardSnapshot>[0]): string[] {
  const result = createInstructorLiveLeaderboardSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorLiveLeaderboardSnapshot', () => {
  it('creates an instructor live leaderboard ranked by AUM and Sharpe ratio', () => {
    const result = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 4,
        rankedFundCount: 3,
        pendingOrderCount: 2,
        missingOrderCount: 1,
        rows: [
          {
            rank: 1,
            fundId: 'fund-003',
            studentDisplayName: 'Chi Fund',
            currentAum: 54_000_000,
            sharpeRatio: 1.2,
            orderStatus: 'pending',
          },
          {
            rank: 2,
            fundId: 'fund-002',
            studentDisplayName: 'Binh Fund',
            currentAum: 54_000_000,
            sharpeRatio: 0.8,
            orderStatus: 'missing',
          },
          {
            rank: 3,
            fundId: 'fund-001',
            studentDisplayName: 'An Fund',
            currentAum: 51_000_000,
            sharpeRatio: 1.1,
            orderStatus: 'pending',
          },
        ],
      },
    });
  });

  it('trims class ids, fund ids, and display names before ranking', () => {
    const result = createInstructorLiveLeaderboardSnapshot({
      classId: ' class-001 ',
      monthIndex: 4,
      funds: [
        {
          fundId: ' fund-002 ',
          studentDisplayName: ' Binh Fund ',
          currentAum: 54_000_000,
          sharpeRatio: 1.2,
          orderStatus: 'pending',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        rows: [
          expect.objectContaining({
            fundId: 'fund-002',
            studentDisplayName: 'Binh Fund',
          }),
        ],
      }),
    });
  });

  it('uses fund id as the final deterministic tie-breaker', () => {
    const result = createInstructorLiveLeaderboardSnapshot({
      classId: 'class-001',
      monthIndex: 4,
      funds: [
        {
          fundId: 'fund-b',
          studentDisplayName: 'B Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'pending',
        },
        {
          fundId: 'fund-a',
          studentDisplayName: 'A Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'missing',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        rows: [expect.objectContaining({ fundId: 'fund-a' }), expect.objectContaining({ fundId: 'fund-b' })],
      }),
    });
  });

  it('does not expose holdings, target weights, or tax drag details in leaderboard rows', () => {
    const result = createInstructorLiveLeaderboardSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    for (const row of result.value.rows) {
      expect('holdings' in row).toBe(false);
      expect('targetWeights' in row).toBe(false);
      expect('estimatedTaxDrag' in row).toBe(false);
    }
  });

  it('supports an empty class leaderboard', () => {
    const result = createInstructorLiveLeaderboardSnapshot({
      classId: 'class-001',
      monthIndex: 0,
      funds: [],
    });

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 0,
        rankedFundCount: 0,
        pendingOrderCount: 0,
        missingOrderCount: 0,
        rows: [],
      },
    });
  });

  it('rejects invalid class and month inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid fund identity fields', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], fundId: '   ' }],
      }),
    ).toContain('invalid_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [defaultInput.funds[0], { ...defaultInput.funds[1], fundId: ' fund-001 ' }],
      }),
    ).toContain('duplicate_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], studentDisplayName: '   ' }],
      }),
    ).toContain('invalid_student_display_name');
  });

  it('rejects invalid leaderboard metric and order-status fields', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], currentAum: -1 }],
      }),
    ).toContain('invalid_current_aum');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], currentAum: Number.NaN }],
      }),
    ).toContain('invalid_current_aum');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], sharpeRatio: Number.POSITIVE_INFINITY }],
      }),
    ).toContain('invalid_sharpe_ratio');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], orderStatus: 'processed' as 'pending' }],
      }),
    ).toContain('invalid_order_status');
  });
});
