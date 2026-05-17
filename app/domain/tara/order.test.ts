import { describe, expect, it } from 'vitest';

import { createStudentTaraOrderEntrySnapshot, createTaraOrderDraft } from './order';

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
