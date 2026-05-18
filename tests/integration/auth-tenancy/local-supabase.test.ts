import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseAuthTenancyServerEnvironment } from '../../../app/infrastructure/auth-tenancy/environment';

const parsedEnvironment = parseAuthTenancyServerEnvironment(process.env);
const databaseUrl = parsedEnvironment.ok ? parsedEnvironment.env.databaseUrl : undefined;
const root = resolve(import.meta.dirname, '../../..');
const migration = readFileSync(
  resolve(root, 'supabase/migrations/202605180001_auth_tenancy_foundation.sql'),
  'utf8',
);
const fixtures = readFileSync(resolve(root, 'supabase/fixtures/auth-tenancy.sql'), 'utf8');

function psqlScalar(sql: string): string {
  if (!parsedEnvironment.ok) {
    throw new Error(`AUTH_TENANCY_DATABASE_URL is invalid for local Supabase RLS proof: ${parsedEnvironment.code}`);
  }

  return execFileSync('psql', [parsedEnvironment.env.databaseUrl, '--no-psqlrc', '--quiet', '--tuples-only', '--no-align', '--set', 'ON_ERROR_STOP=1'], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  }).trim();
}

const runIfConfigured = databaseUrl ? describe : describe.skip;

runIfConfigured('US-038 local Supabase auth-tenancy RLS proof', () => {
  it('allows and denies the approved student and instructor read paths', () => {
    const result = psqlScalar(`
      begin;
      ${migration}
      ${fixtures}

      set local role authenticated;
      select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","app_role":"student"}', true);

      select jsonb_build_object(
        'studentOwnFunds', (select count(*) from public.funds where student_id = '11111111-1111-4111-8111-111111111111'),
        'studentOtherHoldings', (select count(*) from public.asset_holdings where fund_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'),
        'studentRevealedScenarioRows', (select count(*) from public.macro_narratives where class_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        'studentFutureScenarioRows', (select count(*) from public.macro_narratives where class_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and month_index = 2),
        'studentCrossClassFunds', (select count(*) from public.funds where class_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
      )::text;

      reset role;
      set local role authenticated;
      select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa","app_role":"instructor"}', true);

      select jsonb_build_object(
        'instructorOwnedHoldings', (select count(*) from public.asset_holdings where class_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        'instructorUnownedHoldings', (select count(*) from public.asset_holdings where class_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
      )::text;

      reset role;
      set local role authenticated;
      select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa","app_role":"student"}', true);

      select jsonb_build_object(
        'instructorSubjectWithStudentRoleHoldings', (select count(*) from public.asset_holdings where class_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        'instructorSubjectWithStudentRoleAdminRows', (select count(*) from public.class_administrators where class_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
      )::text;

      rollback;
    `);

    const lines = result.split('\n').filter(Boolean);
    const studentProof = JSON.parse(lines.at(-3) ?? '{}');
    const instructorProof = JSON.parse(lines.at(-2) ?? '{}');
    const roleMismatchProof = JSON.parse(lines.at(-1) ?? '{}');

    expect(studentProof).toEqual({
      studentOwnFunds: 1,
      studentOtherHoldings: 0,
      studentRevealedScenarioRows: 2,
      studentFutureScenarioRows: 0,
      studentCrossClassFunds: 0,
    });
    expect(instructorProof).toEqual({
      instructorOwnedHoldings: 6,
      instructorUnownedHoldings: 0,
    });
    expect(roleMismatchProof).toEqual({
      instructorSubjectWithStudentRoleHoldings: 0,
      instructorSubjectWithStudentRoleAdminRows: 0,
    });
  });
});
