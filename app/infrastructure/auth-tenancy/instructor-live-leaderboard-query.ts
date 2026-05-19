import {
  createInstructorLiveLeaderboardQueryDescriptor,
  createInstructorLiveLeaderboardQueryResultEnvelope,
  createInstructorLiveLeaderboardSnapshot,
  type InstructorLiveLeaderboardError,
  type InstructorLiveLeaderboardQueryResultEnvelope,
} from '../../domain/classes/live-leaderboard';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseInstructorLiveLeaderboardFundRow,
  parseInstructorPendingTaraOrderStatusRow,
  type AuthTenancyDatabaseRowFailureCode,
} from './rows';

export type InstructorLiveLeaderboardQueryScope = {
  classId: string;
  monthIndex: number;
};

export type InstructorLiveLeaderboardQueryRowSet = {
  funds: readonly unknown[];
  orders: readonly unknown[];
};

export type InstructorLiveLeaderboardQueryRowReader = {
  readInstructorLiveLeaderboardRows(input: {
    session: AuthTenancySession;
    scope: InstructorLiveLeaderboardQueryScope;
  }): Promise<InstructorLiveLeaderboardQueryRowSet>;
};

export type InstructorLiveLeaderboardQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'fund_row_rejected'
  | 'order_row_rejected'
  | 'row_reader_failed'
  | 'invalid_order_status'
  | 'unknown_order_fund'
  | 'duplicate_order_fund'
  | 'invalid_snapshot'
  | 'invalid_result_envelope';

export type InstructorLiveLeaderboardQueryExecutionFailure = {
  code: InstructorLiveLeaderboardQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  fundId?: string;
  validationErrors?: readonly InstructorLiveLeaderboardError[];
};

export type InstructorLiveLeaderboardQueryExecutionResult =
  | { ok: true; value: InstructorLiveLeaderboardQueryResultEnvelope }
  | { ok: false; failure: InstructorLiveLeaderboardQueryExecutionFailure };

export async function executeInstructorLiveLeaderboardQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: InstructorLiveLeaderboardQueryRowReader;
}): Promise<InstructorLiveLeaderboardQueryExecutionResult> {
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
  const descriptorResult = createInstructorLiveLeaderboardQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  let rows: InstructorLiveLeaderboardQueryRowSet;
  try {
    rows = await input.rowReader.readInstructorLiveLeaderboardRows({ session: input.session, scope });
  } catch {
    return { ok: false, failure: { code: 'row_reader_failed' } };
  }

  const funds: {
    fundId: string;
    studentDisplayName: string;
    currentAum: number;
    sharpeRatio: number;
    orderStatus: 'pending' | 'missing';
  }[] = [];
  const fundIds = new Set<string>();
  const pendingOrderFundIds = new Set<string>();

  for (const row of rows.funds) {
    const parsed = parseInstructorLiveLeaderboardFundRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'fund_row_rejected', rowFailureCode: parsed.code } };
    }
    funds.push({ ...parsed.row, orderStatus: 'missing' });
    fundIds.add(parsed.row.fundId);
  }

  for (const row of rows.orders) {
    const parsed = parseInstructorPendingTaraOrderStatusRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'order_row_rejected', rowFailureCode: parsed.code } };
    }
    if (parsed.row.status !== 'pending') {
      return { ok: false, failure: { code: 'invalid_order_status', fundId: parsed.row.fundId } };
    }
    if (!fundIds.has(parsed.row.fundId)) {
      return { ok: false, failure: { code: 'unknown_order_fund', fundId: parsed.row.fundId } };
    }
    if (pendingOrderFundIds.has(parsed.row.fundId)) {
      return { ok: false, failure: { code: 'duplicate_order_fund', fundId: parsed.row.fundId } };
    }
    pendingOrderFundIds.add(parsed.row.fundId);
  }

  const snapshotResult = createInstructorLiveLeaderboardSnapshot({
    classId: scope.classId,
    monthIndex: scope.monthIndex,
    funds: funds.map((fund) => ({
      ...fund,
      orderStatus: pendingOrderFundIds.has(fund.fundId) ? 'pending' : 'missing',
    })),
  });
  if (!snapshotResult.ok) {
    return { ok: false, failure: { code: 'invalid_snapshot', validationErrors: snapshotResult.errors } };
  }

  const envelopeResult = createInstructorLiveLeaderboardQueryResultEnvelope({
    descriptor: descriptorResult.value,
    snapshot: snapshotResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
