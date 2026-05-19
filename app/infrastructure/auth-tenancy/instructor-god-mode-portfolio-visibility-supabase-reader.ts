import type {
  InstructorGodModePortfolioVisibilityQueryRowReader,
  InstructorGodModePortfolioVisibilityQueryRowSet,
  InstructorGodModePortfolioVisibilityQueryScope,
} from './instructor-god-mode-portfolio-visibility-query';
import type { AuthTenancySession } from './session';

type SupabaseSelectResult = {
  data: readonly unknown[] | null;
  error: unknown | null;
};

type SupabaseSelectQuery = PromiseLike<SupabaseSelectResult> & {
  match(filters: Record<string, string | number>): SupabaseSelectQuery;
};

type SupabaseInstructorGodModePortfolioVisibilityClient = {
  from(table: string): {
    select(columns: string): SupabaseSelectQuery;
  };
};

export function createSupabaseInstructorGodModePortfolioVisibilityRowReader(
  client: SupabaseInstructorGodModePortfolioVisibilityClient,
): InstructorGodModePortfolioVisibilityQueryRowReader {
  return {
    async readInstructorGodModePortfolioVisibilityRows({
      scope,
    }: {
      session: AuthTenancySession;
      scope: InstructorGodModePortfolioVisibilityQueryScope;
    }) {
      const [funds, holdings, orders] = await Promise.all([
        selectRows(client, 'funds', 'id,class_id,student_display_name,current_aum,sharpe_ratio', { class_id: scope.classId }),
        selectRows(client, 'asset_holdings', 'id,class_id,fund_id,tier,allocation_weight_pct', { class_id: scope.classId }),
        selectRows(client, 'tara_orders', 'id,class_id,fund_id,month_index,status', {
          class_id: scope.classId,
          month_index: scope.monthIndex,
          status: 'pending',
        }),
      ]);

      return { funds, holdings, orders } satisfies InstructorGodModePortfolioVisibilityQueryRowSet;
    },
  };
}

async function selectRows(
  client: SupabaseInstructorGodModePortfolioVisibilityClient,
  table: string,
  columns: string,
  filters: Record<string, string | number>,
): Promise<readonly unknown[]> {
  const result = await client.from(table).select(columns).match(filters);

  if (result.error !== null && result.error !== undefined) {
    throw new Error(`Supabase instructor God Mode portfolio visibility read failed: ${table}`);
  }

  return Array.isArray(result.data) ? result.data : [];
}
