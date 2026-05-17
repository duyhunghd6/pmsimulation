import { describe, expect, it } from 'vitest';

import { createInstructorPendingOrderVisibilitySnapshot } from './pending-order-visibility';

const defaultInput = {
  classId: 'class-001',
  monthIndex: 4,
  enrolledFundIds: ['fund-001', 'fund-002', 'fund-003'],
  pendingOrders: [
    { fundId: 'fund-001', monthIndex: 4, status: 'pending' },
    { fundId: 'fund-003', monthIndex: 4, status: 'pending' },
  ],
};

function errorCodesFor(input: Parameters<typeof createInstructorPendingOrderVisibilitySnapshot>[0]): string[] {
  const result = createInstructorPendingOrderVisibilitySnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorPendingOrderVisibilitySnapshot', () => {
  it('creates a pending-order snapshot for enrolled class funds', () => {
    const result = createInstructorPendingOrderVisibilitySnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 4,
        totalFundCount: 3,
        pendingOrderCount: 2,
        missingOrderCount: 1,
        fundStatuses: [
          { fundId: 'fund-001', orderStatus: 'pending' },
          { fundId: 'fund-002', orderStatus: 'missing' },
          { fundId: 'fund-003', orderStatus: 'pending' },
        ],
      },
    });
  });

  it('trims class ids, enrolled fund ids, and order fund ids before matching', () => {
    const result = createInstructorPendingOrderVisibilitySnapshot({
      classId: ' class-001 ',
      monthIndex: 4,
      enrolledFundIds: [' fund-001 ', 'fund-002'],
      pendingOrders: [{ fundId: ' fund-001 ', monthIndex: 4, status: 'pending' }],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        fundStatuses: [
          { fundId: 'fund-001', orderStatus: 'pending' },
          { fundId: 'fund-002', orderStatus: 'missing' },
        ],
      }),
    });
  });

  it('does not expose target weights or tax drag details in the instructor snapshot', () => {
    const result = createInstructorPendingOrderVisibilitySnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('targetWeights' in result.value).toBe(false);
    expect('estimatedTaxDrag' in result.value).toBe(false);
    expect(result.value.fundStatuses.every((status) => !('targetWeights' in status))).toBe(true);
    expect(result.value.fundStatuses.every((status) => !('estimatedTaxDrag' in status))).toBe(true);
  });

  it('supports a class where no funds have submitted pending orders yet', () => {
    const result = createInstructorPendingOrderVisibilitySnapshot({
      ...defaultInput,
      pendingOrders: [],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        totalFundCount: 3,
        pendingOrderCount: 0,
        missingOrderCount: 3,
        fundStatuses: [
          { fundId: 'fund-001', orderStatus: 'missing' },
          { fundId: 'fund-002', orderStatus: 'missing' },
          { fundId: 'fund-003', orderStatus: 'missing' },
        ],
      }),
    });
  });

  it('rejects invalid class and snapshot month inputs', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid or duplicate enrolled fund ids', () => {
    expect(errorCodesFor({ ...defaultInput, enrolledFundIds: ['fund-001', '   '] })).toContain('invalid_fund_id');
    expect(errorCodesFor({ ...defaultInput, enrolledFundIds: ['fund-001', ' fund-001 '] })).toContain(
      'duplicate_fund_id',
    );
  });

  it('rejects pending orders outside the enrolled current-month pending set', () => {
    expect(
      errorCodesFor({
        ...defaultInput,
        pendingOrders: [{ fundId: 'fund-001', monthIndex: 5, status: 'pending' }],
      }),
    ).toContain('invalid_order_month');
    expect(
      errorCodesFor({
        ...defaultInput,
        pendingOrders: [{ fundId: 'fund-001', monthIndex: 4, status: 'processed' }],
      }),
    ).toContain('invalid_order_status');
    expect(
      errorCodesFor({
        ...defaultInput,
        pendingOrders: [{ fundId: 'fund-999', monthIndex: 4, status: 'pending' }],
      }),
    ).toContain('unknown_order_fund');
    expect(
      errorCodesFor({
        ...defaultInput,
        pendingOrders: [
          { fundId: 'fund-001', monthIndex: 4, status: 'pending' },
          { fundId: ' fund-001 ', monthIndex: 4, status: 'pending' },
        ],
      }),
    ).toContain('duplicate_order_fund');
  });
});
