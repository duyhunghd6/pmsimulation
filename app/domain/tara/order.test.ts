import { describe, expect, it } from 'vitest';

import {
  createStudentTaraOrderEntryQueryDescriptor,
  createStudentTaraOrderEntryQueryResultEnvelope,
  createStudentTaraOrderEntryQueryResultValidationFailureEnvelope,
  createStudentTaraOrderEntrySnapshot,
  createStudentTaraOrderServerActionCommandDescriptor,
  createStudentTaraOrderServerActionResultEnvelope,
  createStudentTaraOrderServerActionValidationFailureEnvelope,
  createStudentTaraOrderSubmissionReceipt,
  createTaraOrderDraft,
} from './order';

const defaultInput = {
  fundId: 'fund-001',
  monthIndex: 2,
  currentAum: 50_000_000,
  currentWeights: { Base: 30, Core: 40, Apex: 30 },
  targetWeights: { Base: 40, Core: 45, Apex: 15 },
  apexUnrealizedGainPct: 10,
};

function errorCodesFor(input: Parameters<typeof createTaraOrderDraft>[0]): string[] {
  const result = createTaraOrderDraft(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createTaraOrderDraft', () => {
  it('creates a pending TARA order draft with validated target weights and estimated tax drag', () => {
    const result = createTaraOrderDraft(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual({
      fundId: 'fund-001',
      monthIndex: 2,
      targetWeights: { Base: 40, Core: 45, Apex: 15 },
      estimatedTaxDrag: {
        apexReductionWeightPct: 15,
        apexSaleAmount: 7_500_000,
        taxableGain: 750_000,
        estimatedTaxPaid: 150_000,
        taxDragPct: 0.3,
      },
      rebalanceTrigger: 'student_tara_submission',
      status: 'pending',
    });
  });

  it('keeps the draft pending when no Apex sale tax is due', () => {
    const result = createTaraOrderDraft({
      ...defaultInput,
      targetWeights: { Base: 25, Core: 40, Apex: 35 },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.status).toBe('pending');
    expect(result.value.estimatedTaxDrag.estimatedTaxPaid).toBe(0);
  });

  it('rejects blank fund ids', () => {
    expect(errorCodesFor({ ...defaultInput, fundId: '   ' })).toContain('invalid_fund_id');
  });

  it('rejects invalid month indexes', () => {
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid target allocations before creating a draft', () => {
    const result = createTaraOrderDraft({
      ...defaultInput,
      targetWeights: { Base: 40, Core: 45, Apex: 14.9 },
    });

    expect(result.ok).toBe(false);

    if (result.ok) {
      return;
    }

    expect(result.errors).toEqual([
      expect.objectContaining({
        code: 'invalid_tax_drag_preview',
        allocationErrors: [expect.objectContaining({ code: 'total_must_equal_100' })],
      }),
    ]);
  });

  it('rejects invalid tax-drag inputs before creating a draft', () => {
    expect(errorCodesFor({ ...defaultInput, currentAum: Number.NaN })).toContain('invalid_tax_drag_preview');
    expect(errorCodesFor({ ...defaultInput, apexUnrealizedGainPct: Number.POSITIVE_INFINITY })).toContain(
      'invalid_tax_drag_preview',
    );
  });

  it('trims fund ids before returning a draft', () => {
    const result = createTaraOrderDraft({ ...defaultInput, fundId: ' fund-001 ' });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({ fundId: 'fund-001' }),
    });
  });
});

