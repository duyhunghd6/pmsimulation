import { randomUUID } from 'node:crypto';

import {
  type ClassMonthAdvanceFundProcessingInput,
  type ClassMonthAdvanceProcessingRecord,
  type SharedMonthAdvanceProcessingRequest,
} from '../../domain/classes/month-advancement';
import type {
  MonthAdvanceClassMonthProcessingPersistenceReceipt,
  MonthAdvanceClassMonthProcessingReader,
  MonthAdvanceClassMonthProcessingWriter,
} from './month-advance';

type SupabaseSelectResult = {
  data: readonly unknown[] | null;
  error: unknown | null;
};

type SupabaseMutationResult = {
  data: unknown;
  error: unknown | null;
};

type SupabaseSelectQuery = PromiseLike<SupabaseSelectResult> & {
  match(filters: Record<string, string | number>): SupabaseSelectQuery;
};

type SupabaseUpdateQuery = {
  match(filters: Record<string, string | number>): PromiseLike<SupabaseMutationResult>;
};

type SupabaseMonthAdvanceProcessingClient = {
  from(table: string): {
    select(columns: string): SupabaseSelectQuery;
    upsert(rows: readonly Record<string, unknown>[], options: { onConflict: string }): PromiseLike<SupabaseMutationResult>;
    update(row: Record<string, unknown>): SupabaseUpdateQuery;
  };
};

type AssetTier = 'Base' | 'Core' | 'Apex';

type FundRow = {
  id: string;
  classId: string;
  currentAum: number;
};

type HoldingRow = {
  fundId: string;
  classId: string;
  tier: AssetTier;
  allocationWeightPct: number;
};

type PendingOrderRow = {
  fundId: string;
  classId: string;
  monthIndex: number;
  targetWeights: Record<AssetTier, number>;
};

type TrackedMetricRow = {
  fundId: string | null;
  classId: string;
  monthIndex: number;
  metricId: string;
  valueNumeric: number | null;
};

const assetTiers: readonly AssetTier[] = ['Base', 'Core', 'Apex'];

export function createSupabaseMonthAdvanceClassMonthProcessingStore(
  client: SupabaseMonthAdvanceProcessingClient,
): MonthAdvanceClassMonthProcessingReader & MonthAdvanceClassMonthProcessingWriter {
  return {
    async readFundInputs(request) {
      return readFundInputs(client, request);
    },
    async writeClassMonthProcessingResult(record) {
      return writeClassMonthProcessingResult(client, record);
    },
  };
}

async function readFundInputs(
  client: SupabaseMonthAdvanceProcessingClient,
  request: SharedMonthAdvanceProcessingRequest,
): Promise<ClassMonthAdvanceFundProcessingInput[]> {
  const [fundRows, holdingRows, orderRows, metricRows] = await Promise.all([
    selectRows(client, 'funds', 'id,class_id,current_aum', { class_id: request.classId }),
    selectRows(client, 'asset_holdings', 'id,class_id,fund_id,tier,allocation_weight_pct', { class_id: request.classId }),
    selectRows(client, 'tara_orders', 'id,class_id,fund_id,month_index,target_weights_json,status', {
      class_id: request.classId,
      month_index: request.currentMonthIndex,
      status: 'pending',
    }),
    selectRows(client, 'tracked_metrics', 'id,class_id,fund_id,scope_type,scope_id,month_index,metric_id,value_numeric,value_text', {
      class_id: request.classId,
      month_index: request.currentMonthIndex,
    }),
  ]);

  const funds = fundRows.map(parseFundRow);
  const holdings = holdingRows.map(parseHoldingRow);
  const orders = orderRows.map(parsePendingOrderRow);
  const metrics = metricRows.map(parseTrackedMetricRow);
  const holdingWeightsByFund = groupHoldingWeightsByFund(holdings, request.classId);
  const pendingOrdersByFund = new Map(orders.map((order) => [order.fundId, order]));
  const sellConcentrationPct = calculateClassroomSellConcentrationPct(funds, holdingWeightsByFund, pendingOrdersByFund);

  return funds.map((fund) => {
    const currentWeights = holdingWeightsByFund.get(fund.id);
    if (!currentWeights) {
      throw new Error('Supabase month advance processing row rejected: asset_holdings');
    }

    const pendingOrder = pendingOrdersByFund.get(fund.id);

    return {
      fundId: fund.id,
      currentAum: fund.currentAum,
      grossMarketReturnPct: readMetricValue(metrics, 'gross_market_return_pct', request.classId, fund.id),
      feeDragPct: readMetricValue(metrics, 'fee_drag_pct', request.classId, fund.id),
      currentWeights,
      targetWeights: pendingOrder?.targetWeights ?? currentWeights,
      apexUnrealizedGainPct: readMetricValue(metrics, 'apex_unrealized_gain_pct', request.classId, fund.id),
      classroomSellConcentrationPct: sellConcentrationPct,
    };
  });
}

