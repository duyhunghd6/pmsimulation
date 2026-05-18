import { describe, expect, it } from 'vitest';

import {
  executeInstructorPendingOrderVisibilityQuery,
  type InstructorPendingOrderVisibilityQueryRowReader,
} from './instructor-pending-order-visibility-query';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherClassId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const secondFundId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const scope = { classId, monthIndex: 1 };

const fundRows = [
  {
    id: fundId,
    class_id: classId,
  },
  {
    id: secondFundId,
    class_id: classId,
  },
];

const pendingOrderRow = {
  id: '70000000-0000-4000-8000-000000000001',
  fund_id: fundId,
  class_id: classId,
  month_index: 1,
  status: 'pending',
};

function rowReader(
  rows: Partial<Awaited<ReturnType<InstructorPendingOrderVisibilityQueryRowReader['readInstructorPendingOrderVisibilityRows']>>> = {},
): InstructorPendingOrderVisibilityQueryRowReader {
  return {
    async readInstructorPendingOrderVisibilityRows() {
      return {
        funds: rows.funds ?? fundRows,
        orders: rows.orders ?? [pendingOrderRow],
      };
    },
  };
}

describe('executeInstructorPendingOrderVisibilityQuery', () => {
  it('returns a status-only pending-order visibility envelope for an instructor-scoped class', async () => {
    const result = await executeInstructorPendingOrderVisibilityQuery({
      session: instructorSession,
      scope,
      rowReader: rowReader(),
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_pending_order_visibility_query_result',
        queryResultKey:
          'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:month:1:instructor-pending-order-visibility-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:month:1:instructor-pending-order-visibility-query',
        queryName: 'get_instructor_pending_order_visibility',
        requiredScope: 'instructor_scoped_class',
        classId,
        currentMonthIndex: 1,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        snapshot: {
          classId,
          monthIndex: 1,
          totalFundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          fundStatuses: [
            { fundId, orderStatus: 'pending' },
            { fundId: secondFundId, orderStatus: 'missing' },
          ],
        },
      },
    });

    if (!result.ok) {
      return;
    }
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('targetWeights' in result.value.snapshot.fundStatuses[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.snapshot.fundStatuses[0]).toBe(false);
  });

  it('rejects non-instructor sessions before reading rows', async () => {
    let readCount = 0;
    const reader: InstructorPendingOrderVisibilityQueryRowReader = {
      async readInstructorPendingOrderVisibilityRows() {
        readCount += 1;
        return { funds: fundRows, orders: [pendingOrderRow] };
      },
    };

    await expect(
      executeInstructorPendingOrderVisibilityQuery({ session: studentSession, scope, rowReader: reader }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
    expect(readCount).toBe(0);
  });

  it('requires a current-month scope before reading rows', async () => {
    let readCount = 0;
    const reader: InstructorPendingOrderVisibilityQueryRowReader = {
      async readInstructorPendingOrderVisibilityRows() {
        readCount += 1;
        return { funds: fundRows, orders: [pendingOrderRow] };
      },
    };

    await expect(
      executeInstructorPendingOrderVisibilityQuery({ session: instructorSession, scope: { classId }, rowReader: reader }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_month_scope' },
    });
    expect(readCount).toBe(0);
  });

  it('rejects cross-class fund rows before result delivery', async () => {
    await expect(
      executeInstructorPendingOrderVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ funds: [{ ...fundRows[0], class_id: otherClassId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'fund_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects cross-class or future-month order rows before result delivery', async () => {
    await expect(
      executeInstructorPendingOrderVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, class_id: otherClassId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorPendingOrderVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, month_index: 2 }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects duplicate or non-pending order rows as invalid status-only snapshots', async () => {
    await expect(
      executeInstructorPendingOrderVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({
          orders: [pendingOrderRow, { ...pendingOrderRow, id: '70000000-0000-4000-8000-000000000002' }],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: {
        code: 'invalid_snapshot',
        validationErrors: [
          {
            code: 'duplicate_order_fund',
            message: 'Pending order visibility cannot include more than one order for the same fund.',
            fundId,
          },
        ],
      },
    });

    await expect(
      executeInstructorPendingOrderVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, status: 'processed' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: {
        code: 'invalid_snapshot',
        validationErrors: [
          {
            code: 'invalid_order_status',
            message: 'Pending order visibility only accepts pending TARA orders.',
            fundId,
          },
        ],
      },
    });
  });
});
