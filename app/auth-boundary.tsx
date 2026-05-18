import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { classifyAuthTenancyProtectedRouteAccess } from './infrastructure/auth-tenancy/auth-flow';
import type { AuthTenancyRole } from './infrastructure/auth-tenancy/session';
import { readAuthTenancyRouteSession } from './infrastructure/auth-tenancy/supabase-server';
import { signOut } from './login/actions';

export async function NoGameplayProtectedRoute({
  children,
  expectedRole,
  routeLabel,
}: Readonly<{
  children: ReactNode;
  expectedRole: AuthTenancyRole;
  routeLabel: string;
}>) {
  const access = classifyAuthTenancyProtectedRouteAccess({
    expectedRole,
    routeSession: await readAuthTenancyRouteSession(),
  });

  if (access.decision === 'redirect_to_login') {
    redirect('/login?status=sign-in-required');
  }

  if (access.decision === 'block_configuration') {
    return (
      <main className="shell">
        <section className="panel">
          <span className="eyebrow">Protected {routeLabel}</span>
          <h1>Auth configuration required</h1>
          <p>
            This route is protected, but the browser-safe Supabase URL and anon key are not configured for this runtime.
          </p>
          <p className="route-banner">No session, database, RLS, or gameplay payload was read.</p>
          <a className="card" href="/login">
            Return to login
          </a>
        </section>
      </main>
    );
  }

  if (access.decision === 'block_role') {
    return (
      <main className="shell">
        <section className="panel">
          <span className="eyebrow">Protected {routeLabel}</span>
          <h1>Role claim required</h1>
          <p>The authenticated session does not carry the expected trusted app-role claim for this route.</p>
          <p className="route-banner">No gameplay payload was read or rendered for this session.</p>
          <form action={signOut}>
            <button className="button" type="submit">
              Sign out
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="auth-banner">
        <span>{routeLabel} protected by Supabase Auth session and app-role claim.</span>
        <form action={signOut}>
          <button className="button secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </>
  );
}
