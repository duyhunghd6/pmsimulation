import { readAuthTenancyRouteSession } from '../../infrastructure/auth-tenancy/supabase-server';

import { joinClassByCode } from './actions';

type JoinClassLandingPageProps = Readonly<{
  params: Promise<{ joinCode: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

type JoinStatusNotice =
  | { status: 'none' }
  | { status: 'enrolled'; className: string; currentMonth: string }
  | { status: 'validation-error'; errors: string }
  | { status: 'not-authorized' }
  | { status: 'failed'; reason: string };

const joinCodePattern = /^[A-Z0-9]{6,12}$/;

export default async function JoinClassLandingPage({ params, searchParams }: JoinClassLandingPageProps) {
  const { joinCode: rawJoinCode } = await params;
  const queryParams = searchParams ? await searchParams : {};
  const joinCode = decodeURIComponent(rawJoinCode).trim().toUpperCase();
  const isValidJoinCode = joinCodePattern.test(joinCode);
  const routeSession = isValidJoinCode ? await readAuthTenancyRouteSession() : null;
  const notice = createJoinStatusNotice(queryParams);
  const canEnroll = routeSession?.ok === true && routeSession.session.role === 'student';

  return (
    <main className="shell">
      <section className="panel">
        <span className="eyebrow">Student class join link</span>
        <h1>{isValidJoinCode ? `Join class ${joinCode}` : 'Join link unavailable'}</h1>
        <p>
          This public landing route validates the instructor-provided join code before an authenticated student can attach roster enrollment.
          It does not expose roster rows, instructor data, future scenarios, provider payloads, or gameplay snapshots.
        </p>
        <JoinStatus notice={notice} />
        {isValidJoinCode ? (
          <>
            <dl className="metric-grid compact">
              <div className="metric-tile">
                <dt>Join code</dt>
                <dd>{joinCode}</dd>
              </div>
              <div className="metric-tile">
                <dt>Enrollment</dt>
                <dd>{canEnroll ? 'Ready' : enrollmentStateFor(routeSession)}</dd>
              </div>
            </dl>
            {canEnroll ? (
              <form action={joinClassByCode} className="form-stack">
                <input name="joinCode" type="hidden" value={joinCode} />
                <p className="route-banner">
                  Enroll this authenticated student into the class for this join code. The server action prefers the Supabase RPC-backed roster
                  writer when the App Router Supabase client is configured and returns only a student-safe enrollment receipt.
                </p>
                <button className="button" type="submit">
                  Enroll in class
                </button>
              </form>
            ) : (
              <>
                <p className="route-banner">
                  Sign in with the student role before enrollment can be attached to this code. Class membership writes run only after the
                  authenticated server action confirms the student role.
                </p>
                <a className="card" href="/login">
                  Continue to sign in
                </a>
              </>
            )}
          </>
        ) : (
          <p className="route-banner danger">
            Join codes must be 6 to 12 uppercase letters or numbers. No class lookup or enrollment attempt was made.
          </p>
        )}
        <a className="card" href="/">
          Return to shell
        </a>
      </section>
    </main>
  );
}

function JoinStatus({ notice }: Readonly<{ notice: JoinStatusNotice }>) {
  if (notice.status === 'none') {
    return null;
  }

  if (notice.status === 'enrolled') {
    return (
      <p className="route-banner">
        Enrollment accepted for {notice.className} at M{notice.currentMonth}. Open the protected student dashboard after the next server render.
      </p>
    );
  }

  if (notice.status === 'validation-error') {
    return <p className="route-banner danger">Enrollment validation failed: {notice.errors}.</p>;
  }

  if (notice.status === 'not-authorized') {
    return <p className="route-banner danger">Enrollment requires a signed-in student session.</p>;
  }

  return <p className="route-banner danger">Enrollment failed before a roster receipt was delivered: {notice.reason}.</p>;
}

function createJoinStatusNotice(params: Record<string, string | string[] | undefined>): JoinStatusNotice {
  const status = firstSearchParam(params.joinStatus);

  if (status === 'enrolled') {
    return {
      status,
      className: firstSearchParam(params.className) ?? 'the selected class',
      currentMonth: firstSearchParam(params.currentMonth) ?? '1',
    };
  }

  if (status === 'validation-error') {
    return { status, errors: firstSearchParam(params.errors) ?? 'invalid_join_request' };
  }

  if (status === 'not-authorized') {
    return { status };
  }

  if (status === 'failed') {
    return { status, reason: firstSearchParam(params.reason) ?? 'unknown' };
  }

  return { status: 'none' };
}

function enrollmentStateFor(routeSession: Awaited<ReturnType<typeof readAuthTenancyRouteSession>> | null): string {
  if (routeSession?.ok && routeSession.session.role !== 'student') {
    return 'Wrong role';
  }
  if (routeSession?.ok === false && routeSession.code !== 'not_authenticated') {
    return 'Sign-in unavailable';
  }

  return 'Sign-in required';
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
