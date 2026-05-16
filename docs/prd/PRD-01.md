# Product Requirements Document (PRD)

**Product Name:** Apex Alpha Portfolio Simulator
**Document Version:** 1.0.0
**Target Platform:** Web Application (Responsive Desktop-First "Terminal" UI)
**Core Tech Stack:** Next.js (App Router), Vercel, Supabase, Inngest
**Timezone Constraint:** Automated triggers default to UTC+7 (Vietnam Time)

---

## 1. Executive Summary & Vision

**The Problem:** Traditional financial investment training is overly theoretical. Students memorize formulas but fail to grasp the emotional and mathematical impacts of macroeconomic shifts, portfolio drift, and tax drag in a live, competitive market.
**The Product:** A highly scalable, multi-tenant, turn-based simulation platform. Students act as Fund Managers, competing within a "Classroom" environment to build structurally sound portfolios, interpret time-lagged macroeconomic data, and dynamically rebalance using the TARA methodology.
**The Goal:** Deliver a secure, anti-cheat, multiplayer environment that replaces random-number market simulators with a **Pedagogical Deterministic Engine** designed to strictly enforce the curriculum.

## 2. Pedagogical Foundation (The 3 Coursepacks)

The simulation physics are mathematically rigged to test three specific learning outcomes:

1. **Coursepack 1 (Structure):** Forcing students to build an **Asset Pyramid** (Base = Safety, Core = Yield, Apex = Alpha) to survive systemic shocks.
2. **Coursepack 2 (Drivers):** Training students to correlate *Leading* economic indicators (e.g., M2 Growth) to predict *Lagging* indicators (e.g., Central Bank Rates) to forecast yield changes.
3. **Coursepack 3 (Action):** Punishing naive trading and rewarding surgical, rules-based rebalancing via the **TARA Matrix** (Transfer, Avoid, Reduce, Accept) while navigating tax drag and liquidity friction.

---

## 3. User Personas & Permissions

### 3.1. The Student (Fund Manager)

* **Goal:** Start with a virtual $50M AUM. Maximize absolute Risk-Adjusted Return (Sharpe Ratio) and beat classmates on the leaderboard over a 12-to-24 month simulation.
* **Permissions:** Can view their own dashboard, read current/past macro news, submit rebalancing orders, and view their rank. *Strictly restricted from viewing future timeline data or exact holdings of other students.*

### 3.2. The Instructor (Game Master)

* **Goal:** Facilitate experiential learning, control the pace of the simulation turns, and debrief the class using real-time aggregated data.
* **Permissions:** Can instantiate classes, view all student portfolios in "God Mode," manually trigger the "Next Month" execution, and view class-wide aggregated analytics.

---

## 4. Core Simulation Mechanics (The Physics Engine)

*The simulation does NOT use random numbers. It uses a Time-Lagged Causal Engine to reward foresight.*

### 4.1 Time-Lagged Macro Generator

The backend reads from a pre-scripted Scenario Array governed by strict mathematical lag rules:

* **Leading Indicators:** `PMI` (Manufacturing) & `M2 Growth` (Liquidity).
* **Coincident Indicators:** `GDP` (Lags PMI by 1 turn) & `VIX` (Fear/Volatility; spikes on sudden rate hikes).
* **Lagging Indicators:** `CPI / Inflation` (Lags M2 by 2 turns) & `CB Rate` (Mechanically hikes +0.50% if CPI crosses 3.0%).

### 4.2 Asset Factor Matrix ($\beta$ Coefficients)

Asset yields are calculated deterministically by multiplying the change in Macro indicators by the Asset's hardcoded $\beta$ sensitivity.

* *Example:* The **Apex Tier** (Tech/Crypto) has a massively positive $\beta$ to M2 Liquidity, but a severely negative $\beta$ to Interest Rates and VIX.

### 4.3 Friction & PvP Multiplayer Dynamics (Anti-Exploit)

To enforce the TARA Matrix, the system penalizes naive rebalancing:

