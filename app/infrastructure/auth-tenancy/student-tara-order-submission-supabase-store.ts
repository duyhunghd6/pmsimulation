import type { StudentTaraOrderSubmissionActionStore, StudentTaraOrderSubmissionActionRowSet } from './student-tara-order-submission-action';

type SupabaseSelectResult = {
  data: readonly unknown[] | null;
  error: unknown | null;
};

type SupabaseSingleResult = {
  data: unknown | null;
  error: unknown | null;
};

type SupabaseSelectQuery = PromiseLike<SupabaseSelectResult> & {
  match(filters: Record<string, string | number>): SupabaseSelectQuery;
};

type SupabaseInsertQuery = {
  select(columns: string): SupabaseInsertSelectQuery;
};

type SupabaseInsertSelectQuery = {
  single(): PromiseLike<SupabaseSingleResult>;
};

type SupabaseOrderSubmissionClient = {
  from(table: string): {
    select(columns: string): SupabaseSelectQuery;
    insert(row: Record<string, unknown>): SupabaseInsertQuery;
  };
};

export function createSupabaseStudentTaraOrderSubmissionStore(client: SupabaseOrderSubmissionClient): StudentTaraOrderSubmissionActionStore {
  return {
    async readStudentTaraOrderSubmissionRows({ scope }: Parameters<StudentTaraOrderSubmissionActionStore['readStudentTaraOrderSubmissionRows']>[0]) {
      const [funds, holdings, orders, trackedMetrics] = await Promise.all([
        selectRows(client, 'funds', 'id,class_id,student_id,current_aum,sharpe_ratio', { class_id: scope.classId, id: scope.fundId }),
        selectRows(client, 'asset_holdings', 'id,class_id,fund_id,tier,allocation_weight_pct', {
          class_id: scope.classId,
          fund_id: scope.fundId,
        }),
        selectRows(client, 'tara_orders', 'id,class_id,fund_id,month_index,target_weights_json,estimated_tax_drag,rebalance_trigger,status', {
          class_id: scope.classId,
          fund_id: scope.fundId,
          month_index: scope.monthIndex,
        }),
        selectRows(
          client,
          'tracked_metrics',
          'id,class_id,fund_id,scope_type,scope_id,month_index,metric_id,display_label,metric_family,value_numeric,value_text,unit,source_type,source_note,convention_note',
          {
            class_id: scope.classId,
            fund_id: scope.fundId,
            metric_id: 'apex_unrealized_gain_pct',
            month_index: scope.monthIndex,
          },
        ),
      ]);

      return { funds, holdings, orders, trackedMetrics } satisfies StudentTaraOrderSubmissionActionRowSet;
    },
    async createPendingStudentTaraOrder({ command, scope }: Parameters<StudentTaraOrderSubmissionActionStore['createPendingStudentTaraOrder']>[0]) {
      return insertPendingOrder(client, {
        class_id: scope.classId,
        fund_id: scope.fundId,
        month_index: scope.monthIndex,
        target_weights_json: command.targetWeights,
        estimated_tax_drag: command.estimatedTaxDrag.taxDragPct,
        rebalance_trigger: command.rebalanceTrigger,
        status: command.status,
      });
    },
  };
}

async function selectRows(
  client: SupabaseOrderSubmissionClient,
  table: string,
  columns: string,
  filters: Record<string, string | number>,
): Promise<readonly unknown[]> {
  const result = await client.from(table).select(columns).match(filters);

  if (result.error !== null && result.error !== undefined) {
    throw new Error(`Supabase student TARA order submission read failed: ${table}`);
  }

  return Array.isArray(result.data) ? result.data : [];
}

async function insertPendingOrder(client: SupabaseOrderSubmissionClient, row: Record<string, unknown>): Promise<unknown> {
  const result = await client
    .from('tara_orders')
    .insert(row)
    .select('id,class_id,fund_id,month_index,target_weights_json,estimated_tax_drag,rebalance_trigger,status')
    .single();

  if (result.error !== null && result.error !== undefined) {
    throw new Error('Supabase student TARA order submission write failed: tara_orders');
  }

  return result.data;
}
