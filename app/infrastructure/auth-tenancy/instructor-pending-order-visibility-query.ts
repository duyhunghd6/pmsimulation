import {
  createInstructorPendingOrderVisibilityQueryDescriptor,
  createInstructorPendingOrderVisibilityQueryResultEnvelope,
  createInstructorPendingOrderVisibilitySnapshot,
  type InstructorPendingOrderVisibilityQueryResultEnvelope,
  type InstructorPendingOrderVisibilityError,
} from '../../domain/classes/pending-order-visibility';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseInstructorClassFundRow,
  parseInstructorPendingTaraOrderStatusRow,
  type AuthTenancyDatabaseRowFailureCode,
} from './rows';

export type InstructorPendingOrderVisibilityQueryScope = {
  classId: string;
  monthIndex: number;
};

export type InstructorPendingOrderVisibilityQueryRowSet = {
  funds: readonly unknown[];
  orders: readonly unknown[];
};

export type InstructorPendingOrderVisibilityQueryRowReader = {
  readInstructorPendingOrderVisibilityRows(input: {
    session: AuthTenancySession;
    scope: InstructorPendingOrderVisibilityQueryScope;
  }): Promise<InstructorPendingOrderVisibilityQueryRowSet>;
};

export type InstructorPendingOrderVisibilityQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'fund_row_rejected'
  | 'order_row_rejected'
  | 'row_reader_failed'
  | 'invalid_snapshot'
  | 'invalid_result_envelope';

export type InstructorPendingOrderVisibilityQueryExecutionFailure = {
  code: InstructorPendingOrderVisibilityQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly InstructorPendingOrderVisibilityError[];
};

export type InstructorPendingOrderVisibilityQueryExecutionResult =
  | { ok: true; value: InstructorPendingOrderVisibilityQueryResultEnvelope }
  | { ok: false; failure: InstructorPendingOrderVisibilityQueryExecutionFailure };

export async function executeInstructorPendingOrderVisibilityQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: InstructorPendingOrderVisibilityQueryRowReader;
}): Promise<InstructorPendingOrderVisibilityQueryExecutionResult> {
  if (input.session.role !== 'instructor') {
    return { ok: false, failure: { code: 'invalid_role' } };
  }
  if (input.scope.monthIndex === undefined) {
    return { ok: false, failure: { code: 'missing_month_scope' } };
  }

  const scope = {
    classId: input.scope.classId,
    monthIndex: input.scope.monthIndex,
  };
  const descriptorResult = createInstructorPendingOrderVisibilityQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  let rows: InstructorPendingOrderVisibilityQueryRowSet;
  try {
    rows = await input.rowReader.readInstructorPendingOrderVisibilityRows({ session: input.session, scope });
  } catch {
    return { ok: false, failure: { code: 'row_reader_failed' } };
  }

  const enrolledFundIds: string[] = [];
  const pendingOrders: { fundId: string; monthIndex: number; status: string }[] = [];

  for (const row of rows.funds) {
    const parsed = parseInstructorClassFundRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'fund_row_rejected', rowFailureCode: parsed.code } };
    }
    enrolledFundIds.push(parsed.row.fundId);
  }

  for (const row of rows.orders) {
    const parsed = parseInstructorPendingTaraOrderStatusRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'order_row_rejected', rowFailureCode: parsed.code } };
    }
    pendingOrders.push({
      fundId: parsed.row.fundId,
      monthIndex: parsed.row.monthIndex,
      status: parsed.row.status,
    });
  }

  const snapshotResult = createInstructorPendingOrderVisibilitySnapshot({
    classId: scope.classId,
    monthIndex: scope.monthIndex,
    enrolledFundIds,
    pendingOrders,
  });
  if (!snapshotResult.ok) {
    return { ok: false, failure: { code: 'invalid_snapshot', validationErrors: snapshotResult.errors } };
  }

  const envelopeResult = createInstructorPendingOrderVisibilityQueryResultEnvelope({
    descriptor: descriptorResult.value,
    snapshot: snapshotResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
