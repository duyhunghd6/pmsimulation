import { NextResponse, type NextRequest } from 'next/server';

import { parseSupabaseAuthTenancySession } from '../../infrastructure/auth-tenancy/session';
import { createAuthTenancySupabaseServerClient } from '../../infrastructure/auth-tenancy/supabase-server';

function loginRedirect(requestUrl: URL, status: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?status=${encodeURIComponent(status)}`, requestUrl.origin));
}

function routeForRole(role: string): string {
  return role === 'instructor' ? '/instructor/dashboard' : '/dashboard';
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const errorCode = requestUrl.searchParams.get('error_code');
  if (errorCode) {
    return loginRedirect(requestUrl, errorCode);
  }

  const code = requestUrl.searchParams.get('code');
  if (!code) {
    return loginRedirect(requestUrl, 'missing-auth-code');
  }

  const supabase = await createAuthTenancySupabaseServerClient();
  if (!supabase.ok) {
    return loginRedirect(requestUrl, supabase.code);
  }

  const { error } = await supabase.client.auth.exchangeCodeForSession(code);
  if (error) {
    return loginRedirect(requestUrl, 'auth-code-exchange-failed');
  }

  const { data, error: userError } = await supabase.client.auth.getUser();
  if (userError || !data.user) {
    return loginRedirect(requestUrl, 'auth-provider-error');
  }

  const parsedSession = parseSupabaseAuthTenancySession({
    sub: data.user.id,
    app_role: data.user.app_metadata.app_role,
  });
  if (!parsedSession.ok) {
    return loginRedirect(requestUrl, parsedSession.code);
  }

  return NextResponse.redirect(new URL(routeForRole(parsedSession.session.role), requestUrl.origin));
}
