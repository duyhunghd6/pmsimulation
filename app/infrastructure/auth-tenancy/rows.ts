import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';

export type AssetTier = 'Base' | 'Core' | 'Apex';

export type StudentFundStateRow = {
  fundId: string;
  classId: string;
  studentId: string;
  currentAum: number;
  sharpeRatio: number;
};

export type InstructorGodModeHoldingRow = {
  holdingId: string;
  fundId: string;
  classId: string;
  tier: AssetTier;
  allocationWeightPct: number;
};

export type StudentRevealedMacroNarrativeRow = {
  narrativeId: string;
  classId: string;
  monthIndex: number;
  newsHeadline: string;
};

export type StudentRevealedMarketMetricRow = {
  metricId: string;
  classId: string;
  monthIndex: number;
  vnIndexLevel: number;
  equityMarketTradingValue: number;
  foreignInvestorNetTradingValue: number;
  retailInvestorNetTradingValue: number;
  marketEarningsGrowthExpectation: number;
  valuationSentiment: string;
  businessCyclePhase: string;
};

export type TaraTargetWeights = Record<AssetTier, number>;

export type StudentTaraOrderRow = {
  orderId: string;
  fundId: string;
  classId: string;
  monthIndex: number;
  targetWeights: TaraTargetWeights;
  estimatedTaxDrag: number;
  rebalanceTrigger: string;
  status: 'pending' | 'processed';
};

export type StudentSimulationLedgerRow = {
  ledgerId: string;
  fundId: string;
  classId: string;
  monthIndex: number;
  marketBetaImpact: number;
  feeDrag: number;
  taxPaid: number;
  taxDragPct: number;
  pvpSlippagePaid: number;
  liquidityPenaltyPct: number;
  classroomSellConcentrationPct: number;
  endingAum: number;
};

export type AuthTenancyDatabaseRowFailureCode =
  | 'row_not_object'
  | 'invalid_role'
  | 'invalid_id'
  | 'invalid_class_id'
  | 'invalid_fund_id'
  | 'invalid_student_id'
  | 'invalid_month_index'
  | 'invalid_headline'
  | 'invalid_market_metric'
  | 'invalid_tier'
  | 'invalid_target_weights'
  | 'invalid_status'
  | 'invalid_rebalance_trigger'
  | 'invalid_numeric_value'
  | 'scope_mismatch'
  | 'future_scenario_row';

export type AuthTenancyDatabaseRowParseResult<T> =
  | { ok: true; row: T }
  | { ok: false; code: AuthTenancyDatabaseRowFailureCode };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

function isAssetTier(value: unknown): value is AssetTier {
  return value === 'Base' || value === 'Core' || value === 'Apex';
}

function parseDatabaseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseTaraTargetWeights(value: unknown): TaraTargetWeights | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const base = parseDatabaseNumber(value.Base);
  const core = parseDatabaseNumber(value.Core);
  const apex = parseDatabaseNumber(value.Apex);
  if (base === undefined || core === undefined || apex === undefined) {
    return undefined;
  }
  if (Math.abs(base + core + apex - 100) > 0.0001) {
    return undefined;
  }

  return { Base: base, Core: core, Apex: apex };
}

function isTaraOrderStatus(value: unknown): value is StudentTaraOrderRow['status'] {
  return value === 'pending' || value === 'processed';
}

function hasScopedClassFundMonth(input: {
  classId: string;
  fundId: string;
  monthIndex: number;
  scope: ParsedAuthTenancyScope;
}): boolean {
  return input.classId === input.scope.classId && input.fundId === input.scope.fundId && input.monthIndex === input.scope.monthIndex;
}

