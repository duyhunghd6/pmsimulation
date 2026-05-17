# Simulation Engine

## Engine Model

The simulation engine is deterministic and curriculum-driven. It must not use random market returns or live stock API data for MVP outcomes.

The engine advances by monthly turns. Each turn reads a scripted macro narrative row, applies deterministic macro relationships, calculates asset-tier returns, processes TARA orders, applies friction, and writes attribution results.

## Macro Scenario Rules

Macro data comes from a pre-scripted scenario array.

The MVP pure-domain scenario catalog defines paired macro narrative and market metric rows for the full 12-month MVP curriculum calendar, including rate-hike stress turns where CPI crosses `3.0%`, policy rate rises by `0.50%`, and VIX rises. Student-facing reveal helpers may return only current and past rows for the selected month.

Indicator timing:

- Leading indicators: `PMI`, `IIP`, `M2 Growth`.
- Coincident indicators: `GDP`, `VIX`, equity-market liquidity, and market-flow strings.
- Lagging indicators: `CPI / Inflation`, `CB Rate`, bond yield, interbank rate, and delayed risk/performance effects.
- Regime context includes `investment_clock_phase`, `scenario_persistence`, `business_cycle_phase`, driver direction, impact weight, and time lag.

Lag rules:

- `GDP` lags `PMI` by one turn.
- `CPI / Inflation` lags `M2 Growth` by two turns.
- `CB Rate` hikes mechanically by `+0.50%` when `CPI` crosses `3.0%`.
- `VIX` spikes on sudden rate hikes.

## Asset Factor Matrix

Assets are modeled as tiers rather than individual tickers:

- Base: safety-oriented assets.
- Core: yield-oriented assets.
- Apex: alpha-oriented assets.

Asset returns are calculated from hardcoded beta sensitivities to macro and market-string deltas. Apex assets have high positive sensitivity to liquidity and severe negative sensitivity to interest-rate and volatility shocks.

The MVP pure-domain return projection calculates each tier's gross return percentage as the sum of each Asset DNA beta coefficient multiplied by the corresponding current-vs-prior factor delta. Base fee percentage remains separate so attribution can apply fee drag without double-counting it in gross market return.

### MVP Asset DNA Seed Catalog

The MVP pure-domain asset DNA catalog defines one seeded coefficient row for each asset tier. Coefficients are used as deterministic sensitivities for future asset-return calculations, and `base_fee_pct` is the tier-level fee input for attribution.

| Tier | beta_m2 | beta_cpi | beta_gdp | beta_vix | beta_policy_rate | beta_usd_vnd | beta_market_liquidity | base_fee_pct |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Base | 0.05 | -0.05 | 0.10 | -0.05 | 0.20 | -0.05 | 0.05 | 0.10 |
| Core | 0.25 | -0.15 | 0.35 | -0.20 | -0.25 | -0.10 | 0.30 | 0.50 |
| Apex | 0.80 | -0.50 | 0.65 | -0.80 | -0.90 | -0.30 | 1.00 | 1.00 |

## Tracked Simulation Metrics

The engine must track the curriculum metric set needed for Asset Pyramid, Driver/String Map, TARA evidence, and instructor debriefs. Tracked metrics include:

- Investor policy and suitability values such as `savings_rate_for_investment`, `asset_allocation_weight`, `risk_profile_class`, `investment_time_horizon`, `expected_annual_return`, `risk_budget`, and `liquidity_buffer`.
- Macro and market strings such as `investment_clock_phase`, `pmi`, `iip`, `m2_growth`, `gdp_growth_yoy`, `inflation_cpi`, `policy_rate`, `usd_vnd_movement`, `vix`, `vn_index_level`, market liquidity, foreign flows, retail flows, and earnings expectations.
- Asset-class and fund inputs such as `fund_nav_per_unit`, `annualized_return`, `adjusted_world_gold_price`, `bank_deposit_rate`, `bond_fund_duration`, `asset_class_fee_pct`, and `base_fee_pct`.
- Portfolio state and order metrics such as `current_AUM`, `asset_allocation_weight`, `position_weight`, `portfolio_turnover`, target tier weights, cash buffer weight, rebalance trigger, pending-order state, and order discipline values.
- Performance and risk metrics such as `roi`, `fund_nav_per_unit`, `alpha`, `beta`, `volatility`, `correlation_coefficient`, `sharpe_ratio`, `treynor_ratio`, `drawdown`, `benchmark_return`, `risk_free_proxy`, `return_frequency`, `lookback_window`, and `annualization_convention`.
- TARA evidence values such as `risk_probability_score`, `risk_impact_score`, `tara_risk_treatment_class`, `tara_risk_matrix`, impact weight, time lag, and treatment action.
- Friction and attribution values such as `market_beta_impact`, `fee_drag`, `tax_paid`, `tax_drag_pct`, `pvp_slippage_paid`, `liquidity_penalty_pct`, classroom sell concentration, and ending AUM.
- Industry and company evidence values such as `revenue`, `revenue_growth`, `net_income`, `earnings_growth`, `operating_cash_flow`, `roe`, `roa`, margins, dividends, market share, valuation ratios, trading volume, and sector-specific case metrics.

