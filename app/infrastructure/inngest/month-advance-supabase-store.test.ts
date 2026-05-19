import { describe, expect, it } from 'vitest';

import type { ClassMonthAdvanceProcessingRecord } from '../../domain/classes/month-advancement';
import { createSupabaseMonthAdvanceClassMonthProcessingStore } from './month-advance-supabase-store';

type TableRows = Record<string, readonly unknown[]>;

type SelectCall = {
  table: string;
  columns: string;
  filters: Record<string, string | number>;
};

type UpsertCall = {
  table: string;
  rows: readonly Record<string, unknown>[];
  options: { onConflict: string };
};

type UpdateCall = {
  table: string;
  row: Record<string, unknown>;
  filters: Record<string, string | number>;
};

function createSupabaseClientFixture(rowsByTable: TableRows, failingTable?: string) {
  const selectCalls: SelectCall[] = [];
  const upsertCalls: UpsertCall[] = [];
  const updateCalls: UpdateCall[] = [];

  return {
    client: {
      from(table: string) {
        return {
          select(columns: string) {
            return {
              match(filters: Record<string, string | number>) {
                selectCalls.push({ table, columns, filters });
                return this;
              },
              then<TResult1 = { data: readonly unknown[] | null; error: unknown | null }, TResult2 = never>(
                onfulfilled?: ((value: { data: readonly unknown[] | null; error: unknown | null }) => TResult1 | PromiseLike<TResult1>) | null,
                onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
              ) {
                const result =
                  table === failingTable
                    ? { data: null, error: new Error('provider failure') }
                    : { data: rowsByTable[table] ?? [], error: null };
                return Promise.resolve(result).then(onfulfilled, onrejected);
              },
            };
          },
          upsert(rows: readonly Record<string, unknown>[], options: { onConflict: string }) {
            upsertCalls.push({ table, rows, options });
            return Promise.resolve({ data: rows, error: table === failingTable ? new Error('provider failure') : null });
          },
          update(row: Record<string, unknown>) {
            return {
              match(filters: Record<string, string | number>) {
                updateCalls.push({ table, row, filters });
                return Promise.resolve({ data: row, error: table === failingTable ? new Error('provider failure') : null });
              },
            };
          },
        };
      },
    },
    selectCalls,
    upsertCalls,
    updateCalls,
  };
}

const processingRequest = {
  classId: 'class-001',
  triggerMode: 'manual' as const,
  triggerSource: 'live' as const,
  currentMonthIndex: 3,
  nextMonthIndex: 4,
  totalMonths: 12,
  idempotencyKey: 'class:class-001:advance:3->4',
  processingPath: 'shared_month_advance' as const,
};

const processingRecord: ClassMonthAdvanceProcessingRecord = {
  classId: 'class-001',
  triggerMode: 'manual',
  triggerSource: 'live',
  processedMonthIndex: 3,
  advancedToMonthIndex: 4,
  totalMonths: 12,
  idempotencyKey: 'class:class-001:advance:3->4',
  processingPath: 'shared_month_advance',
  processedFundCount: 2,
  fundProcessingKeys: ['class:class-001:fund:fund-001:month:3:processing', 'class:class-001:fund:fund-002:month:3:processing'],
  ledgerDrafts: [
    {
      fundId: 'fund-001',
      monthIndex: 3,
      startingAum: 50_000_000,
      marketBetaImpact: 1_000_000,
      feeDrag: 250_000,
      taxPaid: 100_000,
      taxDragPct: 0.2,
      pvpSlippagePaid: 75_000,
      liquidityPenaltyPct: 0.15,
      classroomSellConcentrationPct: 50,
      endingAum: 50_575_000,
    },
    {
      fundId: 'fund-002',
      monthIndex: 3,
      startingAum: 40_000_000,
      marketBetaImpact: 800_000,
      feeDrag: 200_000,
      taxPaid: 0,
      taxDragPct: 0,
      pvpSlippagePaid: 0,
      liquidityPenaltyPct: 0,
      classroomSellConcentrationPct: 0,
      endingAum: 40_600_000,
    },
  ],
  totalStartingAum: 90_000_000,
  totalMarketBetaImpact: 1_800_000,
  totalFeeDrag: 450_000,
  totalTaxPaid: 100_000,
  totalPvpSlippagePaid: 75_000,
  totalEndingAum: 91_175_000,
};

