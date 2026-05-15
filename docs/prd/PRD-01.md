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

---

## 5. Functional Requirements (Epics)

### Epic 1: The Student "Bloomberg" Dashboard

* **FR-1.1 Macro News Terminal:** Securely displays the current month's news headline and the 6 macroeconomic metrics.
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

1. **`Classes` Table (Game Instances)**
* `id` (PK), `instructor_id` (FK), `trigger_mode` (AUTO/MANUAL), `current_month_index`


2. **`Macro_Narratives` Table (The Script)**
* `id` (PK), `month_index`, `news_headline`, `pmi`, `m2`, `gdp`, `cpi`, `cb_rate`, `vix`


3. **`Asset_DNA` Table (The Physics)**
* `asset_tier` (Base/Core/Apex), `beta_m2`, `beta_cpi`, `beta_gdp`, `beta_vix`, `base_fee_pct`


4. **`Funds` Table (The Player)**
* `id` (PK), `class_id` (FK), `student_id` (FK), `current_AUM`, `sharpe_ratio`


5. **`Asset_Holdings` Table (The Pyramid)**
* `id` (PK), `fund_id` (FK), `tier`, `allocation_weight_pct`


6. **`TARA_Orders` Table**
* `id` (PK), `fund_id` (FK), `month_index`, `target_weights_json`, `status` (PENDING/PROCESSED)


7. **`Simulation_Ledger` Table (For Attribution Reports)**
* `id` (PK), `fund_id` (FK), `month_index`, `tax_paid`, `pvp_slippage_paid`, `ending_AUM`



---

## 8. Out of Scope for MVP (Phase 1)

* **Live Stock API Integration:** Connecting to Yahoo Finance/Bloomberg. The platform strictly relies on the deterministic `Macro_Narratives` table to guarantee specific educational outcomes.
* **Individual Stock Picking:** Students allocate wealth to *Asset Tiers* (e.g., "Apex Equities"), not specific micro-tickers (e.g., "AAPL").
* **Short Selling & Leverage:** Margin accounts are excluded from V1 to ensure the 100% allocation mathematical lock functions cleanly.
* **Instructor Scenario Builder:** MVP will use pre-seeded JSON narrative arcs. A drag-and-drop scenario builder UI for instructors is reserved for Phase 2.