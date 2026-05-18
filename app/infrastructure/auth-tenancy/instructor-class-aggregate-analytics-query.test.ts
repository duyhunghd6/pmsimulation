import { describe, expect, it } from 'vitest';

import {
  executeInstructorClassAggregateAnalyticsQuery,
  type InstructorClassAggregateAnalyticsQueryRowReader,
} from './instructor-class-aggregate-analytics-query';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherClassId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const secondFundId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const thirdFundId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const scope = { classId, monthIndex: 1 };

const fundRows = [
  {
    id: fundId,
    class_id: classId,
    current_aum: '51000000.00',
    sharpe_ratio: '1.1500',
  },
  {
    id: secondFundId,
    class_id: classId,
    current_aum: '54000000.00',
    sharpe_ratio: '0.9000',
  },
  {
    id: thirdFundId,
    class_id: classId,
    current_aum: '45000000.00',
    sharpe_ratio: '-0.3000',
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
  rows: Partial<Awaited<ReturnType<InstructorClassAggregateAnalyticsQueryRowReader['readInstructorClassAggregateAnalyticsRows']>>> = {},
): InstructorClassAggregateAnalyticsQueryRowReader {
  return {
    async readInstructorClassAggregateAnalyticsRows() {
      return {
        funds: rows.funds ?? fundRows,
        orders: rows.orders ?? [pendingOrderRow],
      };
    },
  };
}

describe('executeInstructorClassAggregateAnalyticsQuery', () => {
  it('returns an aggregate-only envelope for an instructor-scoped class', async () => {
    const result = await executeInstructorClassAggregateAnalyticsQuery({
      session: instructorSession,
      scope,
      rowReader: rowReader(),
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_class_aggregate_analytics_query_result',
        queryResultKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:month:1:instructor-class-aggregate-analytics-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:month:1:instructor-class-aggregate-analytics-query',
        queryName: 'get_instructor_class_aggregate_analytics',
        requiredScope: 'instructor_scoped_class',
        classId,
        currentMonthIndex: 1,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includePerFundRows: false,
        includeHoldings: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        snapshot: {
          classId,
          monthIndex: 1,
          fundCount: 3,
          totalCurrentAum: 150000000,
          averageCurrentAum: 50000000,
          averageSharpeRatio: 0.5833333333333333,
          pendingOrderCount: 1,
          missingOrderCount: 2,
          pendingOrderAum: 51000000,
          missingOrderAum: 99000000,
        },
      },
    });

    if (!result.ok) {
      return;
    }
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('funds' in result.value.snapshot).toBe(false);
    expect('holdings' in result.value.snapshot).toBe(false);
    expect('targetWeights' in result.value.snapshot).toBe(false);
    expect('estimatedTaxDrag' in result.value.snapshot).toBe(false);
  });

  it('rejects non-instructor sessions before reading rows', async () => {
    let readCount = 0;
    const reader: InstructorClassAggregateAnalyticsQueryRowReader = {
      async readInstructorClassAggregateAnalyticsRows() {
        readCount += 1;
        return { funds: fundRows, orders: [pendingOrderRow] };
      },
    };

    await expect(executeInstructorClassAggregateAnalyticsQuery({ session: studentSession, scope, rowReader: reader })).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
    expect(readCount).toBe(0);
  });

  it('requires a current-month scope before reading rows', async () => {
    let readCount = 0;
    const reader: InstructorClassAggregateAnalyticsQueryRowReader = {
      async readInstructorClassAggregateAnalyticsRows() {
        readCount += 1;
        return { funds: fundRows, orders: [pendingOrderRow] };
      },
    };

    await expect(
      executeInstructorClassAggregateAnalyticsQuery({ session: instructorSession, scope: { classId }, rowReader: reader }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_month_scope' },
    });
    expect(readCount).toBe(0);
  });

  it('rejects cross-class or malformed fund rows before result delivery', async () => {
    await expect(
      executeInstructorClassAggregateAnalyticsQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ funds: [{ ...fundRows[0], class_id: otherClassId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'fund_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorClassAggregateAnalyticsQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ funds: [{ ...fundRows[0], current_aum: '-1.00' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'fund_row_rejected', rowFailureCode: 'invalid_numeric_value' },
    });
  });

  it('rejects cross-class, future-month, duplicate, unknown, or processed order rows before result delivery', async () => {
    await expect(
      executeInstructorClassAggregateAnalyticsQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, class_id: otherClassId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorClassAggregateAnalyticsQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, month_index: 2 }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorClassAggregateAnalyticsQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({
          orders: [pendingOrderRow, { ...pendingOrderRow, id: '70000000-0000-4000-8000-000000000002' }],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'duplicate_order_fund', fundId },
    });

    await expect(
      executeInstructorClassAggregateAnalyticsQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, fund_id: '99999999-9999-4999-8999-999999999999' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'unknown_order_fund', fundId: '99999999-9999-4999-8999-999999999999' },
    });

    await expect(
      executeInstructorClassAggregateAnalyticsQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, status: 'processed' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_order_status', fundId },
    });
  });
});
