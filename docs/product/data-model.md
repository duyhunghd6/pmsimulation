# Data Model

## Status

This document captures the PRD blueprint for future schema work. Pure TypeScript Asset DNA seed, return-calculation, instructor leaderboard, and month-advance request slices now exist for deterministic domain use, but no database migrations or Drizzle schema files exist yet.

## Core Entities

### Classes

Game instances controlled by instructors.

Expected fields:

- `id`
- `instructor_id`
- `display_name`
- `trigger_mode`
- `current_month_index`
- `total_months`
- `student_join_code`

Rules:

- A class is the primary tenant boundary for gameplay.
- Trigger mode determines whether turn advancement is cron-driven or instructor-driven.
- New classes start at month index `0`.
- Simulations run for 12 to 24 monthly turns.
- Student join codes are student-facing enrollment tokens for a class.
- The MVP pure-domain instructor live month-advance control snapshot emits whether an already-scoped class can currently fast-forward and the deterministic request idempotency key when enabled.

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
- The MVP pure-domain scenario catalog contains deterministic macro narrative rows for the full 12-month MVP curriculum calendar before persistence or seed scripts exist.

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
- The MVP pure-domain scenario catalog pairs market metric rows with macro narrative rows for the same 12-month MVP calendar before persistence or seed scripts exist.

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
- The MVP pure-domain instructor live leaderboard snapshot emits fund id, student display name, current AUM, Sharpe ratio, and pending-order status for already-scoped class funds without holdings or order detail payloads.
- The MVP pure-domain student leaderboard rank snapshot emits rank, display name, current AUM, Sharpe ratio, and viewer-row marking for already-scoped class funds without exact holdings, fund ids in row payloads, pending-order status, target weights, estimated tax drag, order details, or ledger drafts.
- The MVP pure-domain student dashboard current-turn snapshot composes safe viewer-fund dashboard sections without future rows, other-fund ids, other-fund exact holdings, other-fund pending-order details, instructor God Mode data, ledger drafts, or provider payloads.
- The MVP pure-domain student post-turn dashboard snapshot composes the viewer fund attribution report and permitted leaderboard-rank section without order details, target weights, exact holdings, other-fund ids, class aggregate payloads, instructor God Mode data, database rows, or provider payloads.
- The MVP pure-domain student attribution report snapshot emits required post-turn ledger categories only for the viewer fund's already-scoped ledger draft.
- The MVP pure-domain instructor class aggregate analytics snapshot emits class-level fund count, AUM, Sharpe ratio, and order-submission aggregates without per-fund rows, holdings, or order detail payloads.
- The MVP pure-domain instructor dashboard current-turn snapshot composes instructor-only current class sections after class scope has already been enforced, including privileged God Mode holdings, but excludes target weights, estimated tax drag, order detail payloads, ledger drafts, provider payloads, and database rows.

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
- The MVP pure-domain instructor God Mode portfolio visibility snapshot emits exact current Base/Core/Apex allocation weights for already-scoped instructor class funds and is not a student-facing payload.

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
- The MVP pure-domain student TARA order-entry snapshot emits pending draft status, rebalance trigger, target weights, current weights, and estimated tax drag only for the already-scoped viewer fund before persistence exists.
- The MVP pure-domain instructor pending-order visibility snapshot summarizes current-month pending status by enrolled fund without returning target weights or tax-drag details.

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
- The MVP pure-domain risk register evidence snapshot emits these fields for one already-scoped fund month before future `Risk_Register` persistence exists.

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
- The MVP pure-domain processing result emits a per-fund ledger draft with processed month index, fund id, attribution fields, and ending AUM before database persistence exists.
- The MVP pure-domain class-month processing result emits ledger drafts for multiple funds, rejects duplicate fund ids in one batch, and summarizes class-level AUM and cost totals before database persistence exists.
- The MVP pure-domain turn-completion event exposes class-level processing metadata and aggregate totals, not per-fund ledger drafts.
- The MVP pure-domain realtime refresh signal exposes only class/month refresh metadata and dedupe keys, not per-fund ledger drafts, fund processing keys, or aggregate financial totals.
- The MVP pure-domain realtime publication envelope wraps the refresh signal with provider-neutral channel, event, audience, delivery, and publication-key metadata without database rows, provider clients, per-fund ledger drafts, fund processing keys, or aggregate financial totals.
- The MVP pure-domain Supabase Realtime publication descriptor maps the provider-neutral envelope to a broadcast boundary contract without database rows, provider clients, per-fund ledger drafts, fund processing keys, or aggregate financial totals.
- The MVP pure-domain Supabase Realtime subscription descriptor maps the broadcast descriptor to a future client subscription boundary contract without database rows, provider clients, per-fund ledger drafts, fund processing keys, aggregate financial totals, or gameplay data.
- The MVP pure-domain realtime authorized current-turn refetch descriptor maps the subscription descriptor to future client refetch instructions without database rows, provider clients, server query results, UI state, per-fund ledger drafts, fund processing keys, aggregate financial totals, or gameplay data.

## Future Proof Requirements

Schema implementation must include integration proof for:

- Tenant isolation.
- Role-scoped access.
- Future-row protection.
- Tracked metric scoping and convention metadata.
- TARA order validation.
- Risk register treatment mapping.
- Idempotent month processing.
