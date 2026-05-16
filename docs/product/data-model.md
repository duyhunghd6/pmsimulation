# Data Model

## Status

This document captures the PRD blueprint for future schema work. No database migrations or Drizzle schema files exist yet.

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
- `pmi`
- `m2`
- `gdp`
- `cpi`
- `cb_rate`
- `vix`

Rules:

- Future rows must not be exposed to students.
- Scenario rows drive deterministic outcomes.

### Asset DNA

Asset-tier factor sensitivities and fees.

Expected fields:

- `asset_tier`
- `beta_m2`
- `beta_cpi`
- `beta_gdp`
- `beta_vix`
- `base_fee_pct`

Rules:

- Asset tiers are Base, Core, and Apex for MVP.
- Individual stock picking is out of scope.

### Funds

Student-managed portfolio state.

Expected fields:

- `id`
- `class_id`
- `student_id`
- `current_AUM`
- `sharpe_ratio`

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

Rules:

- Allocations should sum to `100.0%` for a valid current portfolio.

### TARA Orders

Target allocation submissions for a month.

Expected fields:

- `id`
- `fund_id`
- `month_index`
- `target_weights_json`
- `status`

Rules:

- Target weights must sum to exactly `100.0%`.
- Orders are pending until processed by the end-of-month engine.
- Duplicate processing must not apply the same order twice.

### Simulation Ledger

Post-turn attribution records.

Expected fields:

- `id`
- `fund_id`
- `month_index`
- `tax_paid`
- `pvp_slippage_paid`
- `ending_AUM`

Rules:

- Ledger rows are the durable source for attribution reports.
- Month/fund processing should be idempotent.

## Future Proof Requirements

Schema implementation must include integration proof for:

- Tenant isolation.
- Role-scoped access.
- Future-row protection.
- TARA order validation.
- Idempotent month processing.
