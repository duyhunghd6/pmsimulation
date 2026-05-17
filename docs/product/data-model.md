# Data Model

## Status

This document captures the PRD blueprint for future schema work. Pure TypeScript Asset DNA seed and return-calculation slices now exist for deterministic domain use, but no database migrations or Drizzle schema files exist yet.

## Core Entities

### Classes

Game instances controlled by instructors.

Expected fields:

- `id`
- `instructor_id`
- `trigger_mode`
- `current_month_index`

Rules:

- A class is the primary tenant boundary for gameplay.
- Trigger mode determines whether turn advancement is cron-driven or instructor-driven.

### Macro Narratives

Scripted monthly scenario rows.

Expected fields:

- `id`
- `month_index`
- `news_headline`
- `investment_clock_phase`
- `pmi`
- `iip`
- `m2_growth`
- `gdp_growth_yoy`
- `inflation_cpi`
- `policy_rate`
- `bond_yield`
- `interbank_rate`
- `usd_vnd_movement`
- `vix`
- `scenario_persistence`

Rules:

- Future rows must not be exposed to students.
- Scenario rows drive deterministic outcomes.

### Market Metrics

Current-turn market strings scoped to class and month.

Expected fields:

- `id`
- `class_id`
- `month_index`
- `vn_index_level`
- `equity_market_trading_value`
- `foreign_investor_net_trading_value`
- `retail_investor_net_trading_value`
- `market_earnings_growth_expectation`
- `valuation_sentiment`
- `business_cycle_phase`

Rules:

- Students may only see current or previously revealed market metric rows.
- Future market strings are scenario data and must be protected like future macro rows.

### Tracked Metrics

Generic registry for seeded, computed, student-entered, or rubric-scored metric values.

Expected fields:

- `id`
- `scope_type`
- `scope_id`
- `month_index`
- `metric_id`
- `display_label`
- `metric_family`
- `value_numeric`
- `value_text`
- `unit`
- `source_type`
- `source_note`
- `convention_note`

Rules:

- Metric scope must identify whether the value belongs to a scenario, class, fund, or case.
- Advanced risk/performance metrics must store benchmark, return frequency, lookback window, annualization convention, risk-free proxy, and raw-vs-adjusted price convention.

### Asset DNA

Asset-tier factor sensitivities and fees.

Expected fields:

- `asset_tier`
- `beta_m2`
- `beta_cpi`
- `beta_gdp`
- `beta_vix`
- `beta_policy_rate`
- `beta_usd_vnd`
- `beta_market_liquidity`
- `base_fee_pct`

Rules:

- Asset tiers are Base, Core, and Apex for MVP.
- The MVP pure-domain catalog contains one seeded Asset DNA row for each tier.
- Individual stock picking is out of scope.

### Funds

Student-managed portfolio state.

Expected fields:

- `id`
- `class_id`
- `student_id`
- `current_AUM`
- `risk_appetite_level`
- `risk_profile_class`
- `investment_time_horizon`
- `expected_annual_return`
- `risk_budget`
- `liquidity_buffer`
- `roi`
- `alpha`
- `beta`
- `volatility`
- `sharpe_ratio`
- `treynor_ratio`
- `drawdown`

Rules:

- A student fund belongs to a class.
- Students may only access their own exact fund state.

### Asset Holdings

Current allocation by asset tier.

Expected fields:

- `id`
- `fund_id`
- `tier`
- `allocation_weight_pct`
- `position_weight`
- `cash_buffer_weight`

Rules:

- Allocations should sum to `100.0%` for a valid current portfolio.

### TARA Orders

Target allocation submissions for a month.

Expected fields:

- `id`
- `fund_id`
- `month_index`
- `target_weights_json`
- `estimated_tax_drag`
- `rebalance_trigger`
- `status`

Rules:

- Target weights must sum to exactly `100.0%`.
- Orders are pending until processed by the end-of-month engine.
- Duplicate processing must not apply the same order twice.

### Risk Register

TARA risk evidence and treatment decisions by fund and month.

Expected fields:

- `id`
- `fund_id`
- `month_index`
- `risk_type`
- `risk_direction`
- `impact_weight`
- `risk_time_lag`
- `risk_probability_score`
- `risk_impact_score`
- `tara_risk_treatment_class`
- `risk_treatment_action`

Rules:

- TARA treatment must be tied to probability, impact, direction, and time-lag evidence.
- Risk treatment classes must map to concrete Avoid, Reduce, Accept, or Transfer actions.

### Simulation Ledger

Post-turn attribution records.

Expected fields:

- `id`
- `fund_id`
- `month_index`
- `market_beta_impact`
- `fee_drag`
- `tax_paid`
- `tax_drag_pct`
- `pvp_slippage_paid`
- `liquidity_penalty_pct`
- `classroom_sell_concentration_pct`
- `ending_AUM`

Rules:

- Ledger rows are the durable source for attribution reports.
- Month/fund processing should be idempotent.

## Future Proof Requirements

Schema implementation must include integration proof for:

- Tenant isolation.
- Role-scoped access.
- Future-row protection.
- Tracked metric scoping and convention metadata.
- TARA order validation.
- Risk register treatment mapping.
- Idempotent month processing.