export function parseStudentFundStateRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentFundStateRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const fundId = input.id;
  const classId = input.class_id;
  const studentId = input.student_id;
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (!isUuid(studentId)) {
    return { ok: false, code: 'invalid_student_id' };
  }
  if (classId !== boundary.scope.classId || studentId !== boundary.session.subjectId || (boundary.scope.fundId !== undefined && fundId !== boundary.scope.fundId)) {
    return { ok: false, code: 'scope_mismatch' };
  }

  const currentAum = parseDatabaseNumber(input.current_aum);
  const sharpeRatio = parseDatabaseNumber(input.sharpe_ratio);
  if (currentAum === undefined || sharpeRatio === undefined) {
    return { ok: false, code: 'invalid_numeric_value' };
  }

  return { ok: true, row: { fundId, classId, studentId, currentAum, sharpeRatio } };
}

export function parseInstructorGodModeHoldingRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<InstructorGodModeHoldingRow> {
  if (boundary.session.role !== 'instructor') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const holdingId = input.id;
  const fundId = input.fund_id;
  const classId = input.class_id;
  if (!isUuid(holdingId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_fund_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (classId !== boundary.scope.classId) {
    return { ok: false, code: 'scope_mismatch' };
  }
  if (!isAssetTier(input.tier)) {
    return { ok: false, code: 'invalid_tier' };
  }

  const allocationWeightPct = parseDatabaseNumber(input.allocation_weight_pct);
  if (allocationWeightPct === undefined) {
    return { ok: false, code: 'invalid_numeric_value' };
  }

  return {
    ok: true,
    row: {
      holdingId,
      fundId,
      classId,
      tier: input.tier,
      allocationWeightPct,
    },
  };
}

export function parseStudentRevealedMacroNarrativeRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentRevealedMacroNarrativeRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const narrativeId = input.id;
  const classId = input.class_id;
  if (!isUuid(narrativeId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (classId !== boundary.scope.classId) {
    return { ok: false, code: 'scope_mismatch' };
  }
  if (typeof input.month_index !== 'number' || !Number.isInteger(input.month_index) || input.month_index < 0 || boundary.scope.monthIndex === undefined) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (input.month_index > boundary.scope.monthIndex) {
    return { ok: false, code: 'future_scenario_row' };
  }
  if (typeof input.news_headline !== 'string' || input.news_headline.trim() === '') {
    return { ok: false, code: 'invalid_headline' };
  }

  return {
    ok: true,
    row: {
      narrativeId,
      classId,
      monthIndex: input.month_index,
      newsHeadline: input.news_headline,
    },
  };
}

export function parseStudentRevealedMarketMetricRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentRevealedMarketMetricRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const metricId = input.id;
  const classId = input.class_id;
  if (!isUuid(metricId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (classId !== boundary.scope.classId) {
    return { ok: false, code: 'scope_mismatch' };
  }
  if (typeof input.month_index !== 'number' || !Number.isInteger(input.month_index) || input.month_index < 0 || boundary.scope.monthIndex === undefined) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (input.month_index > boundary.scope.monthIndex) {
    return { ok: false, code: 'future_scenario_row' };
  }

  const vnIndexLevel = parseDatabaseNumber(input.vn_index_level);
  const equityMarketTradingValue = parseDatabaseNumber(input.equity_market_trading_value);
  const foreignInvestorNetTradingValue = parseDatabaseNumber(input.foreign_investor_net_trading_value);
  const retailInvestorNetTradingValue = parseDatabaseNumber(input.retail_investor_net_trading_value);
  const marketEarningsGrowthExpectation = parseDatabaseNumber(input.market_earnings_growth_expectation);
  if (
    vnIndexLevel === undefined ||
    equityMarketTradingValue === undefined ||
    foreignInvestorNetTradingValue === undefined ||
    retailInvestorNetTradingValue === undefined ||
    marketEarningsGrowthExpectation === undefined
  ) {
    return { ok: false, code: 'invalid_numeric_value' };
  }
  if (typeof input.valuation_sentiment !== 'string' || input.valuation_sentiment.trim() === '' || typeof input.business_cycle_phase !== 'string' || input.business_cycle_phase.trim() === '') {
    return { ok: false, code: 'invalid_market_metric' };
  }

  return {
    ok: true,
    row: {
      metricId,
      classId,
      monthIndex: input.month_index,
      vnIndexLevel,
      equityMarketTradingValue,
      foreignInvestorNetTradingValue,
      retailInvestorNetTradingValue,
      marketEarningsGrowthExpectation,
      valuationSentiment: input.valuation_sentiment,
      businessCyclePhase: input.business_cycle_phase,
    },
  };
}

export function parseStudentTaraOrderRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentTaraOrderRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const orderId = input.id;
  const fundId = input.fund_id;
  const classId = input.class_id;
  if (!isUuid(orderId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_fund_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (typeof input.month_index !== 'number' || !Number.isInteger(input.month_index) || input.month_index < 0 || boundary.scope.monthIndex === undefined) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (!hasScopedClassFundMonth({ classId, fundId, monthIndex: input.month_index, scope: boundary.scope })) {
    return { ok: false, code: 'scope_mismatch' };
  }

  const targetWeights = parseTaraTargetWeights(input.target_weights_json);
  if (targetWeights === undefined) {
    return { ok: false, code: 'invalid_target_weights' };
  }
  const estimatedTaxDrag = parseDatabaseNumber(input.estimated_tax_drag);
  if (estimatedTaxDrag === undefined) {
    return { ok: false, code: 'invalid_numeric_value' };
  }
  if (typeof input.rebalance_trigger !== 'string' || input.rebalance_trigger.trim() === '') {
    return { ok: false, code: 'invalid_rebalance_trigger' };
  }
  if (!isTaraOrderStatus(input.status)) {
    return { ok: false, code: 'invalid_status' };
  }

  return {
    ok: true,
    row: {
      orderId,
      fundId,
      classId,
      monthIndex: input.month_index,
      targetWeights,
      estimatedTaxDrag,
      rebalanceTrigger: input.rebalance_trigger,
      status: input.status,
    },
  };
}

export function parseStudentSimulationLedgerRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentSimulationLedgerRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const ledgerId = input.id;
  const fundId = input.fund_id;
  const classId = input.class_id;
  if (!isUuid(ledgerId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_fund_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (typeof input.month_index !== 'number' || !Number.isInteger(input.month_index) || input.month_index < 0 || boundary.scope.monthIndex === undefined) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (!hasScopedClassFundMonth({ classId, fundId, monthIndex: input.month_index, scope: boundary.scope })) {
    return { ok: false, code: 'scope_mismatch' };
  }

  const marketBetaImpact = parseDatabaseNumber(input.market_beta_impact);
  const feeDrag = parseDatabaseNumber(input.fee_drag);
  const taxPaid = parseDatabaseNumber(input.tax_paid);
  const taxDragPct = parseDatabaseNumber(input.tax_drag_pct);
  const pvpSlippagePaid = parseDatabaseNumber(input.pvp_slippage_paid);
  const liquidityPenaltyPct = parseDatabaseNumber(input.liquidity_penalty_pct);
  const classroomSellConcentrationPct = parseDatabaseNumber(input.classroom_sell_concentration_pct);
  const endingAum = parseDatabaseNumber(input.ending_aum);
  if (
    marketBetaImpact === undefined ||
    feeDrag === undefined ||
    taxPaid === undefined ||
    taxDragPct === undefined ||
    pvpSlippagePaid === undefined ||
    liquidityPenaltyPct === undefined ||
    classroomSellConcentrationPct === undefined ||
    endingAum === undefined
  ) {
    return { ok: false, code: 'invalid_numeric_value' };
  }

  return {
    ok: true,
    row: {
      ledgerId,
      fundId,
      classId,
      monthIndex: input.month_index,
      marketBetaImpact,
      feeDrag,
      taxPaid,
      taxDragPct,
      pvpSlippagePaid,
      liquidityPenaltyPct,
      classroomSellConcentrationPct,
      endingAum,
    },
  };
}
