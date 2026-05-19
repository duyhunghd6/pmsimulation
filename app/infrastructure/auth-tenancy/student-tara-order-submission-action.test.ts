import { describe, expect, it } from 'vitest';

import {
  executeStudentTaraOrderSubmissionAction,
  type StudentTaraOrderSubmissionActionStore,
} from './student-tara-order-submission-action';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';

const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const subjectId = '11111111-1111-4111-8111-111111111111';
const currentMonthIndex = 2;

const studentSession: AuthTenancySession = { subjectId, role: 'student' };
const studentScope: ParsedAuthTenancyScope = { classId, fundId, monthIndex: currentMonthIndex };

function createRows(overrides: Partial<Awaited<ReturnType<StudentTaraOrderSubmissionActionStore['readStudentTaraOrderSubmissionRows']>>> = {}) {
  return {
    funds: [
      {
        id: fundId,
        class_id: classId,
        student_id: subjectId,
        current_aum: '50000000.00',
        sharpe_ratio: '1.20',
      },
    ],
    holdings: [
      {
        id: '30000000-0000-4000-8000-000000000001',
        class_id: classId,
        fund_id: fundId,
        tier: 'Base',
        allocation_weight_pct: '40.00',
      },
      {
        id: '30000000-0000-4000-8000-000000000002',
        class_id: classId,
        fund_id: fundId,
        tier: 'Core',
        allocation_weight_pct: '30.00',
      },
      {
        id: '30000000-0000-4000-8000-000000000003',
        class_id: classId,
        fund_id: fundId,
        tier: 'Apex',
        allocation_weight_pct: '30.00',
      },
    ],
    orders: [],
    trackedMetrics: [
      {
        id: '50000000-0000-4000-8000-000000000001',
        class_id: classId,
        fund_id: fundId,
        scope_type: 'fund',
        scope_id: fundId,
        month_index: currentMonthIndex,
        metric_id: 'apex_unrealized_gain_pct',
        display_label: 'Apex unrealized gain',
        metric_family: 'portfolio_state',
        value_numeric: '10.00',
        value_text: null,
        unit: 'percent',
        source_type: 'computed',
        source_note: 'Current unrealized gain for Apex tax preview.',
        convention_note: 'Percentage gain over cost basis.',
      },
    ],
    ...overrides,
  };
}

function createStore(options: {
  rows?: ReturnType<typeof createRows>;
  persistedRow?: unknown;
} = {}) {
  const writes: unknown[] = [];
  const store: StudentTaraOrderSubmissionActionStore = {
    async readStudentTaraOrderSubmissionRows() {
      return options.rows ?? createRows();
    },
    async createPendingStudentTaraOrder({ command }) {
      writes.push(command);
      return (
        options.persistedRow ?? {
          id: '40000000-0000-4000-8000-000000000001',
          class_id: classId,
          fund_id: fundId,
          month_index: currentMonthIndex,
          target_weights_json: command.targetWeights,
          estimated_tax_drag: String(command.estimatedTaxDrag.taxDragPct),
          rebalance_trigger: command.rebalanceTrigger,
          status: command.status,
        }
      );
    },
  };

  return { store, writes };
}