async function writeClassMonthProcessingResult(
  client: SupabaseMonthAdvanceProcessingClient,
  record: ClassMonthAdvanceProcessingRecord,
): Promise<MonthAdvanceClassMonthProcessingPersistenceReceipt> {
  const pendingOrdersByFund = await readPendingOrdersByProcessedFund(client, record);

  if (record.ledgerDrafts.length > 0) {
    await mutateRows(
      client
        .from('simulation_ledger')
        .upsert(
          record.ledgerDrafts.map((draft) => ({
            id: randomUUID(),
            fund_id: draft.fundId,
            class_id: record.classId,
            month_index: draft.monthIndex,
            market_beta_impact: draft.marketBetaImpact,
            fee_drag: draft.feeDrag,
            tax_paid: draft.taxPaid,
            tax_drag_pct: draft.taxDragPct,
            pvp_slippage_paid: draft.pvpSlippagePaid,
            liquidity_penalty_pct: draft.liquidityPenaltyPct,
            classroom_sell_concentration_pct: draft.classroomSellConcentrationPct,
            ending_aum: draft.endingAum,
          })),
          { onConflict: 'fund_id,month_index' },
        ),
      'simulation_ledger',
    );
  }

  for (const draft of record.ledgerDrafts) {
    await mutateRows(
      client.from('funds').update({ current_aum: draft.endingAum }).match({ class_id: record.classId, id: draft.fundId }),
      'funds',
    );

    const pendingOrder = pendingOrdersByFund.get(draft.fundId);
    if (pendingOrder) {
      await writeAssetHoldingTargetWeights(client, record.classId, draft.fundId, pendingOrder.targetWeights);
    }

    await mutateRows(
      client
        .from('tara_orders')
        .update({ status: 'processed' })
        .match({ class_id: record.classId, fund_id: draft.fundId, month_index: record.processedMonthIndex, status: 'pending' }),
      'tara_orders',
    );
  }

  await mutateRows(
    client
      .from('classes')
      .update({ current_month_index: record.advancedToMonthIndex })
      .match({ id: record.classId, current_month_index: record.processedMonthIndex }),
    'classes',
  );

  return {
    receiptType: 'class_month_processing_persistence_receipt',
    classMonthWriteKey: `${record.idempotencyKey}:supabase-class-month-write`,
    ledgerWriteCount: record.ledgerDrafts.length,
    processedMonthIndex: record.processedMonthIndex,
    advancedToMonthIndex: record.advancedToMonthIndex,
  };
}

