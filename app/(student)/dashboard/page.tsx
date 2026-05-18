import { executeStudentDashboardCurrentTurnQuery } from '../../infrastructure/auth-tenancy/student-dashboard-current-turn-query';
import { readAuthTenancyRouteSession } from '../../infrastructure/auth-tenancy/supabase-server';
import type { AuthTenancySession } from '../../infrastructure/auth-tenancy/session';
import type { StudentDashboardCurrentTurnQueryRowReader } from '../../infrastructure/auth-tenancy/student-dashboard-current-turn-query';

const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const currentMonthIndex = 2;

const formatCurrency = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'currency',
  currency: 'USD',
});

const formatNumber = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const formatPercent = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  style: 'percent',
});

export default async function StudentDashboardShellPage() {
  const routeSession = await readAuthTenancyRouteSession();

  if (!routeSession.ok || routeSession.session.role !== 'student') {
    return <StudentDashboardUnavailable />;
  }

  const queryResult = await executeStudentDashboardCurrentTurnQuery({
    session: routeSession.session,
    scope: { classId, fundId, monthIndex: currentMonthIndex },
    rowReader: createBoundedCurrentTurnRowReader(routeSession.session),
    intendedWeights: { Base: 35, Core: 45, Apex: 20 },
    dangerousDriftThresholdPct: 8,
  });

  if (!queryResult.ok) {
    return (
      <main className="shell dashboard-shell">
        <section className="panel">
          <span className="eyebrow">Student current-turn dashboard</span>
          <h1>Current-turn data unavailable</h1>
          <p>The student-scoped dashboard query failed before rendering gameplay data.</p>
          <p className="route-banner">Failure code: {queryResult.failure.code}</p>
        </section>
      </main>
    );
  }

  const dashboard = queryResult.value.snapshot;
  const macroNews = dashboard.macroNews;
  const driverString = dashboard.driverStringDashboard;
  const pyramid = dashboard.portfolioPyramid;
  const orderEntry = dashboard.taraOrderEntry;
  const leaderboard = dashboard.leaderboardRank;

  return (
    <main className="shell dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Protected student current-turn dashboard</span>
          <h1>Apex Alpha command center</h1>
          <p>{macroNews.newsHeadline}</p>
        </div>
        <dl className="metric-grid compact">
          <MetricTile label="Current month" value={`M${dashboard.monthIndex + 1}`} />
          <MetricTile label="Clock phase" value={driverString.context.investmentClockPhase} />
          <MetricTile label="Business cycle" value={driverString.context.businessCyclePhase} />
          <MetricTile label="Viewer rank" value={`${leaderboard.viewerRank}/${leaderboard.rankedFundCount}`} />
        </dl>
      </section>

      <section className="surface-grid">
        <article className="terminal-panel wide">
          <div className="panel-heading">
            <span className="eyebrow">Macro news terminal</span>
            <strong>{macroNews.scenarioPersistence}</strong>
          </div>
          <dl className="metric-grid">
            <MetricTile label="PMI" value={formatNumber.format(macroNews.macroDrivers.pmi)} />
            <MetricTile label="CPI" value={`${formatNumber.format(macroNews.macroDrivers.inflationCpi)}%`} />
            <MetricTile label="Policy rate" value={`${formatNumber.format(macroNews.macroDrivers.policyRate)}%`} />
            <MetricTile label="VIX" value={formatNumber.format(macroNews.macroDrivers.vix)} />
            <MetricTile label="VN Index" value={formatNumber.format(macroNews.marketStrings.vnIndexLevel)} />
            <MetricTile label="Valuation" value={macroNews.marketStrings.valuationSentiment} />
          </dl>
        </article>

        <article className="terminal-panel wide">
          <div className="panel-heading">
            <span className="eyebrow">Driver/String dashboard</span>
            <strong>No future rows rendered</strong>
          </div>
          <div className="driver-columns">
            {(['leading', 'coincident', 'lagging'] as const).map((timing) => (
              <div className="driver-column" key={timing}>
                <h2>{timing}</h2>
                <dl>
                  {driverString.driverMetrics
                    .filter((metric) => metric.timing === timing)
                    .map((metric) => (
                      <div className="metric-line" key={metric.metricId}>
                        <dt>{metric.displayLabel}</dt>
                        <dd>{formatNumber.format(metric.value)}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            ))}
          </div>
          <dl className="market-string-list">
            {driverString.marketStringMetrics.map((metric) => (
              <div className="metric-line" key={metric.metricId}>
                <dt>{metric.displayLabel}</dt>
                <dd>{typeof metric.value === 'number' ? formatNumber.format(metric.value) : metric.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="terminal-panel">
          <div className="panel-heading">
            <span className="eyebrow">Portfolio pyramid</span>
            <strong>{pyramid.hasDangerousDrift ? 'Drift alert' : 'Within bands'}</strong>
          </div>
          <div className="pyramid-stack">
            {pyramid.tiers.map((tier) => (
              <div className="pyramid-row" key={tier.tier}>
                <div className="metric-line">
                  <dt>{tier.tier}</dt>
                  <dd>{formatNumber.format(tier.currentWeightPct)}%</dd>
                </div>
                <div className="bar-track" aria-label={`${tier.tier} current allocation`}>
                  <div className="bar-fill" style={{ width: `${tier.currentWeightPct}%` }} />
                </div>
                <span className={tier.isDangerousDrift ? 'status danger' : 'status'}>
                  {tier.driftDirection} {formatNumber.format(tier.driftPct)} pts
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="terminal-panel">
          <div className="panel-heading">
            <span className="eyebrow">TARA order entry</span>
            <strong>{orderEntry.status}</strong>
          </div>
          <dl className="metric-grid compact">
            {Object.entries(orderEntry.targetWeights).map(([tier, weight]) => (
              <MetricTile key={tier} label={`${tier} target`} value={`${formatNumber.format(weight)}%`} />
            ))}
            <MetricTile label="Apex reduction" value={`${formatNumber.format(orderEntry.estimatedTaxDrag.apexReductionWeightPct)} pts`} />
            <MetricTile label="Estimated tax" value={formatCurrency.format(orderEntry.estimatedTaxDrag.estimatedTaxPaid)} />
            <MetricTile label="Tax drag" value={formatPercent.format(orderEntry.estimatedTaxDrag.taxDragPct / 100)} />
          </dl>
          <p className="route-banner">Order submission remains out of scope; this slice renders the safe current-turn entry state only.</p>
        </article>

        <article className="terminal-panel wide">
          <div className="panel-heading">
            <span className="eyebrow">Leaderboard rank</span>
            <strong>Viewer-safe rows</strong>
          </div>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Fund</th>
                <th>AUM</th>
                <th>Sharpe</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.rows.map((row) => (
                <tr className={row.isViewerFund ? 'viewer-row' : undefined} key={`${row.rank}-${row.studentDisplayName}`}>
                  <td>{row.rank}</td>
                  <td>{row.studentDisplayName}</td>
                  <td>{formatCurrency.format(row.currentAum)}</td>
                  <td>{formatNumber.format(row.sharpeRatio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

function StudentDashboardUnavailable() {
  return (
    <main className="shell dashboard-shell">
      <section className="panel">
        <span className="eyebrow">Student current-turn dashboard</span>
        <h1>Protected dashboard waiting for session</h1>
        <p>The route guard must allow a trusted student app-role session before current-turn dashboard data is rendered.</p>
        <p className="route-banner">No macro, holding, order, leaderboard, or attribution payload was rendered.</p>
      </section>
    </main>
  );
}

function createBoundedCurrentTurnRowReader(session: AuthTenancySession): StudentDashboardCurrentTurnQueryRowReader {
  return {
    async readStudentDashboardCurrentTurnRows() {
      return {
        macroNarratives: [
          {
            id: '10000000-0000-4000-8000-000000000001',
            class_id: classId,
            month_index: currentMonthIndex,
            news_headline: 'Liquidity tightens as policy rates rise',
            investment_clock_phase: 'slowdown',
            pmi: '49.20',
            iip: '51.10',
            m2_growth: '8.40',
            gdp_growth_yoy: '5.70',
            inflation_cpi: '3.20',
            policy_rate: '5.00',
            bond_yield: '4.80',
            interbank_rate: '4.20',
            usd_vnd_movement: '1.10',
            vix: '28.00',
            scenario_persistence: 'rate_hike_stress',
          },
        ],
        marketMetrics: [
          {
            id: '20000000-0000-4000-8000-000000000001',
            class_id: classId,
            month_index: currentMonthIndex,
            vn_index_level: '1175.00',
            equity_market_trading_value: '14000.00',
            foreign_investor_net_trading_value: '-900.00',
            retail_investor_net_trading_value: '500.00',
            market_earnings_growth_expectation: '-1.50',
            valuation_sentiment: 'cautious',
            business_cycle_phase: 'late_cycle',
          },
        ],
        funds: [
          {
            id: fundId,
            class_id: classId,
            student_id: session.subjectId,
            current_aum: '50000000.00',
            sharpe_ratio: '1.20',
          },
        ],
        holdings: [
          {
            id: '30000000-0000-4000-8000-000000000001',
            class_id: classId,
            fund_id: fundId,
            tier: 'Base',
            allocation_weight_pct: '40.00',
          },
          {
            id: '30000000-0000-4000-8000-000000000002',
            class_id: classId,
            fund_id: fundId,
            tier: 'Core',
            allocation_weight_pct: '30.00',
          },
          {
            id: '30000000-0000-4000-8000-000000000003',
            class_id: classId,
            fund_id: fundId,
            tier: 'Apex',
            allocation_weight_pct: '30.00',
          },
        ],
        orders: [
          {
            id: '40000000-0000-4000-8000-000000000001',
            class_id: classId,
            fund_id: fundId,
            month_index: currentMonthIndex,
            target_weights_json: { Base: 50, Core: 30, Apex: 20 },
            estimated_tax_drag: '0.20',
            rebalance_trigger: 'student_tara_submission',
            status: 'pending',
          },
        ],
        trackedMetrics: [
          {
            id: '50000000-0000-4000-8000-000000000001',
            class_id: classId,
            fund_id: fundId,
            scope_type: 'fund',
            scope_id: fundId,
            month_index: currentMonthIndex,
            metric_id: 'apex_unrealized_gain_pct',
            display_label: 'Apex unrealized gain',
            metric_family: 'portfolio_state',
            value_numeric: '10.00',
            value_text: null,
            unit: 'percent',
            source_type: 'computed',
            source_note: 'Current unrealized gain for Apex tax preview.',
            convention_note: 'Percentage gain over cost basis.',
          },
        ],
        leaderboardFunds: [
          {
            id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            class_id: classId,
            student_display_name: 'Beta Fund',
            current_aum: '52000000.00',
            sharpe_ratio: '1.10',
          },
          {
            id: fundId,
            class_id: classId,
            student_display_name: 'Viewer Fund',
            current_aum: '50000000.00',
            sharpe_ratio: '1.20',
          },
        ],
      };
    },
  };
}