* **Tax Drag (Teaches "Accept/Reduce"):** Selling profitable Apex assets incurs a 20% simulated capital gains tax automatically deducted from AUM.
* **PvP Crowded Trade Penalty (Market Depth):** During end-of-turn processing, if $>50\%$ of the classroom volume submits identical sell orders for the exact same asset tier, the Engine applies a `Liquidity Penalty` (e.g., -5% extra slippage) to that specific trade, simulating a market panic and teaching contrarianism.

### 4.4 Tracked Simulation Metrics Catalog

The simulator must track the broader curriculum metric set from the Asset Pyramid / Driver String / TARA course design, not only CPI and interest rates. A tracked metric can be a seeded scenario time series, a computed fund metric, a student-entered policy field, a TARA rubric score, or an evidence metric used in debriefs. MVP may keep individual-stock picking out of scope, but the platform data model must still make these variables visible as tracked learning evidence where they affect scenarios, allocation decisions, or post-turn attribution.

| Metric family | Tracked metrics / IDs | Product use |
| --- | --- | --- |
| **Investor, suitability, and pyramid policy** | `savings_rate_for_investment`, `asset_allocation_weight`, `risk_appetite_level`, `risk_profile_class`, `investment_time_horizon`, `expected_annual_return`, `investment_capacity`, `risk_limit`, `risk_budget`, `liquidity_buffer` | Defines each student fund mandate, allocation guardrails, target return, allowed drawdown, and whether a TARA action is appropriate for the persona. |
| **Macro regime and leading/coincident/lagging drivers** | `investment_clock_phase`, `pmi`, `iip`, `m2_growth`, `gdp_growth_yoy`, `inflation_cpi`, `policy_rate`, `bond_yield`, `interbank_rate`, `usd_vnd_movement`, `vix`, `scenario_persistence`, `driver_time_lag` | Drives deterministic monthly scenario state and teaches lagged relationships between liquidity, growth, inflation, rates, FX, and volatility. |
| **Vietnam equity-market strings** | `vn_index_level`, `equity_market_trading_value`, `foreign_investor_net_trading_value`, `retail_investor_net_trading_value`, `market_earnings_growth_expectation`, `valuation_sentiment`, `business_cycle_phase` | Gives students a market dashboard for Driver/String Map reasoning before reallocating between Base/Core/Apex tiers. |
| **Asset class and fund inputs** | `fund_nav_per_unit`, `annualized_return`, `adjusted_world_gold_price`, `bank_deposit_rate`, `bond_fund_duration`, `asset_class_fee_pct`, `base_fee_pct` | Tracks non-equity asset-class behavior for deposits, gold, bond funds, equity funds/ETFs, and tier fees. |
| **Portfolio construction and order state** | `current_AUM`, `own_capital`, `position_weight`, `holding_count`, `portfolio_turnover`, `pending_order_count`, `target_weight_base`, `target_weight_core`, `target_weight_apex`, `cash_buffer_weight`, `rebalance_trigger`, `limit_price`, `trigger_price`, `trailing_step` | Supports the pyramid visualizer, 100% TARA allocation validation, pending-order visibility, and execution discipline. |
| **Performance and risk dashboard** | `roi`, `fund_nav_per_unit`, `alpha`, `beta`, `volatility`, `correlation_coefficient`, `sharpe_ratio`, `treynor_ratio`, `drawdown`, `benchmark_return`, `risk_free_proxy`, `return_frequency`, `lookback_window`, `annualization_convention` | Powers the Risk-Return Dashboard and forces every advanced metric to carry benchmark/window/frequency conventions. |
| **TARA and risk register** | `risk_probability_score`, `risk_impact_score`, `tara_risk_treatment_class`, `tara_risk_matrix`, `risk_type`, `risk_direction`, `impact_weight`, `risk_time_lag`, `risk_treatment_action` | Turns TARA from a static label into a time-shifting risk register with explicit Avoid/Reduce/Accept/Transfer decisions. |
| **Friction, attribution, and PvP mechanics** | `tax_paid`, `tax_drag_pct`, `pvp_slippage_paid`, `liquidity_penalty_pct`, `classroom_sell_concentration_pct`, `market_beta_impact`, `fee_drag`, `ending_AUM` | Explains post-turn AUM changes and connects penalties to tax drag, liquidity crowding, beta sensitivity, and fees. |
| **Industry and company evidence metrics** | `revenue`, `revenue_growth`, `net_income`, `earnings_growth`, `operating_cash_flow`, `total_assets`, `roe`, `roa`, `gross_margin`, `net_profit_margin`, `business_profit_margin`, `dividend_yield`, `cash_dividend`, `market_share`, `market_capitalization`, `average_trading_volume`, `mp_stock_group_class`, `ev_to_ebitda`, `price_to_book`, `store_count`, `hot_rolled_coil_price`, `free_cash_flow`, `leverage_ratio_family` | Used for stock-case evidence, instructor debriefs, and future extensions; MVP may expose these as scripted case/context metrics without allowing individual-stock trading. |

