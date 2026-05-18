import { describe, expect, it } from 'vitest';

import {
  executeStudentTaraOrderEntryQuery,
  type StudentTaraOrderEntryQueryRowReader,
} from './student-tara-order-entry-query';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const otherFundId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const scope = { classId, fundId, monthIndex: 1 };

const fundRow = {
  id: fundId,
  class_id: classId,
  student_id: studentSession.subjectId,
  current_aum: '50000000.00',
  sharpe_ratio: '1.20',
};

const holdingRows = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    class_id: classId,
    fund_id: fundId,
    tier: 'Base',
    allocation_weight_pct: '40.00',
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    class_id: classId,
    fund_id: fundId,
    tier: 'Core',
    allocation_weight_pct: '30.00',
  },
  {
    id: '60000000-0000-4000-8000-000000000003',
    class_id: classId,
    fund_id: fundId,
    tier: 'Apex',
    allocation_weight_pct: '30.00',
  },
];

const pendingOrderRow = {
  id: '70000000-0000-4000-8000-000000000001',
  class_id: classId,
  fund_id: fundId,
  month_index: 1,
  target_weights_json: { Base: 50, Core: 30, Apex: 20 },
  estimated_tax_drag: '0.20',
  rebalance_trigger: 'student_tara_submission',
  status: 'pending',
};

const apexUnrealizedGainMetricRow = {
  id: '80000000-0000-4000-8000-000000000001',
  class_id: classId,
  fund_id: fundId,
  scope_type: 'fund',
  scope_id: fundId,
  month_index: 1,
  metric_id: 'apex_unrealized_gain_pct',
  display_label: 'Apex unrealized gain',
  metric_family: 'portfolio_state',
  value_numeric: '10.00',
  value_text: null,
  unit: 'percent',
  source_type: 'computed',
  source_note: 'Current unrealized gain for Apex tax preview.',
  convention_note: 'Percentage gain over cost basis.',
};

function rowReader(rows: {
  funds?: readonly unknown[];
  holdings?: readonly unknown[];
  orders?: readonly unknown[];
  trackedMetrics?: readonly unknown[];
}): StudentTaraOrderEntryQueryRowReader {
  return {
    async readStudentTaraOrderEntryRows() {
      return {
        funds: rows.funds ?? [fundRow],
        holdings: rows.holdings ?? holdingRows,
        orders: rows.orders ?? [pendingOrderRow],
        trackedMetrics: rows.trackedMetrics ?? [apexUnrealizedGainMetricRow],
      };
    },
  };
}

describe('executeStudentTaraOrderEntryQuery', () => {
  it('returns a student TARA order-entry query result envelope from parsed scoped rows', async () => {
    await expect(
      executeStudentTaraOrderEntryQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({}),
      }),
    ).resolves.toEqual({
      ok: true,
      value: {
        envelopeType: 'student_tara_order_entry_query_result',
        queryResultKey: `class:${classId}:month:1:fund:${fundId}:student-tara-order-entry-query:result-envelope`,
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: `class:${classId}:month:1:fund:${fundId}:student-tara-order-entry-query`,
        queryName: 'get_student_tara_order_entry',
        requiredScope: 'viewer_fund_in_class',
        classId,
        currentMonthIndex: 1,
        viewerFundId: fundId,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeOtherFundOrderData: false,
        includeClassroomOrderList: false,
        includeProviderPayload: false,
        snapshot: {
          classId,
          monthIndex: 1,
          viewerFundId: fundId,
          currentWeights: { Base: 40, Core: 30, Apex: 30 },
          targetWeights: { Base: 50, Core: 30, Apex: 20 },
          estimatedTaxDrag: {
            apexReductionWeightPct: 10,
            apexSaleAmount: 5000000,
            taxableGain: 500000,
            estimatedTaxPaid: 100000,
            taxDragPct: 0.2,
          },
          rebalanceTrigger: 'student_tara_submission',
          status: 'pending',
        },
      },
    });
  });

  it('defaults target weights to current weights when no pending order exists', async () => {
    await expect(
      executeStudentTaraOrderEntryQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ orders: [] }),
      }),
    ).resolves.toMatchObject({
      ok: true,
      value: {
        snapshot: {
          currentWeights: { Base: 40, Core: 30, Apex: 30 },
          targetWeights: { Base: 40, Core: 30, Apex: 30 },
          estimatedTaxDrag: {
            apexReductionWeightPct: 0,
            estimatedTaxPaid: 0,
            taxDragPct: 0,
          },
        },
      },
    });
  });

  it('rejects non-student sessions before reading rows', async () => {
    const reader: StudentTaraOrderEntryQueryRowReader = {
      async readStudentTaraOrderEntryRows() {
        throw new Error('rows should not be read for invalid roles');
      },
    };

    await expect(
      executeStudentTaraOrderEntryQuery({
        session: instructorSession,
        scope,
        rowReader: reader,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
  });

  it('rejects missing fund scope before reading rows', async () => {
    const reader: StudentTaraOrderEntryQueryRowReader = {
      async readStudentTaraOrderEntryRows() {
        throw new Error('rows should not be read without a fund scope');
      },
    };

    await expect(
      executeStudentTaraOrderEntryQuery({
        session: studentSession,
        scope: { classId, monthIndex: 1 },
        rowReader: reader,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_fund_scope' },
    });
  });

  it('rejects other-fund order rows before result delivery', async () => {
    await expect(
      executeStudentTaraOrderEntryQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ orders: [{ ...pendingOrderRow, fund_id: otherFundId }] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects duplicate pending orders before snapshot construction', async () => {
    await expect(
      executeStudentTaraOrderEntryQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({
          orders: [pendingOrderRow, { ...pendingOrderRow, id: '70000000-0000-4000-8000-000000000002' }],
        }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'duplicate_pending_order' },
    });
  });

  it('rejects missing Apex unrealized gain metric rows without returning database rows', async () => {
    await expect(
      executeStudentTaraOrderEntryQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ trackedMetrics: [] }),
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_apex_unrealized_gain_pct' },
    });
  });
});
