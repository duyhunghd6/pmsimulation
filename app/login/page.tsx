import { parseAuthTenancyBrowserAuthEnvironment } from '../infrastructure/auth-tenancy/environment';

import { signInWithEmail } from './actions';

const statusMessages: Record<string, string> = {
  'auth-error': 'Supabase Auth rejected the sign-in request.',
  'check-email': 'Check your email for the Supabase magic link.',
  'invalid_supabase_anon_key': 'The public Supabase anon key is invalid for this runtime.',
  'invalid_supabase_url': 'The public Supabase URL is invalid for this runtime.',
  'auth-code-exchange-failed': 'Supabase Auth could not exchange the magic-link code for a session.',
  'auth-provider-error': 'Supabase Auth could not load the authenticated user after callback.',
  'invalid_role': 'The authenticated user does not have a valid app_role claim.',
  'missing-auth-code': 'The auth callback did not include a Supabase code.',
  'missing-email': 'Enter an email address to request a magic link.',
  'missing_role': 'The authenticated user does not have an app_role claim.',
  'missing_supabase_anon_key': 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required before sign-in can run.',
  'otp_expired': 'The magic link is invalid or expired. Request a fresh link and open it once in this browser.',
  'missing_supabase_url': 'NEXT_PUBLIC_SUPABASE_URL is required before sign-in can run.',
  'sign-in-required': 'Sign in before opening a protected route.',
  'signed-out': 'You have been signed out.',
};

type LoginPageProps = Readonly<{
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const env = parseAuthTenancyBrowserAuthEnvironment(process.env);
  const params = searchParams ? await searchParams : {};
  const status = firstSearchParam(params.status);
  const statusMessage = status ? (statusMessages[status] ?? 'The auth request could not be completed.') : undefined;

  return (
    <main className="shell">
      <section className="panel">
        <span className="eyebrow">Public auth entry</span>
        <h1>Sign in boundary</h1>
        <p>
          This route starts the Supabase magic-link flow with only browser-safe public environment values. It does not
          read a database, RLS policy, server-only credential, or gameplay payload.
        </p>
        {statusMessage ? <p className="route-banner">{statusMessage}</p> : null}
        {env.ok ? (
          <form action={signInWithEmail} className="form-stack">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" placeholder="student@example.edu" type="email" required />
            <button className="button" type="submit">
              Send magic link
            </button>
          </form>
        ) : (
          <p className="route-banner">
            Login is disabled until public Supabase auth environment values are configured. Current blocker: {env.code}.
          </p>
        )}
        <a className="card" href="/">
          Return to shell
        </a>
      </section>
    </main>
  );
}
