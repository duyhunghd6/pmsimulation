import {
  executeInstructorPendingOrderVisibilityQuery,
  type InstructorPendingOrderVisibilityQueryRowReader,
} from '../../../infrastructure/auth-tenancy/instructor-pending-order-visibility-query';
import {
  executeInstructorLiveLeaderboardQuery,
  type InstructorLiveLeaderboardQueryRowReader,
} from '../../../infrastructure/auth-tenancy/instructor-live-leaderboard-query';
import {
  executeInstructorClassAggregateAnalyticsQuery,
  type InstructorClassAggregateAnalyticsQueryRowReader,
} from '../../../infrastructure/auth-tenancy/instructor-class-aggregate-analytics-query';
import { createInstructorLiveMonthAdvanceControlSnapshot } from '../../../domain/classes/month-advancement';
import {
  executeInstructorGodModePortfolioVisibilityQuery,
  type InstructorGodModePortfolioVisibilityQueryRowReader,
} from '../../../infrastructure/auth-tenancy/instructor-god-mode-portfolio-visibility-query';
import { readAuthTenancyRouteSession } from '../../../infrastructure/auth-tenancy/supabase-server';
import { RealtimeRefreshPanel } from '../../../realtime-refresh-panel';
import { createRealtimeRefreshPanelConfig } from '../../../realtime-refresh-plan';
import type { AuthTenancySession } from '../../../infrastructure/auth-tenancy/session';

import { advanceInstructorLiveMonth, createInstructorClass } from './actions';
import { AdvanceMonthSubmitButton, CreateClassSubmitButton } from './create-class-submit-button';

const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const currentMonthIndex = 2;
const totalMonths = 12;
const triggerMode = 'manual';

const formatPercent = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'percent',
});