describe('createStudentTaraOrderSubmissionReceipt', () => {
  const defaultReceiptInput = {
    classId: 'class-001',
    viewerFundId: 'fund-001',
    monthIndex: 2,
    currentAum: 50_000_000,
    currentWeights: { Base: 30, Core: 40, Apex: 30 },
    targetWeights: { Base: 40, Core: 45, Apex: 15 },
    apexUnrealizedGainPct: 10,
  };

  function receiptErrorCodesFor(input: Parameters<typeof createStudentTaraOrderSubmissionReceipt>[0]): string[] {
    const result = createStudentTaraOrderSubmissionReceipt(input);

    if (result.ok) {
      return [];
    }

    return result.errors.map((error) => error.code);
  }

  it('creates a student-safe receipt for an accepted pending TARA order submission', () => {
    const result = createStudentTaraOrderSubmissionReceipt(defaultReceiptInput);

    expect(result).toEqual({
      ok: true,
      value: {
        receiptType: 'student_tara_order_submission_receipt',
        submissionKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission',
        classId: 'class-001',
        monthIndex: 2,
        viewerFundId: 'fund-001',
        targetWeights: { Base: 40, Core: 45, Apex: 15 },
        estimatedTaxDrag: {
          apexReductionWeightPct: 15,
          apexSaleAmount: 7_500_000,
          taxableGain: 750_000,
          estimatedTaxPaid: 150_000,
          taxDragPct: 0.3,
        },
        rebalanceTrigger: 'student_tara_submission',
        status: 'pending',
      },
    });
  });

  it('trims class and viewer fund ids before creating the submission key', () => {
    const result = createStudentTaraOrderSubmissionReceipt({
      ...defaultReceiptInput,
      classId: ' class-001 ',
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        submissionKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission',
        classId: 'class-001',
        viewerFundId: 'fund-001',
      }),
    });
  });

  it('does not expose classroom order, persistence, auth, or processed execution payloads', () => {
    const result = createStudentTaraOrderSubmissionReceipt(defaultReceiptInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('otherFunds' in result.value).toBe(false);
    expect('classOrders' in result.value).toBe(false);
    expect('orderId' in result.value).toBe(false);
    expect('processedAt' in result.value).toBe(false);
    expect('authSession' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
  });

  it('rejects invalid submission scope and draft inputs', () => {
    expect(receiptErrorCodesFor({ ...defaultReceiptInput, classId: '   ' })).toContain('invalid_class_id');
    expect(receiptErrorCodesFor({ ...defaultReceiptInput, viewerFundId: '   ' })).toContain('invalid_viewer_fund_id');
    expect(receiptErrorCodesFor({ ...defaultReceiptInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(
      receiptErrorCodesFor({
        ...defaultReceiptInput,
        targetWeights: { Base: 40, Core: 45, Apex: 14.9 },
      }),
    ).toContain('invalid_order_draft');
    expect(receiptErrorCodesFor({ ...defaultReceiptInput, currentAum: Number.NaN })).toContain('invalid_order_draft');
  });
});

describe('createStudentTaraOrderServerActionCommandDescriptor', () => {
  const defaultReceiptInput = {
    classId: 'class-001',
    viewerFundId: 'fund-001',
    monthIndex: 2,
    currentAum: 50_000_000,
    currentWeights: { Base: 30, Core: 40, Apex: 30 },
    targetWeights: { Base: 40, Core: 45, Apex: 15 },
    apexUnrealizedGainPct: 10,
  };

  it('creates a server-action command descriptor from a validated student submission receipt', () => {
    const receiptResult = createStudentTaraOrderSubmissionReceipt(defaultReceiptInput);

    expect(receiptResult.ok).toBe(true);

    if (!receiptResult.ok) {
      return;
    }

    expect(createStudentTaraOrderServerActionCommandDescriptor(receiptResult.value)).toEqual({
      descriptorType: 'student_tara_order_server_action_command',
      commandKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission:server-action-command',
      commandBoundary: 'server_action_command_boundary',
      commandName: 'submit_student_tara_order',
      requiredScope: 'viewer_fund_in_class',
      classId: 'class-001',
      monthIndex: 2,
      viewerFundId: 'fund-001',
      idempotencyKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission',
      targetWeights: { Base: 40, Core: 45, Apex: 15 },
      estimatedTaxDrag: {
        apexReductionWeightPct: 15,
        apexSaleAmount: 7_500_000,
        taxableGain: 750_000,
        estimatedTaxPaid: 150_000,
        taxDragPct: 0.3,
      },
      rebalanceTrigger: 'student_tara_submission',
      status: 'pending',
      persistenceIntent: 'create_pending_tara_order',
    });
  });

  it('keeps the command descriptor scoped to the viewer fund without platform payloads', () => {
    const receiptResult = createStudentTaraOrderSubmissionReceipt(defaultReceiptInput);

    expect(receiptResult.ok).toBe(true);

    if (!receiptResult.ok) {
      return;
    }

    const descriptor = createStudentTaraOrderServerActionCommandDescriptor(receiptResult.value);

    expect(descriptor.requiredScope).toBe('viewer_fund_in_class');
    expect('authSession' in descriptor).toBe(false);
    expect('databaseRows' in descriptor).toBe(false);
    expect('supabaseClient' in descriptor).toBe(false);
    expect('serverActionResult' in descriptor).toBe(false);
    expect('workerPayload' in descriptor).toBe(false);
    expect('realtimePayload' in descriptor).toBe(false);
    expect('processedOrder' in descriptor).toBe(false);
  });
});

describe('createStudentTaraOrderServerActionResultEnvelope', () => {
  const defaultReceiptInput = {
    classId: 'class-001',
    viewerFundId: 'fund-001',
    monthIndex: 2,
    currentAum: 50_000_000,
    currentWeights: { Base: 30, Core: 40, Apex: 30 },
    targetWeights: { Base: 40, Core: 45, Apex: 15 },
    apexUnrealizedGainPct: 10,
  };

  function createDescriptor() {
    const receiptResult = createStudentTaraOrderSubmissionReceipt(defaultReceiptInput);

    expect(receiptResult.ok).toBe(true);

    if (!receiptResult.ok) {
      throw new Error('Expected a valid receipt.');
    }

    return createStudentTaraOrderServerActionCommandDescriptor(receiptResult.value);
  }

  it('creates a student-safe server-action result envelope from a command descriptor', () => {
    const envelope = createStudentTaraOrderServerActionResultEnvelope(createDescriptor());

    expect(envelope).toEqual({
      envelopeType: 'student_tara_order_server_action_result',
      resultKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission:server-action-command:result-envelope',
      commandKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission:server-action-command',
      commandBoundary: 'server_action_result_boundary',
      commandName: 'submit_student_tara_order',
      requiredScope: 'viewer_fund_in_class',
      classId: 'class-001',
      monthIndex: 2,
      viewerFundId: 'fund-001',
      idempotencyKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission',
      resultStatus: 'accepted_pending_order',
      persistenceIntent: 'create_pending_tara_order',
      deliverySemantics: 'student_safe_order_receipt',
      receipt: {
        receiptType: 'student_tara_order_submission_receipt',
        submissionKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission',
        classId: 'class-001',
        monthIndex: 2,
        viewerFundId: 'fund-001',
        targetWeights: { Base: 40, Core: 45, Apex: 15 },
        estimatedTaxDrag: {
          apexReductionWeightPct: 15,
          apexSaleAmount: 7_500_000,
          taxableGain: 750_000,
          estimatedTaxPaid: 150_000,
          taxDragPct: 0.3,
        },
        rebalanceTrigger: 'student_tara_submission',
        status: 'pending',
      },
    });
  });

  it('preserves command scope and excludes platform execution payloads', () => {
    const envelope = createStudentTaraOrderServerActionResultEnvelope(createDescriptor());

    expect(envelope.requiredScope).toBe('viewer_fund_in_class');
    expect(envelope.receipt.submissionKey).toBe(envelope.idempotencyKey);
    expect('authSession' in envelope).toBe(false);
    expect('databaseRows' in envelope).toBe(false);
    expect('orderId' in envelope).toBe(false);
    expect('serverActionExecution' in envelope).toBe(false);
    expect('workerPayload' in envelope).toBe(false);
    expect('realtimePayload' in envelope).toBe(false);
    expect('processedOrder' in envelope).toBe(false);
  });
});

describe('createStudentTaraOrderServerActionValidationFailureEnvelope', () => {
  const defaultReceiptInput = {
    classId: 'class-001',
    viewerFundId: 'fund-001',
    monthIndex: 2,
    currentAum: 50_000_000,
    currentWeights: { Base: 30, Core: 40, Apex: 30 },
    targetWeights: { Base: 40, Core: 45, Apex: 15 },
    apexUnrealizedGainPct: 10,
  };

  it('creates a student-safe validation failure envelope for invalid server-action input', () => {
    const result = createStudentTaraOrderServerActionValidationFailureEnvelope({
      ...defaultReceiptInput,
      targetWeights: { Base: 40, Core: 45, Apex: 14.9 },
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_tara_order_server_action_validation_failure',
        resultKey: 'class:class-001:fund:fund-001:month:2:tara-order-submission:validation-failure',
        commandBoundary: 'server_action_result_boundary',
        commandName: 'submit_student_tara_order',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        monthIndex: 2,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        persistenceIntent: 'none_validation_failed',
        deliverySemantics: 'student_safe_validation_errors',
        validationErrors: [
          expect.objectContaining({
            code: 'invalid_order_draft',
            allocationErrors: [expect.objectContaining({ code: 'total_must_equal_100' })],
          }),
        ],
      },
    });
  });

  it('uses deterministic fallback key parts when invalid scope cannot identify class, fund, or month', () => {
    const result = createStudentTaraOrderServerActionValidationFailureEnvelope({
      ...defaultReceiptInput,
      classId: '   ',
      viewerFundId: '   ',
      monthIndex: -1,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        resultKey: 'class:unknown-class:fund:unknown-fund:month:invalid-month:tara-order-submission:validation-failure',
        classId: null,
        monthIndex: null,
        viewerFundId: null,
        validationErrors: [
          expect.objectContaining({ code: 'invalid_class_id' }),
          expect.objectContaining({ code: 'invalid_month_index' }),
          expect.objectContaining({ code: 'invalid_viewer_fund_id' }),
          expect.objectContaining({ code: 'invalid_order_draft' }),
        ],
      }),
    });
  });

  it('does not create a failure envelope for a valid accepted submission', () => {
    const result = createStudentTaraOrderServerActionValidationFailureEnvelope(defaultReceiptInput);

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'submission_is_valid',
          message: 'Validation failure envelopes require an invalid student TARA order submission.',
        },
      ],
    });
  });

  it('excludes raw order payloads and platform execution details from validation failures', () => {
    const result = createStudentTaraOrderServerActionValidationFailureEnvelope({
      ...defaultReceiptInput,
      currentAum: Number.NaN,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect('targetWeights' in result.value).toBe(false);
    expect('currentWeights' in result.value).toBe(false);
    expect('estimatedTaxDrag' in result.value).toBe(false);
    expect('authSession' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('serverActionExecution' in result.value).toBe(false);
    expect('workerPayload' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
    expect('processedOrder' in result.value).toBe(false);
  });
});

describe('student TARA order-entry query boundary envelopes', () => {
  const defaultSnapshotInput = {
    classId: 'class-001',
    viewerFundId: 'fund-001',
    monthIndex: 2,
    currentAum: 50_000_000,
    currentWeights: { Base: 30, Core: 40, Apex: 30 },
    targetWeights: { Base: 40, Core: 45, Apex: 15 },
    apexUnrealizedGainPct: 10,
  };

  function createDescriptor() {
    const descriptorResult = createStudentTaraOrderEntryQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });

    expect(descriptorResult.ok).toBe(true);

    if (!descriptorResult.ok) {
      throw new Error('Expected a valid descriptor.');
    }

    return descriptorResult.value;
  }

  function createSnapshot() {
    const snapshotResult = createStudentTaraOrderEntrySnapshot(defaultSnapshotInput);

    expect(snapshotResult.ok).toBe(true);

    if (!snapshotResult.ok) {
      throw new Error('Expected a valid snapshot.');
    }

    return snapshotResult.value;
  }

  it('creates a server-query descriptor for the scoped order-entry surface', () => {
    expect(
      createStudentTaraOrderEntryQueryDescriptor({
        classId: ' class-001 ',
        currentMonthIndex: 2,
        viewerFundId: ' fund-001 ',
      }),
    ).toEqual({
      ok: true,
      value: {
        descriptorType: 'student_tara_order_entry_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:2:fund:fund-001:student-tara-order-entry-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_student_tara_order_entry',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 2,
        viewerFundId: 'fund-001',
        currentTurnOnly: true,
        includeOtherFundOrderData: false,
        includeClassroomOrderList: false,
        includeProviderPayload: false,
        requestedSurface: 'tara_order_entry',
      },
    });
  });

  it('rejects invalid student order-entry query descriptor scope inputs', () => {
    const result = createStudentTaraOrderEntryQueryDescriptor({
      classId: '   ',
      currentMonthIndex: -1,
      viewerFundId: '   ',
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_current_month_index', message: 'Current month index must be a non-negative integer.' },
        { code: 'invalid_viewer_fund_id', message: 'Viewer fund id is required.' },
      ],
    });
  });

  it('wraps an already-authorized order-entry snapshot when scope matches', () => {
    const envelope = createStudentTaraOrderEntryQueryResultEnvelope({
      descriptor: createDescriptor(),
      snapshot: createSnapshot(),
    });

    expect(envelope).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_tara_order_entry_query_result',
        queryResultKey: 'class:class-001:month:2:fund:fund-001:student-tara-order-entry-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:2:fund:fund-001:student-tara-order-entry-query',
        queryName: 'get_student_tara_order_entry',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 2,
        viewerFundId: 'fund-001',
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeOtherFundOrderData: false,
        includeClassroomOrderList: false,
        includeProviderPayload: false,
        snapshot: expect.objectContaining({
          classId: 'class-001',
          monthIndex: 2,
          viewerFundId: 'fund-001',
          status: 'pending',
        }),
      },
    });
  });

  it('rejects missing and mismatched order-entry query results', () => {
    const descriptor = createDescriptor();

    expect(createStudentTaraOrderEntryQueryResultEnvelope({ descriptor })).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_tara_order_entry_snapshot',
          message: 'Student TARA order-entry query result envelopes require the already-authorized snapshot.',
        },
      ],
    });

    expect(
      createStudentTaraOrderEntryQueryResultEnvelope({
        descriptor,
        snapshot: { ...createSnapshot(), classId: 'other-class', monthIndex: 3, viewerFundId: 'other-fund' },
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'mismatched_class_id',
          message: 'Student TARA order-entry query result class must match the descriptor class.',
        },
        {
          code: 'mismatched_current_month_index',
          message: 'Student TARA order-entry query result month must match the descriptor current month.',
        },
        {
          code: 'mismatched_viewer_fund_id',
          message: 'Student TARA order-entry query result viewer fund must match the descriptor viewer fund.',
        },
      ],
    });
  });

  it('creates student-safe validation failure envelopes without leaking order payloads', () => {
    const result = createStudentTaraOrderEntryQueryResultValidationFailureEnvelope({ descriptor: createDescriptor() });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_tara_order_entry_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:2:fund:fund-001:student-tara-order-entry-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:2:fund:fund-001:student-tara-order-entry-query',
        queryName: 'get_student_tara_order_entry',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 2,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeOtherFundOrderData: false,
        includeClassroomOrderList: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_tara_order_entry_snapshot',
            message: 'Student TARA order-entry query result envelopes require the already-authorized snapshot.',
          },
        ],
      },
    });

    if (!result.ok) {
      return;
    }

    expect('snapshot' in result.value).toBe(false);
    expect('targetWeights' in result.value).toBe(false);
    expect('currentWeights' in result.value).toBe(false);
    expect('estimatedTaxDrag' in result.value).toBe(false);
    expect('classOrders' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('providerClient' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for a valid query result', () => {
    expect(
      createStudentTaraOrderEntryQueryResultValidationFailureEnvelope({
        descriptor: createDescriptor(),
        snapshot: createSnapshot(),
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student TARA order-entry query result.',
        },
      ],
    });
  });
});

