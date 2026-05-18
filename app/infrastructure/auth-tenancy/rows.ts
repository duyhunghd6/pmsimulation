import { CLASS_TRIGGER_MODES, INITIAL_CLASS_MONTH_INDEX, type ClassTriggerMode } from '../../domain/classes/class-draft';
import { MAX_SIMULATION_MONTHS, MIN_SIMULATION_MONTHS } from '../../domain/classes/month-advancement';
import { TARA_RISK_TREATMENT_CLASSES, type TaraRiskTreatmentClass } from '../../domain/tara/risk-register';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';

export type AssetTier = 'Base' | 'Core' | 'Apex';

export type InstructorOwnedClassRow = {
  classId: string;
  instructorId: string;
  displayName: string;
  triggerMode: ClassTriggerMode;
  currentMonthIndex: number;
  totalMonths: number;
  studentJoinCode: string;
};

export type InstructorCreatedClassRow = InstructorOwnedClassRow;

export type StudentFundStateRow = {
  fundId: string;
  classId: string;
  studentId: string;
  currentAum: number;
  sharpeRatio: number;
};

export type StudentLeaderboardFundRow = {
  fundId: string;
  classId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
};

export type InstructorLiveLeaderboardFundRow = {
  fundId: string;
  classId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
};

export type InstructorClassFundRow = {
  fundId: string;
  classId: string;
};

export type InstructorClassAggregateFundRow = {
  fundId: string;
  classId: string;
  currentAum: number;
  sharpeRatio: number;
};

