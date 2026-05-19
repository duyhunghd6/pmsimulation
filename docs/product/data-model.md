# Data Model

## Status

This document captures the PRD blueprint for schema work. Pure TypeScript Asset DNA seed, return-calculation, instructor leaderboard, and month-advance request slices now exist for deterministic domain use. The human approved the full-stack MVP implementation track on 2026-05-18, so accepted stories may now add Supabase PostgreSQL, Drizzle schema/migrations, RLS policies, and deterministic seed fixtures. A first US-038 Supabase RLS migration, deterministic auth-tenancy fixture, Drizzle schema, server-side database row parsers for scoped student fund/holding/order/risk-register/ledger/macro-narrative/market-metric/tracked-metric and instructor owned-class/God Mode holding/class fund/TARA order status/live leaderboard result delivery, injected student macro news, current-turn Driver/String dashboard, portfolio pyramid, TARA order-entry, instructor pending-order visibility, instructor live leaderboard, instructor class aggregate analytics, and instructor God Mode portfolio visibility server query executors over parsed RLS-backed rows, server-only local database URL parser, and browser-safe Supabase auth environment parser now exist for local proof and future auth setup, with role-claim-aware student/instructor RLS helpers and policies. A first Inngest month-advance worker handoff route now parses bounded shared processing events into the existing worker-safe receipt envelope. The protected student dashboard now renders a first bounded post-turn attribution panel from existing safe post-turn snapshot/query-result envelope builders without live Supabase ledger reads or raw ledger delivery, and protected realtime panels render route-scoped authorized server query result status without returning database rows, provider clients, or gameplay data through realtime payloads. No live database runtime, hosted Supabase project, production migration path, browser auth flow, hosted worker execution, or fully passing local RLS integration proof is wired yet.

## Approved MVP Persistence Foundation

The first provider-backed foundation should use Supabase PostgreSQL with Drizzle schema/migrations and Supabase RLS. The minimum proof schema includes profiles or trusted auth-subject mappings, classes, class administration, class membership or enrollment, funds, asset holdings, macro narratives, market metrics, tracked metrics, TARA orders, risk register rows, and simulation ledger rows.