Every metric record must carry its `month_index`, `class_id` or scenario scope, display label, unit, source/convention note, and whether it is `seeded`, `computed`, `student_entered`, or `rubric_scored`. Metrics that use alpha, beta, volatility, correlation, Sharpe, Treynor, or drawdown must also store benchmark, return frequency, lookback window, annualization convention, risk-free proxy, and raw-vs-adjusted price convention.

---

## 5. Functional Requirements (Epics)

### Epic 1: The Student "Bloomberg" Dashboard

* **FR-1.1 Macro News Terminal:** Securely displays the current month's news headline, macro regime, market-string dashboard, and all tracked scenario metrics relevant to the current turn. It must never expose future-month metric rows.
* **FR-1.2 Pyramid Visualizer:** An interactive funnel chart displaying the current structural weight of their portfolio, highlighting dangerous "Portfolio Drift".
* **FR-1.3 TARA Order Entry:** Interactive sliders to adjust asset allocations. *Must include strict client-side validation (Zustand)* ensuring total allocation exactly equals 100.0% before submission. Calculates an "Estimated Tax Drag" preview.
* **FR-1.4 Attribution Report:** A post-turn report breaking down exactly *why* their AUM changed (e.g., Market Beta Impact: +$200k vs. Tax Penalties: -$40k vs. PvP Slippage: -$15k).

### Epic 2: Multi-Tenant Instructor Management

* **FR-2.1 Class Instantiation:** Instructors can create isolated Game Instances (`class_id`) and generate join-links.
* **FR-2.2 Live Leaderboard:** A grid showing all student funds, their AUM, Sharpe Ratios, and who currently has "Pending Orders".

### Epic 3: The "Dual-Trigger" Execution Engine

The engine that advances the simulation month must support two modes:

* **FR-3.1 Auto Mode (Asynchronous):** System automatically locks pending orders and advances the month at `0:00 AM UTC+7` daily via Cron Job.
* **FR-3.2 Live Mode (Synchronous/"War Room"):** Instructor clicks "Fast-Forward Month" on their dashboard, bypassing the cron timer for live 15-minute blitz rounds in class.
* **FR-3.3 Live WebSockets:** Upon the engine completing the math, the server pushes a WebSocket event. All connected student screens must instantly auto-refresh to show the new month without requiring an `F5` reload.

---

## 6. Technical Architecture & Tech Stack

To meet strict anti-cheating requirements and Vercel timeout constraints, the stack is rigorously defined:

| Layer | Technology | Engineering Rationale |
| --- | --- | --- |
| **Frontend Framework** | **Next.js (App Router)** | React Server Components (RSC) securely fetch current turn data on the server. Future months are never sent to the browser, preventing DevTools cheating. Server Actions handle secure form submissions. |
| **Hosting & Cron** | **Vercel** | Edge network deployment. Supports native `vercel.json` Cron Jobs for the midnight Auto-Mode trigger. |
| **Database & Auth** | **Supabase (PostgreSQL)** | Provides Auth and **Row Level Security (RLS)** to isolate multi-tenant classes. Uses **Supabase Realtime (WebSockets)** for FR-3.3 screen refreshing. |
| **Database ORM** | **Drizzle ORM** | High-performance, type-safe queries optimized for serverless edge runtimes. |
| **Math Worker / Queue** | **Inngest** (or Upstash QStash) | **Critical:** Calculating the PvP slippage, taxes, and $\beta$ matrix for 20-50 students simultaneously will exceed Vercel's 15-60s serverless timeout limit. The "End of Month" trigger *must* pass the workload to Inngest to calculate safely in the background. |
| **UI Components** | **Tailwind CSS + shadcn/ui** | Accessible, professional, dark-mode financial aesthetics. |
| **Data Visualization** | **Apache ECharts & Tremor** | Tremor handles KPI metrics and leaderboards. ECharts natively supports complex Funnel/Pyramid charts. |

