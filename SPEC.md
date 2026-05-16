# Apex Alpha Portfolio Simulator Specification Snapshot

Source: `docs/prd/PRD-01.md`
Source version: 1.0.0
Ingested: 2026-05-16
Updated: 2026-05-17 for tracked simulation metrics / driver-string catalog
Status: accepted seed specification

This file records the project specification ingested into the harness from the accepted PRD. It is a stable intake snapshot, not the living product plan.

Living product truth now lives in:

- `docs/product/overview.md`
- `docs/product/roles-and-permissions.md`
- `docs/product/simulation-engine.md`
- `docs/product/user-surfaces.md`
- `docs/product/data-model.md`
- `docs/product/runtime-architecture.md`
- `docs/stories/backlog.md`
- `docs/TEST_MATRIX.md`
- `docs/decisions/0004-accept-apex-alpha-prd.md`

When future behavior changes, update the smaller product docs, story packets, test matrix, and decision records rather than extending this snapshot.

## 1. Executive Summary and Vision

Apex Alpha Portfolio Simulator is a highly scalable, multi-tenant, turn-based web simulation platform for investment training.

Students act as fund managers inside instructor-controlled classroom environments. Each student starts with virtual `$50M` AUM and competes over a 12-to-24 month simulation by building structurally sound portfolios, interpreting time-lagged macroeconomic data, and rebalancing through the TARA methodology.

The product replaces random-number market simulators with a Pedagogical Deterministic Engine designed to enforce the curriculum and expose students to the emotional and mathematical effects of macroeconomic shifts, portfolio drift, tax drag, and liquidity friction.

Target platform: responsive, desktop-first web application with a terminal-style financial UI.

Core stack expected by the PRD:

- Next.js App Router.
- Vercel hosting and cron.
- Supabase PostgreSQL, Auth, Row Level Security, and Realtime.
- Drizzle ORM.
- Inngest, or possibly Upstash QStash, for background simulation processing.
- Tailwind CSS and shadcn/ui.
- Apache ECharts and Tremor.

Automated trigger timezone default: UTC+7 / Vietnam time.

## 2. Pedagogical Foundation

The simulation physics are deterministic and curriculum-driven. They are mathematically rigged to test three coursepacks.

### Coursepack 1: Structure

Students must learn to build and maintain an Asset Pyramid:

- Base = Safety.
- Core = Yield.
- Apex = Alpha.

The simulation should expose weak structures through shocks and portfolio drift.

### Coursepack 2: Drivers

Students must learn to correlate leading economic indicators with lagging outcomes:

- Leading indicators such as `PMI` and `M2 Growth` signal later economic changes.
- Lagging indicators such as central bank rates respond after earlier macro conditions.
- Students use lagged relationships to forecast yield and risk changes.

### Coursepack 3: Action

Students must learn rules-based rebalancing through the TARA Matrix:

- Transfer.
- Avoid.
- Reduce.
- Accept.

The system should punish naive trading and reward surgical rebalancing while modeling tax drag and liquidity friction.

## 3. Personas and Permissions

### Student / Fund Manager

Goal: maximize absolute risk-adjusted return, including Sharpe ratio, and beat classmates on the leaderboard.

Student permissions:

- View their own dashboard.
- Read current and past macro news.
- View current and historical public macro metrics available to their turn.
- View their own portfolio and attribution reports.
- Submit TARA rebalancing orders.
- View leaderboard rank and permitted leaderboard metrics.

Student restrictions:

- Must not view future timeline data.
- Must not view exact holdings of other students.
- Must not access cross-class data.

### Instructor / Game Master

Goal: facilitate experiential learning, control the pace of simulation turns, and debrief the class using real-time aggregated and portfolio-level data.

Instructor permissions:

- Instantiate isolated classes / game instances.
- Generate student join links.
- View all student portfolios in God Mode.
- View class-wide aggregated analytics.
- View live leaderboard data.
- See which students have pending orders.
- Manually trigger the next-month execution for live classroom sessions.

## 4. Core Simulation Mechanics

The simulation does not use random market numbers. It reads from a pre-scripted scenario array and applies deterministic time-lagged causal rules.

### 4.1 Time-Lagged Macro Generator

The backend reads monthly macro values from a scripted scenario source.

Macro indicators and regime strings:

- Leading: `PMI`, `IIP`, and `M2 Growth`.
- Coincident: `GDP`, `VIX`, equity-market liquidity, and market-flow strings.
- Lagging: `CPI / Inflation`, `CB Rate`, bond yield, interbank rate, and delayed risk/performance effects.
- Regime context: `investment_clock_phase`, `scenario_persistence`, `business_cycle_phase`, driver direction, impact weight, and time lag.