describe('createSupabaseMonthAdvanceClassMonthProcessingStore', () => {
  it('reads class-scoped provider rows into month-advance fund inputs', async () => {
    const fixture = createSupabaseClientFixture({
      funds: [
        { id: 'fund-001', class_id: 'class-001', current_aum: '50000000' },
        { id: 'fund-002', class_id: 'class-001', current_aum: 40_000_000 },
      ],
      asset_holdings: [
        { id: 'holding-001', class_id: 'class-001', fund_id: 'fund-001', tier: 'Base', allocation_weight_pct: '20' },
        { id: 'holding-002', class_id: 'class-001', fund_id: 'fund-001', tier: 'Core', allocation_weight_pct: '40' },
        { id: 'holding-003', class_id: 'class-001', fund_id: 'fund-001', tier: 'Apex', allocation_weight_pct: '40' },
        { id: 'holding-004', class_id: 'class-001', fund_id: 'fund-002', tier: 'Base', allocation_weight_pct: 30 },
        { id: 'holding-005', class_id: 'class-001', fund_id: 'fund-002', tier: 'Core', allocation_weight_pct: 50 },
        { id: 'holding-006', class_id: 'class-001', fund_id: 'fund-002', tier: 'Apex', allocation_weight_pct: 20 },
      ],
      tara_orders: [
        {
          id: 'order-001',
          class_id: 'class-001',
          fund_id: 'fund-001',
          month_index: 3,
          target_weights_json: { Base: 30, Core: 50, Apex: 20 },
          status: 'pending',
        },
        {
          id: 'order-002',
          class_id: 'class-001',
          fund_id: 'fund-002',
          month_index: 3,
          target_weights_json: { Base: 20, Core: 55, Apex: 25 },
          status: 'pending',
        },
      ],
      tracked_metrics: [
        {
          id: 'metric-001',
          class_id: 'class-001',
          fund_id: null,
          scope_type: 'class',
          scope_id: 'class-001',
          month_index: 3,
          metric_id: 'gross_market_return_pct',
          value_numeric: '4.25',
          value_text: null,
        },
        {
          id: 'metric-002',
          class_id: 'class-001',
          fund_id: 'fund-001',
          scope_type: 'fund',
          scope_id: 'fund-001',
          month_index: 3,
          metric_id: 'fee_drag_pct',
          value_numeric: 0.5,
          value_text: null,
        },
        {
          id: 'metric-003',
          class_id: 'class-001',
          fund_id: 'fund-001',
          scope_type: 'fund',
          scope_id: 'fund-001',
          month_index: 3,
          metric_id: 'apex_unrealized_gain_pct',
          value_numeric: '25',
          value_text: null,
        },
      ],
    });
    const store = createSupabaseMonthAdvanceClassMonthProcessingStore(fixture.client);

    await expect(store.readFundInputs(processingRequest)).resolves.toEqual([
      {
        fundId: 'fund-001',
        currentAum: 50_000_000,
        grossMarketReturnPct: 4.25,
        feeDragPct: 0.5,
        currentWeights: { Base: 20, Core: 40, Apex: 40 },
        targetWeights: { Base: 30, Core: 50, Apex: 20 },
        apexUnrealizedGainPct: 25,
        classroomSellConcentrationPct: { Base: 50, Core: 0, Apex: 50 },
      },
      {
        fundId: 'fund-002',
        currentAum: 40_000_000,
        grossMarketReturnPct: 4.25,
        feeDragPct: 0,
        currentWeights: { Base: 30, Core: 50, Apex: 20 },
        targetWeights: { Base: 20, Core: 55, Apex: 25 },
        apexUnrealizedGainPct: 0,
        classroomSellConcentrationPct: { Base: 50, Core: 0, Apex: 50 },
      },
    ]);
    expect(fixture.selectCalls).toEqual([
      { table: 'funds', columns: 'id,class_id,current_aum', filters: { class_id: 'class-001' } },
      { table: 'asset_holdings', columns: 'id,class_id,fund_id,tier,allocation_weight_pct', filters: { class_id: 'class-001' } },
      {
        table: 'tara_orders',
        columns: 'id,class_id,fund_id,month_index,target_weights_json,status',
        filters: { class_id: 'class-001', month_index: 3, status: 'pending' },
      },
      {
        table: 'tracked_metrics',
        columns: 'id,class_id,fund_id,scope_type,scope_id,month_index,metric_id,value_numeric,value_text',
        filters: { class_id: 'class-001', month_index: 3 },
      },
    ]);
  });

  it('rejects malformed provider rows before processing', async () => {
    const fixture = createSupabaseClientFixture({
      funds: [{ id: 'fund-001', class_id: 'class-001', current_aum: '50000000' }],
      asset_holdings: [
        { id: 'holding-001', class_id: 'class-001', fund_id: 'fund-001', tier: 'Base', allocation_weight_pct: 20 },
        { id: 'holding-002', class_id: 'class-001', fund_id: 'fund-001', tier: 'Core', allocation_weight_pct: 40 },
      ],
      tara_orders: [],
      tracked_metrics: [],
    });
    const store = createSupabaseMonthAdvanceClassMonthProcessingStore(fixture.client);

    await expect(store.readFundInputs(processingRequest)).rejects.toThrow('Supabase month advance processing row rejected: asset_holdings');
  });

  it('writes ledger drafts, fund AUMs, processed pending orders, and class month advancement', async () => {
    const fixture = createSupabaseClientFixture({});
    const store = createSupabaseMonthAdvanceClassMonthProcessingStore(fixture.client);

    await expect(store.writeClassMonthProcessingResult(processingRecord)).resolves.toEqual({
      receiptType: 'class_month_processing_persistence_receipt',
      classMonthWriteKey: 'class:class-001:advance:3->4:supabase-class-month-write',
      ledgerWriteCount: 2,
      processedMonthIndex: 3,
      advancedToMonthIndex: 4,
    });
    expect(fixture.upsertCalls).toHaveLength(1);
    expect(fixture.upsertCalls[0]).toEqual({
      table: 'simulation_ledger',
      options: { onConflict: 'fund_id,month_index' },
      rows: [
        expect.objectContaining({
          fund_id: 'fund-001',
          class_id: 'class-001',
          month_index: 3,
          market_beta_impact: 1_000_000,
          fee_drag: 250_000,
          tax_paid: 100_000,
          tax_drag_pct: 0.2,
          pvp_slippage_paid: 75_000,
          liquidity_penalty_pct: 0.15,
          classroom_sell_concentration_pct: 50,
          ending_aum: 50_575_000,
        }),
        expect.objectContaining({
          fund_id: 'fund-002',
          class_id: 'class-001',
          month_index: 3,
          ending_aum: 40_600_000,
        }),
      ],
    });
    expect(fixture.updateCalls).toEqual([
      { table: 'funds', row: { current_aum: 50_575_000 }, filters: { class_id: 'class-001', id: 'fund-001' } },
      {
        table: 'tara_orders',
        row: { status: 'processed' },
        filters: { class_id: 'class-001', fund_id: 'fund-001', month_index: 3, status: 'pending' },
      },
      { table: 'funds', row: { current_aum: 40_600_000 }, filters: { class_id: 'class-001', id: 'fund-002' } },
      {
        table: 'tara_orders',
        row: { status: 'processed' },
        filters: { class_id: 'class-001', fund_id: 'fund-002', month_index: 3, status: 'pending' },
      },
      { table: 'classes', row: { current_month_index: 4 }, filters: { id: 'class-001', current_month_index: 3 } },
    ]);
  });

  it('sanitizes provider read and write failures', async () => {
    const readFixture = createSupabaseClientFixture({}, 'funds');
    const readStore = createSupabaseMonthAdvanceClassMonthProcessingStore(readFixture.client);

    await expect(readStore.readFundInputs(processingRequest)).rejects.toThrow('Supabase month advance processing read failed: funds');

    const writeFixture = createSupabaseClientFixture({}, 'simulation_ledger');
    const writeStore = createSupabaseMonthAdvanceClassMonthProcessingStore(writeFixture.client);

    await expect(writeStore.writeClassMonthProcessingResult(processingRecord)).rejects.toThrow(
      'Supabase month advance processing write failed: simulation_ledger',
    );
  });
});
