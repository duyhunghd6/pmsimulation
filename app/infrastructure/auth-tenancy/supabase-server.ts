import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { parseAuthTenancyBrowserAuthEnvironment } from './environment';
import type { AuthTenancyRouteSessionResult } from './auth-flow';
import { parseSupabaseAuthTenancySession } from './session';

type SupabaseServerClientResult =
  | { ok: true; client: ReturnType<typeof createServerClient> }
  | { ok: false; code: Exclude<AuthTenancyRouteSessionResult, { ok: true }>['code'] };

export async function createAuthTenancySupabaseServerClient(): Promise<SupabaseServerClientResult> {
  const env = parseAuthTenancyBrowserAuthEnvironment(process.env);
  if (!env.ok) {
    return { ok: false, code: env.code };
  }

  const cookieStore = await cookies();

  return {
    ok: true,
    client: createServerClient(env.env.supabaseUrl, env.env.supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
          }
        },
      },
    }),
  };
}

export async function readAuthTenancyRouteSession(): Promise<AuthTenancyRouteSessionResult> {
  const supabase = await createAuthTenancySupabaseServerClient();
  if (!supabase.ok) {
    return supabase;
  }

  const { data, error } = await supabase.client.auth.getUser();
  if (error) {
    return { ok: false, code: 'auth_provider_error' };
  }
  if (!data.user) {
    return { ok: false, code: 'not_authenticated' };
  }

  const parsedSession = parseSupabaseAuthTenancySession({
    sub: data.user.id,
    app_role: data.user.app_metadata.app_role,
  });
  if (!parsedSession.ok) {
    return parsedSession;
  }

  return { ok: true, session: parsedSession.session };
}