async function readPendingOrdersByProcessedFund(
  client: SupabaseMonthAdvanceProcessingClient,
  record: ClassMonthAdvanceProcessingRecord,
): Promise<Map<string, PendingOrderRow>> {
  if (record.ledgerDrafts.length === 0) {
    return new Map();
  }

  const processedFundIds = new Set(record.ledgerDrafts.map((draft) => draft.fundId));
  const rows = await selectRows(client, 'tara_orders', 'id,class_id,fund_id,month_index,target_weights_json,status', {
    class_id: record.classId,
    month_index: record.processedMonthIndex,
    status: 'pending',
  });
  const pendingOrdersByFund = new Map<string, PendingOrderRow>();

  for (const row of rows) {
    const order = parsePendingOrderRow(row);
    if (order.classId !== record.classId || order.monthIndex !== record.processedMonthIndex) {
      throw new Error('Supabase month advance processing row rejected: tara_orders');
    }

    if (!processedFundIds.has(order.fundId)) {
      continue;
    }

    if (pendingOrdersByFund.has(order.fundId)) {
      throw new Error('Supabase month advance processing row rejected: tara_orders');
    }

    pendingOrdersByFund.set(order.fundId, order);
  }

  return pendingOrdersByFund;
}

async function writeAssetHoldingTargetWeights(
  client: SupabaseMonthAdvanceProcessingClient,
  classId: string,
  fundId: string,
  targetWeights: Record<AssetTier, number>,
): Promise<void> {
  for (const tier of assetTiers) {
    await mutateRows(
      client
        .from('asset_holdings')
        .update({ allocation_weight_pct: targetWeights[tier] })
        .match({ class_id: classId, fund_id: fundId, tier }),
      'asset_holdings',
    );
  }
}

async function selectRows(
  client: SupabaseMonthAdvanceProcessingClient,
  table: string,
  columns: string,
  filters: Record<string, string | number>,
): Promise<readonly unknown[]> {
  const result = await client.from(table).select(columns).match(filters);

  if ((result.error !== null && result.error !== undefined) || !Array.isArray(result.data)) {
    throw new Error(`Supabase month advance processing read failed: ${table}`);
  }

  return result.data;
}

async function mutateRows(query: PromiseLike<SupabaseMutationResult>, table: string): Promise<void> {
  const result = await query;

  if (result.error !== null && result.error !== undefined) {
    throw new Error(`Supabase month advance processing write failed: ${table}`);
  }
}

function parseFundRow(row: unknown): FundRow {
  const record = requireRecord(row, 'funds');
  return {
    id: requireString(record.id, 'funds'),
    classId: requireString(record.class_id, 'funds'),
    currentAum: requireNumber(record.current_aum, 'funds'),
  };
}

function parseHoldingRow(row: unknown): HoldingRow {
  const record = requireRecord(row, 'asset_holdings');
  return {
    fundId: requireString(record.fund_id, 'asset_holdings'),
    classId: requireString(record.class_id, 'asset_holdings'),
    tier: requireAssetTier(record.tier),
    allocationWeightPct: requireNumber(record.allocation_weight_pct, 'asset_holdings'),
  };
}

function parsePendingOrderRow(row: unknown): PendingOrderRow {
  const record = requireRecord(row, 'tara_orders');
  return {
    fundId: requireString(record.fund_id, 'tara_orders'),
    classId: requireString(record.class_id, 'tara_orders'),
    monthIndex: requireInteger(record.month_index, 'tara_orders'),
    targetWeights: parseTierWeights(record.target_weights_json, 'tara_orders'),
  };
}

function parseTrackedMetricRow(row: unknown): TrackedMetricRow {
  const record = requireRecord(row, 'tracked_metrics');
  const fundId = record.fund_id === null || record.fund_id === undefined ? null : requireString(record.fund_id, 'tracked_metrics');
  return {
    fundId,
    classId: requireString(record.class_id, 'tracked_metrics'),
    monthIndex: requireInteger(record.month_index, 'tracked_metrics'),
    metricId: requireString(record.metric_id, 'tracked_metrics'),
    valueNumeric: record.value_numeric === null || record.value_numeric === undefined ? null : requireNumber(record.value_numeric, 'tracked_metrics'),
  };
}

