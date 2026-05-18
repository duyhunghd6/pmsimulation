import {
  createInstructorClassAggregateAnalyticsSnapshot,
  type InstructorClassAggregateAnalyticsSnapshot,
} from './class-aggregate-analytics';
import {
  createInstructorGodModePortfolioVisibilitySnapshot,
  type InstructorGodModePortfolioVisibilitySnapshot,
} from './god-mode-portfolio-visibility';
import { createInstructorLiveMonthAdvanceControlSnapshot, type InstructorLiveMonthAdvanceControlSnapshot } from './month-advancement';
import {
  createInstructorLiveLeaderboardSnapshot,
  type InstructorLiveLeaderboardSnapshot,
} from './live-leaderboard';
import {
  createInstructorPendingOrderVisibilitySnapshot,
  type InstructorPendingOrderVisibilitySnapshot,
  type PendingOrderVisibilityOrderInput,
} from './pending-order-visibility';

export type InstructorDashboardCurrentTurnFundInput = {
  fundId: string;
  studentDisplayName: string;
  currentAum: number;
  sharpeRatio: number;
  holdings: Record<string, number>;
};

export type InstructorDashboardCurrentTurnSnapshotInput = {
  classId: string;
  currentMonthIndex: number;
  triggerMode: string;
  totalMonths: number;
  funds: InstructorDashboardCurrentTurnFundInput[];
  pendingOrders: PendingOrderVisibilityOrderInput[];
};

export type InstructorDashboardCurrentTurnSnapshot = {
  snapshotType: 'instructor_dashboard_current_turn';
  classId: string;
  monthIndex: number;
  pendingOrderVisibility: InstructorPendingOrderVisibilitySnapshot;
  liveLeaderboard: InstructorLiveLeaderboardSnapshot;
  godModePortfolioVisibility: InstructorGodModePortfolioVisibilitySnapshot;
  classAggregateAnalytics: InstructorClassAggregateAnalyticsSnapshot;
  liveMonthAdvanceControl: InstructorLiveMonthAdvanceControlSnapshot;
};

export type InstructorDashboardCurrentTurnSnapshotErrorSource =
  | 'pending_order_visibility'
  | 'live_leaderboard'
  | 'god_mode_portfolio_visibility'
  | 'class_aggregate_analytics'
  | 'live_month_advance_control';

export type InstructorDashboardCurrentTurnSnapshotError = {
  source: InstructorDashboardCurrentTurnSnapshotErrorSource;
  code: string;
  message: string;
  fundId?: string;
};

export type InstructorDashboardCurrentTurnSnapshotResult =
  | { ok: true; value: InstructorDashboardCurrentTurnSnapshot }
  | { ok: false; errors: InstructorDashboardCurrentTurnSnapshotError[] };

export type InstructorDashboardCurrentTurnQuerySection =
  | 'pending_order_visibility'
  | 'live_leaderboard'
  | 'god_mode_portfolio_visibility'
  | 'class_aggregate_analytics'
  | 'live_month_advance_control';

export type InstructorDashboardCurrentTurnQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
};

export type InstructorDashboardCurrentTurnQueryDescriptor = {
  descriptorType: 'instructor_dashboard_current_turn_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_instructor_dashboard_current_turn';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeStudentExactHoldingsForInstructor: true;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeProviderPayload: false;
  requestedSections: InstructorDashboardCurrentTurnQuerySection[];
};

export type InstructorDashboardCurrentTurnQueryDescriptorErrorCode = 'invalid_class_id' | 'invalid_current_month_index';

export type InstructorDashboardCurrentTurnQueryDescriptorError = {
  code: InstructorDashboardCurrentTurnQueryDescriptorErrorCode;
  message: string;
};

export type InstructorDashboardCurrentTurnQueryDescriptorResult =
  | { ok: true; value: InstructorDashboardCurrentTurnQueryDescriptor }
  | { ok: false; errors: InstructorDashboardCurrentTurnQueryDescriptorError[] };

export type InstructorDashboardCurrentTurnQueryResultEnvelope = {
  envelopeType: 'instructor_dashboard_current_turn_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_dashboard_current_turn';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeStudentExactHoldingsForInstructor: true;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeProviderPayload: false;
  snapshot: InstructorDashboardCurrentTurnSnapshot;
};

export type InstructorDashboardCurrentTurnQueryResultValidationFailureEnvelope = {
  envelopeType: 'instructor_dashboard_current_turn_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_instructor_dashboard_current_turn';
  requiredScope: 'instructor_scoped_class';
  classId: string;
  currentMonthIndex: number;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeStudentExactHoldingsForInstructor: true;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeProviderPayload: false;
  validationErrors: InstructorDashboardCurrentTurnQueryResultEnvelopeError[];
};

export type InstructorDashboardCurrentTurnQueryResultEnvelopeInput = {
  descriptor: InstructorDashboardCurrentTurnQueryDescriptor;
  snapshot?: InstructorDashboardCurrentTurnSnapshot;
};

export type InstructorDashboardCurrentTurnQueryResultEnvelopeErrorCode =
  | 'missing_instructor_dashboard_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index';

export type InstructorDashboardCurrentTurnQueryResultEnvelopeError = {
  code: InstructorDashboardCurrentTurnQueryResultEnvelopeErrorCode;
  message: string;
};

export type InstructorDashboardCurrentTurnQueryResultEnvelopeResult =
  | { ok: true; value: InstructorDashboardCurrentTurnQueryResultEnvelope }
  | { ok: false; errors: InstructorDashboardCurrentTurnQueryResultEnvelopeError[] };

export type InstructorDashboardCurrentTurnQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type InstructorDashboardCurrentTurnQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: InstructorDashboardCurrentTurnQueryResultValidationFailureEnvelope }
  | { ok: false; errors: InstructorDashboardCurrentTurnQueryResultValidationFailureEnvelopeError[] };

export function createInstructorDashboardCurrentTurnQueryDescriptor(
  input: InstructorDashboardCurrentTurnQueryDescriptorInput,
): InstructorDashboardCurrentTurnQueryDescriptorResult {
  const errors: InstructorDashboardCurrentTurnQueryDescriptorError[] = [];
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
      descriptorType: 'instructor_dashboard_current_turn_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:instructor-dashboard-current-turn-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_instructor_dashboard_current_turn',
      requiredScope: 'instructor_scoped_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeStudentExactHoldingsForInstructor: true,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeProviderPayload: false,
      requestedSections: [
        'pending_order_visibility',
        'live_leaderboard',
        'god_mode_portfolio_visibility',
        'class_aggregate_analytics',
        'live_month_advance_control',
      ],
    },
  };
}

export function createInstructorDashboardCurrentTurnQueryResultValidationFailureEnvelope(
  input: InstructorDashboardCurrentTurnQueryResultEnvelopeInput,
): InstructorDashboardCurrentTurnQueryResultValidationFailureEnvelopeResult {
  const result = createInstructorDashboardCurrentTurnQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid instructor dashboard current-turn query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_dashboard_current_turn_query_result_validation_failure',
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
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createInstructorDashboardCurrentTurnQueryResultEnvelope(
  input: InstructorDashboardCurrentTurnQueryResultEnvelopeInput,
): InstructorDashboardCurrentTurnQueryResultEnvelopeResult {
  const errors: InstructorDashboardCurrentTurnQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_instructor_dashboard_snapshot',
          message: 'Instructor dashboard query result envelopes require the already-authorized current-turn snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Instructor dashboard query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Instructor dashboard query result month must match the descriptor current month.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_dashboard_current_turn_query_result',
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
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function buildInstructorDashboardCurrentTurnSnapshot(
  input: InstructorDashboardCurrentTurnSnapshotInput,
): InstructorDashboardCurrentTurnSnapshotResult {
  const errors: InstructorDashboardCurrentTurnSnapshotError[] = [];
  const pendingOrderVisibilityResult = createInstructorPendingOrderVisibilitySnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    enrolledFundIds: input.funds.map((fund) => fund.fundId),
    pendingOrders: input.pendingOrders,
  });
  const liveMonthAdvanceControlResult = createInstructorLiveMonthAdvanceControlSnapshot({
    classId: input.classId,
    triggerMode: input.triggerMode,
    currentMonthIndex: input.currentMonthIndex,
    totalMonths: input.totalMonths,
  });

  if (!pendingOrderVisibilityResult.ok) {
    errors.push(
      ...pendingOrderVisibilityResult.errors.map((error) => ({
        source: 'pending_order_visibility' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (!liveMonthAdvanceControlResult.ok) {
    errors.push(
      ...liveMonthAdvanceControlResult.errors.map((error) => ({
        source: 'live_month_advance_control' as const,
        code: error.code,
        message: error.message,
      })),
    );
  }

  if (!pendingOrderVisibilityResult.ok) {
    return { ok: false, errors };
  }

  const orderStatusByFundId = new Map(
    pendingOrderVisibilityResult.value.fundStatuses.map((fundStatus) => [fundStatus.fundId, fundStatus.orderStatus]),
  );
  const fundsWithOrderStatus = input.funds.map((fund) => ({
    ...fund,
    orderStatus: orderStatusByFundId.get(fund.fundId.trim()) ?? 'missing',
  }));
  const liveLeaderboardResult = createInstructorLiveLeaderboardSnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    funds: fundsWithOrderStatus,
  });
  const godModePortfolioVisibilityResult = createInstructorGodModePortfolioVisibilitySnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    funds: fundsWithOrderStatus,
  });
  const classAggregateAnalyticsResult = createInstructorClassAggregateAnalyticsSnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    funds: fundsWithOrderStatus,
  });

  if (!liveLeaderboardResult.ok) {
    errors.push(
      ...liveLeaderboardResult.errors.map((error) => ({
        source: 'live_leaderboard' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (!godModePortfolioVisibilityResult.ok) {
    errors.push(
      ...godModePortfolioVisibilityResult.errors.map((error) => ({
        source: 'god_mode_portfolio_visibility' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (!classAggregateAnalyticsResult.ok) {
    errors.push(
      ...classAggregateAnalyticsResult.errors.map((error) => ({
        source: 'class_aggregate_analytics' as const,
        code: error.code,
        message: error.message,
        fundId: error.fundId,
      })),
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (
    !liveMonthAdvanceControlResult.ok ||
    !liveLeaderboardResult.ok ||
    !godModePortfolioVisibilityResult.ok ||
    !classAggregateAnalyticsResult.ok
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      snapshotType: 'instructor_dashboard_current_turn',
      classId: pendingOrderVisibilityResult.value.classId,
      monthIndex: input.currentMonthIndex,
      pendingOrderVisibility: pendingOrderVisibilityResult.value,
      liveLeaderboard: liveLeaderboardResult.value,
      godModePortfolioVisibility: godModePortfolioVisibilityResult.value,
      classAggregateAnalytics: classAggregateAnalyticsResult.value,
      liveMonthAdvanceControl: liveMonthAdvanceControlResult.value,
    },
  };
}