describe('executeStudentTaraOrderSubmissionAction', () => {
  it('validates a student-scoped submission, persists it, and returns the safe receipt envelope', async () => {
    const { store, writes } = createStore();

    const result = await executeStudentTaraOrderSubmissionAction({
      session: studentSession,
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 20 },
      store,
    });

    expect(result.ok).toBe(true);
    expect(writes).toHaveLength(1);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual({
      envelopeType: 'student_tara_order_server_action_result',
      resultKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:fund:dddddddd-dddd-4ddd-8ddd-dddddddddddd:month:2:tara-order-submission:server-action-command:result-envelope',
      commandKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:fund:dddddddd-dddd-4ddd-8ddd-dddddddddddd:month:2:tara-order-submission:server-action-command',
      commandBoundary: 'server_action_result_boundary',
      commandName: 'submit_student_tara_order',
      requiredScope: 'viewer_fund_in_class',
      classId,
      monthIndex: currentMonthIndex,
      viewerFundId: fundId,
      idempotencyKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:fund:dddddddd-dddd-4ddd-8ddd-dddddddddddd:month:2:tara-order-submission',
      resultStatus: 'accepted_pending_order',
      persistenceIntent: 'create_pending_tara_order',
      deliverySemantics: 'student_safe_order_receipt',
      receipt: {
        receiptType: 'student_tara_order_submission_receipt',
        submissionKey: 'class:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa:fund:dddddddd-dddd-4ddd-8ddd-dddddddddddd:month:2:tara-order-submission',
        classId,
        monthIndex: currentMonthIndex,
        viewerFundId: fundId,
        targetWeights: { Base: 50, Core: 30, Apex: 20 },
        estimatedTaxDrag: {
          apexReductionWeightPct: 10,
          apexSaleAmount: 5_000_000,
          taxableGain: 500_000,
          estimatedTaxPaid: 100_000,
          taxDragPct: 0.2,
        },
        rebalanceTrigger: 'student_tara_submission',
        status: 'pending',
      },
    });
    expect('databaseRows' in result.value).toBe(false);
    expect('authSession' in result.value).toBe(false);
    expect('workerPayload' in result.value).toBe(false);
  });

  it('blocks non-student sessions before reading or writing order rows', async () => {
    const { store, writes } = createStore();

    const result = await executeStudentTaraOrderSubmissionAction({
      session: { subjectId, role: 'instructor' },
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 20 },
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'invalid_role' } });
    expect(writes).toHaveLength(0);
  });

  it('returns a student-safe validation failure and skips persistence for invalid target weights', async () => {
    const { store, writes } = createStore();

    const result = await executeStudentTaraOrderSubmissionAction({
      session: studentSession,
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 19.9 },
      store,
    });

    expect(result.ok).toBe(false);
    expect(writes).toHaveLength(0);

    if (result.ok) {
      return;
    }

    expect(result.failure.code).toBe('invalid_submission');
    expect(result.safeFailure).toEqual(
      expect.objectContaining({
        envelopeType: 'student_tara_order_server_action_validation_failure',
        resultStatus: 'validation_failed',
        persistenceIntent: 'none_validation_failed',
        deliverySemantics: 'student_safe_validation_errors',
        classId,
        viewerFundId: fundId,
        monthIndex: currentMonthIndex,
      }),
    );
    expect(result.safeFailure?.validationErrors).toEqual([
      expect.objectContaining({ code: 'invalid_order_draft' }),
    ]);
  });

  it('rejects an existing pending order before creating a second pending row', async () => {
    const { store, writes } = createStore({
      rows: createRows({
        orders: [
          {
            id: '40000000-0000-4000-8000-000000000002',
            class_id: classId,
            fund_id: fundId,
            month_index: currentMonthIndex,
            target_weights_json: { Base: 45, Core: 35, Apex: 20 },
            estimated_tax_drag: '0.2',
            rebalance_trigger: 'student_tara_submission',
            status: 'pending',
          },
        ],
      }),
    });

    const result = await executeStudentTaraOrderSubmissionAction({
      session: studentSession,
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 20 },
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'pending_order_already_exists' } });
    expect(writes).toHaveLength(0);
  });

  it('parses the persisted order row before delivering the receipt', async () => {
    const { store } = createStore({
      persistedRow: {
        id: '40000000-0000-4000-8000-000000000003',
        class_id: classId,
        fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        month_index: currentMonthIndex,
        target_weights_json: { Base: 50, Core: 30, Apex: 20 },
        estimated_tax_drag: '0.2',
        rebalance_trigger: 'student_tara_submission',
        status: 'pending',
      },
    });

    const result = await executeStudentTaraOrderSubmissionAction({
      session: studentSession,
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 20 },
      store,
    });

    expect(result).toEqual({
      ok: false,
      failure: { code: 'persisted_order_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects persisted rows that do not match the validated command payload', async () => {
    const { store } = createStore({
      persistedRow: {
        id: '40000000-0000-4000-8000-000000000004',
        class_id: classId,
        fund_id: fundId,
        month_index: currentMonthIndex,
        target_weights_json: { Base: 50, Core: 30, Apex: 20 },
        estimated_tax_drag: '9.99',
        rebalance_trigger: 'student_tara_submission',
        status: 'pending',
      },
    });

    const result = await executeStudentTaraOrderSubmissionAction({
      session: studentSession,
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 20 },
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'persisted_order_mismatch' } });
  });

  it('fails closed if the row store fails before validation', async () => {
    const store: StudentTaraOrderSubmissionActionStore = {
      async readStudentTaraOrderSubmissionRows() {
        throw new Error('provider read detail');
      },
      async createPendingStudentTaraOrder() {
        throw new Error('not used');
      },
    };

    const result = await executeStudentTaraOrderSubmissionAction({
      session: studentSession,
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 20 },
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'row_store_failed' } });
  });

  it('fails closed if pending-order persistence fails', async () => {
    const store: StudentTaraOrderSubmissionActionStore = {
      async readStudentTaraOrderSubmissionRows() {
        return createRows();
      },
      async createPendingStudentTaraOrder() {
        throw new Error('provider write detail');
      },
    };

    const result = await executeStudentTaraOrderSubmissionAction({
      session: studentSession,
      scope: studentScope,
      targetWeights: { Base: 50, Core: 30, Apex: 20 },
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'pending_order_store_failed' } });
  });
});
