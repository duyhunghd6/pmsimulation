import {
  ASSET_TIERS,
  validateTaraAllocationWeights,
  type AllocationValidationError,
  type AssetTier,
} from '../tara/allocation';
import { type PendingOrderFundStatus } from './pending-order-visibility';

export type InstructorGodModePortfolioFundInput = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  orderStatus: PendingOrderFundStatus['orderStatus'];
  holdings: Record<string, number>;
};

export type InstructorGodModePortfolioVisibilityInput = {
  classId: string;
  monthIndex: number;
  funds: InstructorGodModePortfolioFundInput[];
};

export type InstructorGodModePortfolioHolding = {
  tier: AssetTier;
  allocationWeightPct: number;
};

export type InstructorGodModePortfolioRow = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  orderStatus: PendingOrderFundStatus['orderStatus'];
  holdings: InstructorGodModePortfolioHolding[];
};

export type InstructorGodModePortfolioVisibilitySnapshot = {
  classId: string;
  monthIndex: number;
  fundCount: number;
  pendingOrderCount: number;
  missingOrderCount: number;
  rows: InstructorGodModePortfolioRow[];
};

export type InstructorGodModePortfolioVisibilityErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_fund_id'
  | 'duplicate_fund_id'
  | 'invalid_student_display_name'
  | 'invalid_current_aum'
  | 'invalid_sharpe_ratio'
  | 'invalid_order_status'
  | AllocationValidationError['code'];

export type InstructorGodModePortfolioVisibilityError = {
  code: InstructorGodModePortfolioVisibilityErrorCode;
  message: string;
  fundId?: string;
  tier?: string;
  total?: number;
  source?: 'holdings';
};

export type InstructorGodModePortfolioVisibilityResult =
  | { ok: true; value: InstructorGodModePortfolioVisibilitySnapshot }
  | { ok: false; errors: InstructorGodModePortfolioVisibilityError[] };

export type InstructorGodModePortfolioVisibilityQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
};

export type InstructorGodModePortfolioVisibilityQueryDescriptor = {
  descriptorType: 'instructor_god_mode_portfolio_visibility_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_instructor_god_mode_portfolio_visibility';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeStudentExactHoldingsForInstructor: true;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
};

export type InstructorGodModePortfolioVisibilityQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_current_month_index';

export type InstructorGodModePortfolioVisibilityQueryDescriptorError = {
  code: InstructorGodModePortfolioVisibilityQueryDescriptorErrorCode;
  message: string;
};

export type InstructorGodModePortfolioVisibilityQueryDescriptorResult =
  | { ok: true; value: InstructorGodModePortfolioVisibilityQueryDescriptor }
  | { ok: false; errors: InstructorGodModePortfolioVisibilityQueryDescriptorError[] };

export type InstructorGodModePortfolioVisibilityQueryResultEnvelope = {
  envelopeType: 'instructor_god_mode_portfolio_visibility_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_god_mode_portfolio_visibility';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeStudentExactHoldingsForInstructor: true;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  snapshot: InstructorGodModePortfolioVisibilitySnapshot;
};

export type InstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelope = {
  envelopeType: 'instructor_god_mode_portfolio_visibility_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_god_mode_portfolio_visibility';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeStudentExactHoldingsForInstructor: true;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeProviderPayload: false;
  validationErrors: InstructorGodModePortfolioVisibilityQueryResultEnvelopeError[];
};

export type InstructorGodModePortfolioVisibilityQueryResultEnvelopeInput = {
  descriptor: InstructorGodModePortfolioVisibilityQueryDescriptor;
  snapshot?: InstructorGodModePortfolioVisibilitySnapshot;
};

export type InstructorGodModePortfolioVisibilityQueryResultEnvelopeErrorCode =
  | 'missing_god_mode_portfolio_visibility_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index';

export type InstructorGodModePortfolioVisibilityQueryResultEnvelopeError = {
  code: InstructorGodModePortfolioVisibilityQueryResultEnvelopeErrorCode;
  message: string;
};

export type InstructorGodModePortfolioVisibilityQueryResultEnvelopeResult =
  | { ok: true; value: InstructorGodModePortfolioVisibilityQueryResultEnvelope }
  | { ok: false; errors: InstructorGodModePortfolioVisibilityQueryResultEnvelopeError[] };

export type InstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type InstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: InstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelope }
  | { ok: false; errors: InstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelopeError[] };

export function createInstructorGodModePortfolioVisibilityQueryDescriptor(
  input: InstructorGodModePortfolioVisibilityQueryDescriptorInput,
): InstructorGodModePortfolioVisibilityQueryDescriptorResult {
  const errors: InstructorGodModePortfolioVisibilityQueryDescriptorError[] = [];
  const classId = input.classId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (!Number.isInteger(input.currentMonthIndex) || input.currentMonthIndex < 0) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      descriptorType: 'instructor_god_mode_portfolio_visibility_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:instructor-god-mode-portfolio-visibility-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_instructor_god_mode_portfolio_visibility',
      requiredScope: 'instructor_scoped_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeStudentExactHoldingsForInstructor: true,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeEstimatedTaxDrag: false,
      includeProviderPayload: false,
    },
  };
}

