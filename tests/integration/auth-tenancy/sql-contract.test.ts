import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const migration = readFileSync(
  resolve(root, 'supabase/migrations/202605180001_auth_tenancy_foundation.sql'),
  'utf8',
);
const fixtures = readFileSync(resolve(root, 'supabase/fixtures/auth-tenancy.sql'), 'utf8');

const requiredTables = [
  'profiles',
  'classes',
  'class_administrators',
  'class_enrollments',
  'funds',
  'asset_holdings',
  'macro_narratives',
  'market_metrics',
  'tracked_metrics',
  'tara_orders',
  'risk_register_entries',
  'simulation_ledger',
];

const requiredPolicies = [
  'funds_select_own_or_administered',
  'asset_holdings_select_own_or_instructor_god_mode',
  'macro_narratives_select_revealed_or_administered',
  'market_metrics_select_revealed_or_administered',
  'tara_orders_select_student_own_pending_boundary',
  'simulation_ledger_select_own_or_administered',
];

describe('US-038 Supabase auth-tenancy SQL contract', () => {
  it('defines the minimum approved tenancy tables and enables RLS', () => {
    for (const table of requiredTables) {
      expect(migration).toContain(`create table if not exists public.${table}`);
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it('defines policies for own-fund, future-row, holding, and instructor boundaries', () => {
    for (const policy of requiredPolicies) {
      expect(migration).toContain(`create policy ${policy}`);
    }

    expect(migration).toContain("public.current_app_role() = 'student'");
    expect(migration).toContain("public.current_app_role() = 'instructor'");
    expect(migration).toContain('public.owns_fund(fund_id) or public.is_class_admin(class_id)');
    expect(migration).toContain('month_index <= (');
    expect(migration).toContain('public.is_class_admin(class_id)');
  });

  it('defines a student-safe leaderboard RPC contract', () => {
    const leaderboardFunction = migration.match(/create or replace function public\.student_leaderboard_funds[\s\S]*?\$\$;/)?.[0] ?? '';

    expect(leaderboardFunction).toContain('returns table');
    expect(leaderboardFunction).toContain('student_display_name text');
    expect(leaderboardFunction).toContain('current_aum numeric');
    expect(leaderboardFunction).toContain('sharpe_ratio numeric');
    expect(leaderboardFunction).toContain('public.is_class_student(target_class_id)');
    expect(leaderboardFunction).not.toContain('public.asset_holdings');
    expect(leaderboardFunction).not.toContain('public.tara_orders');
    expect(leaderboardFunction).not.toContain('target_weights_json');
    expect(migration).toContain('grant execute on function public.student_leaderboard_funds(uuid) to authenticated');
  });

  it('defines a student join-code enrollment RPC contract', () => {
    const joinFunction = migration.match(/create or replace function public\.join_class_by_code[\s\S]*?\$\$;/)?.[0] ?? '';

    expect(joinFunction).toContain("public.current_app_role() <> 'student'");
    expect(joinFunction).toContain('target_student_join_code text');
    expect(joinFunction).toContain('insert into public.class_enrollments');
    expect(joinFunction).toContain('insert into public.funds');
    expect(joinFunction).toContain('on conflict (class_id, student_id) do nothing');
    expect(joinFunction).toContain('insert into public.asset_holdings');
    expect(joinFunction).toContain("('Base', 40.0000, 0.4000, 0.0500)");
    expect(joinFunction).toContain("('Core', 40.0000, 0.4000, 0.0000)");
    expect(joinFunction).toContain("('Apex', 20.0000, 0.2000, 0.0000)");
    expect(joinFunction).toContain('on conflict (fund_id, tier) do nothing');
    expect(joinFunction).toContain('student_join_code text');
    expect(joinFunction).not.toContain('public.tara_orders');
    expect(joinFunction).not.toContain('target_weights_json');
    expect(migration).toContain('grant execute on function public.join_class_by_code(text, uuid) to authenticated');
  });

  it('provides deterministic fixture actors, classes, scenario rows, and exact holdings', () => {
    expect(fixtures.match(/'student'/g)).toHaveLength(3);
    expect(fixtures.match(/'instructor'/g)).toHaveLength(2);
    expect(fixtures).toContain('Alpha Capital Lab');
    expect(fixtures).toContain('Beta Macro Lab');
    expect(fixtures.match(/insert into public\.macro_narratives/g)).toHaveLength(1);
    expect(fixtures.match(/'Apex'/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(fixtures).toContain('Future inflation shock tests crowded Apex exposure');
  });
});
