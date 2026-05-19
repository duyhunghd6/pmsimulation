import type {
  InstructorPendingOrderVisibilityQueryRowReader,
  InstructorPendingOrderVisibilityQueryRowSet,
  InstructorPendingOrderVisibilityQueryScope,
} from './instructor-pending-order-visibility-query';
import type { AuthTenancySession } from './session';

type SupabaseSelectResult = {
  data: readonly unknown[] | null;
  error: unknown | null;
};

type SupabaseSelectQuery = PromiseLike<SupabaseSelectResult> & {
  match(filters: Record<string, string | number>): SupabaseSelectQuery;
};

type SupabaseInstructorPendingOrderVisibilityClient = {
  from(table: string): {
    select(columns: string): SupabaseSelectQuery;
  };
};

export function createSupabaseInstructorPendingOrderVisibilityRowReader(
  client: SupabaseInstructorPendingOrderVisibilityClient,
): InstructorPendingOrderVisibilityQueryRowReader {
  return {
    async readInstructorPendingOrderVisibilityRows({
      scope,
    }: {
      session: AuthTenancySession;
      scope: InstructorPendingOrderVisibilityQueryScope;
    }) {
      const [funds, orders] = await Promise.all([
        selectRows(client, 'funds', 'id,class_id', { class_id: scope.classId }),
        selectRows(client, 'tara_orders', 'id,class_id,fund_id,month_index,status', {
          class_id: scope.classId,
          month_index: scope.monthIndex,
          status: 'pending',
        }),
      ]);

      return { funds, orders } satisfies InstructorPendingOrderVisibilityQueryRowSet;
    },
  };
}

async function selectRows(
  client: SupabaseInstructorPendingOrderVisibilityClient,
  table: string,
  columns: string,
  filters: Record<string, string | number>,
): Promise<readonly unknown[]> {
  const result = await client.from(table).select(columns).match(filters);

  if (result.error !== null && result.error !== undefined) {
    throw new Error(`Supabase instructor pending-order visibility read failed: ${table}`);
  }

  return Array.isArray(result.data) ? result.data : [];
}