export function createInstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelope(
  input: InstructorGodModePortfolioVisibilityQueryResultEnvelopeInput,
): InstructorGodModePortfolioVisibilityQueryResultValidationFailureEnvelopeResult {
  const result = createInstructorGodModePortfolioVisibilityQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor God Mode portfolio visibility query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_god_mode_portfolio_visibility_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      resultStatus: 'validation_failed',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeStudentExactHoldingsForInstructor: input.descriptor.includeStudentExactHoldingsForInstructor,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createInstructorGodModePortfolioVisibilityQueryResultEnvelope(
  input: InstructorGodModePortfolioVisibilityQueryResultEnvelopeInput,
): InstructorGodModePortfolioVisibilityQueryResultEnvelopeResult {
  const errors: InstructorGodModePortfolioVisibilityQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_god_mode_portfolio_visibility_snapshot',
          message: 'Instructor God Mode portfolio visibility query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Instructor God Mode portfolio visibility query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Instructor God Mode portfolio visibility query result month must match the descriptor current month.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_god_mode_portfolio_visibility_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      resultStatus: 'ready',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeStudentExactHoldingsForInstructor: input.descriptor.includeStudentExactHoldingsForInstructor,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function createInstructorGodModePortfolioVisibilitySnapshot(
  input: InstructorGodModePortfolioVisibilityInput,
): InstructorGodModePortfolioVisibilityResult {
  const errors: InstructorGodModePortfolioVisibilityError[] = [];
  const classId = input.classId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const seenFundIds = new Set<string>();
  const rows: InstructorGodModePortfolioRow[] = [];

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (!monthIndexIsValid) {
    errors.push({
      code: 'invalid_month_index',
      message: 'Month index must be a non-negative integer.',
    });
  }

  for (const fund of input.funds) {
    const fundId = fund.fundId.trim();
    const studentDisplayName = fund.studentDisplayName.trim();
    const holdingsResult = validateTaraAllocationWeights(fund.holdings);

    if (fundId === '') {
      errors.push({
        code: 'invalid_fund_id',
        message: 'God Mode portfolio fund id is required.',
      });
    } else if (seenFundIds.has(fundId)) {
      errors.push({
        code: 'duplicate_fund_id',
        message: 'God Mode portfolio visibility cannot include the same fund more than once.',
        fundId,
      });
    } else {
      seenFundIds.add(fundId);
    }

    if (studentDisplayName === '') {
      errors.push({
        code: 'invalid_student_display_name',
        message: 'Student display name is required.',
        fundId: fundId || undefined,
      });
    }

    if (!Number.isFinite(fund.currentAum) || fund.currentAum < 0) {
      errors.push({
        code: 'invalid_current_aum',
        message: 'Current AUM must be a non-negative finite number.',
        fundId: fundId || undefined,
      });
    }

    if (!Number.isFinite(fund.sharpeRatio)) {
      errors.push({
        code: 'invalid_sharpe_ratio',
        message: 'Sharpe ratio must be a finite number.',
        fundId: fundId || undefined,
      });
    }

    if (fund.orderStatus !== 'pending' && fund.orderStatus !== 'missing') {
      errors.push({
        code: 'invalid_order_status',
        message: 'God Mode portfolio order status must be pending or missing.',
        fundId: fundId || undefined,
      });
    }

    if (!holdingsResult.ok) {
      errors.push(
        ...holdingsResult.errors.map((error) => ({
          ...error,
          fundId: fundId || undefined,
          source: 'holdings' as const,
        })),
      );
      continue;
    }

    rows.push({
      fundId,
      studentDisplayName,
      currentAum: fund.currentAum,
      sharpeRatio: fund.sharpeRatio,
      orderStatus: fund.orderStatus,
      holdings: ASSET_TIERS.map((tier) => ({
        tier,
        allocationWeightPct: holdingsResult.value[tier],
      })),
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const sortedRows = rows.sort((left, right) => {
    const displayNameComparison = left.studentDisplayName.localeCompare(right.studentDisplayName);

    if (displayNameComparison !== 0) {
      return displayNameComparison;
    }

    return left.fundId.localeCompare(right.fundId);
  });

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      fundCount: sortedRows.length,
      pendingOrderCount: sortedRows.filter((row) => row.orderStatus === 'pending').length,
      missingOrderCount: sortedRows.filter((row) => row.orderStatus === 'missing').length,
      rows: sortedRows,
    },
  };
}
