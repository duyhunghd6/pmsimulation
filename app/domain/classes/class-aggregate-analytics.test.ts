import { describe, expect, it } from 'vitest';

import { createInstructorClassAggregateAnalyticsSnapshot } from './class-aggregate-analytics';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  funds: [
    {
      fundId: 'fund-001',
      currentAum: 50_000_000,
      sharpeRatio: 1.1,
      orderStatus: 'pending' as const,
    },
    {
      fundId: 'fund-002',
      currentAum: 55_000_000,
      sharpeRatio: 0.7,
      orderStatus: 'missing' as const,
    },
    {
      fundId: 'fund-003',
      currentAum: 45_000_000,
      sharpeRatio: -0.3,
      orderStatus: 'pending' as const,
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createInstructorClassAggregateAnalyticsSnapshot>[0]): string[] {
  const result = createInstructorClassAggregateAnalyticsSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorClassAggregateAnalyticsSnapshot', () => {
  it('creates class-wide aggregate analytics from fund summaries', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 4,
        fundCount: 3,
        totalCurrentAum: 150_000_000,
        averageCurrentAum: 50_000_000,
        averageSharpeRatio: 0.5,
        pendingOrderCount: 2,
        missingOrderCount: 1,
        pendingOrderAum: 95_000_000,
        missingOrderAum: 55_000_000,
      },
    });
  });

  it('trims class and fund ids before aggregating', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot({
      classId: ' class-001 ',
      monthIndex: 1,
      funds: [
        {
          fundId: ' fund-001 ',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'pending',
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        fundCount: 1,
      }),
    });
  });

  it('does not expose per-fund rows, holdings, target weights, or tax drag details', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('rows' in result.value).toBe(false);
    expect('funds' in result.value).toBe(false);
    expect('holdings' in result.value).toBe(false);
    expect('targetWeights' in result.value).toBe(false);
    expect('estimatedTaxDrag' in result.value).toBe(false);
  });

  it('supports an empty class aggregate snapshot', () => {
    const result = createInstructorClassAggregateAnalyticsSnapshot({
      classId: 'class-001',
      monthIndex: 0,
      funds: [],
    });

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 0,
        fundCount: 0,
        totalCurrentAum: 0,
        averageCurrentAum: 0,
        averageSharpeRatio: null,
        pendingOrderCount: 0,
        missingOrderCount: 0,
        pendingOrderAum: 0,
        missingOrderAum: 0,
      },
    });
  });

  it('rejects invalid class and month inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid and duplicate fund ids', () => {
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
  });

  it('rejects invalid aggregate metric and order-status fields', () => {
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
