import {
  buildPortfolioPyramidSnapshot,
  createStudentPortfolioPyramidQueryDescriptor,
  createStudentPortfolioPyramidQueryResultEnvelope,
  type PortfolioPyramidSnapshotError,
  type StudentPortfolioPyramidQueryResultEnvelope,
} from '../../domain/portfolio/pyramid';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseStudentOwnHoldingRow,
  type AssetTier,
  type AuthTenancyDatabaseRowFailureCode,
} from './rows';

export type StudentPortfolioPyramidQueryScope = {
  classId: string;
  fundId: string;
  monthIndex: number;
};

export type StudentPortfolioPyramidQueryRowSet = {
  holdings: readonly unknown[];
};

export type StudentPortfolioPyramidQueryRowReader = {
  readStudentPortfolioPyramidRows(input: {
    session: AuthTenancySession;
    scope: StudentPortfolioPyramidQueryScope;
  }): Promise<StudentPortfolioPyramidQueryRowSet>;
};

export type StudentPortfolioPyramidQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_fund_scope'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'holding_row_rejected'
  | 'duplicate_holding_tier'
  | 'invalid_snapshot'
  | 'invalid_result_envelope';

export type StudentPortfolioPyramidQueryExecutionFailure = {
  code: StudentPortfolioPyramidQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly PortfolioPyramidSnapshotError[];
};

export type StudentPortfolioPyramidQueryExecutionResult =
  | { ok: true; value: StudentPortfolioPyramidQueryResultEnvelope }
  | { ok: false; failure: StudentPortfolioPyramidQueryExecutionFailure };

export async function executeStudentPortfolioPyramidQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: StudentPortfolioPyramidQueryRowReader;
  intendedWeights: Record<string, number>;
  dangerousDriftThresholdPct: number;
}): Promise<StudentPortfolioPyramidQueryExecutionResult> {
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
  const descriptorResult = createStudentPortfolioPyramidQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
    viewerFundId: scope.fundId,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  const rows = await input.rowReader.readStudentPortfolioPyramidRows({ session: input.session, scope });
  const currentWeights: Partial<Record<AssetTier, number>> = {};

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

  const snapshotResult = buildPortfolioPyramidSnapshot({
    classId: scope.classId,
    monthIndex: scope.monthIndex,
    viewerFundId: scope.fundId,
    currentWeights,
    intendedWeights: input.intendedWeights,
    dangerousDriftThresholdPct: input.dangerousDriftThresholdPct,
  });
  if (!snapshotResult.ok) {
    return { ok: false, failure: { code: 'invalid_snapshot', validationErrors: snapshotResult.errors } };
  }

  const envelopeResult = createStudentPortfolioPyramidQueryResultEnvelope({
    descriptor: descriptorResult.value,
    snapshot: snapshotResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
