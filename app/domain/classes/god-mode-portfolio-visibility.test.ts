import { describe, expect, it } from 'vitest';

import { createInstructorGodModePortfolioVisibilitySnapshot } from './god-mode-portfolio-visibility';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 5,
  funds: [
    {
      fundId: 'fund-002',
      studentDisplayName: 'Bao Tran',
      currentAum: 54_000_000,
      sharpeRatio: 1.2,
      orderStatus: 'missing' as const,
      holdings: {
        Base: 20,
        Core: 50,
        Apex: 30,
      },
    },
    {
      fundId: 'fund-001',
      studentDisplayName: 'An Nguyen',
      currentAum: 51_000_000,
      sharpeRatio: 0.8,
      orderStatus: 'pending' as const,
      holdings: {
        Base: 35,
        Core: 45,
        Apex: 20,
      },
    },
  ],
};

function errorCodesFor(input: Parameters<typeof createInstructorGodModePortfolioVisibilitySnapshot>[0]): string[] {
  const result = createInstructorGodModePortfolioVisibilitySnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorGodModePortfolioVisibilitySnapshot', () => {
  it('creates instructor God Mode portfolio rows with exact current tier holdings', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 5,
        fundCount: 2,
        pendingOrderCount: 1,
        missingOrderCount: 1,
        rows: [
          {
            fundId: 'fund-001',
            studentDisplayName: 'An Nguyen',
            currentAum: 51_000_000,
            sharpeRatio: 0.8,
            orderStatus: 'pending',
            holdings: [
              { tier: 'Base', allocationWeightPct: 35 },
              { tier: 'Core', allocationWeightPct: 45 },
              { tier: 'Apex', allocationWeightPct: 20 },
            ],
          },
          {
            fundId: 'fund-002',
            studentDisplayName: 'Bao Tran',
            currentAum: 54_000_000,
            sharpeRatio: 1.2,
            orderStatus: 'missing',
            holdings: [
              { tier: 'Base', allocationWeightPct: 20 },
              { tier: 'Core', allocationWeightPct: 50 },
              { tier: 'Apex', allocationWeightPct: 30 },
            ],
          },
        ],
      },
    });
  });

  it('trims class ids, fund ids, and display names before building rows', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot({
      classId: ' class-001 ',
      monthIndex: 2,
      funds: [
        {
          fundId: ' fund-001 ',
          studentDisplayName: ' An Nguyen ',
          currentAum: 50_000_000,
          sharpeRatio: 1,
          orderStatus: 'pending',
          holdings: {
            Base: 40,
            Core: 40,
            Apex: 20,
          },
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        rows: [
          expect.objectContaining({
            fundId: 'fund-001',
            studentDisplayName: 'An Nguyen',
          }),
        ],
      }),
    });
  });

  it('does not expose target weights, tax drag details, order details, or ledger drafts', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('targetWeights' in result.value.rows[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.rows[0]).toBe(false);
    expect('orderDetails' in result.value.rows[0]).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
  });

  it('supports an empty class portfolio snapshot', () => {
    const result = createInstructorGodModePortfolioVisibilitySnapshot({
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

  it('rejects invalid identity fields', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], fundId: '   ' }],
      }),
    ).toContain('invalid_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [defaultInput.funds[0], { ...defaultInput.funds[1], fundId: ' fund-002 ' }],
      }),
    ).toContain('duplicate_fund_id');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], studentDisplayName: '   ' }],
      }),
    ).toContain('invalid_student_display_name');
  });

  it('rejects invalid portfolio metric and order-status fields', () => {
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

  it('rejects invalid current holding allocations', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 60 } }],
      }),
    ).toContain('missing_tier');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 40, Apex: 10, Gold: 10 } }],
      }),
    ).toContain('unknown_tier');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 40, Apex: 10 } }],
      }),
    ).toContain('total_must_equal_100');
    expect(
      errorCodesFor({
        ...defaultInput,
        funds: [{ ...defaultInput.funds[0], holdings: { Base: 40, Core: 40, Apex: -20 } }],
      }),
    ).toContain('invalid_weight');
  });
});
