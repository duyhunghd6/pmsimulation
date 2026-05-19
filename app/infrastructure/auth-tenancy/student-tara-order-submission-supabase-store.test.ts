import { describe, expect, it } from 'vitest';

import { createStudentTaraOrderServerActionCommandDescriptor, createStudentTaraOrderSubmissionReceipt } from '../../domain/tara/order';
import { createSupabaseStudentTaraOrderSubmissionStore } from './student-tara-order-submission-supabase-store';

const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const subjectId = '11111111-1111-4111-8111-111111111111';
const currentMonthIndex = 2;
const studentSession = { subjectId, role: 'student' as const };
const scope = { classId, fundId, monthIndex: currentMonthIndex };

type QueryCall =
  | {
      kind: 'select';
      table: string;
      columns: string;
      filters: Record<string, string | number>;
    }
  | {
      kind: 'insert';
      table: string;
      row: Record<string, unknown>;
      columns: string;
    };

type QueryRows = Record<string, readonly unknown[]>;

function createClient(rows: QueryRows, calls: QueryCall[] = []) {
  return {
    calls,
    from(table: string) {
      return {
        select(columns: string) {
          const query = {
            filters: {} as Record<string, string | number>,
            match(filters: Record<string, string | number>) {
              query.filters = filters;
              calls.push({ kind: 'select', table, columns, filters });
              return query;
            },
            then<TResult1 = { data: readonly unknown[]; error: null }, TResult2 = never>(
              onfulfilled?: ((value: { data: readonly unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
              onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
            ) {
              return Promise.resolve({ data: rows[table] ?? [], error: null }).then(onfulfilled, onrejected);
            },
          };

          return query;
        },
        insert(row: Record<string, unknown>) {
          return {
            select(columns: string) {
              calls.push({ kind: 'insert', table, row, columns });

              return {
                single<TResult1 = { data: unknown; error: null }, TResult2 = never>(
                  onfulfilled?: ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
                  onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
                ) {
                  return Promise.resolve({
                    data: {
                      id: '40000000-0000-4000-8000-000000000001',
                      ...row,
                    },
                    error: null,
                  }).then(onfulfilled, onrejected);
                },
              };
            },
          };
        },
      };
    },
  };
}

function createCommand() {
  const receipt = createStudentTaraOrderSubmissionReceipt({
    classId,
    viewerFundId: fundId,
    monthIndex: currentMonthIndex,
    currentAum: 50_000_000,
    currentWeights: { Base: 40, Core: 30, Apex: 30 },
    targetWeights: { Base: 50, Core: 30, Apex: 20 },
    apexUnrealizedGainPct: 10,
  });

  if (!receipt.ok) {
    throw new Error('test command setup failed');
  }

  return createStudentTaraOrderServerActionCommandDescriptor(receipt.value);
}

describe('createSupabaseStudentTaraOrderSubmissionStore', () => {
  it('reads scoped rows needed by the student TARA order submission executor', async () => {
    const calls: QueryCall[] = [];
    const client = createClient(
      {
        funds: [{ id: fundId, class_id: classId, student_id: subjectId, current_aum: '50000000.00', sharpe_ratio: '1.20' }],
        asset_holdings: [{ id: '30000000-0000-4000-8000-000000000001', class_id: classId, fund_id: fundId, tier: 'Base' }],
        tara_orders: [],
        tracked_metrics: [{ id: '50000000-0000-4000-8000-000000000001', class_id: classId, fund_id: fundId, month_index: 2 }],
      },
      calls,
    );

    const rows = await createSupabaseStudentTaraOrderSubmissionStore(client).readStudentTaraOrderSubmissionRows({
      session: studentSession,
      scope,
    });

    expect(rows.funds).toEqual([{ id: fundId, class_id: classId, student_id: subjectId, current_aum: '50000000.00', sharpe_ratio: '1.20' }]);
    expect(calls).toEqual([
      expect.objectContaining({ kind: 'select', table: 'funds', filters: { class_id: classId, id: fundId } }),
      expect.objectContaining({ kind: 'select', table: 'asset_holdings', filters: { class_id: classId, fund_id: fundId } }),
      expect.objectContaining({ kind: 'select', table: 'tara_orders', filters: { class_id: classId, fund_id: fundId, month_index: 2 } }),
      expect.objectContaining({
        kind: 'select',
        table: 'tracked_metrics',
        filters: { class_id: classId, fund_id: fundId, metric_id: 'apex_unrealized_gain_pct', month_index: 2 },
      }),
    ]);
  });

  it('inserts a pending order row without returning provider payloads beyond the parsed row shape', async () => {
    const calls: QueryCall[] = [];
    const client = createClient({}, calls);
    const command = createCommand();

    const row = await createSupabaseStudentTaraOrderSubmissionStore(client).createPendingStudentTaraOrder({
      session: studentSession,
      scope,
      command,
    });

    expect(row).toEqual({
      id: '40000000-0000-4000-8000-000000000001',
      class_id: classId,
      fund_id: fundId,
      month_index: currentMonthIndex,
      target_weights_json: { Base: 50, Core: 30, Apex: 20 },
      estimated_tax_drag: 0.2,
      rebalance_trigger: 'student_tara_submission',
      status: 'pending',
    });
    expect(calls).toEqual([
      {
        kind: 'insert',
        table: 'tara_orders',
        row: {
          class_id: classId,
          fund_id: fundId,
          month_index: currentMonthIndex,
          target_weights_json: { Base: 50, Core: 30, Apex: 20 },
          estimated_tax_drag: 0.2,
          rebalance_trigger: 'student_tara_submission',
          status: 'pending',
        },
        columns: 'id,class_id,fund_id,month_index,target_weights_json,estimated_tax_drag,rebalance_trigger,status',
      },
    ]);
  });

  it('fails closed without returning provider error details when reads fail', async () => {
    const client = {
      from(table: string) {
        return {
          select() {
            const query = {
              match() {
                return query;
              },
              then<TResult1 = { data: null; error: { message: string } }, TResult2 = never>(
                onfulfilled?: ((value: { data: null; error: { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
                onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
              ) {
                return Promise.resolve({ data: null, error: { message: `provider failed for ${table}` } }).then(onfulfilled, onrejected);
              },
            };

            return query;
          },
          insert() {
            throw new Error('not used');
          },
        };
      },
    };

    await expect(
      createSupabaseStudentTaraOrderSubmissionStore(client).readStudentTaraOrderSubmissionRows({ session: studentSession, scope }),
    ).rejects.toThrow('Supabase student TARA order submission read failed: funds');
  });

  it('fails closed without returning provider error details when writes fail', async () => {
    const client = {
      from() {
        return {
          select() {
            throw new Error('not used');
          },
          insert() {
            return {
              select() {
                return {
                  single<TResult1 = { data: null; error: { message: string } }, TResult2 = never>(
                    onfulfilled?: ((value: { data: null; error: { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
                    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
                  ) {
                    return Promise.resolve({ data: null, error: { message: 'provider failed with internal details' } }).then(onfulfilled, onrejected);
                  },
                };
              },
            };
          },
        };
      },
    };

    await expect(
      createSupabaseStudentTaraOrderSubmissionStore(client).createPendingStudentTaraOrder({
        session: studentSession,
        scope,
        command: createCommand(),
      }),
    ).rejects.toThrow('Supabase student TARA order submission write failed: tara_orders');
  });
});
