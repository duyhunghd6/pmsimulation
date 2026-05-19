import {
  createStudentTaraOrderServerActionCommandDescriptor,
  createStudentTaraOrderServerActionResultEnvelope,
  createStudentTaraOrderServerActionValidationFailureEnvelope,
  createStudentTaraOrderSubmissionReceipt,
  type StudentTaraOrderServerActionResultEnvelope,
  type StudentTaraOrderServerActionValidationFailureEnvelope,
  type StudentTaraOrderSubmissionReceiptError,
} from '../../domain/tara/order';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseStudentFundStateRow,
  parseStudentOwnHoldingRow,
  parseStudentTaraOrderRow,
  parseStudentTrackedMetricRow,
  type AuthTenancyDatabaseRowFailureCode,
  type StudentTaraOrderRow,
  type TaraTargetWeights,
} from './rows';

const apexUnrealizedGainMetricId = 'apex_unrealized_gain_pct';

export type StudentTaraOrderSubmissionActionScope = {
  classId: string;
  fundId: string;
  monthIndex: number;
};

export type StudentTaraOrderSubmissionActionRowSet = {
  funds: readonly unknown[];
  holdings: readonly unknown[];
  orders: readonly unknown[];
  trackedMetrics: readonly unknown[];
};

export type StudentTaraOrderSubmissionActionStore = {
  readStudentTaraOrderSubmissionRows(input: {
    session: AuthTenancySession;
    scope: StudentTaraOrderSubmissionActionScope;
  }): Promise<StudentTaraOrderSubmissionActionRowSet>;
  createPendingStudentTaraOrder(input: {
    session: AuthTenancySession;
    scope: StudentTaraOrderSubmissionActionScope;
    command: ReturnType<typeof createStudentTaraOrderServerActionCommandDescriptor>;
  }): Promise<unknown>;
};

export type StudentTaraOrderSubmissionActionFailureCode =
  | 'invalid_role'
  | 'missing_fund_scope'
  | 'missing_month_scope'
  | 'fund_row_rejected'
  | 'missing_fund_row'
  | 'duplicate_fund_row'
  | 'holding_row_rejected'
  | 'duplicate_holding_tier'
  | 'order_row_rejected'
  | 'pending_order_already_exists'
  | 'tracked_metric_row_rejected'
  | 'missing_apex_unrealized_gain_pct'
  | 'duplicate_apex_unrealized_gain_pct'
  | 'invalid_apex_unrealized_gain_pct'
  | 'invalid_submission'
  | 'invalid_validation_failure_envelope'
  | 'row_store_failed'
  | 'pending_order_store_failed'
  | 'persisted_order_row_rejected'
  | 'persisted_order_mismatch';

export type StudentTaraOrderSubmissionActionFailure = {
  code: StudentTaraOrderSubmissionActionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly StudentTaraOrderSubmissionReceiptError[];
};

export type StudentTaraOrderSubmissionActionResult =
  | { ok: true; value: StudentTaraOrderServerActionResultEnvelope }
  | { ok: false; safeFailure?: StudentTaraOrderServerActionValidationFailureEnvelope; failure: StudentTaraOrderSubmissionActionFailure };

