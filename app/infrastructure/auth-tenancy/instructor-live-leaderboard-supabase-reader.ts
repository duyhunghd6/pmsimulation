import type {
  InstructorLiveLeaderboardQueryRowReader,
  InstructorLiveLeaderboardQueryRowSet,
  InstructorLiveLeaderboardQueryScope,
} from './instructor-live-leaderboard-query';
import type { AuthTenancySession } from './session';

type SupabaseSelectResult = {
  data: readonly unknown[] | null;
  error: unknown | null;
};

type SupabaseSelectQuery = PromiseLike<SupabaseSelectResult> & {
  match(filters: Record<string, string | number>): SupabaseSelectQuery;
};

type SupabaseInstructorLiveLeaderboardClient = {
  from(table: string): {
    select(columns: string): SupabaseSelectQuery;
  };
};

export function createSupabaseInstructorLiveLeaderboardRowReader(
  client: SupabaseInstructorLiveLeaderboardClient,
): InstructorLiveLeaderboardQueryRowReader {
  return {
    async readInstructorLiveLeaderboardRows({
      scope,
    }: {
      session: AuthTenancySession;
      scope: InstructorLiveLeaderboardQueryScope;
    }) {
      const [funds, orders] = await Promise.all([
        selectRows(client, 'funds', 'id,class_id,student_display_name,current_aum,sharpe_ratio', { class_id: scope.classId }),
        selectRows(client, 'tara_orders', 'id,class_id,fund_id,month_index,status', {
          class_id: scope.classId,
          month_index: scope.monthIndex,
          status: 'pending',
        }),
      ]);

      return { funds, orders } satisfies InstructorLiveLeaderboardQueryRowSet;
    },
  };
}

async function selectRows(
  client: SupabaseInstructorLiveLeaderboardClient,
  table: string,
  columns: string,
  filters: Record<string, string | number>,
): Promise<readonly unknown[]> {
  const result = await client.from(table).select(columns).match(filters);

  if (result.error !== null && result.error !== undefined) {
    throw new Error(`Supabase instructor live leaderboard read failed: ${table}`);
  }

  return Array.isArray(result.data) ? result.data : [];
}