describe('createStudentTaraOrderEntrySnapshot', () => {
  const defaultSnapshotInput = {
    classId: 'class-001',
    viewerFundId: 'fund-001',
    monthIndex: 2,
    currentAum: 50_000_000,
    currentWeights: { Base: 30, Core: 40, Apex: 30 },
    targetWeights: { Base: 40, Core: 45, Apex: 15 },
    apexUnrealizedGainPct: 10,
  };

  function snapshotErrorCodesFor(input: Parameters<typeof createStudentTaraOrderEntrySnapshot>[0]): string[] {
    const result = createStudentTaraOrderEntrySnapshot(input);

    if (result.ok) {
      return [];
    }

    return result.errors.map((error) => error.code);
  }

  it('creates a student order-entry snapshot from the viewer fund draft inputs', () => {
    const result = createStudentTaraOrderEntrySnapshot(defaultSnapshotInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        monthIndex: 2,
        viewerFundId: 'fund-001',
        currentWeights: { Base: 30, Core: 40, Apex: 30 },
        targetWeights: { Base: 40, Core: 45, Apex: 15 },
        estimatedTaxDrag: {
          apexReductionWeightPct: 15,
          apexSaleAmount: 7_500_000,
          taxableGain: 750_000,
          estimatedTaxPaid: 150_000,
          taxDragPct: 0.3,
        },
        rebalanceTrigger: 'student_tara_submission',
        status: 'pending',
      },
    });
  });

  it('trims class and viewer fund ids before returning the snapshot', () => {
    const result = createStudentTaraOrderEntrySnapshot({
      ...defaultSnapshotInput,
      classId: ' class-001 ',
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        viewerFundId: 'fund-001',
      }),
    });
  });

  it('does not expose other fund, classroom order, or persistence payloads', () => {
    const result = createStudentTaraOrderEntrySnapshot(defaultSnapshotInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('otherFunds' in result.value).toBe(false);
    expect('classOrders' in result.value).toBe(false);
    expect('orderId' in result.value).toBe(false);
    expect('processedAt' in result.value).toBe(false);
  });

  it('rejects invalid student order-entry scope inputs', () => {
    expect(snapshotErrorCodesFor({ ...defaultSnapshotInput, classId: '   ' })).toContain('invalid_class_id');
    expect(snapshotErrorCodesFor({ ...defaultSnapshotInput, viewerFundId: '   ' })).toContain(
      'invalid_viewer_fund_id',
    );
    expect(snapshotErrorCodesFor({ ...defaultSnapshotInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(snapshotErrorCodesFor({ ...defaultSnapshotInput, monthIndex: 1.5 })).toContain('invalid_month_index');
  });

  it('rejects invalid current weights, target weights, and tax preview inputs', () => {
    expect(
      snapshotErrorCodesFor({
        ...defaultSnapshotInput,
        currentWeights: { Base: 30, Core: 40, Apex: 29.9 },
      }),
    ).toContain('invalid_order_draft');
    expect(
      snapshotErrorCodesFor({
        ...defaultSnapshotInput,
        targetWeights: { Base: 40, Core: 45, Apex: 14.9 },
      }),
    ).toContain('invalid_order_draft');
    expect(snapshotErrorCodesFor({ ...defaultSnapshotInput, currentAum: Number.NaN })).toContain('invalid_order_draft');
  });
});
