import {
  createInstructorClassAggregateAnalyticsQueryDescriptor,
  createInstructorClassAggregateAnalyticsQueryResultEnvelope,
  createInstructorClassAggregateAnalyticsSnapshot,
  type InstructorClassAggregateAnalyticsError,
  type InstructorClassAggregateAnalyticsQueryResultEnvelope,
} from '../../domain/classes/class-aggregate-analytics';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseInstructorClassAggregateFundRow,
  parseInstructorPendingTaraOrderStatusRow,
  type AuthTenancyDatabaseRowFailureCode,
} from './rows';

export type InstructorClassAggregateAnalyticsQueryScope = {
  classId: string;
  monthIndex: number;
};

export type InstructorClassAggregateAnalyticsQueryRowSet = {
  funds: readonly unknown[];
  orders: readonly unknown[];
};

export type InstructorClassAggregateAnalyticsQueryRowReader = {
  readInstructorClassAggregateAnalyticsRows(input: {
    session: AuthTenancySession;
    scope: InstructorClassAggregateAnalyticsQueryScope;
  }): Promise<InstructorClassAggregateAnalyticsQueryRowSet>;
};

export type InstructorClassAggregateAnalyticsQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'fund_row_rejected'
  | 'order_row_rejected'
  | 'invalid_order_status'
  | 'unknown_order_fund'
  | 'duplicate_order_fund'
  | 'invalid_snapshot'
  | 'invalid_result_envelope';

export type InstructorClassAggregateAnalyticsQueryExecutionFailure = {
  code: InstructorClassAggregateAnalyticsQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  fundId?: string;
  validationErrors?: readonly InstructorClassAggregateAnalyticsError[];
};

export type InstructorClassAggregateAnalyticsQueryExecutionResult =
  | { ok: true; value: InstructorClassAggregateAnalyticsQueryResultEnvelope }
  | { ok: false; failure: InstructorClassAggregateAnalyticsQueryExecutionFailure };

export async function executeInstructorClassAggregateAnalyticsQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: InstructorClassAggregateAnalyticsQueryRowReader;
}): Promise<InstructorClassAggregateAnalyticsQueryExecutionResult> {
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
  const descriptorResult = createInstructorClassAggregateAnalyticsQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  const rows = await input.rowReader.readInstructorClassAggregateAnalyticsRows({ session: input.session, scope });
  const funds: {
    fundId: string;
    currentAum: number;
    sharpeRatio: number;
    orderStatus: 'pending' | 'missing';
  }[] = [];
  const fundIds = new Set<string>();
  const pendingOrderFundIds = new Set<string>();

  for (const row of rows.funds) {
    const parsed = parseInstructorClassAggregateFundRow(row, { session: input.session, scope });
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

  const snapshotResult = createInstructorClassAggregateAnalyticsSnapshot({
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

  const envelopeResult = createInstructorClassAggregateAnalyticsQueryResultEnvelope({
    descriptor: descriptorResult.value,
    snapshot: snapshotResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