export type StudentOwnHoldingRow = {
  holdingId: string;
  fundId: string;
  classId: string;
  tier: AssetTier;
  allocationWeightPct: number;
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
  investmentClockPhase: string;
  pmi: number;
  iip: number;
  m2Growth: number;
  gdpGrowthYoy: number;
  inflationCpi: number;
  policyRate: number;
  bondYield: number;
  interbankRate: number;
  usdVndMovement: number;
  vix: number;
  scenarioPersistence: string;
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

export type TrackedMetricScopeType = 'scenario' | 'class' | 'fund' | 'case';
export type TrackedMetricSourceType = 'seeded' | 'computed' | 'student_entered' | 'rubric_scored';

export type StudentTrackedMetricRow = {
  trackedMetricId: string;
  classId: string;
  fundId?: string;
  scopeType: TrackedMetricScopeType;
  scopeId: string;
  monthIndex: number;
  metricId: string;
  displayLabel: string;
  metricFamily: string;
  valueNumeric?: number;
  valueText?: string;
  unit: string;
  sourceType: TrackedMetricSourceType;
  sourceNote: string;
  conventionNote: string;
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

export type InstructorPendingTaraOrderStatusRow = {
  orderId: string;
  fundId: string;
  classId: string;
  monthIndex: number;
  status: 'pending' | 'processed';
};

export type StudentRiskRegisterEntryRow = {
  riskRegisterEntryId: string;
  fundId: string;
  classId: string;
  monthIndex: number;
  riskType: string;
  riskDirection: string;
  impactWeight: number;
  riskTimeLag: number;
  riskProbabilityScore: number;
  riskImpactScore: number;
  taraRiskTreatmentClass: TaraRiskTreatmentClass;
  riskTreatmentAction: string;
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
  | 'invalid_instructor_id'
  | 'invalid_month_index'
  | 'invalid_total_months'
  | 'invalid_display_name'
  | 'invalid_trigger_mode'
  | 'invalid_join_code'
  | 'invalid_headline'
  | 'invalid_macro_narrative'
  | 'invalid_market_metric'
  | 'invalid_metric_scope'
  | 'invalid_metric_value'
  | 'invalid_metric_metadata'
  | 'invalid_metric_source'
  | 'invalid_tier'
  | 'invalid_target_weights'
  | 'invalid_status'
  | 'invalid_rebalance_trigger'
  | 'invalid_risk_type'
  | 'invalid_risk_direction'
  | 'invalid_impact_weight'
  | 'invalid_risk_time_lag'
  | 'invalid_risk_probability_score'
  | 'invalid_risk_impact_score'
  | 'invalid_tara_risk_treatment_class'
  | 'invalid_risk_treatment_action'
  | 'invalid_numeric_value'
  | 'scope_mismatch'
  | 'future_scenario_row';

export type AuthTenancyDatabaseRowParseResult<T> =
  | { ok: true; row: T }
  | { ok: false; code: AuthTenancyDatabaseRowFailureCode };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const classTriggerModes = new Set<string>(CLASS_TRIGGER_MODES);
const joinCodePattern = /^[A-Z0-9]{6,12}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

function isAssetTier(value: unknown): value is AssetTier {
  return value === 'Base' || value === 'Core' || value === 'Apex';
}

function parseClassTriggerMode(value: unknown): ClassTriggerMode | undefined {
  return typeof value === 'string' && classTriggerModes.has(value) ? (value as ClassTriggerMode) : undefined;
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

function parseDatabaseNonNegativeInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined;
}

function parseAllocationWeightPct(value: unknown): number | undefined {
  const parsed = parseDatabaseNumber(value);
  return parsed !== undefined && parsed >= 0 && parsed <= 100 ? parsed : undefined;
}

function parseTaraRiskTreatmentClass(value: unknown): TaraRiskTreatmentClass | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  return TARA_RISK_TREATMENT_CLASSES.includes(normalized as TaraRiskTreatmentClass) ? (normalized as TaraRiskTreatmentClass) : undefined;
}

function parseTrackedMetricScopeType(value: unknown): TrackedMetricScopeType | undefined {
  return value === 'scenario' || value === 'class' || value === 'fund' || value === 'case' ? value : undefined;
}

function parseTrackedMetricSourceType(value: unknown): TrackedMetricSourceType | undefined {
  return value === 'seeded' || value === 'computed' || value === 'student_entered' || value === 'rubric_scored' ? value : undefined;
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

export function parseInstructorOwnedClassRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<InstructorOwnedClassRow> {
  if (boundary.session.role !== 'instructor') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const classId = input.id;
  const instructorId = input.instructor_id;
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(instructorId)) {
    return { ok: false, code: 'invalid_instructor_id' };
  }
  if (classId !== boundary.scope.classId || instructorId !== boundary.session.subjectId) {
    return { ok: false, code: 'scope_mismatch' };
  }

  if (typeof input.display_name !== 'string' || input.display_name.trim() === '') {
    return { ok: false, code: 'invalid_display_name' };
  }
  const triggerMode = parseClassTriggerMode(input.trigger_mode);
  if (triggerMode === undefined) {
    return { ok: false, code: 'invalid_trigger_mode' };
  }
  if (typeof input.current_month_index !== 'number' || !Number.isInteger(input.current_month_index) || input.current_month_index < 0) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (typeof input.total_months !== 'number' || !Number.isInteger(input.total_months) || input.total_months < MIN_SIMULATION_MONTHS || input.total_months > MAX_SIMULATION_MONTHS) {
    return { ok: false, code: 'invalid_total_months' };
  }
  if (input.current_month_index >= input.total_months) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (typeof input.student_join_code !== 'string' || !joinCodePattern.test(input.student_join_code)) {
    return { ok: false, code: 'invalid_join_code' };
  }

  return {
    ok: true,
    row: {
      classId,
      instructorId,
      displayName: input.display_name.trim(),
      triggerMode,
      currentMonthIndex: input.current_month_index,
      totalMonths: input.total_months,
      studentJoinCode: input.student_join_code,
    },
  };
}

export function parseInstructorCreatedClassRow(
  input: unknown,
  boundary: { session: AuthTenancySession },
): AuthTenancyDatabaseRowParseResult<InstructorCreatedClassRow> {
  if (boundary.session.role !== 'instructor') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const classId = input.id;
  const instructorId = input.instructor_id;
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(instructorId)) {
    return { ok: false, code: 'invalid_instructor_id' };
  }
  if (instructorId !== boundary.session.subjectId) {
    return { ok: false, code: 'scope_mismatch' };
  }

  if (typeof input.display_name !== 'string' || input.display_name.trim() === '') {
    return { ok: false, code: 'invalid_display_name' };
  }
  const triggerMode = parseClassTriggerMode(input.trigger_mode);
  if (triggerMode === undefined) {
    return { ok: false, code: 'invalid_trigger_mode' };
  }
  if (input.current_month_index !== INITIAL_CLASS_MONTH_INDEX) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (typeof input.total_months !== 'number' || !Number.isInteger(input.total_months) || input.total_months < MIN_SIMULATION_MONTHS || input.total_months > MAX_SIMULATION_MONTHS) {
    return { ok: false, code: 'invalid_total_months' };
  }
  if (typeof input.student_join_code !== 'string' || !joinCodePattern.test(input.student_join_code)) {
    return { ok: false, code: 'invalid_join_code' };
  }

  return {
    ok: true,
    row: {
      classId,
      instructorId,
      displayName: input.display_name.trim(),
      triggerMode,
      currentMonthIndex: input.current_month_index,
      totalMonths: input.total_months,
      studentJoinCode: input.student_join_code,
    },
  };
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

export function parseStudentLeaderboardFundRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentLeaderboardFundRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const fundId = input.id;
  const classId = input.class_id;
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (classId !== boundary.scope.classId) {
    return { ok: false, code: 'scope_mismatch' };
  }
  if (typeof input.student_display_name !== 'string' || input.student_display_name.trim() === '') {
    return { ok: false, code: 'invalid_display_name' };
  }

  const currentAum = parseDatabaseNumber(input.current_aum);
  const sharpeRatio = parseDatabaseNumber(input.sharpe_ratio);
  if (currentAum === undefined || currentAum < 0 || sharpeRatio === undefined) {
    return { ok: false, code: 'invalid_numeric_value' };
  }

  return {
    ok: true,
    row: {
      fundId,
      classId,
      studentDisplayName: input.student_display_name.trim(),
      currentAum,
      sharpeRatio,
    },
  };
}

export function parseInstructorClassFundRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<InstructorClassFundRow> {
  if (boundary.session.role !== 'instructor') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const fundId = input.id;
  const classId = input.class_id;
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (classId !== boundary.scope.classId) {
    return { ok: false, code: 'scope_mismatch' };
  }

  return { ok: true, row: { fundId, classId } };
}

export function parseInstructorClassAggregateFundRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<InstructorClassAggregateFundRow> {
  if (boundary.session.role !== 'instructor') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const fundId = input.id;
  const classId = input.class_id;
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (classId !== boundary.scope.classId) {
    return { ok: false, code: 'scope_mismatch' };
  }

  const currentAum = parseDatabaseNumber(input.current_aum);
  const sharpeRatio = parseDatabaseNumber(input.sharpe_ratio);
  if (currentAum === undefined || currentAum < 0 || sharpeRatio === undefined) {
    return { ok: false, code: 'invalid_numeric_value' };
  }

  return { ok: true, row: { fundId, classId, currentAum, sharpeRatio } };
}

export function parseInstructorLiveLeaderboardFundRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<InstructorLiveLeaderboardFundRow> {
  if (boundary.session.role !== 'instructor') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const fundId = input.id;
  const classId = input.class_id;
  if (!isUuid(fundId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (classId !== boundary.scope.classId) {
    return { ok: false, code: 'scope_mismatch' };
  }
  if (typeof input.student_display_name !== 'string' || input.student_display_name.trim() === '') {
    return { ok: false, code: 'invalid_display_name' };
  }

  const currentAum = parseDatabaseNumber(input.current_aum);
  const sharpeRatio = parseDatabaseNumber(input.sharpe_ratio);
  if (currentAum === undefined || currentAum < 0 || sharpeRatio === undefined) {
    return { ok: false, code: 'invalid_numeric_value' };
  }

  return {
    ok: true,
    row: {
      fundId,
      classId,
      studentDisplayName: input.student_display_name.trim(),
      currentAum,
      sharpeRatio,
    },
  };
}

export function parseStudentOwnHoldingRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentOwnHoldingRow> {
  if (boundary.session.role !== 'student') {
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
  if (classId !== boundary.scope.classId || fundId !== boundary.scope.fundId) {
    return { ok: false, code: 'scope_mismatch' };
  }
  if (!isAssetTier(input.tier)) {
    return { ok: false, code: 'invalid_tier' };
  }

  const allocationWeightPct = parseAllocationWeightPct(input.allocation_weight_pct);
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
  if (typeof input.investment_clock_phase !== 'string' || input.investment_clock_phase.trim() === '' || typeof input.scenario_persistence !== 'string' || input.scenario_persistence.trim() === '') {
    return { ok: false, code: 'invalid_macro_narrative' };
  }

  const pmi = parseDatabaseNumber(input.pmi);
  const iip = parseDatabaseNumber(input.iip);
  const m2Growth = parseDatabaseNumber(input.m2_growth);
  const gdpGrowthYoy = parseDatabaseNumber(input.gdp_growth_yoy);
  const inflationCpi = parseDatabaseNumber(input.inflation_cpi);
  const policyRate = parseDatabaseNumber(input.policy_rate);
  const bondYield = parseDatabaseNumber(input.bond_yield);
  const interbankRate = parseDatabaseNumber(input.interbank_rate);
  const usdVndMovement = parseDatabaseNumber(input.usd_vnd_movement);
  const vix = parseDatabaseNumber(input.vix);
  if (
    pmi === undefined ||
    iip === undefined ||
    m2Growth === undefined ||
    gdpGrowthYoy === undefined ||
    inflationCpi === undefined ||
    policyRate === undefined ||
    bondYield === undefined ||
    interbankRate === undefined ||
    usdVndMovement === undefined ||
    vix === undefined
  ) {
    return { ok: false, code: 'invalid_numeric_value' };
  }

  return {
    ok: true,
    row: {
      narrativeId,
      classId,
      monthIndex: input.month_index,
      newsHeadline: input.news_headline.trim(),
      investmentClockPhase: input.investment_clock_phase.trim(),
      pmi,
      iip,
      m2Growth,
      gdpGrowthYoy,
      inflationCpi,
      policyRate,
      bondYield,
      interbankRate,
      usdVndMovement,
      vix,
      scenarioPersistence: input.scenario_persistence.trim(),
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

export function parseStudentTrackedMetricRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentTrackedMetricRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const trackedMetricId = input.id;
  const classId = input.class_id;
  const fundId = input.fund_id;
  const scopeId = input.scope_id;
  if (!isUuid(trackedMetricId)) {
    return { ok: false, code: 'invalid_id' };
  }
  if (!isUuid(classId)) {
    return { ok: false, code: 'invalid_class_id' };
  }
  if (fundId !== null && fundId !== undefined && !isUuid(fundId)) {
    return { ok: false, code: 'invalid_fund_id' };
  }
  if (!isUuid(scopeId)) {
    return { ok: false, code: 'invalid_metric_scope' };
  }
  if (typeof input.month_index !== 'number' || !Number.isInteger(input.month_index) || input.month_index < 0 || boundary.scope.monthIndex === undefined) {
    return { ok: false, code: 'invalid_month_index' };
  }
  if (input.month_index > boundary.scope.monthIndex) {
    return { ok: false, code: 'future_scenario_row' };
  }
  if (classId !== boundary.scope.classId || (fundId !== null && fundId !== undefined && fundId !== boundary.scope.fundId)) {
    return { ok: false, code: 'scope_mismatch' };
  }

  const scopeType = parseTrackedMetricScopeType(input.scope_type);
  if (scopeType === undefined || (scopeType === 'fund' && fundId !== boundary.scope.fundId) || (scopeType !== 'fund' && fundId !== null && fundId !== undefined)) {
    return { ok: false, code: 'invalid_metric_scope' };
  }
  if ((scopeType === 'fund' && scopeId !== fundId) || (scopeType === 'class' && scopeId !== classId)) {
    return { ok: false, code: 'scope_mismatch' };
  }

  const valueNumeric = input.value_numeric === null || input.value_numeric === undefined ? undefined : parseDatabaseNumber(input.value_numeric);
  if (input.value_numeric !== null && input.value_numeric !== undefined && valueNumeric === undefined) {
    return { ok: false, code: 'invalid_metric_value' };
  }
  const valueText = typeof input.value_text === 'string' && input.value_text.trim() !== '' ? input.value_text.trim() : undefined;
  if (valueNumeric === undefined && valueText === undefined) {
    return { ok: false, code: 'invalid_metric_value' };
  }

  if (
    typeof input.metric_id !== 'string' ||
    input.metric_id.trim() === '' ||
    typeof input.display_label !== 'string' ||
    input.display_label.trim() === '' ||
    typeof input.metric_family !== 'string' ||
    input.metric_family.trim() === '' ||
    typeof input.unit !== 'string' ||
    input.unit.trim() === '' ||
    typeof input.source_note !== 'string' ||
    input.source_note.trim() === '' ||
    typeof input.convention_note !== 'string' ||
    input.convention_note.trim() === ''
  ) {
    return { ok: false, code: 'invalid_metric_metadata' };
  }
  const sourceType = parseTrackedMetricSourceType(input.source_type);
  if (sourceType === undefined) {
    return { ok: false, code: 'invalid_metric_source' };
  }

  return {
    ok: true,
    row: {
      trackedMetricId,
      classId,
      fundId: fundId ?? undefined,
      scopeType,
      scopeId,
      monthIndex: input.month_index,
      metricId: input.metric_id.trim(),
      displayLabel: input.display_label.trim(),
      metricFamily: input.metric_family.trim(),
      valueNumeric,
      valueText,
      unit: input.unit.trim(),
      sourceType,
      sourceNote: input.source_note.trim(),
      conventionNote: input.convention_note.trim(),
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

export function parseInstructorPendingTaraOrderStatusRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<InstructorPendingTaraOrderStatusRow> {
  if (boundary.session.role !== 'instructor') {
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
  if (classId !== boundary.scope.classId || input.month_index !== boundary.scope.monthIndex) {
    return { ok: false, code: 'scope_mismatch' };
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
      status: input.status,
    },
  };
}

export function parseStudentRiskRegisterEntryRow(
  input: unknown,
  boundary: { session: AuthTenancySession; scope: ParsedAuthTenancyScope },
): AuthTenancyDatabaseRowParseResult<StudentRiskRegisterEntryRow> {
  if (boundary.session.role !== 'student') {
    return { ok: false, code: 'invalid_role' };
  }
  if (!isRecord(input)) {
    return { ok: false, code: 'row_not_object' };
  }

  const riskRegisterEntryId = input.id;
  const fundId = input.fund_id;
  const classId = input.class_id;
  if (!isUuid(riskRegisterEntryId)) {
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

  if (typeof input.risk_type !== 'string' || input.risk_type.trim() === '') {
    return { ok: false, code: 'invalid_risk_type' };
  }
  if (typeof input.risk_direction !== 'string' || input.risk_direction.trim() === '') {
    return { ok: false, code: 'invalid_risk_direction' };
  }
  const impactWeight = parseDatabaseNumber(input.impact_weight);
  if (impactWeight === undefined || impactWeight <= 0) {
    return { ok: false, code: 'invalid_impact_weight' };
  }
  const riskTimeLag = parseDatabaseNonNegativeInteger(input.risk_time_lag);
  if (riskTimeLag === undefined) {
    return { ok: false, code: 'invalid_risk_time_lag' };
  }
  const riskProbabilityScore = parseDatabaseNonNegativeInteger(input.risk_probability_score);
  if (riskProbabilityScore === undefined) {
    return { ok: false, code: 'invalid_risk_probability_score' };
  }
  const riskImpactScore = parseDatabaseNonNegativeInteger(input.risk_impact_score);
  if (riskImpactScore === undefined) {
    return { ok: false, code: 'invalid_risk_impact_score' };
  }
  const taraRiskTreatmentClass = parseTaraRiskTreatmentClass(input.tara_risk_treatment_class);
  if (taraRiskTreatmentClass === undefined) {
    return { ok: false, code: 'invalid_tara_risk_treatment_class' };
  }
  if (typeof input.risk_treatment_action !== 'string' || input.risk_treatment_action.trim() === '') {
    return { ok: false, code: 'invalid_risk_treatment_action' };
  }

  return {
    ok: true,
    row: {
      riskRegisterEntryId,
      fundId,
      classId,
      monthIndex: input.month_index,
      riskType: input.risk_type.trim(),
      riskDirection: input.risk_direction.trim(),
      impactWeight,
      riskTimeLag,
      riskProbabilityScore,
      riskImpactScore,
      taraRiskTreatmentClass,
      riskTreatmentAction: input.risk_treatment_action.trim(),
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
