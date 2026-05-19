import { describe, expect, it } from 'vitest';

import {
  executeInstructorGodModePortfolioVisibilityQuery,
  type InstructorGodModePortfolioVisibilityQueryRowReader,
} from './instructor-god-mode-portfolio-visibility-query';

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
    student_display_name: 'Bao Tran',
    current_aum: '51000000.00',
    sharpe_ratio: '1.1500',
  },
  {
    id: secondFundId,
    class_id: classId,
    student_display_name: 'An Nguyen',
    current_aum: '54000000.00',
    sharpe_ratio: '0.9000',
  },
];

const holdingRows = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    fund_id: fundId,
    class_id: classId,
    tier: 'Base',
    allocation_weight_pct: '30.0000',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    fund_id: fundId,
    class_id: classId,
    tier: 'Core',
    allocation_weight_pct: '45.0000',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    fund_id: fundId,
    class_id: classId,
    tier: 'Apex',
    allocation_weight_pct: '25.0000',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    fund_id: secondFundId,
    class_id: classId,
    tier: 'Base',
    allocation_weight_pct: '40.0000',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    fund_id: secondFundId,
    class_id: classId,
    tier: 'Core',
    allocation_weight_pct: '40.0000',
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    fund_id: secondFundId,
    class_id: classId,
    tier: 'Apex',
    allocation_weight_pct: '20.0000',
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
  rows: Partial<Awaited<ReturnType<InstructorGodModePortfolioVisibilityQueryRowReader['readInstructorGodModePortfolioVisibilityRows']>>> = {},
): InstructorGodModePortfolioVisibilityQueryRowReader {
  return {
    async readInstructorGodModePortfolioVisibilityRows() {
      return {
        funds: rows.funds ?? fundRows,
        holdings: rows.holdings ?? holdingRows,
        orders: rows.orders ?? [pendingOrderRow],
      };
    },
  };
}

