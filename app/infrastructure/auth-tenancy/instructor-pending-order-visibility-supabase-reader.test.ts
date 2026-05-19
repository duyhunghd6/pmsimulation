import { describe, expect, it } from 'vitest';

import { createSupabaseInstructorPendingOrderVisibilityRowReader } from './instructor-pending-order-visibility-supabase-reader';

const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const scope = { classId, monthIndex: 2 };

type QueryCall = {
  table: string;
  columns: string;
  filters: Record<string, string | number>;
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
              calls.push({ table, columns, filters });
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
  };
}

describe('createSupabaseInstructorPendingOrderVisibilityRowReader', () => {
  it('reads status-only pending-order row sets from scoped Supabase tables', async () => {
    const calls: QueryCall[] = [];
    const fundRows = [
      { id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', class_id: classId },
      { id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', class_id: classId },
    ];
    const orderRows = [
      {
        id: '40000000-0000-4000-8000-000000000001',
        class_id: classId,
        fund_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        month_index: 2,
        status: 'pending',
      },
    ];

    const rows = await createSupabaseInstructorPendingOrderVisibilityRowReader(
      createClient({ funds: fundRows, tara_orders: orderRows }, calls),
    ).readInstructorPendingOrderVisibilityRows({ session: instructorSession, scope });

    expect(rows).toEqual({ funds: fundRows, orders: orderRows });
    expect(calls).toEqual([
      {
        table: 'funds',
        columns: 'id,class_id',
        filters: { class_id: classId },
      },
      {
        table: 'tara_orders',
        columns: 'id,class_id,fund_id,month_index,status',
        filters: { class_id: classId, month_index: 2, status: 'pending' },
      },
    ]);
    expect(Object.prototype.hasOwnProperty.call(rows.orders[0], 'target_weights_json')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(rows.orders[0], 'estimated_tax_drag')).toBe(false);
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
                return Promise.resolve({ data: null, error: { message: `provider failed for ${table}` } }).then(
                  onfulfilled,
                  onrejected,
                );
              },
            };

            return query;
          },
        };
      },
    };

    await expect(
      createSupabaseInstructorPendingOrderVisibilityRowReader(client).readInstructorPendingOrderVisibilityRows({
        session: instructorSession,
        scope,
      }),
    ).rejects.toThrow('Supabase instructor pending-order visibility read failed: funds');
  });
});
