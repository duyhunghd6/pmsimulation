export const TRACKED_METRIC_SOURCE_TYPES = ['seeded', 'computed', 'student_entered', 'rubric_scored'] as const;

export type TrackedMetricSourceType = (typeof TRACKED_METRIC_SOURCE_TYPES)[number];

export const TRACKED_SIMULATION_METRIC_FAMILIES = [
  'investor_policy',
  'macro_driver',
  'market_string',
  'asset_class_fund_input',
  'portfolio_order_state',
  'performance_risk',
  'tara_risk_register',
  'friction_attribution',
  'industry_company_evidence',
] as const;

export type TrackedSimulationMetricFamily = (typeof TRACKED_SIMULATION_METRIC_FAMILIES)[number];

export type TrackedSimulationMetricDefinition = {
  id: string;
  family: TrackedSimulationMetricFamily;
  additionalFamilies?: readonly TrackedSimulationMetricFamily[];
  displayLabel: string;
  allowedSourceTypes: readonly TrackedMetricSourceType[];
  requiresAdvancedPerformanceConvention?: true;
};

const seeded = ['seeded'] as const;
const computed = ['computed'] as const;
const studentEntered = ['student_entered'] as const;
const rubricScored = ['rubric_scored'] as const;
const seededOrComputed = ['seeded', 'computed'] as const;
const studentEnteredOrRubricScored = ['student_entered', 'rubric_scored'] as const;

