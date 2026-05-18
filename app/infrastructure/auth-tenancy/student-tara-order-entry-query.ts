import {
  createStudentTaraOrderEntryQueryDescriptor,
  createStudentTaraOrderEntryQueryResultEnvelope,
  createStudentTaraOrderEntrySnapshot,
  type StudentTaraOrderEntryQueryResultEnvelope,
  type StudentTaraOrderEntrySnapshotError,
} from '../../domain/tara/order';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseStudentFundStateRow,
  parseStudentOwnHoldingRow,
  parseStudentTaraOrderRow,
  parseStudentTrackedMetricRow,
  type AuthTenancyDatabaseRowFailureCode,
  type TaraTargetWeights,
} from './rows';

const apexUnrealizedGainMetricId = 'apex_unrealized_gain_pct';

export type StudentTaraOrderEntryQueryScope = {
  classId: string;
  fundId: string;
  monthIndex: number;
};

export type StudentTaraOrderEntryQueryRowSet = {
  funds: readonly unknown[];
  holdings: readonly unknown[];
  orders: readonly unknown[];
  trackedMetrics: readonly unknown[];
};

export type StudentTaraOrderEntryQueryRowReader = {
  readStudentTaraOrderEntryRows(input: {
    session: AuthTenancySession;
    scope: StudentTaraOrderEntryQueryScope;
  }): Promise<StudentTaraOrderEntryQueryRowSet>;
};

export type StudentTaraOrderEntryQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_fund_scope'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'fund_row_rejected'
  | 'missing_fund_row'
  | 'duplicate_fund_row'
  | 'holding_row_rejected'
  | 'duplicate_holding_tier'
  | 'order_row_rejected'
  | 'duplicate_pending_order'
  | 'tracked_metric_row_rejected'
  | 'missing_apex_unrealized_gain_pct'
  | 'duplicate_apex_unrealized_gain_pct'
  | 'invalid_apex_unrealized_gain_pct'
  | 'invalid_snapshot'
  | 'invalid_result_envelope';

export type StudentTaraOrderEntryQueryExecutionFailure = {
  code: StudentTaraOrderEntryQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly StudentTaraOrderEntrySnapshotError[];
};

export type StudentTaraOrderEntryQueryExecutionResult =
  | { ok: true; value: StudentTaraOrderEntryQueryResultEnvelope }
  | { ok: false; failure: StudentTaraOrderEntryQueryExecutionFailure };

export async function executeStudentTaraOrderEntryQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: StudentTaraOrderEntryQueryRowReader;
}): Promise<StudentTaraOrderEntryQueryExecutionResult> {
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
  const descriptorResult = createStudentTaraOrderEntryQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
    viewerFundId: scope.fundId,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  const rows = await input.rowReader.readStudentTaraOrderEntryRows({ session: input.session, scope });
  let currentAum: number | undefined;
  const currentWeights: Record<string, number> = {};
  let pendingTargetWeights: TaraTargetWeights | undefined;
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
    if (parsed.row.status !== 'pending') {
      continue;
    }
    if (pendingTargetWeights !== undefined) {
      return { ok: false, failure: { code: 'duplicate_pending_order' } };
    }
    pendingTargetWeights = parsed.row.targetWeights;
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

  const snapshotResult = createStudentTaraOrderEntrySnapshot({
    classId: scope.classId,
    monthIndex: scope.monthIndex,
    viewerFundId: scope.fundId,
    currentWeights,
    targetWeights: pendingTargetWeights ?? currentWeights,
    currentAum,
    apexUnrealizedGainPct,
  });
  if (!snapshotResult.ok) {
    return { ok: false, failure: { code: 'invalid_snapshot', validationErrors: snapshotResult.errors } };
  }

  const envelopeResult = createStudentTaraOrderEntryQueryResultEnvelope({
    descriptor: descriptorResult.value,
    snapshot: snapshotResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