---

## 7. Core Database Schema Blueprint (PostgreSQL / Drizzle)

### `Classes` Table (Game Instances)

* `id` (PK), `instructor_id` (FK), `trigger_mode` (AUTO/MANUAL), `current_month_index`

### `Macro_Narratives` Table (The Script)

* `id` (PK), `month_index`, `news_headline`, `investment_clock_phase`, `pmi`, `iip`, `m2_growth`, `gdp_growth_yoy`, `inflation_cpi`, `policy_rate`, `bond_yield`, `interbank_rate`, `usd_vnd_movement`, `vix`, `scenario_persistence`

### `Market_Metrics` Table (Current-Turn Market Strings)

* `id` (PK), `class_id` (FK), `month_index`, `vn_index_level`, `equity_market_trading_value`, `foreign_investor_net_trading_value`, `retail_investor_net_trading_value`, `market_earnings_growth_expectation`, `valuation_sentiment`, `business_cycle_phase`

### `Tracked_Metrics` Table (Generic Metric Registry)

* `id` (PK), `scope_type` (SCENARIO/CLASS/FUND/CASE), `scope_id`, `month_index`, `metric_id`, `display_label`, `metric_family`, `value_numeric`, `value_text`, `unit`, `source_type` (SEEDED/COMPUTED/STUDENT_ENTERED/RUBRIC_SCORED), `source_note`, `convention_note`

### `Asset_DNA` Table (The Physics)

* `asset_tier` (Base/Core/Apex), `beta_m2`, `beta_cpi`, `beta_gdp`, `beta_vix`, `beta_policy_rate`, `beta_usd_vnd`, `beta_market_liquidity`, `base_fee_pct`

### `Funds` Table (The Player)

* `id` (PK), `class_id` (FK), `student_id` (FK), `current_AUM`, `risk_appetite_level`, `risk_profile_class`, `investment_time_horizon`, `expected_annual_return`, `risk_budget`, `liquidity_buffer`, `roi`, `alpha`, `beta`, `volatility`, `sharpe_ratio`, `treynor_ratio`, `drawdown`

### `Asset_Holdings` Table (The Pyramid)

* `id` (PK), `fund_id` (FK), `tier`, `allocation_weight_pct`, `position_weight`, `cash_buffer_weight`

### `TARA_Orders` Table

* `id` (PK), `fund_id` (FK), `month_index`, `target_weights_json`, `estimated_tax_drag`, `rebalance_trigger`, `status` (PENDING/PROCESSED)

### `Risk_Register` Table (TARA Evidence)

* `id` (PK), `fund_id` (FK), `month_index`, `risk_type`, `risk_direction`, `impact_weight`, `risk_time_lag`, `risk_probability_score`, `risk_impact_score`, `tara_risk_treatment_class`, `risk_treatment_action`

### `Simulation_Ledger` Table (For Attribution Reports)

* `id` (PK), `fund_id` (FK), `month_index`, `market_beta_impact`, `fee_drag`, `tax_paid`, `tax_drag_pct`, `pvp_slippage_paid`, `liquidity_penalty_pct`, `classroom_sell_concentration_pct`, `ending_AUM`

---

## 8. Out of Scope for MVP (Phase 1)

* **Live Stock API Integration:** Connecting to Yahoo Finance/Bloomberg. The platform strictly relies on the deterministic `Macro_Narratives` table to guarantee specific educational outcomes.
* **Individual Stock Picking:** Students allocate wealth to *Asset Tiers* (e.g., "Apex Equities"), not specific micro-tickers (e.g., "AAPL").
* **Short Selling & Leverage:** Margin accounts are excluded from V1 to ensure the 100% allocation mathematical lock functions cleanly.
* **Instructor Scenario Builder:** MVP will use pre-seeded JSON narrative arcs. A drag-and-drop scenario builder UI for instructors is reserved for Phase 2.
