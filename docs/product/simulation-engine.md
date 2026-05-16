# Simulation Engine

## Engine Model

The simulation engine is deterministic and curriculum-driven. It must not use random market returns or live stock API data for MVP outcomes.

The engine advances by monthly turns. Each turn reads a scripted macro narrative row, applies deterministic macro relationships, calculates asset-tier returns, processes TARA orders, applies friction, and writes attribution results.

## Macro Scenario Rules

Macro data comes from a pre-scripted scenario array.

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

## Tracked Simulation Metrics

The engine must track the curriculum metric set needed for Asset Pyramid, Driver/String Map, and TARA evidence. Tracked metrics include:

- Investor policy and suitability values such as `risk_profile_class`, `investment_time_horizon`, `expected_annual_return`, `risk_budget`, and `liquidity_buffer`.
- Macro and market strings such as `investment_clock_phase`, `m2_growth`, `gdp_growth_yoy`, `inflation_cpi`, `policy_rate`, `usd_vnd_movement`, `vn_index_level`, market liquidity, foreign flows, retail flows, and earnings expectations.
- Portfolio state and order metrics such as `current_AUM`, `asset_allocation_weight`, `position_weight`, `portfolio_turnover`, target tier weights, and pending-order state.
- Performance and risk metrics such as `roi`, `alpha`, `beta`, `volatility`, `correlation_coefficient`, `sharpe_ratio`, `treynor_ratio`, and `drawdown`.
- TARA evidence values such as `risk_probability_score`, `risk_impact_score`, `tara_risk_treatment_class`, impact weight, time lag, and treatment action.
- Friction and attribution values such as `market_beta_impact`, `fee_drag`, `tax_paid`, `tax_drag_pct`, `pvp_slippage_paid`, `liquidity_penalty_pct`, classroom sell concentration, and ending AUM.

Advanced risk/performance metrics must retain benchmark, return frequency, lookback window, annualization convention, risk-free proxy, and raw-vs-adjusted price convention.

## Rebalancing Friction

The engine penalizes naive or crowded rebalancing.

### Tax Drag

Selling profitable Apex assets incurs a simulated `20%` capital gains tax deducted from AUM.

### Crowded-Trade Liquidity Penalty

During end-of-turn processing, if more than `50%` of classroom volume submits identical sell orders for the same asset tier, the engine applies an additional liquidity penalty to that trade.

## TARA Order Rules

Student target allocations must total exactly `100.0%` before submission.

Future implementation should validate the allocation at both the client boundary and the server boundary. Client validation improves usability; server validation is the authoritative guard.

## Processing Requirements

Month advancement must be safe from either trigger path:

- Auto mode via scheduled cron.
- Live mode via instructor action.

Processing must be idempotent so duplicate trigger attempts do not double-apply returns, taxes, slippage, or ledger rows.

## Attribution Requirements

Post-turn results must explain AUM changes by source, including at least:

- Market beta impact.
- Tax penalties.
- PvP slippage or liquidity penalties.
- Ending AUM.