describe('executeInstructorGodModePortfolioVisibilityQuery', () => {
  it('returns a privileged instructor God Mode holdings envelope for a scoped class', async () => {
    const result = await executeInstructorGodModePortfolioVisibilityQuery({
      session: instructorSession,
      scope,
      rowReader: rowReader(),
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_god_mode_portfolio_visibility_query_result',
        queryResultKey:
          'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:month:1:instructor-god-mode-portfolio-visibility-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:month:1:instructor-god-mode-portfolio-visibility-query',
        queryName: 'get_instructor_god_mode_portfolio_visibility',
        requiredScope: 'instructor_scoped_class',
        classId,
        currentMonthIndex: 1,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeStudentExactHoldingsForInstructor: true,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeProviderPayload: false,
        snapshot: {
          classId,
          monthIndex: 1,
          fundCount: 2,
          pendingOrderCount: 1,
          missingOrderCount: 1,
          rows: [
            {
              fundId: secondFundId,
              studentDisplayName: 'An Nguyen',
              currentAum: 54000000,
              sharpeRatio: 0.9,
              orderStatus: 'missing',
              holdings: [
                { tier: 'Base', allocationWeightPct: 40 },
                { tier: 'Core', allocationWeightPct: 40 },
                { tier: 'Apex', allocationWeightPct: 20 },
              ],
            },
            {
              fundId,
              studentDisplayName: 'Bao Tran',
              currentAum: 51000000,
              sharpeRatio: 1.15,
              orderStatus: 'pending',
              holdings: [
                { tier: 'Base', allocationWeightPct: 30 },
                { tier: 'Core', allocationWeightPct: 45 },
                { tier: 'Apex', allocationWeightPct: 25 },
              ],
            },
          ],
        },
      },
    });

    if (!result.ok) {
      return;
    }
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('targetWeights' in result.value.snapshot.rows[0]).toBe(false);
    expect('estimatedTaxDrag' in result.value.snapshot.rows[0]).toBe(false);
    expect('orderDetails' in result.value.snapshot.rows[0]).toBe(false);
  });

  it('rejects non-instructor sessions before reading rows', async () => {
    let readCount = 0;
    const reader: InstructorGodModePortfolioVisibilityQueryRowReader = {
      async readInstructorGodModePortfolioVisibilityRows() {
        readCount += 1;
        return { funds: fundRows, holdings: holdingRows, orders: [pendingOrderRow] };
      },
    };

    await expect(executeInstructorGodModePortfolioVisibilityQuery({ session: studentSession, scope, rowReader: reader })).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
    expect(readCount).toBe(0);
  });

  it('requires a current-month scope before reading rows', async () => {
    let readCount = 0;
    const reader: InstructorGodModePortfolioVisibilityQueryRowReader = {
      async readInstructorGodModePortfolioVisibilityRows() {
        readCount += 1;
        return { funds: fundRows, holdings: holdingRows, orders: [pendingOrderRow] };
      },
    };

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({ session: instructorSession, scope: { classId }, rowReader: reader }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_month_scope' },
    });
    expect(readCount).toBe(0);
  });

  it('fails closed when the row reader fails before result delivery', async () => {
    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: {
          async readInstructorGodModePortfolioVisibilityRows() {
            throw new Error('provider leaked detail');
          },
        },
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'row_reader_failed' },
    });
  });

  it('rejects cross-class or malformed fund rows before result delivery', async () => {
    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ funds: [{ ...fundRows[0], class_id: otherClassId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'fund_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ funds: [{ ...fundRows[0], student_display_name: ' ' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'fund_row_rejected', rowFailureCode: 'invalid_display_name' },
    });
  });

  it('rejects cross-class, unknown-fund, or duplicate holding rows before result delivery', async () => {
    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ holdings: [{ ...holdingRows[0], class_id: otherClassId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'holding_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ holdings: [{ ...holdingRows[0], fund_id: '99999999-9999-4999-8999-999999999999' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'unknown_holding_fund', fundId: '99999999-9999-4999-8999-999999999999' },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({
          holdings: [holdingRows[0], { ...holdingRows[0], id: '10000000-0000-4000-8000-000000000099' }],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'duplicate_holding_tier', fundId, tier: 'Base' },
    });
  });

  it('rejects cross-class, future-month, duplicate, unknown, or processed order rows before result delivery', async () => {
    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, class_id: otherClassId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, month_index: 2 }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [pendingOrderRow, { ...pendingOrderRow, id: '70000000-0000-4000-8000-000000000002' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'duplicate_order_fund', fundId },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, fund_id: '99999999-9999-4999-8999-999999999999' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'unknown_order_fund', fundId: '99999999-9999-4999-8999-999999999999' },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, status: 'processed' }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_order_status', fundId },
    });
  });

  it('rejects incomplete or invalid current holding allocations before result delivery', async () => {
    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ holdings: holdingRows.filter((row) => !(row.fund_id === fundId && row.tier === 'Apex')) }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: {
        code: 'invalid_snapshot',
        validationErrors: [
          {
            code: 'missing_tier',
            message: 'Apex allocation is required.',
            fundId,
            source: 'holdings',
            tier: 'Apex',
          },
          {
            code: 'total_must_equal_100',
            message: 'TARA target allocations must total exactly 100.0%.',
            fundId,
            source: 'holdings',
            total: 75,
          },
        ],
      },
    });

    await expect(
      executeInstructorGodModePortfolioVisibilityQuery({
        session: instructorSession,
        scope,
        rowReader: rowReader({ holdings: holdingRows.map((row) => (row.fund_id === fundId && row.tier === 'Apex' ? { ...row, allocation_weight_pct: '35.0000' } : row)) }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: {
        code: 'invalid_snapshot',
        validationErrors: [
          {
            code: 'total_must_equal_100',
            message: 'TARA target allocations must total exactly 100.0%.',
            fundId,
            source: 'holdings',
            total: 110,
          },
        ],
      },
    });
  });
});