export async function executeStudentTaraOrderSubmissionAction(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  targetWeights: TaraTargetWeights;
  store: StudentTaraOrderSubmissionActionStore;
}): Promise<StudentTaraOrderSubmissionActionResult> {
  if (input.session.role !== 'student') {
    return { ok: false, failure: { code: 'invalid_role' } };
  }
  if (input.scope.fundId === undefined) {
    return { ok: false, failure: { code: 'missing_fund_scope' } };
  }
  if (input.scope.monthIndex === undefined) {
    return { ok: false, failure: { code: 'missing_month_scope' } };
  }

  const scope = {
    classId: input.scope.classId,
    fundId: input.scope.fundId,
    monthIndex: input.scope.monthIndex,
  };
  let rows: StudentTaraOrderSubmissionActionRowSet;
  try {
    rows = await input.store.readStudentTaraOrderSubmissionRows({ session: input.session, scope });
  } catch {
    return { ok: false, failure: { code: 'row_store_failed' } };
  }
  let currentAum: number | undefined;
  const currentWeights: Record<string, number> = {};
  let apexUnrealizedGainPct: number | undefined;

  for (const row of rows.funds) {
    const parsed = parseStudentFundStateRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'fund_row_rejected', rowFailureCode: parsed.code } };
    }
    if (currentAum !== undefined) {
      return { ok: false, failure: { code: 'duplicate_fund_row' } };
    }
    currentAum = parsed.row.currentAum;
  }
  if (currentAum === undefined) {
    return { ok: false, failure: { code: 'missing_fund_row' } };
  }

  for (const row of rows.holdings) {
    const parsed = parseStudentOwnHoldingRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'holding_row_rejected', rowFailureCode: parsed.code } };
    }
    if (currentWeights[parsed.row.tier] !== undefined) {
      return { ok: false, failure: { code: 'duplicate_holding_tier' } };
    }
    currentWeights[parsed.row.tier] = parsed.row.allocationWeightPct;
  }

  for (const row of rows.orders) {
    const parsed = parseStudentTaraOrderRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'order_row_rejected', rowFailureCode: parsed.code } };
    }
    if (parsed.row.status === 'pending') {
      return { ok: false, failure: { code: 'pending_order_already_exists' } };
    }
  }

  for (const row of rows.trackedMetrics) {
    const parsed = parseStudentTrackedMetricRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'tracked_metric_row_rejected', rowFailureCode: parsed.code } };
    }
    if (
      parsed.row.metricId !== apexUnrealizedGainMetricId ||
      parsed.row.scopeType !== 'fund' ||
      parsed.row.fundId !== scope.fundId ||
      parsed.row.monthIndex !== scope.monthIndex
    ) {
      continue;
    }
    if (parsed.row.valueNumeric === undefined) {
      return { ok: false, failure: { code: 'invalid_apex_unrealized_gain_pct' } };
    }
    if (apexUnrealizedGainPct !== undefined) {
      return { ok: false, failure: { code: 'duplicate_apex_unrealized_gain_pct' } };
    }
    apexUnrealizedGainPct = parsed.row.valueNumeric;
  }
  if (apexUnrealizedGainPct === undefined) {
    return { ok: false, failure: { code: 'missing_apex_unrealized_gain_pct' } };
  }

  const receiptResult = createStudentTaraOrderSubmissionReceipt({
    classId: scope.classId,
    viewerFundId: scope.fundId,
    monthIndex: scope.monthIndex,
    currentAum,
    currentWeights,
    targetWeights: input.targetWeights,
    apexUnrealizedGainPct,
  });
  if (!receiptResult.ok) {
    const safeFailure = createStudentTaraOrderServerActionValidationFailureEnvelope({
      classId: scope.classId,
      viewerFundId: scope.fundId,
      monthIndex: scope.monthIndex,
      currentAum,
      currentWeights,
      targetWeights: input.targetWeights,
      apexUnrealizedGainPct,
    });
    if (!safeFailure.ok) {
      return { ok: false, failure: { code: 'invalid_validation_failure_envelope' } };
    }
    return {
      ok: false,
      safeFailure: safeFailure.value,
      failure: { code: 'invalid_submission', validationErrors: receiptResult.errors },
    };
  }

  const command = createStudentTaraOrderServerActionCommandDescriptor(receiptResult.value);
  let persistedRow: unknown;
  try {
    persistedRow = await input.store.createPendingStudentTaraOrder({ session: input.session, scope, command });
  } catch {
    return { ok: false, failure: { code: 'pending_order_store_failed' } };
  }
  const parsedPersistedOrder = parseStudentTaraOrderRow(persistedRow, { session: input.session, scope });
  if (!parsedPersistedOrder.ok) {
    return { ok: false, failure: { code: 'persisted_order_row_rejected', rowFailureCode: parsedPersistedOrder.code } };
  }
  if (!persistedOrderMatchesCommand(parsedPersistedOrder.row, command)) {
    return { ok: false, failure: { code: 'persisted_order_mismatch' } };
  }

  return { ok: true, value: createStudentTaraOrderServerActionResultEnvelope(command) };
}

function persistedOrderMatchesCommand(
  row: StudentTaraOrderRow,
  command: ReturnType<typeof createStudentTaraOrderServerActionCommandDescriptor>,
): boolean {
  return (
    row.classId === command.classId &&
    row.fundId === command.viewerFundId &&
    row.monthIndex === command.monthIndex &&
    row.status === command.status &&
    row.rebalanceTrigger === command.rebalanceTrigger &&
    weightsMatch(row.targetWeights, command.targetWeights) &&
    Math.abs(row.estimatedTaxDrag - command.estimatedTaxDrag.taxDragPct) <= 0.0001
  );
}

function weightsMatch(left: TaraTargetWeights, right: TaraTargetWeights): boolean {
  return left.Base === right.Base && left.Core === right.Core && left.Apex === right.Apex;
}