type InstructorDashboardShellPageProps = Readonly<{
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function InstructorDashboardShellPage({ searchParams }: InstructorDashboardShellPageProps) {
  const params = searchParams ? await searchParams : {};
  const classCreationNotice = createClassCreationNotice(params);
  const liveMonthAdvanceNotice = createLiveMonthAdvanceNotice(params);
  const routeSession = await readAuthTenancyRouteSession();

  if (!routeSession.ok || routeSession.session.role !== 'instructor') {
    return <InstructorDashboardUnavailable />;
  }

  const liveMonthAdvanceControlResult = createInstructorLiveMonthAdvanceControlSnapshot({
    classId,
    triggerMode,
    currentMonthIndex,
    totalMonths,
  });

  if (!liveMonthAdvanceControlResult.ok) {
    return <InstructorDashboardQueryFailure failureCode={liveMonthAdvanceControlResult.errors.map((error) => error.code).join(',')} />;
  }

  const rowReader = createBoundedInstructorDashboardRowReader(routeSession.session);
  const [pendingOrderResult, liveLeaderboardResult, aggregateAnalyticsResult, godModeResult] = await Promise.all([
    executeInstructorPendingOrderVisibilityQuery({
      session: routeSession.session,
      scope: { classId, monthIndex: currentMonthIndex },
      rowReader,
    }),
    executeInstructorLiveLeaderboardQuery({
      session: routeSession.session,
      scope: { classId, monthIndex: currentMonthIndex },
      rowReader,
    }),
    executeInstructorClassAggregateAnalyticsQuery({
      session: routeSession.session,
      scope: { classId, monthIndex: currentMonthIndex },
      rowReader,
    }),
    executeInstructorGodModePortfolioVisibilityQuery({
      session: routeSession.session,
      scope: { classId, monthIndex: currentMonthIndex },
      rowReader,
    }),
  ]);

  if (!pendingOrderResult.ok) {
    return <InstructorDashboardQueryFailure failureCode={pendingOrderResult.failure.code} />;
  }

  if (!liveLeaderboardResult.ok) {
    return <InstructorDashboardQueryFailure failureCode={liveLeaderboardResult.failure.code} />;
  }

  if (!aggregateAnalyticsResult.ok) {
    return <InstructorDashboardQueryFailure failureCode={aggregateAnalyticsResult.failure.code} />;
  }

  if (!godModeResult.ok) {
    return <InstructorDashboardQueryFailure failureCode={godModeResult.failure.code} />;
  }

  const snapshot = pendingOrderResult.value.snapshot;
  const leaderboard = liveLeaderboardResult.value.snapshot;
  const aggregateAnalytics = aggregateAnalyticsResult.value.snapshot;
  const godMode = godModeResult.value.snapshot;
  const liveMonthAdvanceControl = liveMonthAdvanceControlResult.value;
  const instructorDashboard = {
    snapshotType: 'instructor_dashboard_current_turn' as const,
    classId,
    monthIndex: currentMonthIndex,
    pendingOrderVisibility: snapshot,
    liveLeaderboard: leaderboard,
    godModePortfolioVisibility: godMode,
    classAggregateAnalytics: aggregateAnalytics,
    liveMonthAdvanceControl,
  };
  const realtimeRefreshConfig = createRealtimeRefreshPanelConfig({
    classId,
    currentMonthIndex,
    totalMonths,
    surface: 'instructor_dashboard_current_turn',
    instructorDashboard,
  });
  const completionRate = snapshot.totalFundCount === 0 ? 0 : snapshot.pendingOrderCount / snapshot.totalFundCount;
  const missingOrderRate = aggregateAnalytics.fundCount === 0 ? 0 : aggregateAnalytics.missingOrderCount / aggregateAnalytics.fundCount;

  return (
    <main className="shell dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Protected instructor dashboard</span>
          <h1>Class order monitor</h1>
          <p>
            Current-month status, leaderboard-safe rankings, aggregate analytics, privileged God Mode holdings, and a bounded live
            month-advance control for the instructor-scoped class. Per-fund aggregate rows, target weights, estimated tax drag, order
            details, worker jobs, realtime payloads, and provider payloads are not rendered.
          </p>
        </div>
        <dl className="metric-grid compact">
          <MetricTile label="Current month" value={`M${snapshot.monthIndex + 1}`} />
          <MetricTile label="Enrolled funds" value={snapshot.totalFundCount.toString()} />
          <MetricTile label="Pending orders" value={snapshot.pendingOrderCount.toString()} />
          <MetricTile label="Class AUM" value={formatCurrency(aggregateAnalytics.totalCurrentAum)} />
          <MetricTile label="Ranked funds" value={leaderboard.rankedFundCount.toString()} />
          <MetricTile label="God Mode funds" value={godMode.fundCount.toString()} />
          <MetricTile
            label="Live advance"
            value={liveMonthAdvanceControl.canAdvance ? `M${liveMonthAdvanceControl.nextMonthIndex! + 1}` : 'Disabled'}
          />
        </dl>
      </section>

      <section className="surface-grid">
        <RealtimeRefreshPanel config={realtimeRefreshConfig} viewerRole="instructor" />

        <article className="terminal-panel wide">
          <div className="panel-heading">
            <span className="eyebrow">Class creation</span>
            <strong>Join-link boundary</strong>
          </div>
          <p>
            Create an instructor-scoped class receipt through the bounded server action executor. This proof store returns a safe
            join-code receipt; live Supabase writes, roster management, realtime publication, and provider-backed browser proof remain
            unwired.
          </p>
          <form action={createInstructorClass} className="form-stack">
            <label htmlFor="className">Class name</label>
            <input id="className" name="className" placeholder="Alpha Capital Lab" required />

            <label htmlFor="joinCode">Join code</label>
            <input
              id="joinCode"
              maxLength={12}
              minLength={6}
              name="joinCode"
              pattern="[A-Z0-9]{6,12}"
              placeholder="ALPHA01"
              required
            />

            <label htmlFor="triggerMode">Trigger mode</label>
            <select defaultValue="manual" id="triggerMode" name="triggerMode" required>
              <option value="manual">Manual live mode</option>
              <option value="auto">Auto scheduled mode</option>
            </select>

            <CreateClassSubmitButton />
          </form>
          <ClassCreationNotice notice={classCreationNotice} />
        </article>

        <article className="terminal-panel wide">
          <div className="panel-heading">
            <span className="eyebrow">Manual month advance</span>
            <strong>
              {liveMonthAdvanceControl.canAdvance
                ? `M${liveMonthAdvanceControl.currentMonthIndex + 1} → M${liveMonthAdvanceControl.nextMonthIndex! + 1}`
                : formatDisabledReason(liveMonthAdvanceControl.disabledReason)}
            </strong>
          </div>
          <p>
            Accept a live Fast-Forward Month receipt for this instructor-scoped manual class and dispatch the bounded Inngest worker handoff.
            Ledger writes, realtime publication, and processed order execution remain unwired.
          </p>
          <dl className="metric-grid compact">
            <MetricTile label="Trigger mode" value={liveMonthAdvanceControl.triggerMode} />
            <MetricTile label="Current month" value={`M${liveMonthAdvanceControl.currentMonthIndex + 1}`} />
            <MetricTile
              label="Next month"
              value={liveMonthAdvanceControl.nextMonthIndex === null ? 'n/a' : `M${liveMonthAdvanceControl.nextMonthIndex + 1}`}
            />
            <MetricTile label="Total months" value={liveMonthAdvanceControl.totalMonths.toString()} />
          </dl>
          <form action={advanceInstructorLiveMonth} className="form-stack">
            <input name="classId" type="hidden" value={liveMonthAdvanceControl.classId} />
            <input name="triggerMode" type="hidden" value={liveMonthAdvanceControl.triggerMode} />
            <input name="currentMonthIndex" type="hidden" value={liveMonthAdvanceControl.currentMonthIndex} />
            <input name="totalMonths" type="hidden" value={liveMonthAdvanceControl.totalMonths} />
            <AdvanceMonthSubmitButton canAdvance={liveMonthAdvanceControl.canAdvance} />
          </form>
          {!liveMonthAdvanceControl.canAdvance ? (
            <p className="route-banner danger">
              Live month advancement is disabled for this class: {formatDisabledReason(liveMonthAdvanceControl.disabledReason)}.
            </p>
          ) : null}
          <LiveMonthAdvanceNotice notice={liveMonthAdvanceNotice} />
        </article>

        <article className="terminal-panel">
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
        </article>

        <article className="terminal-panel">
          <div className="panel-heading">
            <span className="eyebrow">Live leaderboard</span>
            <strong>{leaderboard.pendingOrderCount} pending</strong>
          </div>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Fund</th>
                <th>AUM</th>
                <th>Sharpe</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.rows.map((row) => (
                <tr className={row.orderStatus === 'pending' ? 'viewer-row' : undefined} key={row.fundId}>
                  <td>#{row.rank}</td>
                  <td>{row.studentDisplayName}</td>
                  <td>{formatCurrency(row.currentAum)}</td>
                  <td>{row.sharpeRatio.toFixed(2)}</td>
                  <td>
                    <span className={row.orderStatus === 'missing' ? 'status danger' : 'status'}>{row.orderStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="terminal-panel">
          <div className="panel-heading">
            <span className="eyebrow">Class aggregate analytics</span>
            <strong>{formatPercent.format(missingOrderRate)} missing</strong>
          </div>
          <dl className="metric-grid compact">
            <MetricTile label="Total AUM" value={formatCurrency(aggregateAnalytics.totalCurrentAum)} />
            <MetricTile label="Average AUM" value={formatCurrency(aggregateAnalytics.averageCurrentAum)} />
            <MetricTile
              label="Average Sharpe"
              value={aggregateAnalytics.averageSharpeRatio === null ? 'n/a' : aggregateAnalytics.averageSharpeRatio.toFixed(2)}
            />
            <MetricTile label="Missing orders" value={aggregateAnalytics.missingOrderCount.toString()} />
            <MetricTile label="Pending AUM" value={formatCurrency(aggregateAnalytics.pendingOrderAum)} />
            <MetricTile label="Missing AUM" value={formatCurrency(aggregateAnalytics.missingOrderAum)} />
          </dl>
          <p className="route-banner">
            Aggregate analytics render class totals only; per-fund rows, holdings, target weights, estimated tax drag, and order
            details stay outside this aggregate surface.
          </p>
        </article>

        <article className="terminal-panel wide">
          <div className="panel-heading">
            <span className="eyebrow">God Mode portfolio visibility</span>
            <strong>{godMode.pendingOrderCount} pending / {godMode.missingOrderCount} missing</strong>
          </div>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Fund</th>
                <th>AUM</th>
                <th>Sharpe</th>
                <th>Base</th>
                <th>Core</th>
                <th>Apex</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {godMode.rows.map((row) => (
                <tr className={row.orderStatus === 'pending' ? 'viewer-row' : undefined} key={row.fundId}>
                  <td>{row.studentDisplayName}</td>
                  <td>{formatCurrency(row.currentAum)}</td>
                  <td>{row.sharpeRatio.toFixed(2)}</td>
                  {row.holdings.map((holding) => (
                    <td key={holding.tier}>{holding.allocationWeightPct.toFixed(1)}%</td>
                  ))}
                  <td>
                    <span className={row.orderStatus === 'missing' ? 'status danger' : 'status'}>{row.orderStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="route-banner">
            This view renders exact Base/Core/Apex holdings only from the bounded instructor God Mode executor; live Supabase reads,
            target weights, order details, month advancement, and browser E2E remain out of scope.
          </p>
        </article>
      </section>
    </main>
  );
}

type ClassCreationNoticeState =
  | { status: 'empty' }
  | { status: 'created'; joinCode: string; triggerMode: string }
  | { status: 'validation-error'; errors: string }
  | { status: 'not-authorized' }
  | { status: 'failed'; reason: string };

function createClassCreationNotice(params: Record<string, string | string[] | undefined>): ClassCreationNoticeState {
  const status = firstSearchParam(params.classCreationStatus);

  if (status === 'created') {
    return {
      status,
      joinCode: firstSearchParam(params.joinCode) ?? 'pending',
      triggerMode: firstSearchParam(params.triggerMode) ?? 'manual',
    };
  }

  if (status === 'validation-error') {
    return { status, errors: firstSearchParam(params.errors) ?? 'invalid_draft' };
  }

  if (status === 'not-authorized') {
    return { status };
  }

  if (status === 'failed') {
    return { status, reason: firstSearchParam(params.reason) ?? 'unknown_failure' };
  }

  return { status: 'empty' };
}

function ClassCreationNotice({ notice }: Readonly<{ notice: ClassCreationNoticeState }>) {
  if (notice.status === 'created') {
    return (
      <p className="route-banner">
        Class creation accepted for join code {notice.joinCode} in {notice.triggerMode} mode. The receipt is safe for browser delivery
        and excludes persisted class ids, raw database rows, auth sessions, and realtime payloads.
      </p>
    );
  }

  if (notice.status === 'validation-error') {
    return <p className="route-banner danger">Class draft rejected before persistence: {notice.errors}.</p>;
  }

  if (notice.status === 'not-authorized') {
    return <p className="route-banner danger">A trusted instructor app-role session is required before creating a class.</p>;
  }

  if (notice.status === 'failed') {
    return <p className="route-banner danger">Class creation stopped at the bounded server action: {notice.reason}.</p>;
  }

  return <p className="route-banner">No class creation receipt yet. Submit a draft to create the first browser-visible receipt.</p>;
}

type LiveMonthAdvanceNoticeState =
  | { status: 'empty' }
  | { status: 'accepted'; advancementKey: string; currentMonth: string; nextMonth: string }
  | { status: 'validation-error'; errors: string }
  | { status: 'not-authorized' }
  | { status: 'failed'; reason: string };

function createLiveMonthAdvanceNotice(params: Record<string, string | string[] | undefined>): LiveMonthAdvanceNoticeState {
  const status = firstSearchParam(params.liveMonthAdvanceStatus);

  if (status === 'accepted') {
    return {
      status,
      advancementKey: firstSearchParam(params.advancementKey) ?? 'pending',
      currentMonth: firstSearchParam(params.currentMonth) ?? 'current',
      nextMonth: firstSearchParam(params.nextMonth) ?? 'next',
    };
  }

  if (status === 'validation-error') {
    return { status, errors: firstSearchParam(params.errors) ?? 'invalid_live_month_advance' };
  }

  if (status === 'not-authorized') {
    return { status };
  }

  if (status === 'failed') {
    return { status, reason: firstSearchParam(params.reason) ?? 'unknown_failure' };
  }

  return { status: 'empty' };
}

function LiveMonthAdvanceNotice({ notice }: Readonly<{ notice: LiveMonthAdvanceNoticeState }>) {
  if (notice.status === 'accepted') {
    return (
      <p className="route-banner">
        Live month advance accepted from M{notice.currentMonth} to M{notice.nextMonth}. Receipt key {notice.advancementKey} is safe for
        instructor browser delivery after the bounded Inngest handoff and excludes worker jobs, realtime payloads, ledger drafts, and
        processed month results.
      </p>
    );
  }

  if (notice.status === 'validation-error') {
    return <p className="route-banner danger">Live month advance rejected before bounded worker handoff: {notice.errors}.</p>;
  }

  if (notice.status === 'not-authorized') {
    return <p className="route-banner danger">A trusted instructor app-role session is required before live month advancement.</p>;
  }

  if (notice.status === 'failed') {
    return <p className="route-banner danger">Live month advance stopped before accepted worker handoff: {notice.reason}.</p>;
  }

  return <p className="route-banner">No live month-advance receipt yet. Accept the control to prove the browser-visible state.</p>;
}

function formatDisabledReason(reason: string | null) {
  if (reason === 'auto_mode') {
    return 'Auto mode';
  }

  if (reason === 'simulation_complete') {
    return 'Simulation complete';
  }

  return 'Unavailable';
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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
        <span className="eyebrow">Instructor dashboard visibility</span>
        <h1>Protected dashboard waiting for session</h1>
        <p>The route guard must allow a trusted instructor app-role session before class dashboard data is rendered.</p>
        <p className="route-banner">
          No class roster, order status, leaderboard, God Mode, aggregate analytics, or month-advance payload was rendered.
        </p>
      </section>
    </main>
  );
}

function InstructorDashboardQueryFailure({ failureCode }: Readonly<{ failureCode: string }>) {
  return (
    <main className="shell dashboard-shell">
      <section className="panel">
        <span className="eyebrow">Instructor dashboard visibility</span>
        <h1>Instructor data unavailable</h1>
        <p>The instructor-scoped queries failed before rendering class status, leaderboard, aggregate, or God Mode data.</p>
        <p className="route-banner">Failure code: {failureCode}</p>
      </section>
    </main>
  );
}

function formatFundLabel(fundId: string) {
  return `Fund ${fundId.slice(0, 8)}`;
}

function formatCurrency(value: number) {
  return `$${(value / 1_000_000).toFixed(1)}M`;
}

function createBoundedInstructorDashboardRowReader(
  _session: AuthTenancySession,
): InstructorPendingOrderVisibilityQueryRowReader &
  InstructorLiveLeaderboardQueryRowReader &
  InstructorClassAggregateAnalyticsQueryRowReader &
  InstructorGodModePortfolioVisibilityQueryRowReader {
  const funds = [
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      class_id: classId,
      student_display_name: 'Alpha Fund',
      current_aum: '51000000.00',
      sharpe_ratio: '1.1500',
    },
    {
      id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      class_id: classId,
      student_display_name: 'Beta Fund',
      current_aum: '54000000.00',
      sharpe_ratio: '0.9000',
    },
    {
      id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      class_id: classId,
      student_display_name: 'Gamma Fund',
      current_aum: '54000000.00',
      sharpe_ratio: '1.2000',
    },
    {
      id: '11111111-1111-4111-8111-111111111111',
      class_id: classId,
      student_display_name: 'Delta Fund',
      current_aum: '49500000.00',
      sharpe_ratio: '0.6400',
    },
  ];
  const orders = [
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
  ];
  const holdings = [
    {
      id: '50000000-0000-4000-8000-000000000001',
      class_id: classId,
      fund_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      tier: 'Base',
      allocation_weight_pct: '35.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000002',
      class_id: classId,
      fund_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      tier: 'Core',
      allocation_weight_pct: '40.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000003',
      class_id: classId,
      fund_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      tier: 'Apex',
      allocation_weight_pct: '25.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000004',
      class_id: classId,
      fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      tier: 'Base',
      allocation_weight_pct: '30.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000005',
      class_id: classId,
      fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      tier: 'Core',
      allocation_weight_pct: '45.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000006',
      class_id: classId,
      fund_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      tier: 'Apex',
      allocation_weight_pct: '25.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000007',
      class_id: classId,
      fund_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      tier: 'Base',
      allocation_weight_pct: '45.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000008',
      class_id: classId,
      fund_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      tier: 'Core',
      allocation_weight_pct: '35.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000009',
      class_id: classId,
      fund_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      tier: 'Apex',
      allocation_weight_pct: '20.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000010',
      class_id: classId,
      fund_id: '11111111-1111-4111-8111-111111111111',
      tier: 'Base',
      allocation_weight_pct: '50.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000011',
      class_id: classId,
      fund_id: '11111111-1111-4111-8111-111111111111',
      tier: 'Core',
      allocation_weight_pct: '35.0000',
    },
    {
      id: '50000000-0000-4000-8000-000000000012',
      class_id: classId,
      fund_id: '11111111-1111-4111-8111-111111111111',
      tier: 'Apex',
      allocation_weight_pct: '15.0000',
    },
  ];

  return {
    async readInstructorPendingOrderVisibilityRows() {
      return { funds, orders };
    },
    async readInstructorLiveLeaderboardRows() {
      return { funds, orders };
    },
    async readInstructorClassAggregateAnalyticsRows() {
      return { funds, orders };
    },
    async readInstructorGodModePortfolioVisibilityRows() {
      return { funds, holdings, orders };
    },
  };
}
