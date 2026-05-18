import { executeInstructorPendingOrderVisibilityQuery } from '../../../infrastructure/auth-tenancy/instructor-pending-order-visibility-query';
import { readAuthTenancyRouteSession } from '../../../infrastructure/auth-tenancy/supabase-server';
import type { AuthTenancySession } from '../../../infrastructure/auth-tenancy/session';
import type { InstructorPendingOrderVisibilityQueryRowReader } from '../../../infrastructure/auth-tenancy/instructor-pending-order-visibility-query';

const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const currentMonthIndex = 2;

const formatPercent = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'percent',
});

export default async function InstructorDashboardShellPage() {
  const routeSession = await readAuthTenancyRouteSession();

  if (!routeSession.ok || routeSession.session.role !== 'instructor') {
    return <InstructorDashboardUnavailable />;
  }

  const queryResult = await executeInstructorPendingOrderVisibilityQuery({
    session: routeSession.session,
    scope: { classId, monthIndex: currentMonthIndex },
    rowReader: createBoundedPendingOrderVisibilityRowReader(routeSession.session),
  });

  if (!queryResult.ok) {
    return (
      <main className="shell dashboard-shell">
        <section className="panel">
          <span className="eyebrow">Instructor pending-order visibility</span>
          <h1>Pending-order data unavailable</h1>
          <p>The instructor-scoped pending-order query failed before rendering class status data.</p>
          <p className="route-banner">Failure code: {queryResult.failure.code}</p>
        </section>
      </main>
    );
  }

  const snapshot = queryResult.value.snapshot;
  const completionRate = snapshot.totalFundCount === 0 ? 0 : snapshot.pendingOrderCount / snapshot.totalFundCount;

  return (
    <main className="shell dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Protected instructor dashboard</span>
          <h1>Class order monitor</h1>
          <p>
            Current-month status-only view for enrolled funds. Target weights, estimated tax drag, order details, and
            provider payloads are not rendered.
          </p>
        </div>
        <dl className="metric-grid compact">
          <MetricTile label="Current month" value={`M${snapshot.monthIndex + 1}`} />
          <MetricTile label="Enrolled funds" value={snapshot.totalFundCount.toString()} />
          <MetricTile label="Pending orders" value={snapshot.pendingOrderCount.toString()} />
          <MetricTile label="Missing orders" value={snapshot.missingOrderCount.toString()} />
        </dl>
      </section>

      <section className="surface-grid">
        <article className="terminal-panel wide">
          <div className="panel-heading">
            <span className="eyebrow">Pending-order visibility</span>
            <strong>{formatPercent.format(completionRate)} submitted</strong>
          </div>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Fund</th>
                <th>Submission status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.fundStatuses.map((fundStatus) => (
                <tr className={fundStatus.orderStatus === 'pending' ? 'viewer-row' : undefined} key={fundStatus.fundId}>
                  <td>{formatFundLabel(fundStatus.fundId)}</td>
                  <td>
                    <span className={fundStatus.orderStatus === 'missing' ? 'status danger' : 'status'}>
                      {fundStatus.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="route-banner">
            This slice reuses the bounded instructor server-query executor over parsed scoped rows; live Supabase reads,
            class creation, God Mode, aggregate analytics, month advancement, and browser E2E remain out of scope.
          </p>
        </article>
      </section>
    </main>
  );
}

function MetricTile({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="metric-tile">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function InstructorDashboardUnavailable() {
  return (
    <main className="shell dashboard-shell">
      <section className="panel">
        <span className="eyebrow">Instructor pending-order visibility</span>
        <h1>Protected dashboard waiting for session</h1>
        <p>The route guard must allow a trusted instructor app-role session before class order status is rendered.</p>
        <p className="route-banner">No class roster, order status, God Mode, aggregate, or month-advance payload was rendered.</p>
      </section>
    </main>
  );
}

function formatFundLabel(fundId: string) {
  return `Fund ${fundId.slice(0, 8)}`;
}

function createBoundedPendingOrderVisibilityRowReader(
  _session: AuthTenancySession,
): InstructorPendingOrderVisibilityQueryRowReader {
  return {
    async readInstructorPendingOrderVisibilityRows() {
      return {
        funds: [
          {
            id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            class_id: classId,
          },
          {
            id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            class_id: classId,
          },
          {
            id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            class_id: classId,
          },
          {
            id: '11111111-1111-4111-8111-111111111111',
            class_id: classId,
          },
        ],
        orders: [
          {
            id: '40000000-0000-4000-8000-000000000001',
            class_id: classId,
            fund_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            month_index: currentMonthIndex,
            status: 'pending',
          },
          {
            id: '40000000-0000-4000-8000-000000000002',
            class_id: classId,
            fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            month_index: currentMonthIndex,
            status: 'pending',
          },
        ],
      };
    },
  };
}
