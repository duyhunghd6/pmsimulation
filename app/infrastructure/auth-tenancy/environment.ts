export type AuthTenancyServerEnvironment = {
  databaseUrl: string;
};

export type AuthTenancyBrowserAuthEnvironment = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export type AuthTenancyEnvironmentFailureCode =
  | 'environment_not_object'
  | 'missing_database_url'
  | 'invalid_database_url';

export type AuthTenancyBrowserAuthEnvironmentFailureCode =
  | 'environment_not_object'
  | 'missing_supabase_url'
  | 'invalid_supabase_url'
  | 'missing_supabase_anon_key'
  | 'invalid_supabase_anon_key';

export type AuthTenancyEnvironmentParseResult =
  | { ok: true; env: AuthTenancyServerEnvironment }
  | { ok: false; code: AuthTenancyEnvironmentFailureCode };

export type AuthTenancyBrowserAuthEnvironmentParseResult =
  | { ok: true; env: AuthTenancyBrowserAuthEnvironment }
  | { ok: false; code: AuthTenancyBrowserAuthEnvironmentFailureCode };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPostgresUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'postgres:' || url.protocol === 'postgresql:';
  } catch {
    return false;
  }
}

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isSupabaseAuthUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (url.protocol === 'http:' && isLocalHostname(url.hostname));
  } catch {
    return false;
  }
}

function isPublicAnonKey(value: unknown): value is string {
  return typeof value === 'string' && value.trim() === value && value.length > 0;
}

export function parseAuthTenancyServerEnvironment(input: unknown): AuthTenancyEnvironmentParseResult {
  if (!isRecord(input)) {
    return { ok: false, code: 'environment_not_object' };
  }

  const databaseUrl = input.AUTH_TENANCY_DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl === '') {
    return { ok: false, code: 'missing_database_url' };
  }
  if (typeof databaseUrl !== 'string' || !isPostgresUrl(databaseUrl)) {
    return { ok: false, code: 'invalid_database_url' };
  }

  return { ok: true, env: { databaseUrl } };
}

export function parseAuthTenancyBrowserAuthEnvironment(
  input: unknown,
): AuthTenancyBrowserAuthEnvironmentParseResult {
  if (!isRecord(input)) {
    return { ok: false, code: 'environment_not_object' };
  }

  const supabaseUrl = input.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl === undefined || supabaseUrl === '') {
    return { ok: false, code: 'missing_supabase_url' };
  }
  if (typeof supabaseUrl !== 'string' || !isSupabaseAuthUrl(supabaseUrl)) {
    return { ok: false, code: 'invalid_supabase_url' };
  }

  const supabaseAnonKey = input.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseAnonKey === undefined || supabaseAnonKey === '') {
    return { ok: false, code: 'missing_supabase_anon_key' };
  }
  if (!isPublicAnonKey(supabaseAnonKey)) {
    return { ok: false, code: 'invalid_supabase_anon_key' };
  }

  return { ok: true, env: { supabaseUrl, supabaseAnonKey } };
}
