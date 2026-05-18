export type AuthTenancyServerEnvironment = {
  databaseUrl: string;
};

export type AuthTenancyEnvironmentFailureCode =
  | 'environment_not_object'
  | 'missing_database_url'
  | 'invalid_database_url';

export type AuthTenancyEnvironmentParseResult =
  | { ok: true; env: AuthTenancyServerEnvironment }
  | { ok: false; code: AuthTenancyEnvironmentFailureCode };

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