Required lag rules:

- `GDP` lags `PMI` by one turn.
- `CPI / Inflation` lags `M2 Growth` by two turns.
- `CB Rate` mechanically hikes `+0.50%` if `CPI` crosses `3.0%`.
- `VIX` spikes on sudden rate hikes.

### 4.2 Asset Factor Matrix

Asset yields are calculated deterministically from macro deltas and hardcoded beta sensitivities.

The asset factor matrix uses beta coefficients for macro and market-string inputs such as:

- M2 liquidity.
- CPI / inflation.
- GDP.
- VIX / volatility.
- Interest rate effects where represented in the asset DNA.
- USD/VND movement.
- Market liquidity and flow pressure where represented in the asset DNA.

The Apex tier, including technology or crypto-like exposure in the PRD example, has strong positive sensitivity to M2 liquidity and severe negative sensitivity to interest rates and VIX.

### 4.3 Friction and PvP Multiplayer Dynamics

The engine penalizes naive rebalancing to reinforce the TARA Matrix.

Tax drag:

- Selling profitable Apex assets incurs a simulated `20%` capital gains tax.
- The tax is automatically deducted from AUM.
- Student order entry should preview estimated tax drag before submission.

Crowded trade / market-depth penalty:

- During end-of-turn processing, if more than `50%` of classroom volume submits identical sell orders for the same asset tier, the engine applies a liquidity penalty to that trade.
- The PRD example penalty is `-5%` extra slippage.
- This simulates market panic and teaches contrarianism.

### 4.4 Tracked Simulation Metrics Catalog

The simulator tracks the broader Asset Pyramid, Driver/String Map, and TARA curriculum metric set rather than only CPI and interest rates. A tracked metric may be seeded, computed, student-entered, or rubric-scored.

Tracked metric families:

- Investor, suitability, and pyramid policy: `savings_rate_for_investment`, `asset_allocation_weight`, `risk_appetite_level`, `risk_profile_class`, `investment_time_horizon`, `expected_annual_return`, `investment_capacity`, `risk_limit`, `risk_budget`, `liquidity_buffer`.
- Macro regime and leading/coincident/lagging drivers: `investment_clock_phase`, `pmi`, `iip`, `m2_growth`, `gdp_growth_yoy`, `inflation_cpi`, `policy_rate`, `bond_yield`, `interbank_rate`, `usd_vnd_movement`, `vix`, `scenario_persistence`, `driver_time_lag`.
- Vietnam equity-market strings: `vn_index_level`, `equity_market_trading_value`, `foreign_investor_net_trading_value`, `retail_investor_net_trading_value`, `market_earnings_growth_expectation`, `valuation_sentiment`, `business_cycle_phase`.
- Asset class and fund inputs: `fund_nav_per_unit`, `annualized_return`, `adjusted_world_gold_price`, `bank_deposit_rate`, `bond_fund_duration`, `asset_class_fee_pct`, `base_fee_pct`.
- Portfolio construction and order state: `current_AUM`, `own_capital`, `position_weight`, `holding_count`, `portfolio_turnover`, `pending_order_count`, `target_weight_base`, `target_weight_core`, `target_weight_apex`, `cash_buffer_weight`, `rebalance_trigger`, `limit_price`, `trigger_price`, `trailing_step`.
- Performance and risk dashboard: `roi`, `fund_nav_per_unit`, `alpha`, `beta`, `volatility`, `correlation_coefficient`, `sharpe_ratio`, `treynor_ratio`, `drawdown`, `benchmark_return`, `risk_free_proxy`, `return_frequency`, `lookback_window`, `annualization_convention`.
- TARA and risk register: `risk_probability_score`, `risk_impact_score`, `tara_risk_treatment_class`, `tara_risk_matrix`, `risk_type`, `risk_direction`, `impact_weight`, `risk_time_lag`, `risk_treatment_action`.
- Friction, attribution, and PvP mechanics: `tax_paid`, `tax_drag_pct`, `pvp_slippage_paid`, `liquidity_penalty_pct`, `classroom_sell_concentration_pct`, `market_beta_impact`, `fee_drag`, `ending_AUM`.
- Industry and company evidence metrics: `revenue`, `revenue_growth`, `net_income`, `earnings_growth`, `operating_cash_flow`, `total_assets`, `roe`, `roa`, `gross_margin`, `net_profit_margin`, `business_profit_margin`, `dividend_yield`, `cash_dividend`, `market_share`, `market_capitalization`, `average_trading_volume`, `mp_stock_group_class`, `ev_to_ebitda`, `price_to_book`, `store_count`, `hot_rolled_coil_price`, `free_cash_flow`, and `leverage_ratio_family`.