Tracked metric records must identify whether the source is seeded, computed, student-entered, or rubric-scored. Advanced risk/performance metrics must retain benchmark, return frequency, lookback window, annualization convention, risk-free proxy, and raw-vs-adjusted price convention.

The MVP pure-domain TARA risk register evidence snapshot records probability, impact, direction, time lag, treatment class, matrix label, and treatment action for one already-scoped fund month before future rubric scoring, persistence, UI, or order execution exists.

## Rebalancing Friction

The engine penalizes naive or crowded rebalancing.

### Tax Drag

Selling profitable Apex assets incurs a simulated `20%` capital gains tax deducted from AUM.

### Crowded-Trade Liquidity Penalty

During end-of-turn processing, if more than `50%` of classroom volume submits identical sell orders for the same asset tier, the engine applies an additional liquidity penalty to that trade.

The MVP domain penalty rate is `5%` of the crowded sold amount for each affected tier.

## TARA Order Rules

Student target allocations must total exactly `100.0%` before submission.

Future implementation should validate the allocation at both the client boundary and the server boundary. Client validation improves usability; server validation is the authoritative guard.

The MVP pure-domain student order-entry snapshot reuses the pending draft and tax-drag preview rules for one already-scoped viewer fund before UI, server actions, persistence, or order execution exists.

## Processing Requirements

Month advancement must be safe from either trigger path:

- Auto mode via scheduled cron.
- Live mode via instructor action on manually paced classes.

Processing must be idempotent so duplicate trigger attempts do not double-apply returns, taxes, slippage, or ledger rows. Advancement requests should carry a deterministic class/month idempotency key before entering the shared processing path.

The MVP pure-domain live month-advance control snapshot reports whether a manual class can currently fast-forward, disables auto-mode or completed classes, and exposes the deterministic request idempotency key only when advancement is available.

The MVP pure-domain shared processing request validates that live and auto trigger inputs advance exactly one month, pair with the correct trigger mode, and preserve the deterministic class/month idempotency key before future worker, order-execution, or ledger persistence code exists.

The MVP pure-domain worker job envelope derives from the shared processing request, preserves the same trigger and class/month idempotency metadata, and excludes fund-level inputs before future Inngest, QStash, or other worker-provider code exists.

The MVP pure-domain per-fund processing result combines a shared processing request with one fund's attribution inputs, preserves trigger metadata, creates a deterministic fund-level processing key, and emits a ledger draft before future worker, order-execution, or ledger persistence code exists.

The MVP pure-domain class-month processing result combines a shared processing request with multiple fund attribution inputs, preserves the same shared trigger metadata, rejects duplicate fund ids in one batch, emits per-fund ledger drafts, and summarizes class-level AUM and cost totals before future worker, order-execution, or ledger persistence code exists.

The MVP pure-domain turn-completion event derives from a completed class-month processing result, preserves shared trigger metadata and aggregate class-level totals, and excludes per-fund ledger drafts before future realtime publication code exists.

The MVP pure-domain realtime refresh signal derives from the turn-completion event and carries only class/month refresh metadata plus dedupe keys before future Supabase Realtime publication or client subscription code exists.

The MVP pure-domain realtime publication envelope derives from the refresh signal and adds provider-neutral class-channel, event, audience, delivery, and publication-key metadata without introducing Supabase Realtime, client subscriptions, provider clients, or gameplay data in the publication payload.

The MVP pure-domain Supabase Realtime publication descriptor derives from that provider-neutral envelope and records the future broadcast boundary metadata without introducing Supabase clients, subscriptions, auth, RLS, platform publication, or gameplay data in the descriptor payload.

The MVP pure-domain Supabase Realtime subscription descriptor derives from that broadcast descriptor and records the future client subscription boundary metadata without introducing Supabase clients, auth, RLS, UI refetch code, platform publication, or gameplay data in the descriptor payload.

The MVP pure-domain realtime authorized current-turn refetch descriptor derives from that subscription descriptor and records the future client refetch plan for authorized current-turn surfaces without introducing Supabase clients, auth, RLS, server queries, UI refetch execution, platform subscription, or gameplay data in the descriptor payload.

## Attribution Requirements

Post-turn results must explain AUM changes by source, including at least:

- Market beta impact.
- Fee drag.
- Tax penalties.
- Tax drag percentage.
- PvP slippage or liquidity penalties.
- Liquidity penalty percentage.
- Classroom sell concentration.
- Ending AUM.

The MVP pure-domain attribution summary calculates ending AUM as starting AUM plus market beta impact minus fee drag, tax paid, and PvP slippage paid.

The MVP pure-domain student attribution report snapshot exposes those post-turn attribution categories only for an already-scoped viewer fund ledger draft. The MVP pure-domain student post-turn dashboard snapshot composes that report with the permitted leaderboard-rank view for one processed class month without exposing order details, holdings, other-fund ids, database rows, provider payloads, or future scenario rows.