export const TRACKED_SIMULATION_METRICS = [
  metric('savings_rate_for_investment', 'investor_policy', 'Savings rate for investment', studentEntered),
  metric('asset_allocation_weight', 'investor_policy', 'Asset allocation weight', studentEnteredOrRubricScored),
  metric('risk_appetite_level', 'investor_policy', 'Risk appetite level', studentEnteredOrRubricScored),
  metric('risk_profile_class', 'investor_policy', 'Risk profile class', rubricScored),
  metric('investment_time_horizon', 'investor_policy', 'Investment time horizon', studentEntered),
  metric('expected_annual_return', 'investor_policy', 'Expected annual return', studentEntered),
  metric('investment_capacity', 'investor_policy', 'Investment capacity', studentEntered),
  metric('risk_limit', 'investor_policy', 'Risk limit', studentEnteredOrRubricScored),
  metric('risk_budget', 'investor_policy', 'Risk budget', studentEnteredOrRubricScored),
  metric('liquidity_buffer', 'investor_policy', 'Liquidity buffer', studentEnteredOrRubricScored),

  metric('investment_clock_phase', 'macro_driver', 'Investment clock phase', seeded),
  metric('pmi', 'macro_driver', 'PMI', seeded),
  metric('iip', 'macro_driver', 'IIP', seeded),
  metric('m2_growth', 'macro_driver', 'M2 growth', seeded),
  metric('gdp_growth_yoy', 'macro_driver', 'GDP growth YoY', seeded),
  metric('inflation_cpi', 'macro_driver', 'Inflation CPI', seeded),
  metric('policy_rate', 'macro_driver', 'Policy rate', seeded),
  metric('bond_yield', 'macro_driver', 'Bond yield', seeded),
  metric('interbank_rate', 'macro_driver', 'Interbank rate', seeded),
  metric('usd_vnd_movement', 'macro_driver', 'USD/VND movement', seeded),
  metric('vix', 'macro_driver', 'VIX', seeded),
  metric('scenario_persistence', 'macro_driver', 'Scenario persistence', seeded),
  metric('driver_time_lag', 'macro_driver', 'Driver time lag', seeded),

  metric('vn_index_level', 'market_string', 'VN Index level', seeded),
  metric('equity_market_trading_value', 'market_string', 'Equity market trading value', seeded),
  metric('foreign_investor_net_trading_value', 'market_string', 'Foreign investor net trading value', seeded),
  metric('retail_investor_net_trading_value', 'market_string', 'Retail investor net trading value', seeded),
  metric('market_earnings_growth_expectation', 'market_string', 'Market earnings growth expectation', seeded),
  metric('valuation_sentiment', 'market_string', 'Valuation sentiment', seeded),
  metric('business_cycle_phase', 'market_string', 'Business cycle phase', seeded),

  metric('fund_nav_per_unit', 'asset_class_fund_input', 'Fund NAV per unit', computed, ['performance_risk']),
  metric('annualized_return', 'asset_class_fund_input', 'Annualized return', computed),
  metric('adjusted_world_gold_price', 'asset_class_fund_input', 'Adjusted world gold price', seededOrComputed),
  metric('bank_deposit_rate', 'asset_class_fund_input', 'Bank deposit rate', seededOrComputed),
  metric('bond_fund_duration', 'asset_class_fund_input', 'Bond fund duration', seededOrComputed),
  metric('asset_class_fee_pct', 'asset_class_fund_input', 'Asset class fee percentage', seededOrComputed),
  metric('base_fee_pct', 'asset_class_fund_input', 'Base fee percentage', seededOrComputed),

  metric('current_AUM', 'portfolio_order_state', 'Current AUM', computed),
  metric('own_capital', 'portfolio_order_state', 'Own capital', computed),
  metric('position_weight', 'portfolio_order_state', 'Position weight', computed),
  metric('holding_count', 'portfolio_order_state', 'Holding count', computed),
  metric('portfolio_turnover', 'portfolio_order_state', 'Portfolio turnover', computed),
  metric('pending_order_count', 'portfolio_order_state', 'Pending order count', computed),
  metric('target_weight_base', 'portfolio_order_state', 'Target weight Base', studentEntered),
  metric('target_weight_core', 'portfolio_order_state', 'Target weight Core', studentEntered),
  metric('target_weight_apex', 'portfolio_order_state', 'Target weight Apex', studentEntered),
  metric('cash_buffer_weight', 'portfolio_order_state', 'Cash buffer weight', studentEnteredOrRubricScored),
  metric('rebalance_trigger', 'portfolio_order_state', 'Rebalance trigger', studentEnteredOrRubricScored),
  metric('limit_price', 'portfolio_order_state', 'Limit price', studentEntered),
  metric('trigger_price', 'portfolio_order_state', 'Trigger price', studentEntered),
  metric('trailing_step', 'portfolio_order_state', 'Trailing step', studentEntered),

  advancedPerformanceMetric('roi', 'Return on investment'),
  advancedPerformanceMetric('alpha', 'Alpha'),
  advancedPerformanceMetric('beta', 'Beta'),
  advancedPerformanceMetric('volatility', 'Volatility'),
  advancedPerformanceMetric('correlation_coefficient', 'Correlation coefficient'),
  advancedPerformanceMetric('sharpe_ratio', 'Sharpe ratio'),
  advancedPerformanceMetric('treynor_ratio', 'Treynor ratio'),
  advancedPerformanceMetric('drawdown', 'Drawdown'),
  metric('benchmark_return', 'performance_risk', 'Benchmark return', computed),
  metric('risk_free_proxy', 'performance_risk', 'Risk-free proxy', seededOrComputed),
  metric('return_frequency', 'performance_risk', 'Return frequency', seededOrComputed),
  metric('lookback_window', 'performance_risk', 'Lookback window', seededOrComputed),
  metric('annualization_convention', 'performance_risk', 'Annualization convention', seededOrComputed),

  metric('risk_probability_score', 'tara_risk_register', 'Risk probability score', rubricScored),
  metric('risk_impact_score', 'tara_risk_register', 'Risk impact score', rubricScored),
  metric('tara_risk_treatment_class', 'tara_risk_register', 'TARA risk treatment class', rubricScored),
  metric('tara_risk_matrix', 'tara_risk_register', 'TARA risk matrix', rubricScored),
  metric('risk_type', 'tara_risk_register', 'Risk type', rubricScored),
  metric('risk_direction', 'tara_risk_register', 'Risk direction', rubricScored),
  metric('impact_weight', 'tara_risk_register', 'Impact weight', rubricScored),
  metric('risk_time_lag', 'tara_risk_register', 'Risk time lag', rubricScored),
  metric('risk_treatment_action', 'tara_risk_register', 'Risk treatment action', rubricScored),

  metric('tax_paid', 'friction_attribution', 'Tax paid', computed),
  metric('tax_drag_pct', 'friction_attribution', 'Tax drag percentage', computed),
  metric('pvp_slippage_paid', 'friction_attribution', 'PvP slippage paid', computed),
  metric('liquidity_penalty_pct', 'friction_attribution', 'Liquidity penalty percentage', computed),
  metric('classroom_sell_concentration_pct', 'friction_attribution', 'Classroom sell concentration percentage', computed),
  metric('market_beta_impact', 'friction_attribution', 'Market beta impact', computed),
  metric('fee_drag', 'friction_attribution', 'Fee drag', computed),
  metric('ending_AUM', 'friction_attribution', 'Ending AUM', computed),

  metric('revenue', 'industry_company_evidence', 'Revenue', seededOrComputed),
  metric('revenue_growth', 'industry_company_evidence', 'Revenue growth', seededOrComputed),
  metric('net_income', 'industry_company_evidence', 'Net income', seededOrComputed),
  metric('earnings_growth', 'industry_company_evidence', 'Earnings growth', seededOrComputed),
  metric('operating_cash_flow', 'industry_company_evidence', 'Operating cash flow', seededOrComputed),
  metric('total_assets', 'industry_company_evidence', 'Total assets', seededOrComputed),
  metric('roe', 'industry_company_evidence', 'ROE', seededOrComputed),
  metric('roa', 'industry_company_evidence', 'ROA', seededOrComputed),
  metric('gross_margin', 'industry_company_evidence', 'Gross margin', seededOrComputed),
  metric('net_profit_margin', 'industry_company_evidence', 'Net profit margin', seededOrComputed),
  metric('business_profit_margin', 'industry_company_evidence', 'Business profit margin', seededOrComputed),
  metric('dividend_yield', 'industry_company_evidence', 'Dividend yield', seededOrComputed),
  metric('cash_dividend', 'industry_company_evidence', 'Cash dividend', seededOrComputed),
  metric('market_share', 'industry_company_evidence', 'Market share', seededOrComputed),
  metric('market_capitalization', 'industry_company_evidence', 'Market capitalization', seededOrComputed),
  metric('average_trading_volume', 'industry_company_evidence', 'Average trading volume', seededOrComputed),
  metric('mp_stock_group_class', 'industry_company_evidence', 'MP stock group class', seededOrComputed),
  metric('ev_to_ebitda', 'industry_company_evidence', 'EV to EBITDA', seededOrComputed),
  metric('price_to_book', 'industry_company_evidence', 'Price to book', seededOrComputed),
  metric('store_count', 'industry_company_evidence', 'Store count', seededOrComputed),
  metric('hot_rolled_coil_price', 'industry_company_evidence', 'Hot rolled coil price', seededOrComputed),
  metric('free_cash_flow', 'industry_company_evidence', 'Free cash flow', seededOrComputed),
  metric('leverage_ratio_family', 'industry_company_evidence', 'Leverage ratio family', seededOrComputed),
] as const satisfies readonly TrackedSimulationMetricDefinition[];

