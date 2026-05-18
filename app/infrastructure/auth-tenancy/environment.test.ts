import { describe, expect, it } from 'vitest';

import { parseAuthTenancyBrowserAuthEnvironment, parseAuthTenancyServerEnvironment } from './environment';

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

describe('parseAuthTenancyBrowserAuthEnvironment', () => {
  it('accepts only the browser-safe Supabase auth environment values', () => {
    const result = parseAuthTenancyBrowserAuthEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'local-anon-key',
      AUTH_TENANCY_DATABASE_URL: 'postgresql://postgres:secret@127.0.0.1:54322/postgres',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
    });

    expect(result).toEqual({
      ok: true,
      env: {
        supabaseUrl: 'http://127.0.0.1:54321',
        supabaseAnonKey: 'local-anon-key',
      },
    });
    expect(result.ok && Object.keys(result.env).sort()).toEqual(['supabaseAnonKey', 'supabaseUrl']);
  });

  it('accepts hosted HTTPS Supabase URLs for the future browser auth client', () => {
    expect(
      parseAuthTenancyBrowserAuthEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: 'https://project-ref.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'hosted-anon-key',
      }),
    ).toEqual({
      ok: true,
      env: {
        supabaseUrl: 'https://project-ref.supabase.co',
        supabaseAnonKey: 'hosted-anon-key',
      },
    });
  });

  it('rejects malformed or server-only browser auth environment values', () => {
    expect(parseAuthTenancyBrowserAuthEnvironment(null)).toEqual({
      ok: false,
      code: 'environment_not_object',
    });
    expect(parseAuthTenancyBrowserAuthEnvironment({})).toEqual({
      ok: false,
      code: 'missing_supabase_url',
    });
    expect(
      parseAuthTenancyBrowserAuthEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      }),
    ).toEqual({ ok: false, code: 'invalid_supabase_url' });
    expect(
      parseAuthTenancyBrowserAuthEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: 'http://supabase.example.test',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      }),
    ).toEqual({ ok: false, code: 'invalid_supabase_url' });
    expect(
      parseAuthTenancyBrowserAuthEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: 'https://project-ref.supabase.co',
      }),
    ).toEqual({ ok: false, code: 'missing_supabase_anon_key' });
    expect(
      parseAuthTenancyBrowserAuthEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: 'https://project-ref.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ' anon-key ',
      }),
    ).toEqual({ ok: false, code: 'invalid_supabase_anon_key' });
  });
});
