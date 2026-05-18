import { integer, jsonb, numeric, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  role: text('role').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const classes = pgTable('classes', {
  id: uuid('id').primaryKey(),
  instructorId: uuid('instructor_id').notNull(),
  displayName: text('display_name').notNull(),
  triggerMode: text('trigger_mode').notNull(),
  currentMonthIndex: integer('current_month_index').notNull(),
  totalMonths: integer('total_months').notNull(),
  studentJoinCode: text('student_join_code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const classAdministrators = pgTable(
  'class_administrators',
  {
    classId: uuid('class_id').notNull(),
    instructorId: uuid('instructor_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.classId, table.instructorId] })],
);

export const classEnrollments = pgTable(
  'class_enrollments',
  {
    classId: uuid('class_id').notNull(),
    studentId: uuid('student_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.classId, table.studentId] })],
);

export const funds = pgTable('funds', {
  id: uuid('id').primaryKey(),
  classId: uuid('class_id').notNull(),
  studentId: uuid('student_id').notNull(),
  currentAum: numeric('current_aum', { precision: 14, scale: 2 }).notNull(),
  riskAppetiteLevel: text('risk_appetite_level').notNull(),
  riskProfileClass: text('risk_profile_class').notNull(),
  investmentTimeHorizon: text('investment_time_horizon').notNull(),
  expectedAnnualReturn: numeric('expected_annual_return', { precision: 7, scale: 4 }).notNull(),
  riskBudget: numeric('risk_budget', { precision: 7, scale: 4 }).notNull(),
  liquidityBuffer: numeric('liquidity_buffer', { precision: 7, scale: 4 }).notNull(),
  roi: numeric('roi', { precision: 9, scale: 4 }).notNull(),
  alpha: numeric('alpha', { precision: 9, scale: 4 }).notNull(),
  beta: numeric('beta', { precision: 9, scale: 4 }).notNull(),
  volatility: numeric('volatility', { precision: 9, scale: 4 }).notNull(),
  sharpeRatio: numeric('sharpe_ratio', { precision: 9, scale: 4 }).notNull(),
  treynorRatio: numeric('treynor_ratio', { precision: 9, scale: 4 }).notNull(),
  drawdown: numeric('drawdown', { precision: 9, scale: 4 }).notNull(),
});

export const assetHoldings = pgTable('asset_holdings', {
  id: uuid('id').primaryKey(),
  fundId: uuid('fund_id').notNull(),
  classId: uuid('class_id').notNull(),
  tier: text('tier').notNull(),
  allocationWeightPct: numeric('allocation_weight_pct', { precision: 7, scale: 4 }).notNull(),
  positionWeight: numeric('position_weight', { precision: 7, scale: 4 }).notNull(),
  cashBufferWeight: numeric('cash_buffer_weight', { precision: 7, scale: 4 }).notNull(),
});

export const macroNarratives = pgTable('macro_narratives', {
  id: uuid('id').primaryKey(),
  classId: uuid('class_id').notNull(),
  monthIndex: integer('month_index').notNull(),
  newsHeadline: text('news_headline').notNull(),
  investmentClockPhase: text('investment_clock_phase').notNull(),
  pmi: numeric('pmi', { precision: 7, scale: 2 }).notNull(),
  iip: numeric('iip', { precision: 7, scale: 2 }).notNull(),
  m2Growth: numeric('m2_growth', { precision: 7, scale: 2 }).notNull(),
  gdpGrowthYoy: numeric('gdp_growth_yoy', { precision: 7, scale: 2 }).notNull(),
  inflationCpi: numeric('inflation_cpi', { precision: 7, scale: 2 }).notNull(),
  policyRate: numeric('policy_rate', { precision: 7, scale: 2 }).notNull(),
  bondYield: numeric('bond_yield', { precision: 7, scale: 2 }).notNull(),
  interbankRate: numeric('interbank_rate', { precision: 7, scale: 2 }).notNull(),
  usdVndMovement: numeric('usd_vnd_movement', { precision: 7, scale: 2 }).notNull(),
  vix: numeric('vix', { precision: 7, scale: 2 }).notNull(),
  scenarioPersistence: text('scenario_persistence').notNull(),
});

export const marketMetrics = pgTable('market_metrics', {
  id: uuid('id').primaryKey(),
  classId: uuid('class_id').notNull(),
  monthIndex: integer('month_index').notNull(),
  vnIndexLevel: numeric('vn_index_level', { precision: 12, scale: 2 }).notNull(),
  equityMarketTradingValue: numeric('equity_market_trading_value', { precision: 14, scale: 2 }).notNull(),
  foreignInvestorNetTradingValue: numeric('foreign_investor_net_trading_value', { precision: 14, scale: 2 }).notNull(),
  retailInvestorNetTradingValue: numeric('retail_investor_net_trading_value', { precision: 14, scale: 2 }).notNull(),
  marketEarningsGrowthExpectation: numeric('market_earnings_growth_expectation', { precision: 7, scale: 2 }).notNull(),
  valuationSentiment: text('valuation_sentiment').notNull(),
  businessCyclePhase: text('business_cycle_phase').notNull(),
});

export const trackedMetrics = pgTable('tracked_metrics', {
  id: uuid('id').primaryKey(),
  classId: uuid('class_id'),
  fundId: uuid('fund_id'),
  scopeType: text('scope_type').notNull(),
  scopeId: uuid('scope_id').notNull(),
  monthIndex: integer('month_index').notNull(),
  metricId: text('metric_id').notNull(),
  displayLabel: text('display_label').notNull(),
  metricFamily: text('metric_family').notNull(),
  valueNumeric: numeric('value_numeric', { precision: 14, scale: 4 }),
  valueText: text('value_text'),
  unit: text('unit').notNull(),
  sourceType: text('source_type').notNull(),
  sourceNote: text('source_note').notNull(),
  conventionNote: text('convention_note').notNull(),
});

export const taraOrders = pgTable('tara_orders', {
  id: uuid('id').primaryKey(),
  fundId: uuid('fund_id').notNull(),
  classId: uuid('class_id').notNull(),
  monthIndex: integer('month_index').notNull(),
  targetWeightsJson: jsonb('target_weights_json').notNull(),
  estimatedTaxDrag: numeric('estimated_tax_drag', { precision: 14, scale: 2 }).notNull(),
  rebalanceTrigger: text('rebalance_trigger').notNull(),
  status: text('status').notNull(),
});

export const riskRegisterEntries = pgTable('risk_register_entries', {
  id: uuid('id').primaryKey(),
  fundId: uuid('fund_id').notNull(),
  classId: uuid('class_id').notNull(),
  monthIndex: integer('month_index').notNull(),
  riskType: text('risk_type').notNull(),
  riskDirection: text('risk_direction').notNull(),
  impactWeight: numeric('impact_weight', { precision: 7, scale: 4 }).notNull(),
  riskTimeLag: integer('risk_time_lag').notNull(),
  riskProbabilityScore: integer('risk_probability_score').notNull(),
  riskImpactScore: integer('risk_impact_score').notNull(),
  taraRiskTreatmentClass: text('tara_risk_treatment_class').notNull(),
  riskTreatmentAction: text('risk_treatment_action').notNull(),
});

export const simulationLedger = pgTable('simulation_ledger', {
  id: uuid('id').primaryKey(),
  fundId: uuid('fund_id').notNull(),
  classId: uuid('class_id').notNull(),
  monthIndex: integer('month_index').notNull(),
  marketBetaImpact: numeric('market_beta_impact', { precision: 14, scale: 2 }).notNull(),
  feeDrag: numeric('fee_drag', { precision: 14, scale: 2 }).notNull(),
  taxPaid: numeric('tax_paid', { precision: 14, scale: 2 }).notNull(),
  taxDragPct: numeric('tax_drag_pct', { precision: 7, scale: 4 }).notNull(),
  pvpSlippagePaid: numeric('pvp_slippage_paid', { precision: 14, scale: 2 }).notNull(),
  liquidityPenaltyPct: numeric('liquidity_penalty_pct', { precision: 7, scale: 4 }).notNull(),
  classroomSellConcentrationPct: numeric('classroom_sell_concentration_pct', { precision: 7, scale: 4 }).notNull(),
  endingAum: numeric('ending_aum', { precision: 14, scale: 2 }).notNull(),
});
