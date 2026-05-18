import { describe, expect, it } from 'vitest';

import { parseAuthTenancyServerEnvironment } from './environment';

describe('parseAuthTenancyServerEnvironment', () => {
  it('accepts the local auth-tenancy database proof URL from server environment input', () => {
    expect(
      parseAuthTenancyServerEnvironment({
        AUTH_TENANCY_DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
      }),
    ).toEqual({
      ok: true,
      env: { databaseUrl: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' },
    });
  });

  it('rejects missing, malformed, or non-Postgres database URLs', () => {
    expect(parseAuthTenancyServerEnvironment(null)).toEqual({
      ok: false,
      code: 'environment_not_object',
    });
    expect(parseAuthTenancyServerEnvironment({})).toEqual({
      ok: false,
      code: 'missing_database_url',
    });
    expect(parseAuthTenancyServerEnvironment({ AUTH_TENANCY_DATABASE_URL: '' })).toEqual({
      ok: false,
      code: 'missing_database_url',
    });
    expect(parseAuthTenancyServerEnvironment({ AUTH_TENANCY_DATABASE_URL: 'not-a-url' })).toEqual({
      ok: false,
      code: 'invalid_database_url',
    });
    expect(parseAuthTenancyServerEnvironment({ AUTH_TENANCY_DATABASE_URL: 'https://example.test/db' })).toEqual({
      ok: false,
      code: 'invalid_database_url',
    });
  });
});
