import { describe, expect, it } from 'vitest';

import {
  createInstructorPendingOrderVisibilityQueryDescriptor,
  createInstructorPendingOrderVisibilityQueryResultEnvelope,
  createInstructorPendingOrderVisibilityQueryResultValidationFailureEnvelope,
  createInstructorPendingOrderVisibilitySnapshot,
} from './pending-order-visibility';

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

describe('createInstructorPendingOrderVisibilityQueryDescriptor', () => {
  it('creates a server-query descriptor for scoped instructor pending-order visibility', () => {
    const result = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 4,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'instructor_pending_order_visibility_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:4:instructor-pending-order-visibility-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_instructor_pending_order_visibility',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
      },
    });
  });

  it('keeps the descriptor free of snapshots, order details, and provider clients', () => {
    const result = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('instructor_scoped_class');
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
  });

  it('rejects invalid descriptor scope inputs', () => {
    const result = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: ' ',
      currentMonthIndex: 1.5,
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_current_month_index', message: 'Current month index must be a non-negative integer.' },
      ],
    });
  });
});

describe('createInstructorPendingOrderVisibilityQueryResultEnvelope', () => {
  it('wraps an already-authorized pending-order visibility snapshot for the descriptor scope', () => {
    const descriptor = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorPendingOrderVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorPendingOrderVisibilityQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_pending_order_visibility_query_result',
        queryResultKey: 'class:class-001:month:4:instructor-pending-order-visibility-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:4:instructor-pending-order-visibility-query',
        queryName: 'get_instructor_pending_order_visibility',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        snapshot: snapshot.value,
      },
    });
  });

  it('keeps the query result envelope scoped to status-only instructor payloads', () => {
    const descriptor = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorPendingOrderVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorPendingOrderVisibilityQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: snapshot.value,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('instructor_scoped_class');
    expect(result.value.currentTurnOnly).toBe(true);
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(result.value.snapshot.fundStatuses).toEqual([
      { fundId: 'fund-001', orderStatus: 'pending' },
      { fundId: 'fund-002', orderStatus: 'missing' },
      { fundId: 'fund-003', orderStatus: 'pending' },
    ]);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('targetWeights' in result.value.snapshot.fundStatuses[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.snapshot.fundStatuses[0]).toBe(false);
  });

  it('rejects missing or mismatched pending-order visibility query results', () => {
    const descriptor = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorPendingOrderVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorPendingOrderVisibilityQueryResultEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_pending_order_visibility_snapshot',
          message: 'Instructor pending-order visibility query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createInstructorPendingOrderVisibilityQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: {
          ...snapshot.value,
          classId: 'class-999',
          monthIndex: 5,
        },
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'mismatched_class_id',
          message: 'Instructor pending-order visibility query result class must match the descriptor class.',
        },
        {
          code: 'mismatched_current_month_index',
          message: 'Instructor pending-order visibility query result month must match the descriptor current month.',
        },
      ],
    });
  });

  it('creates a validation failure envelope for an invalid pending-order visibility query result', () => {
    const descriptor = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createInstructorPendingOrderVisibilityQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_pending_order_visibility_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:4:instructor-pending-order-visibility-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:4:instructor-pending-order-visibility-query',
        queryName: 'get_instructor_pending_order_visibility',
        requiredScope: 'instructor_scoped_class',
        classId: 'class-001',
        currentMonthIndex: 4,
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_pending_order_visibility_snapshot',
            message: 'Instructor pending-order visibility query result envelopes require the already-authorized snapshot.',
          },
        ],
      },
    });
  });

  it('keeps validation failures free of snapshots, database rows, and provider clients', () => {
    const descriptor = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorPendingOrderVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createInstructorPendingOrderVisibilityQueryResultValidationFailureEnvelope({
      descriptor: descriptor.value,
      snapshot: {
        ...snapshot.value,
        classId: 'class-999',
      },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect(result.value.validationErrors).toEqual([
      {
        code: 'mismatched_class_id',
        message: 'Instructor pending-order visibility query result class must match the descriptor class.',
      },
    ]);
    expect(result.value.includeTargetWeights).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeEstimatedTaxDrag).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for a valid pending-order visibility query result', () => {
    const descriptor = createInstructorPendingOrderVisibilityQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 4,
    });
    const snapshot = createInstructorPendingOrderVisibilitySnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createInstructorPendingOrderVisibilityQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor pending-order visibility query result.',
        },
      ],
    });
  });
});

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
