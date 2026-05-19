import { describe, expect, it } from 'vitest';

import { createSupabaseStudentDashboardCurrentTurnRowReader } from './student-dashboard-current-turn-supabase-reader';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const scope = { classId, fundId, monthIndex: 2 };

type QueryCall =
  | {
      kind: 'select';
      table: string;
      columns: string;
      filters: Record<string, string | number>;
    }
  | {
      kind: 'rpc';
      functionName: string;
      args: Record<string, string | number>;
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
      };
    },
    rpc(functionName: string, args: Record<string, string | number>) {
      calls.push({ kind: 'rpc', functionName, args });

      return {
        then<TResult1 = { data: readonly unknown[]; error: null }, TResult2 = never>(
          onfulfilled?: ((value: { data: readonly unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
        ) {
          return Promise.resolve({ data: rows[functionName] ?? [], error: null }).then(onfulfilled, onrejected);
        },
      };
    },
  };
}

describe('createSupabaseStudentDashboardCurrentTurnRowReader', () => {
  it('reads current-turn dashboard row sets from scoped Supabase tables', async () => {
    const calls: QueryCall[] = [];
    const client = createClient(
      {
        macro_narratives: [{ id: '10000000-0000-4000-8000-000000000001', class_id: classId, month_index: 2 }],
        market_metrics: [{ id: '20000000-0000-4000-8000-000000000001', class_id: classId, month_index: 2 }],
        funds: [
          {
            id: fundId,
            class_id: classId,
            student_id: studentSession.subjectId,
            current_aum: '50000000.00',
            sharpe_ratio: '1.20',
          },
        ],
        asset_holdings: [{ id: '30000000-0000-4000-8000-000000000001', class_id: classId, fund_id: fundId, tier: 'Base' }],
        tara_orders: [{ id: '40000000-0000-4000-8000-000000000001', class_id: classId, fund_id: fundId, month_index: 2 }],
        tracked_metrics: [{ id: '50000000-0000-4000-8000-000000000001', class_id: classId, fund_id: fundId, month_index: 2 }],
        student_leaderboard_funds: [
          {
            id: fundId,
            class_id: classId,
            student_display_name: 'Viewer Fund',
            current_aum: '50000000.00',
            sharpe_ratio: '1.20',
          },
          {
            id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            class_id: classId,
            student_display_name: 'Class Peer',
            current_aum: '49000000.00',
            sharpe_ratio: '0.90',
          },
        ],
      },
      calls,
    );

    const rows = await createSupabaseStudentDashboardCurrentTurnRowReader(client).readStudentDashboardCurrentTurnRows({
      session: studentSession,
      scope,
    });

    expect(rows.macroNarratives).toEqual([{ id: '10000000-0000-4000-8000-000000000001', class_id: classId, month_index: 2 }]);
    expect(rows.leaderboardFunds).toEqual([
      {
        id: fundId,
        class_id: classId,
        student_display_name: 'Viewer Fund',
        current_aum: '50000000.00',
        sharpe_ratio: '1.20',
      },
      {
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        class_id: classId,
        student_display_name: 'Class Peer',
        current_aum: '49000000.00',
        sharpe_ratio: '0.90',
      },
    ]);
    expect(calls).toEqual([
      expect.objectContaining({ kind: 'select', table: 'macro_narratives', filters: { class_id: classId, month_index: 2 } }),
      expect.objectContaining({ kind: 'select', table: 'market_metrics', filters: { class_id: classId, month_index: 2 } }),
      expect.objectContaining({ kind: 'select', table: 'funds', filters: { class_id: classId, id: fundId } }),
      expect.objectContaining({ kind: 'select', table: 'asset_holdings', filters: { class_id: classId, fund_id: fundId } }),
      expect.objectContaining({ kind: 'select', table: 'tara_orders', filters: { class_id: classId, fund_id: fundId, month_index: 2 } }),
      expect.objectContaining({
        kind: 'select',
        table: 'tracked_metrics',
        filters: { class_id: classId, fund_id: fundId, metric_id: 'apex_unrealized_gain_pct', month_index: 2 },
      }),
      expect.objectContaining({ kind: 'rpc', functionName: 'student_leaderboard_funds', args: { target_class_id: classId } }),
    ]);
  });

  it('fails closed without returning provider error payloads', async () => {
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
        };
      },
      rpc() {
        return {
          then<TResult1 = { data: readonly unknown[]; error: null }, TResult2 = never>(
            onfulfilled?: ((value: { data: readonly unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
          ) {
            return Promise.resolve({ data: [], error: null }).then(onfulfilled, onrejected);
          },
        };
      },
    };

    await expect(
      createSupabaseStudentDashboardCurrentTurnRowReader(client).readStudentDashboardCurrentTurnRows({ session: studentSession, scope }),
    ).rejects.toThrow('Supabase student dashboard read failed: macro_narratives');
  });

  it('fails closed when the leaderboard RPC returns a provider error', async () => {
    const client = {
      ...createClient({}),
      rpc() {
        return {
          then<TResult1 = { data: null; error: { message: string } }, TResult2 = never>(
            onfulfilled?: ((value: { data: null; error: { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
          ) {
            return Promise.resolve({ data: null, error: { message: 'provider failed with internal details' } }).then(onfulfilled, onrejected);
          },
        };
      },
    };

    await expect(
      createSupabaseStudentDashboardCurrentTurnRowReader(client).readStudentDashboardCurrentTurnRows({ session: studentSession, scope }),
    ).rejects.toThrow('Supabase student dashboard read failed: student_leaderboard_funds');
  });
});
