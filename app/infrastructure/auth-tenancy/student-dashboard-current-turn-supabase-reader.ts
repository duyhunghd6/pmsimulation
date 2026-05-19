import type {
  StudentDashboardCurrentTurnQueryRowReader,
  StudentDashboardCurrentTurnQueryRowSet,
  StudentDashboardCurrentTurnQueryScope,
} from './student-dashboard-current-turn-query';
import type { AuthTenancySession } from './session';

type SupabaseSelectResult = {
  data: readonly unknown[] | null;
  error: unknown | null;
};

type SupabaseSelectQuery = PromiseLike<SupabaseSelectResult> & {
  match(filters: Record<string, string | number>): SupabaseSelectQuery;
};

type SupabaseRpcQuery = PromiseLike<SupabaseSelectResult>;

type SupabaseReaderClient = {
  from(table: string): {
    select(columns: string): SupabaseSelectQuery;
  };
  rpc(functionName: string, args: Record<string, string | number>): SupabaseRpcQuery;
};

export function createSupabaseStudentDashboardCurrentTurnRowReader(
  client: SupabaseReaderClient,
): StudentDashboardCurrentTurnQueryRowReader {
  return {
    async readStudentDashboardCurrentTurnRows({ scope }: { session: AuthTenancySession; scope: StudentDashboardCurrentTurnQueryScope }) {
      const [macroNarratives, marketMetrics, funds, holdings, orders, trackedMetrics, leaderboardFunds] = await Promise.all([
        selectRows(
          client,
          'macro_narratives',
          'id,class_id,month_index,news_headline,investment_clock_phase,pmi,iip,m2_growth,gdp_growth_yoy,inflation_cpi,policy_rate,bond_yield,interbank_rate,usd_vnd_movement,vix,scenario_persistence',
          { class_id: scope.classId, month_index: scope.monthIndex },
        ),
        selectRows(
          client,
          'market_metrics',
          'id,class_id,month_index,vn_index_level,equity_market_trading_value,foreign_investor_net_trading_value,retail_investor_net_trading_value,market_earnings_growth_expectation,valuation_sentiment,business_cycle_phase',
          { class_id: scope.classId, month_index: scope.monthIndex },
        ),
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
        selectStudentLeaderboardRows(client, scope.classId),
      ]);

      return {
        macroNarratives,
        marketMetrics,
        funds,
        holdings,
        orders,
        trackedMetrics,
        leaderboardFunds,
      } satisfies StudentDashboardCurrentTurnQueryRowSet;
    },
  };
}

async function selectRows(
  client: SupabaseReaderClient,
  table: string,
  columns: string,
  filters: Record<string, string | number>,
): Promise<readonly unknown[]> {
  const result = await client.from(table).select(columns).match(filters);

  if (result.error !== null && result.error !== undefined) {
    throw new Error(`Supabase student dashboard read failed: ${table}`);
  }

  return Array.isArray(result.data) ? result.data : [];
}

async function selectStudentLeaderboardRows(client: SupabaseReaderClient, classId: string): Promise<readonly unknown[]> {
  const result = await client.rpc('student_leaderboard_funds', { target_class_id: classId });

  if (result.error !== null && result.error !== undefined) {
    throw new Error('Supabase student dashboard read failed: student_leaderboard_funds');
  }

  return Array.isArray(result.data) ? result.data : [];
}