Every tracked metric record should carry its month, scope, display label, unit, source or convention note, and source type. Metrics for alpha, beta, volatility, correlation, Sharpe, Treynor, and drawdown must also retain benchmark, return frequency, lookback window, annualization convention, risk-free proxy, and raw-vs-adjusted price convention.

## 5. Functional Requirements

### Epic 1: Student Bloomberg Dashboard

#### FR-1.1 Macro News Terminal

The student dashboard securely displays the current month's news headline, macro regime, market-string dashboard, and all tracked scenario metrics relevant to the current turn.

The browser must not receive future macro or metric rows.

#### FR-1.2 Pyramid Visualizer

The student dashboard includes an interactive funnel or pyramid chart showing current structural portfolio weights.

The visualizer should highlight dangerous portfolio drift.

#### FR-1.3 TARA Order Entry

Students submit target allocation orders through an interactive order-entry surface.

Requirements:

- Sliders or equivalent controls adjust asset-tier allocations.
- Client-side validation must ensure total allocation exactly equals `100.0%` before submission.
- The PRD names Zustand for client-side validation state.
- The interface calculates an estimated tax-drag preview.
- Server-side order handling must still enforce authorization and accepted allocation rules.

#### FR-1.4 Attribution Report

After a processed turn, students receive an attribution report that explains AUM movement.

The report should break out effects such as:

- Market beta impact.
- Tax penalties.
- PvP slippage / liquidity penalties.
- Ending AUM.

### Epic 2: Multi-Tenant Instructor Management

#### FR-2.1 Class Instantiation

Instructors can create isolated game instances identified by `class_id` and generate join links for students.

Class isolation is a security and anti-cheat requirement.

#### FR-2.2 Live Leaderboard

Instructors can view a live leaderboard showing:

- Student funds.
- AUM.
- Sharpe ratios.
- Pending-order status.

The instructor can view broader detail than students, including God Mode portfolio visibility and class-wide analytics.

### Epic 3: Dual-Trigger Execution Engine

The engine that advances the simulation month must support both asynchronous auto mode and synchronous live mode.

#### FR-3.1 Auto Mode

The system automatically locks pending orders and advances the month at `0:00 AM UTC+7` daily via Vercel Cron.

#### FR-3.2 Live Mode

An instructor can click a Fast-Forward Month action on the instructor dashboard to advance a month for live 15-minute classroom blitz rounds.

Live mode bypasses the cron timer but must feed the same safe end-of-month processing path as auto mode.

#### FR-3.3 Live WebSockets

When engine processing completes, the server pushes a realtime event.

Connected student screens must refresh to the new month without requiring manual `F5` reload.

## 6. Technical Architecture

### Frontend Framework

Next.js App Router is the intended frontend framework.

React Server Components should securely fetch current-turn data on the server. Future months must never be sent to the browser.

Server Actions should handle secure form submissions where appropriate.

### Hosting and Cron

Vercel is the intended hosting and cron platform.

Vercel Cron should support the midnight UTC+7 auto-mode trigger.

### Database and Auth

Supabase PostgreSQL and Supabase Auth are the intended database and authentication foundation.

Row Level Security must isolate:

- Students from other students' exact holdings.
- Students and instructors from other classes' data.
- All users from future scenario data unless explicitly authorized by role and product contract.

Supabase Realtime provides WebSocket-style refresh events for turn completion.

### ORM

Drizzle ORM is the intended type-safe database access layer for serverless runtime compatibility.

### Math Worker / Queue

End-of-month simulation processing must be offloaded to a background worker / queue because PvP slippage, taxes, and beta-matrix math for 20-50 students may exceed Vercel serverless timeout limits.

The PRD names Inngest as the primary option and Upstash QStash as an alternative.

### UI Components

Tailwind CSS and shadcn/ui are intended for the professional dark-mode financial aesthetic.

### Data Visualization

Apache ECharts and Tremor are intended for charts, funnel / pyramid visualization, KPI metrics, and leaderboards.

## 7. Core Database Schema Blueprint

The PRD defines these PostgreSQL / Drizzle entities as a starting blueprint. No schema, migration, or RLS policy files exist yet.

### `Classes`

Game instances.

Expected fields:

- `id` primary key.
- `instructor_id` foreign key.
- `trigger_mode` with auto/manual style values.
- `current_month_index`.

### `Macro_Narratives`

Scripted macro scenario rows.

Expected fields:

- `id` primary key.
- `month_index`.
- `news_headline`.
- `investment_clock_phase`.
- `pmi`.
- `iip`.
- `m2_growth`.
- `gdp_growth_yoy`.
- `inflation_cpi`.
- `policy_rate`.
- `bond_yield`.
- `interbank_rate`.
- `usd_vnd_movement`.
- `vix`.
- `scenario_persistence`.

### `Market_Metrics`

Current-turn market strings scoped to a class and month.

Expected fields:

- `id` primary key.
- `class_id` foreign key.
- `month_index`.
- `vn_index_level`.
- `equity_market_trading_value`.
- `foreign_investor_net_trading_value`.
- `retail_investor_net_trading_value`.
- `market_earnings_growth_expectation`.
- `valuation_sentiment`.
- `business_cycle_phase`.

### `Tracked_Metrics`

Generic registry for seeded, computed, student-entered, or rubric-scored metric values.

Expected fields:

- `id` primary key.
- `scope_type`, covering scenario, class, fund, or case scopes.
- `scope_id`.
- `month_index`.
- `metric_id`.
- `display_label`.
- `metric_family`.
- `value_numeric`.
- `value_text`.
- `unit`.
- `source_type`.
- `source_note`.
- `convention_note`.

### `Asset_DNA`

Asset-tier physics / beta configuration.

Expected fields:

- `asset_tier`, covering Base, Core, and Apex.
- `beta_m2`.
- `beta_cpi`.
- `beta_gdp`.
- `beta_vix`.
- `beta_policy_rate`.
- `beta_usd_vnd`.
- `beta_market_liquidity`.
- `base_fee_pct`.

### `Funds`

Student fund state.

Expected fields:

- `id` primary key.
- `class_id` foreign key.
- `student_id` foreign key.
- `current_AUM`.
- `risk_appetite_level`.
- `risk_profile_class`.
- `investment_time_horizon`.
- `expected_annual_return`.
- `risk_budget`.
- `liquidity_buffer`.
- `roi`.
- `alpha`.
- `beta`.
- `volatility`.
- `sharpe_ratio`.
- `treynor_ratio`.
- `drawdown`.

### `Asset_Holdings`

Portfolio allocation by fund and tier.

Expected fields:

- `id` primary key.
- `fund_id` foreign key.
- `tier`.
- `allocation_weight_pct`.
- `position_weight`.
- `cash_buffer_weight`.

### `TARA_Orders`

Student target-allocation orders.

Expected fields:

- `id` primary key.
- `fund_id` foreign key.
- `month_index`.
- `target_weights_json`.
- `estimated_tax_drag`.
- `rebalance_trigger`.
- `status`, including pending and processed states.

### `Risk_Register`

TARA risk evidence and treatment decisions by fund and month.

Expected fields:

- `id` primary key.
- `fund_id` foreign key.
- `month_index`.
- `risk_type`.
- `risk_direction`.
- `impact_weight`.
- `risk_time_lag`.
- `risk_probability_score`.
- `risk_impact_score`.
- `tara_risk_treatment_class`.
- `risk_treatment_action`.

### `Simulation_Ledger`

Turn attribution and accounting.

Expected fields:

- `id` primary key.
- `fund_id` foreign key.
- `month_index`.
- `market_beta_impact`.
- `fee_drag`.
- `tax_paid`.
- `tax_drag_pct`.
- `pvp_slippage_paid`.
- `liquidity_penalty_pct`.
- `classroom_sell_concentration_pct`.
- `ending_AUM`.

## 8. Out of Scope for MVP Phase 1

The MVP excludes:

- Live stock API integration, including Yahoo Finance or Bloomberg connections.
- Individual stock picking; students allocate by asset tier rather than micro-tickers such as `AAPL`.
- Short selling.
- Leverage / margin accounts.
- Instructor scenario-builder tooling.

The platform relies on deterministic seeded macro narratives for MVP to guarantee specific educational outcomes.

## 9. Initial Harness Decomposition

This specification was decomposed into living contracts and candidate work surfaces:

- Product overview for goals, boundaries, and learning model.
- Roles and permissions for student, instructor, tenancy, and anti-cheat access rules.
- Simulation engine contract for deterministic macro, beta, tax, slippage, and execution rules.
- User surfaces contract for student dashboard, instructor management, leaderboards, and realtime refresh.
- Data model contract for the initial entity blueprint.
- Runtime architecture contract for target stack, background execution, security, and hosting constraints.
- Story backlog for candidate epics and implementation slices.
- Test matrix for current proof gaps and future validation shape.

Implementation has not started. Future stories must create concrete source code, schemas, validation, RLS policies, jobs, UI flows, and executable proof from these contracts.