function groupHoldingWeightsByFund(
  holdings: readonly HoldingRow[],
  classId: string,
): Map<string, Record<AssetTier, number>> {
  const grouped = new Map<string, Partial<Record<AssetTier, number>>>();

  for (const holding of holdings) {
    if (holding.classId !== classId) {
      throw new Error('Supabase month advance processing row rejected: asset_holdings');
    }

    const existing = grouped.get(holding.fundId) ?? {};
    if (existing[holding.tier] !== undefined) {
      throw new Error('Supabase month advance processing row rejected: asset_holdings');
    }
    existing[holding.tier] = holding.allocationWeightPct;
    grouped.set(holding.fundId, existing);
  }

  return new Map(Array.from(grouped.entries()).map(([fundId, weights]) => [fundId, requireCompleteTierWeights(weights, 'asset_holdings')]));
}

function calculateClassroomSellConcentrationPct(
  funds: readonly FundRow[],
  currentWeightsByFund: ReadonlyMap<string, Record<AssetTier, number>>,
  pendingOrdersByFund: ReadonlyMap<string, PendingOrderRow>,
): Record<AssetTier, number> {
  const sellCounts: Record<AssetTier, number> = { Base: 0, Core: 0, Apex: 0 };

  for (const fund of funds) {
    const currentWeights = currentWeightsByFund.get(fund.id);
    const order = pendingOrdersByFund.get(fund.id);
    if (!currentWeights || !order) {
      continue;
    }

    for (const tier of assetTiers) {
      if (order.targetWeights[tier] < currentWeights[tier]) {
        sellCounts[tier] += 1;
      }
    }
  }

  const denominator = funds.length === 0 ? 1 : funds.length;
  return {
    Base: (sellCounts.Base / denominator) * 100,
    Core: (sellCounts.Core / denominator) * 100,
    Apex: (sellCounts.Apex / denominator) * 100,
  };
}

function readMetricValue(
  metrics: readonly TrackedMetricRow[],
  metricId: string,
  classId: string,
  fundId: string,
): number {
  const fundMetric = metrics.find((metric) => metric.classId === classId && metric.metricId === metricId && metric.fundId === fundId);
  if (fundMetric?.valueNumeric !== undefined && fundMetric.valueNumeric !== null) {
    return fundMetric.valueNumeric;
  }

  const classMetric = metrics.find((metric) => metric.classId === classId && metric.metricId === metricId && metric.fundId === null);
  return classMetric?.valueNumeric ?? 0;
}

function parseTierWeights(value: unknown, table: string): Record<AssetTier, number> {
  return requireCompleteTierWeights(requireRecord(value, table), table);
}

function requireCompleteTierWeights(value: Record<string, unknown> | Partial<Record<AssetTier, number>>, table: string): Record<AssetTier, number> {
  return {
    Base: requireNumber(value.Base, table),
    Core: requireNumber(value.Core, table),
    Apex: requireNumber(value.Apex, table),
  };
}

function requireRecord(value: unknown, table: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Supabase month advance processing row rejected: ${table}`);
  }

  return value as Record<string, unknown>;
}

function requireString(value: unknown, table: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Supabase month advance processing row rejected: ${table}`);
  }

  return value;
}

function requireInteger(value: unknown, table: string): number {
  const numberValue = requireNumber(value, table);
  if (!Number.isInteger(numberValue)) {
    throw new Error(`Supabase month advance processing row rejected: ${table}`);
  }

  return numberValue;
}

function requireNumber(value: unknown, table: string): number {
  const numberValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  if (!Number.isFinite(numberValue)) {
    throw new Error(`Supabase month advance processing row rejected: ${table}`);
  }

  return numberValue;
}

function requireAssetTier(value: unknown): AssetTier {
  if (value === 'Base' || value === 'Core' || value === 'Apex') {
    return value;
  }

  throw new Error('Supabase month advance processing row rejected: asset_holdings');
}
