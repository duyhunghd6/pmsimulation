import { describe, expect, it } from 'vitest';

import { createStudentLeaderboardRankSnapshot } from './leaderboard-rank';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  viewerFundId: 'fund-001',
  funds: [
    {
      fundId: 'fund-001',
      studentDisplayName: 'An Fund',
      currentAum: 51_000_000,
      sharpeRatio: 1.1,
    },
    {
      fundId: 'fund-002',
      studentDisplayName: 'Binh Fund',
      currentAum: 54_000_000,
      sharpeRatio: 0.8,
    },
    {
      fundId: 'fund-003',
      studentDisplayName: 'Chi Fund',
      currentAum: 54_000_000,
      sharpeRatio: 1.2,
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createStudentLeaderboardRankSnapshot>[0]): string[] {
  const result = createStudentLeaderboardRankSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createStudentLeaderboardRankSnapshot', () => {
  it('creates a student leaderboard rank snapshot with the viewer rank marked', () => {
    const result = createStudentLeaderboardRankSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 4,
        viewerFundId: 'fund-001',
        viewerRank: 3,
        rankedFundCount: 3,
        rows: [
          {
            rank: 1,
            studentDisplayName: 'Chi Fund',
            currentAum: 54_000_000,
            sharpeRatio: 1.2,
            isViewerFund: false,
          },
          {
            rank: 2,
            studentDisplayName: 'Binh Fund',
            currentAum: 54_000_000,
            sharpeRatio: 0.8,
            isViewerFund: false,
          },
          {
            rank: 3,
            studentDisplayName: 'An Fund',
            currentAum: 51_000_000,
            sharpeRatio: 1.1,
            isViewerFund: true,
          },
        ],
      },
    });
  });

  it('trims class ids, fund ids, viewer fund ids, and display names before ranking', () => {
    const result = createStudentLeaderboardRankSnapshot({
      classId: ' class-001 ',
      monthIndex: 4,
      viewerFundId: ' fund-002 ',
      funds: [
        {
          fundId: ' fund-002 ',
          studentDisplayName: ' Binh Fund ',
          currentAum: 54_000_000,
          sharpeRatio: 1.2,
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        viewerFundId: 'fund-002',
        viewerRank: 1,
        rows: [
          expect.objectContaining({
            studentDisplayName: 'Binh Fund',
            isViewerFund: true,
          }),
        ],
      }),
    });
  });

  it('uses fund id as the final deterministic tie-breaker without exposing it in rows', () => {
    const result = createStudentLeaderboardRankSnapshot({
      classId: 'class-001',
      monthIndex: 4,
      viewerFundId: 'fund-b',
      funds: [
        {
          fundId: 'fund-b',
          studentDisplayName: 'B Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
        },
        {
          fundId: 'fund-a',
          studentDisplayName: 'A Fund',
          currentAum: 50_000_000,
          sharpeRatio: 1,
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        viewerRank: 2,
        rows: [
          expect.objectContaining({ studentDisplayName: 'A Fund', isViewerFund: false }),
          expect.objectContaining({ studentDisplayName: 'B Fund', isViewerFund: true }),
        ],
      }),
    });

    if (!result.ok) {
      return;
    }

    expect('fundId' in result.value.rows[0]).toBe(false);
  });

  it('does not expose holdings, target weights, order status, or tax drag details', () => {
    const result = createStudentLeaderboardRankSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    for (const row of result.value.rows) {
      expect('holdings' in row).toBe(false);
      expect('targetWeights' in row).toBe(false);
      expect('orderStatus' in row).toBe(false);
      expect('estimatedTaxDrag' in row).toBe(false);
    }
  });

  it('rejects invalid class, month, and viewer fund inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, viewerFundId: '   ' })).toContain('invalid_viewer_fund_id');
    expect(errorCodesFor({ ...defaultInput, viewerFundId: 'fund-404' })).toContain('viewer_fund_not_found');
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

  it('rejects invalid leaderboard metrics', () => {
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
  });
});
