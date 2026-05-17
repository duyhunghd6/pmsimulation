import { describe, expect, it } from 'vitest';

import {
  TRACKED_METRIC_SOURCE_TYPES,
  TRACKED_SIMULATION_METRICS,
  getTrackedSimulationMetricDefinition,
  listTrackedSimulationMetricDefinitionsByFamily,
  metricRequiresAdvancedPerformanceConvention,
} from './catalog';

const prdMetricIds = [
  'savings_rate_for_investment',
  'asset_allocation_weight',
  'risk_appetite_level',
  'risk_profile_class',
  'investment_time_horizon',
  'expected_annual_return',
  'investment_capacity',
  'risk_limit',
  'risk_budget',
  'liquidity_buffer',
  'investment_clock_phase',
  'pmi',
  'iip',
  'm2_growth',
  'gdp_growth_yoy',
  'inflation_cpi',
  'policy_rate',
  'bond_yield',
  'interbank_rate',
  'usd_vnd_movement',
  'vix',
  'scenario_persistence',
  'driver_time_lag',
  'vn_index_level',
  'equity_market_trading_value',
  'foreign_investor_net_trading_value',
  'retail_investor_net_trading_value',
  'market_earnings_growth_expectation',
  'valuation_sentiment',
  'business_cycle_phase',
  'fund_nav_per_unit',
  'annualized_return',
  'adjusted_world_gold_price',
  'bank_deposit_rate',
  'bond_fund_duration',
  'asset_class_fee_pct',
  'base_fee_pct',
  'current_AUM',
  'own_capital',
  'position_weight',
  'holding_count',
  'portfolio_turnover',
  'pending_order_count',
  'target_weight_base',
  'target_weight_core',
  'target_weight_apex',
  'cash_buffer_weight',
  'rebalance_trigger',
  'limit_price',
  'trigger_price',
  'trailing_step',
  'roi',
  'alpha',
  'beta',
  'volatility',
  'correlation_coefficient',
  'sharpe_ratio',
  'treynor_ratio',
  'drawdown',
  'benchmark_return',
  'risk_free_proxy',
  'return_frequency',
  'lookback_window',
  'annualization_convention',
  'risk_probability_score',
  'risk_impact_score',
  'tara_risk_treatment_class',
  'tara_risk_matrix',
  'risk_type',
  'risk_direction',
  'impact_weight',
  'risk_time_lag',
  'risk_treatment_action',
  'tax_paid',
  'tax_drag_pct',
  'pvp_slippage_paid',
  'liquidity_penalty_pct',
  'classroom_sell_concentration_pct',
  'market_beta_impact',
  'fee_drag',
  'ending_AUM',
  'revenue',
  'revenue_growth',
  'net_income',
  'earnings_growth',
  'operating_cash_flow',
  'total_assets',
  'roe',
  'roa',
  'gross_margin',
  'net_profit_margin',
  'business_profit_margin',
  'dividend_yield',
  'cash_dividend',
  'market_share',
  'market_capitalization',
  'average_trading_volume',
  'mp_stock_group_class',
  'ev_to_ebitda',
  'price_to_book',
  'store_count',
  'hot_rolled_coil_price',
  'free_cash_flow',
  'leverage_ratio_family',
];

describe('tracked simulation metric catalog', () => {
  it('contains each PRD tracked metric id exactly once', () => {
    const catalogIds = TRACKED_SIMULATION_METRICS.map((definition) => definition.id);

    expect(new Set(catalogIds).size).toBe(catalogIds.length);

    for (const metricId of prdMetricIds) {
      expect(getTrackedSimulationMetricDefinition(metricId)?.id).toBe(metricId);
    }
  });

  it('classifies metrics by curriculum family', () => {
    expect(listTrackedSimulationMetricDefinitionsByFamily('macro_driver').map((definition) => definition.id)).toContain(
      'm2_growth',
    );
    expect(listTrackedSimulationMetricDefinitionsByFamily('market_string').map((definition) => definition.id)).toContain(
      'vn_index_level',
    );
    expect(listTrackedSimulationMetricDefinitionsByFamily('friction_attribution').map((definition) => definition.id)).toContain(
      'ending_AUM',
    );
    expect(listTrackedSimulationMetricDefinitionsByFamily('performance_risk').map((definition) => definition.id)).toContain(
      'fund_nav_per_unit',
    );
  });

  it('marks advanced risk and performance metrics that require convention metadata', () => {
    expect(metricRequiresAdvancedPerformanceConvention('alpha')).toBe(true);
    expect(metricRequiresAdvancedPerformanceConvention('beta')).toBe(true);
    expect(metricRequiresAdvancedPerformanceConvention('volatility')).toBe(true);
    expect(metricRequiresAdvancedPerformanceConvention('correlation_coefficient')).toBe(true);
    expect(metricRequiresAdvancedPerformanceConvention('sharpe_ratio')).toBe(true);
    expect(metricRequiresAdvancedPerformanceConvention('treynor_ratio')).toBe(true);
    expect(metricRequiresAdvancedPerformanceConvention('drawdown')).toBe(true);
    expect(metricRequiresAdvancedPerformanceConvention('benchmark_return')).toBe(false);
    expect(metricRequiresAdvancedPerformanceConvention('unknown_metric')).toBe(false);
  });

  it('records allowed metric source types for seeded, computed, student-entered, and rubric-scored metrics', () => {
    expect(TRACKED_METRIC_SOURCE_TYPES).toEqual(['seeded', 'computed', 'student_entered', 'rubric_scored']);
    expect(getTrackedSimulationMetricDefinition('pmi')?.allowedSourceTypes).toEqual(['seeded']);
    expect(getTrackedSimulationMetricDefinition('target_weight_base')?.allowedSourceTypes).toEqual(['student_entered']);
    expect(getTrackedSimulationMetricDefinition('risk_probability_score')?.allowedSourceTypes).toEqual(['rubric_scored']);
    expect(getTrackedSimulationMetricDefinition('fee_drag')?.allowedSourceTypes).toEqual(['computed']);
  });
});
