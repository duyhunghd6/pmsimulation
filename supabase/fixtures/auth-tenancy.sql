insert into public.profiles (id, role, display_name) values
  ('11111111-1111-4111-8111-111111111111', 'student', 'Student One'),
  ('22222222-2222-4222-8222-222222222222', 'student', 'Student Two'),
  ('33333333-3333-4333-8333-333333333333', 'student', 'Student Three'),
  ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'instructor', 'Instructor Alpha'),
  ('bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'instructor', 'Instructor Beta')
on conflict (id) do nothing;

insert into public.classes (
  id,
  instructor_id,
  display_name,
  trigger_mode,
  current_month_index,
  total_months,
  student_join_code
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'Alpha Capital Lab', 'manual', 1, 12, 'ALPHA-CLASS'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb', 'Beta Macro Lab', 'auto', 1, 12, 'BETA-CLASS')
on conflict (id) do nothing;

insert into public.class_administrators (class_id, instructor_id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb')
on conflict do nothing;

insert into public.class_enrollments (class_id, student_id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '33333333-3333-4333-8333-333333333333')
on conflict do nothing;

insert into public.funds (
  id,
  class_id,
  student_id,
  current_aum,
  risk_appetite_level,
  risk_profile_class,
  investment_time_horizon,
  expected_annual_return,
  risk_budget,
  liquidity_buffer,
  roi,
  alpha,
  beta,
  volatility,
  sharpe_ratio,
  treynor_ratio,
  drawdown
) values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 50000000.00, 'balanced', 'Core Builder', '12 months', 0.1200, 0.0800, 0.0500, 0.0100, 0.0020, 0.9500, 0.1200, 1.1000, 0.0900, -0.0300),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 50500000.00, 'growth', 'Apex Seeker', '12 months', 0.1500, 0.1000, 0.0300, 0.0200, 0.0040, 1.1500, 0.1600, 1.2500, 0.1100, -0.0400),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '33333333-3333-4333-8333-333333333333', 49800000.00, 'defensive', 'Base Defender', '12 months', 0.0900, 0.0600, 0.1000, -0.0040, -0.0010, 0.7000, 0.0800, 0.9000, 0.0600, -0.0200)
on conflict (id) do nothing;

insert into public.asset_holdings (id, fund_id, class_id, tier, allocation_weight_pct, position_weight, cash_buffer_weight) values
  ('10000000-0000-4000-8000-000000000001', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Base', 40.0000, 0.4000, 0.0500),
  ('10000000-0000-4000-8000-000000000002', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Core', 40.0000, 0.4000, 0.0000),
  ('10000000-0000-4000-8000-000000000003', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Apex', 20.0000, 0.2000, 0.0000),
  ('20000000-0000-4000-8000-000000000001', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Base', 20.0000, 0.2000, 0.0000),
  ('20000000-0000-4000-8000-000000000002', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Core', 35.0000, 0.3500, 0.0000),
  ('20000000-0000-4000-8000-000000000003', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Apex', 45.0000, 0.4500, 0.0000),
  ('30000000-0000-4000-8000-000000000001', 'ffffffff-ffff-4fff-8fff-ffffffffffff', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Base', 60.0000, 0.6000, 0.1000),
  ('30000000-0000-4000-8000-000000000002', 'ffffffff-ffff-4fff-8fff-ffffffffffff', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Core', 30.0000, 0.3000, 0.0000),
  ('30000000-0000-4000-8000-000000000003', 'ffffffff-ffff-4fff-8fff-ffffffffffff', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Apex', 10.0000, 0.1000, 0.0000)
on conflict (id) do nothing;

insert into public.macro_narratives (
  id,
  class_id,
  month_index,
  news_headline,
  investment_clock_phase,
  pmi,
  iip,
  m2_growth,
  gdp_growth_yoy,
  inflation_cpi,
  policy_rate,
  bond_yield,
  interbank_rate,
  usd_vnd_movement,
  vix,
  scenario_persistence
) values
  ('40000000-0000-4000-8000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 0, 'Liquidity support stabilizes early cycle risk appetite', 'Recovery', 51.20, 5.10, 8.20, 5.00, 2.60, 4.50, 3.90, 4.10, -0.20, 14.00, 'persistent'),
  ('40000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 'Credit growth accelerates while inflation remains contained', 'Expansion', 52.40, 5.70, 8.90, 5.20, 2.80, 4.50, 4.00, 4.20, 0.10, 15.00, 'persistent'),
  ('40000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2, 'Future inflation shock tests crowded Apex exposure', 'Slowdown', 49.80, 4.80, 10.40, 5.10, 3.20, 5.00, 4.60, 4.90, 0.80, 22.00, 'transient'),
  ('50000000-0000-4000-8000-000000000000', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 0, 'Defensive positioning leads early recovery', 'Recovery', 50.80, 4.90, 7.80, 4.80, 2.50, 4.50, 3.80, 4.00, -0.10, 13.50, 'persistent'),
  ('50000000-0000-4000-8000-000000000001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1, 'Base assets absorb mild market volatility', 'Expansion', 51.40, 5.20, 8.10, 5.00, 2.70, 4.50, 3.95, 4.15, 0.20, 15.50, 'persistent'),
  ('50000000-0000-4000-8000-000000000002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 2, 'Future policy surprise pressures duration risk', 'Slowdown', 48.90, 4.50, 10.10, 4.90, 3.10, 5.00, 4.55, 4.80, 0.70, 21.00, 'transient')
on conflict (id) do nothing;

insert into public.market_metrics (
  id,
  class_id,
  month_index,
  vn_index_level,
  equity_market_trading_value,
  foreign_investor_net_trading_value,
  retail_investor_net_trading_value,
  market_earnings_growth_expectation,
  valuation_sentiment,
  business_cycle_phase
) values
  ('60000000-0000-4000-8000-000000000000', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 0, 1240.00, 18500000000.00, 250000000.00, 420000000.00, 8.50, 'neutral', 'recovery'),
  ('60000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 1265.00, 19900000000.00, 310000000.00, 500000000.00, 9.20, 'constructive', 'expansion'),
  ('60000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2, 1198.00, 16500000000.00, -420000000.00, -250000000.00, 5.10, 'risk-off', 'slowdown')
on conflict (id) do nothing;

insert into public.tara_orders (id, fund_id, class_id, month_index, target_weights_json, estimated_tax_drag, rebalance_trigger, status) values
  ('70000000-0000-4000-8000-000000000001', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, '{"Base":45,"Core":40,"Apex":15}', 12500.00, 'Reduce Apex after CPI risk', 'pending')
on conflict (id) do nothing;

insert into public.risk_register_entries (
  id,
  fund_id,
  class_id,
  month_index,
  risk_type,
  risk_direction,
  impact_weight,
  risk_time_lag,
  risk_probability_score,
  risk_impact_score,
  tara_risk_treatment_class,
  risk_treatment_action
) values
  ('80000000-0000-4000-8000-000000000001', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 'inflation', 'up', 0.7000, 2, 4, 4, 'Reduce', 'Trim Apex and rebalance toward Base')
on conflict (id) do nothing;

insert into public.simulation_ledger (
  id,
  fund_id,
  class_id,
  month_index,
  market_beta_impact,
  fee_drag,
  tax_paid,
  tax_drag_pct,
  pvp_slippage_paid,
  liquidity_penalty_pct,
  classroom_sell_concentration_pct,
  ending_aum
) values
  ('90000000-0000-4000-8000-000000000001', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 0, 300000.00, 45000.00, 0.00, 0.0000, 0.00, 0.0000, 0.0000, 50255000.00)
on conflict (id) do nothing;