Class is the primary tenant boundary. RLS and server-side guards must prove student own-fund access, future-row denial, other-student exact-holding denial, instructor owned-class God Mode access, and unowned-class rejection before user-visible full-stack flows are marked implemented.

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
- The US-038 server-side instructor owned-class row parser preserves instructor role, owner id, class id, trigger mode, month bounds, total simulation length, and join-code shape before returning persisted class rows to instructor paths.
- The MVP pure-domain instructor dashboard current-turn query descriptor records the future server-query scope for an instructor-scoped class/current-month dashboard request without emitting database rows, snapshots, target weights, order details, provider clients, or query results. The MVP pure-domain instructor dashboard current-turn query result envelope wraps an already-authorized instructor dashboard snapshot only when class and current-month scope match, without emitting database rows, target weights, order details, provider clients, UI state, or executed query metadata. The MVP pure-domain instructor dashboard current-turn query result validation failure envelope maps missing or mismatched query results to instructor query-result validation errors without emitting snapshots, database rows, target weights, order details, provider clients, UI state, ledger drafts, or executed query metadata.
- The MVP pure-domain auto month-advance scheduled trigger descriptor maps a validated auto advancement request to future scheduled-trigger metadata without emitting database rows, persisted class rows, auth sessions, platform scheduler payloads, worker payloads, realtime payloads, ledger drafts, or trigger execution details. The MVP pure-domain auto scheduled-trigger result envelope maps that descriptor to a scheduled-trigger-safe accepted auto advancement receipt without emitting database rows, persisted class rows, auth sessions, platform scheduler payloads, worker jobs, realtime payloads, ledger drafts, processing results, or trigger execution details. The MVP pure-domain auto scheduled-trigger validation failure envelope maps invalid auto advancement inputs to scheduled-trigger-safe validation errors without raw advancement payloads, database rows, persisted class rows, auth sessions, platform scheduler payloads, worker jobs, realtime payloads, ledger drafts, or trigger execution details.
- The MVP pure-domain instructor live month-advance server-action command descriptor maps a validated live advancement request to command-boundary metadata without emitting database rows, persisted class rows, auth sessions, worker payloads, realtime payloads, ledger drafts, or server-action execution details. The MVP pure-domain instructor live month-advance server-action result envelope maps that command descriptor to an instructor-safe accepted live month-advance receipt without emitting database rows, persisted class rows, auth sessions, worker jobs, realtime payloads, ledger drafts, or server-action execution details. The MVP pure-domain instructor live month-advance server-action validation failure envelope maps invalid live advancement inputs to instructor-safe validation errors without raw advancement payloads, database rows, persisted class rows, auth sessions, worker jobs, realtime payloads, ledger drafts, or server-action execution details. The first Inngest month-advance worker handoff route maps parsed shared live/manual or auto/scheduled processing event data to the existing worker-safe receipt envelope, and the protected instructor live action now dispatches valid manual/live requests into that handoff without emitting database rows, persisted class rows, ledger drafts, realtime payloads, fund inputs, or processed month results. The first bounded `/api/cron/month-advance` scheduled-trigger route requires `CRON_SECRET`, parses one auto-paced class/month transition, returns scheduled-trigger-safe envelopes, and dispatches valid auto requests into the same handoff without durable class discovery, persisted rows, ledger drafts, realtime payloads, fund inputs, or processed month results.
- The MVP pure-domain instructor class server-action command descriptor maps a validated class draft to future class creation persistence intent without emitting database rows or persisted class ids. The MVP pure-domain instructor class server-action result envelope maps that command descriptor to an instructor-safe accepted class-creation receipt without emitting database rows, persisted class ids, auth sessions, or server-action execution details. The MVP pure-domain instructor class server-action validation failure envelope maps invalid draft inputs to instructor-safe validation errors without raw class draft payloads, database rows, persisted class ids, auth sessions, generated join-code payloads, or server-action execution details. The first bounded instructor class creation executor validates trusted-session draft scope, calls an injected class creation store, parses the persisted class row, rejects mismatched persisted payloads, and still returns no persisted class id or raw database row to the browser-safe result envelope. The protected instructor dashboard now renders a class creation form that returns only the safe receipt state from that bounded executor, and the server action prefers a Supabase-backed class creation writer when the App Router Supabase server client is available. The Supabase migration exposes a bounded authenticated `create_instructor_class` RPC that requires `app_role=instructor`, uses `auth.uid()` as the class owner, creates both the `classes` row and owner `class_administrators` row, and returns the persisted class row shape for the existing parser. The protected instructor dashboard now renders a server-refreshed class-list panel from parsed instructor-owned `classes` rows when the App Router Supabase server client is available, without returning raw database rows, provider errors, provider clients, auth sessions, roster rows, or secrets; hosted Supabase execution proof remains pending.

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
- The MVP pure-domain student macro news query descriptor, result envelope, and validation failure envelope record the future server-query boundary for one already-scoped class/current-month/viewer-fund macro news request without emitting database rows, provider clients, future scenario rows, UI state, or executed query metadata.

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
- The MVP pure-domain student macro news query boundary wraps only an already-authorized current-month macro news snapshot and does not emit database rows, persisted market metric rows, provider clients, future market strings, UI state, or executed query metadata.
- The MVP pure-domain current-turn Driver/String dashboard query boundary wraps only an already-authorized current-turn dashboard projection and does not emit database rows, persisted market metric rows, provider clients, future market strings, other-fund payloads, UI state, or executed query metadata.

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
- Student tracked metric result delivery must preserve student role, class, optional fund, month, metric source, value, and convention scope before returning persisted rows.
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
- The MVP pure-domain instructor live leaderboard snapshot emits fund id, student display name, current AUM, Sharpe ratio, and pending-order status for already-scoped class funds without holdings or order detail payloads. The MVP pure-domain live leaderboard query descriptor, result envelope, and validation failure envelope record the future server-query boundary without emitting database rows, provider clients, holdings, target weights, estimated tax drag, order details, UI state, or executed query metadata. The first bounded infrastructure executor parses injected instructor-scoped live leaderboard fund rows and status-only current-month TARA order rows before returning the safe live leaderboard result envelope, rejecting cross-class, malformed, future-month, processed, unknown-fund, and duplicate pending-order rows before delivery. The protected instructor dashboard can source that leaderboard-safe pre-parser row set from Supabase when the App Router server client is available, while still excluding holdings, target weights, estimated tax drag, order details, raw provider payloads, and hosted provider proof.
- The MVP pure-domain student leaderboard rank snapshot emits rank, display name, current AUM, Sharpe ratio, and viewer-row marking for already-scoped class funds without exact holdings, fund ids in row payloads, pending-order status, target weights, estimated tax drag, order details, or ledger drafts. The MVP pure-domain student leaderboard rank query descriptor, result envelope, and validation failure envelope record the future server-query boundary without emitting database rows, provider clients, other-fund ids, exact holdings, pending-order status, target weights, estimated tax drag, order details, UI state, ledger drafts, or executed query metadata.
- The MVP pure-domain student dashboard current-turn snapshot composes safe viewer-fund dashboard sections without future rows, other-fund ids, other-fund exact holdings, other-fund pending-order details, instructor God Mode data, ledger drafts, or provider payloads.
- The MVP pure-domain student dashboard current-turn query descriptor records the future server-query scope for a class/current-month/viewer-fund dashboard request without emitting database rows, snapshots, other-fund exact holdings, instructor God Mode data, provider clients, or query results. The MVP pure-domain student dashboard current-turn query result envelope wraps an already-authorized current-turn dashboard snapshot only when it matches that scope, without emitting database rows, provider clients, UI state, other-fund exact holdings, instructor God Mode data, future scenario rows, ledger drafts, or executed query metadata. The MVP pure-domain student dashboard current-turn query result validation failure envelope maps missing or mismatched query results to validation errors without returning snapshots, database rows, provider clients, UI state, other-fund exact holdings, instructor God Mode data, future scenario rows, ledger drafts, or executed query metadata.
- The MVP pure-domain student post-turn dashboard snapshot composes the viewer fund attribution report and permitted leaderboard-rank section without order details, target weights, exact holdings, other-fund ids, class aggregate payloads, instructor God Mode data, database rows, or provider payloads. The protected student dashboard now renders a bounded post-turn attribution panel from that safe snapshot/query-result envelope with empty, safe failure, and success states while live Supabase ledger reads remain unwired.
- The MVP pure-domain student post-turn dashboard query descriptor records the future server-query scope for a class/processed-month/viewer-fund dashboard request without emitting database rows, snapshots, attribution reports, other-fund ids, exact holdings, class aggregate payloads, instructor God Mode data, provider clients, UI state, ledger draft collections, or query results. The MVP pure-domain student post-turn dashboard query result envelope wraps an already-authorized post-turn dashboard snapshot only when class, processed-month, and viewer-fund scope match, without emitting database rows, provider clients, UI state, other-fund ids, exact holdings, order details, class aggregate payloads, instructor God Mode data, ledger draft collections, or executed query metadata. The MVP pure-domain student post-turn dashboard query result validation failure envelope maps missing or mismatched query results to validation errors without emitting snapshots, attribution reports, database rows, provider clients, UI state, other-fund ids, exact holdings, order details, class aggregate payloads, instructor God Mode data, ledger draft collections, or executed query metadata.
- The MVP pure-domain student attribution report snapshot emits required post-turn ledger categories only for the viewer fund's already-scoped ledger draft. The MVP pure-domain student attribution report query descriptor, result envelope, and validation failure envelope represent the future server-query boundary without returning database rows, provider clients, raw ledger drafts, other-fund ledger drafts, target weights, order details, or UI state. The protected student dashboard now renders those categories through the safe post-turn dashboard envelope without raw ledger drafts or provider payloads.
- The MVP pure-domain instructor class aggregate analytics snapshot emits class-level fund count, AUM, Sharpe ratio, and order-submission aggregates without per-fund rows, holdings, or order detail payloads. The MVP pure-domain class aggregate analytics query descriptor, result envelope, and validation failure envelope record the future server-query boundary without emitting database rows, provider clients, per-fund rows, holdings, target weights, estimated tax drag, order details, UI state, or executed query metadata. The first bounded infrastructure executor parses aggregate-safe class fund rows and status-only current-month TARA order rows before returning the safe aggregate analytics envelope, rejects cross-class, malformed, future-month, processed, unknown-fund, and duplicate pending-order rows, fails closed on provider reader errors, and keeps per-fund rows, holdings, target weights, estimated tax drag, and order details unwired. The protected instructor dashboard can source that aggregate-safe pre-parser row set from Supabase when the App Router server client is available, while still excluding per-fund detail delivery, holdings, order details, raw provider payloads, and hosted provider proof.
- The MVP pure-domain instructor dashboard current-turn snapshot composes instructor-only current class sections after class scope has already been enforced, including privileged God Mode holdings, but excludes target weights, estimated tax drag, order detail payloads, ledger drafts, provider payloads, and database rows.
- The MVP pure-domain instructor dashboard current-turn query descriptor records the future server-query boundary for an instructor-scoped class/current-month dashboard request without emitting database rows, snapshots, target weights, order details, provider clients, or query results. The MVP pure-domain instructor dashboard current-turn query result envelope wraps an already-authorized instructor dashboard snapshot only when class and current-month scope match, without emitting database rows, target weights, order details, provider clients, UI state, or executed query metadata. The MVP pure-domain instructor dashboard current-turn query result validation failure envelope maps missing or mismatched query results to instructor query-result validation errors without emitting snapshots, database rows, target weights, order details, provider clients, UI state, ledger drafts, or executed query metadata.

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
- The US-038 server-side student own-holding row parser preserves student role, class, fund, tier, and allocation scope before returning persisted holding rows to student paths.
- The MVP pure-domain student portfolio pyramid query descriptor, result envelope, and validation failure envelope record the future server-query boundary for one already-scoped viewer fund without emitting database rows, provider clients, other-fund holdings, instructor God Mode data, target weights, order details, estimated tax drag, ledger drafts, UI state, or executed query metadata. The first US-038 infrastructure portfolio pyramid executor parses injected RLS-backed own-holding rows into current tier weights, rejects other-fund and duplicate-tier rows before result delivery, and returns only the safe student portfolio pyramid result envelope.
- The MVP pure-domain instructor God Mode portfolio visibility snapshot emits exact current Base/Core/Apex allocation weights for already-scoped instructor class funds and is not a student-facing payload. The MVP pure-domain God Mode portfolio visibility query descriptor, result envelope, and validation failure envelope record the query boundary without emitting database rows, provider clients, target weights, estimated tax drag, order details, UI state, or unscoped holdings delivery. The first bounded infrastructure God Mode executor parses injected RLS-backed class fund, current holding, and status-only order rows, rejects unsafe rows before delivery, and returns only the privileged instructor result envelope. The protected instructor dashboard renders that privileged envelope from bounded parsed rows without adding target weights, estimated tax drag, order details, raw provider payloads, or live provider execution.

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
- The MVP pure-domain student TARA order submission receipt emits deterministic class/fund/month submission metadata, target weights, estimated tax drag, rebalance trigger, and pending status for one already-scoped viewer fund before persistence exists.
- The MVP pure-domain student TARA order server-action command descriptor maps the validated receipt to future pending-order persistence intent for one already-scoped viewer fund without database rows, server action execution, auth sessions, workers, realtime payloads, or processed order data.
- The MVP pure-domain student TARA order server-action result envelope maps that command descriptor to a student-safe accepted-pending-order receipt result without database rows, persisted order ids, server action execution details, auth sessions, workers, realtime payloads, or processed order data.
- The MVP pure-domain student TARA order server-action validation failure envelope maps invalid submission inputs to student-safe validation errors without raw order payloads, target weights, current weights, tax-drag previews, database rows, persisted order ids, server action execution details, auth sessions, workers, realtime payloads, or processed order data.
- The first bounded student TARA order submission executor reads parsed current fund, holding, pending-order, and tracked-metric rows, rejects existing pending orders, validates submitted target weights against authoritative current state, calls an injected pending-order writer, parses the returned pending `tara_orders` row, and returns only the existing student-safe accepted-pending-order result envelope. The protected student dashboard form posts target weights to that executor through a Supabase-backed pending-order read/write store when the App Router Supabase server client is available, with a bounded proof-store fallback; provider rows, provider errors, and persisted order ids remain outside browser delivery, and hosted Supabase execution proof remains pending.
- The MVP pure-domain student TARA order-entry query descriptor, result envelope, and validation failure envelope record the future server-query boundary for one already-scoped class/current-month/viewer-fund order-entry request without emitting database rows, persisted order ids, other-fund order data, classroom order lists, provider clients, UI state, or executed query metadata. The first US-038 infrastructure executor now parses RLS-backed own-fund, own-holding, pending-order, and tracked-metric rows before returning the safe student TARA order-entry query result envelope, rejects other-fund order rows and duplicate pending orders, and keeps live database/provider execution, UI rendering, browser delivery, and server actions unwired.
- The MVP pure-domain instructor pending-order visibility snapshot summarizes current-month pending status by enrolled fund without returning target weights or tax-drag details.
- The MVP pure-domain instructor pending-order visibility query descriptor, result envelope, and validation failure envelope record the future server-query boundary for one already-scoped class/current-month request without emitting database rows, persisted order ids, target weights, estimated tax drag, order details, provider clients, UI state, or executed query metadata. The first bounded infrastructure executor now parses instructor-scoped class fund and status-only current-month TARA order rows before returning the safe pending-order visibility envelope, rejects cross-class and future-month rows, and keeps target weights, estimated tax drag, and order details unwired. The protected instructor dashboard renders only that status-only envelope and can source its pre-parser rows from Supabase when the App Router server client is available, with bounded fallback rows and hosted provider proof still pending.

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
- The US-038 server-side student risk register row parser preserves class, fund, month, role, treatment class, and evidence field scope before returning persisted risk register results to student paths.

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
- The MVP pure-domain shared month-advance processing validation failure envelope maps invalid shared processing inputs to processing-safe validation errors without raw trigger payloads, worker jobs, realtime payloads, fund inputs, ledger drafts, processing results, or downstream execution details.
- The MVP pure-domain processing result emits a per-fund ledger draft with processed month index, fund id, attribution fields, and ending AUM before database persistence exists.
- The MVP pure-domain per-fund processing validation failure envelope maps invalid fund processing inputs to validation errors without returning raw attribution inputs, allocation weights, ledger drafts, database rows, worker jobs, provider execution details, or realtime payloads.
- The MVP pure-domain class-month processing result emits ledger drafts for multiple funds, rejects duplicate fund ids in one batch, and summarizes class-level AUM and cost totals before live database persistence exists.
- The first bounded Inngest class-month processing executor reads class fund inputs through an injected worker reader, persists the deterministic class-month processing record through an injected writer, derives a refresh-only realtime publication descriptor from the aggregate turn-completion event, dispatches through the existing injected server-only Supabase Realtime publisher, and returns only the aggregate turn-completion event, safe persistence receipt, and safe publication result/failure. The first Supabase-backed processing store maps provider `funds`, `asset_holdings`, pending current-month `tara_orders`, and `tracked_metrics` rows into processing inputs, then upserts `simulation_ledger`, updates `funds.current_aum`, marks matching pending `tara_orders` as `processed`, and advances `classes.current_month_index` through injected persistence calls. Hosted worker wiring, live RLS write proof, asset-holding rebalance mutation, provider payloads, hosted worker proof, and hosted realtime proof remain unwired.
- The MVP pure-domain class-month processing validation failure envelope maps duplicate-fund and invalid per-fund processing failures to class-processing-safe validation errors without returning fund inputs, ledger drafts, processing results, database rows, worker jobs, or realtime payloads.
- The MVP pure-domain turn-completion event exposes class-level processing metadata and aggregate totals, not per-fund ledger drafts.
- The MVP pure-domain realtime refresh signal exposes only class/month refresh metadata and dedupe keys, not per-fund ledger drafts, fund processing keys, or aggregate financial totals.
- The MVP pure-domain realtime publication envelope wraps the refresh signal with provider-neutral channel, event, audience, delivery, and publication-key metadata without database rows, provider clients, per-fund ledger drafts, fund processing keys, or aggregate financial totals.
- The MVP pure-domain Supabase Realtime publication descriptor maps the provider-neutral envelope to a broadcast boundary contract without database rows, provider clients, per-fund ledger drafts, fund processing keys, or aggregate financial totals.
- The first infrastructure Supabase Realtime publication boundary consumes that descriptor through an injected server-only client shape and returns safe result/failure envelopes without database rows, server query results, provider clients, provider errors, per-fund ledger drafts, fund processing keys, aggregate financial totals, or gameplay data.
- The MVP pure-domain Supabase Realtime subscription descriptor maps the broadcast descriptor to a future client subscription boundary contract without database rows, provider clients, per-fund ledger drafts, fund processing keys, aggregate financial totals, or gameplay data.
- The MVP pure-domain realtime authorized current-turn refetch descriptor maps the subscription descriptor to future client refetch instructions without database rows, provider clients, server query results, UI state, per-fund ledger drafts, fund processing keys, aggregate financial totals, or gameplay data.
- The MVP pure-domain realtime authorized current-turn query descriptor maps the refetch plan to future server-scoped query instructions without database rows, provider clients, executed server query results, UI state, per-fund ledger drafts, fund processing keys, aggregate financial totals, or gameplay data.
- The MVP pure-domain realtime authorized current-turn query result envelope wraps already-authorized student and instructor current-turn dashboard snapshots without database rows, provider clients, UI state, per-fund ledger drafts, fund processing keys, aggregate financial totals, or unscoped gameplay payloads.
- The MVP pure-domain realtime authorized current-turn query result validation failure envelope maps missing or mismatched dashboard query results to validation errors without returning snapshots, database rows, provider clients, UI state, per-fund ledger drafts, fund processing keys, aggregate financial totals, or unscoped gameplay payloads.

## Future Proof Requirements

Schema implementation must include integration proof for:

- Tenant isolation.
- Role-scoped access.
- Future-row protection.
- Tracked metric scoping and convention metadata.
- TARA order validation.
- Risk register treatment mapping.
- Idempotent month processing.
