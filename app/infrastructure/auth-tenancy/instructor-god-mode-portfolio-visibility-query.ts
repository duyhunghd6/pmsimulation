import {
  createInstructorGodModePortfolioVisibilityQueryDescriptor,
  createInstructorGodModePortfolioVisibilityQueryResultEnvelope,
  createInstructorGodModePortfolioVisibilitySnapshot,
  type InstructorGodModePortfolioVisibilityError,
  type InstructorGodModePortfolioVisibilityQueryResultEnvelope,
} from '../../domain/classes/god-mode-portfolio-visibility';
import type { AuthTenancySession, ParsedAuthTenancyScope } from './session';
import {
  parseInstructorGodModeHoldingRow,
  parseInstructorLiveLeaderboardFundRow,
  parseInstructorPendingTaraOrderStatusRow,
  type AuthTenancyDatabaseRowFailureCode,
  type AssetTier,
} from './rows';

export type InstructorGodModePortfolioVisibilityQueryScope = {
  classId: string;
  monthIndex: number;
};

export type InstructorGodModePortfolioVisibilityQueryRowSet = {
  funds: readonly unknown[];
  holdings: readonly unknown[];
  orders: readonly unknown[];
};

export type InstructorGodModePortfolioVisibilityQueryRowReader = {
  readInstructorGodModePortfolioVisibilityRows(input: {
    session: AuthTenancySession;
    scope: InstructorGodModePortfolioVisibilityQueryScope;
  }): Promise<InstructorGodModePortfolioVisibilityQueryRowSet>;
};

export type InstructorGodModePortfolioVisibilityQueryExecutionFailureCode =
  | 'invalid_role'
  | 'missing_month_scope'
  | 'invalid_descriptor'
  | 'fund_row_rejected'
  | 'holding_row_rejected'
  | 'order_row_rejected'
  | 'invalid_order_status'
  | 'unknown_order_fund'
  | 'duplicate_order_fund'
  | 'unknown_holding_fund'
  | 'duplicate_holding_tier'
  | 'invalid_snapshot'
  | 'invalid_result_envelope';

export type InstructorGodModePortfolioVisibilityQueryExecutionFailure = {
  code: InstructorGodModePortfolioVisibilityQueryExecutionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  fundId?: string;
  tier?: AssetTier;
  validationErrors?: readonly InstructorGodModePortfolioVisibilityError[];
};

export type InstructorGodModePortfolioVisibilityQueryExecutionResult =
  | { ok: true; value: InstructorGodModePortfolioVisibilityQueryResultEnvelope }
  | { ok: false; failure: InstructorGodModePortfolioVisibilityQueryExecutionFailure };

export async function executeInstructorGodModePortfolioVisibilityQuery(input: {
  session: AuthTenancySession;
  scope: ParsedAuthTenancyScope;
  rowReader: InstructorGodModePortfolioVisibilityQueryRowReader;
}): Promise<InstructorGodModePortfolioVisibilityQueryExecutionResult> {
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
  const descriptorResult = createInstructorGodModePortfolioVisibilityQueryDescriptor({
    classId: scope.classId,
    currentMonthIndex: scope.monthIndex,
  });
  if (!descriptorResult.ok) {
    return { ok: false, failure: { code: 'invalid_descriptor' } };
  }

  const rows = await input.rowReader.readInstructorGodModePortfolioVisibilityRows({ session: input.session, scope });
  const funds: {
    fundId: string;
    studentDisplayName: string;
    currentAum: number;
    sharpeRatio: number;
    orderStatus: 'pending' | 'missing';
    holdings: Record<string, number>;
  }[] = [];
  const fundIds = new Set<string>();
  const pendingOrderFundIds = new Set<string>();
  const seenHoldingKeys = new Set<string>();
  const holdingsByFund = new Map<string, Record<string, number>>();

  for (const row of rows.funds) {
    const parsed = parseInstructorLiveLeaderboardFundRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'fund_row_rejected', rowFailureCode: parsed.code } };
    }
    fundIds.add(parsed.row.fundId);
    const holdings: Record<string, number> = {};
    holdingsByFund.set(parsed.row.fundId, holdings);
    funds.push({ ...parsed.row, orderStatus: 'missing', holdings });
  }

  for (const row of rows.holdings) {
    const parsed = parseInstructorGodModeHoldingRow(row, { session: input.session, scope });
    if (!parsed.ok) {
      return { ok: false, failure: { code: 'holding_row_rejected', rowFailureCode: parsed.code } };
    }
    if (!fundIds.has(parsed.row.fundId)) {
      return { ok: false, failure: { code: 'unknown_holding_fund', fundId: parsed.row.fundId } };
    }

    const holdingKey = `${parsed.row.fundId}:${parsed.row.tier}`;
    if (seenHoldingKeys.has(holdingKey)) {
      return {
        ok: false,
        failure: { code: 'duplicate_holding_tier', fundId: parsed.row.fundId, tier: parsed.row.tier },
      };
    }
    seenHoldingKeys.add(holdingKey);
    holdingsByFund.get(parsed.row.fundId)![parsed.row.tier] = parsed.row.allocationWeightPct;
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

  const snapshotResult = createInstructorGodModePortfolioVisibilitySnapshot({
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

  const envelopeResult = createInstructorGodModePortfolioVisibilityQueryResultEnvelope({
    descriptor: descriptorResult.value,
    snapshot: snapshotResult.value,
  });
  if (!envelopeResult.ok) {
    return { ok: false, failure: { code: 'invalid_result_envelope' } };
  }

  return { ok: true, value: envelopeResult.value };
}