const definitionsById = new Map(TRACKED_SIMULATION_METRICS.map((definition) => [definition.id, definition]));

export function getTrackedSimulationMetricDefinition(metricId: string): TrackedSimulationMetricDefinition | null {
  return definitionsById.get(metricId) ?? null;
}

export function listTrackedSimulationMetricDefinitionsByFamily(
  family: TrackedSimulationMetricFamily,
): TrackedSimulationMetricDefinition[] {
  return TRACKED_SIMULATION_METRICS.filter(
    (definition) => definition.family === family || definition.additionalFamilies?.includes(family) === true,
  );
}

export function metricRequiresAdvancedPerformanceConvention(metricId: string): boolean {
  return getTrackedSimulationMetricDefinition(metricId)?.requiresAdvancedPerformanceConvention === true;
}

function metric(
  id: string,
  family: TrackedSimulationMetricFamily,
  displayLabel: string,
  allowedSourceTypes: readonly TrackedMetricSourceType[],
  additionalFamilies?: readonly TrackedSimulationMetricFamily[],
): TrackedSimulationMetricDefinition {
  return {
    id,
    family,
    ...(additionalFamilies === undefined ? {} : { additionalFamilies }),
    displayLabel,
    allowedSourceTypes,
  };
}

function advancedPerformanceMetric(id: string, displayLabel: string): TrackedSimulationMetricDefinition {
  return {
    id,
    family: 'performance_risk',
    displayLabel,
    allowedSourceTypes: computed,
    requiresAdvancedPerformanceConvention: true,
  };
}
