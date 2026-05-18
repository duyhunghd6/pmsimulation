import {
  buildCurrentTurnDriverStringDashboard,
  type CurrentTurnDriverStringDashboard,
} from '../scenario/driver-string-dashboard';
import {
  buildStudentMacroNewsSnapshot,
  type MacroNarrativeRow,
  type MarketMetricRow,
  type StudentMacroNewsSnapshot,
} from '../scenario/macro-news';
import { buildPortfolioPyramidSnapshot, type PortfolioPyramidSnapshot } from '../portfolio/pyramid';
import { createStudentTaraOrderEntrySnapshot, type StudentTaraOrderEntrySnapshot } from '../tara/order';
import {
  createStudentAttributionReportSnapshot,
  type StudentAttributionReportLedgerDraftInput,
  type StudentAttributionReportSnapshot,
} from './attribution-report';
import {
  createStudentLeaderboardRankSnapshot,
  type StudentLeaderboardRankFundInput,
  type StudentLeaderboardRankSnapshot,
} from './leaderboard-rank';

export type StudentDashboardCurrentTurnSnapshotInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  macroNarratives: readonly MacroNarrativeRow[];
  marketMetrics: readonly MarketMetricRow[];
  currentWeights: Record<string, number>;
  intendedWeights: Record<string, number>;
  dangerousDriftThresholdPct: number;
  targetWeights: Record<string, number>;
  currentAum: number;
  apexUnrealizedGainPct: number;
  leaderboardFunds: StudentLeaderboardRankFundInput[];
};

export type StudentDashboardCurrentTurnSnapshot = {
  snapshotType: 'student_dashboard_current_turn';
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  macroNews: StudentMacroNewsSnapshot;
  driverStringDashboard: CurrentTurnDriverStringDashboard;
  portfolioPyramid: PortfolioPyramidSnapshot;
  taraOrderEntry: StudentTaraOrderEntrySnapshot;
  leaderboardRank: StudentLeaderboardRankSnapshot;
};

export type StudentDashboardCurrentTurnSnapshotErrorSource =
  | 'macro_news'
  | 'driver_string_dashboard'
  | 'portfolio_pyramid'
  | 'tara_order_entry'
  | 'leaderboard_rank';

export type StudentDashboardCurrentTurnSnapshotError = {
  source: StudentDashboardCurrentTurnSnapshotErrorSource;
  code: string;
  message: string;
};

export type StudentDashboardCurrentTurnSnapshotResult =
  | { ok: true; value: StudentDashboardCurrentTurnSnapshot }
  | { ok: false; errors: StudentDashboardCurrentTurnSnapshotError[] };

export type StudentDashboardCurrentTurnQuerySection =
  | 'macro_news'
  | 'driver_string_dashboard'
  | 'portfolio_pyramid'
  | 'tara_order_entry'
  | 'leaderboard_rank';

export type StudentDashboardCurrentTurnQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
};

export type StudentDashboardCurrentTurnQueryDescriptor = {
  descriptorType: 'student_dashboard_current_turn_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_student_dashboard_current_turn';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundExactHoldingsForStudents: false;
  includeInstructorGodModeData: false;
  includeProviderPayload: false;
  requestedSections: StudentDashboardCurrentTurnQuerySection[];
};

export type StudentDashboardCurrentTurnQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_current_month_index'
  | 'invalid_viewer_fund_id';

export type StudentDashboardCurrentTurnQueryDescriptorError = {
  code: StudentDashboardCurrentTurnQueryDescriptorErrorCode;
  message: string;
};

export type StudentDashboardCurrentTurnQueryDescriptorResult =
  | { ok: true; value: StudentDashboardCurrentTurnQueryDescriptor }
  | { ok: false; errors: StudentDashboardCurrentTurnQueryDescriptorError[] };

export type StudentDashboardCurrentTurnQueryResultEnvelope = {
  envelopeType: 'student_dashboard_current_turn_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_dashboard_current_turn';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundExactHoldingsForStudents: false;
  includeInstructorGodModeData: false;
  includeProviderPayload: false;
  snapshot: StudentDashboardCurrentTurnSnapshot;
};

export type StudentDashboardCurrentTurnQueryResultValidationFailureEnvelope = {
  envelopeType: 'student_dashboard_current_turn_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_dashboard_current_turn';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundExactHoldingsForStudents: false;
  includeInstructorGodModeData: false;
  includeProviderPayload: false;
  validationErrors: StudentDashboardCurrentTurnQueryResultEnvelopeError[];
};

export type StudentDashboardCurrentTurnQueryResultEnvelopeInput = {
  descriptor: StudentDashboardCurrentTurnQueryDescriptor;
  snapshot?: StudentDashboardCurrentTurnSnapshot;
};

export type StudentDashboardCurrentTurnQueryResultEnvelopeErrorCode =
  | 'missing_student_dashboard_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index'
  | 'mismatched_viewer_fund_id';

export type StudentDashboardCurrentTurnQueryResultEnvelopeError = {
  code: StudentDashboardCurrentTurnQueryResultEnvelopeErrorCode;
  message: string;
};

export type StudentDashboardCurrentTurnQueryResultEnvelopeResult =
  | { ok: true; value: StudentDashboardCurrentTurnQueryResultEnvelope }
  | { ok: false; errors: StudentDashboardCurrentTurnQueryResultEnvelopeError[] };

export type StudentDashboardCurrentTurnQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type StudentDashboardCurrentTurnQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: StudentDashboardCurrentTurnQueryResultValidationFailureEnvelope }
  | { ok: false; errors: StudentDashboardCurrentTurnQueryResultValidationFailureEnvelopeError[] };

export function createStudentDashboardCurrentTurnQueryDescriptor(
  input: StudentDashboardCurrentTurnQueryDescriptorInput,
): StudentDashboardCurrentTurnQueryDescriptorResult {
  const errors: StudentDashboardCurrentTurnQueryDescriptorError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();

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

  if (viewerFundId === '') {
    errors.push({
      code: 'invalid_viewer_fund_id',
      message: 'Viewer fund id is required.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      descriptorType: 'student_dashboard_current_turn_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:fund:${viewerFundId}:student-dashboard-current-turn-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_student_dashboard_current_turn',
      requiredScope: 'viewer_fund_in_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      viewerFundId,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundExactHoldingsForStudents: false,
      includeInstructorGodModeData: false,
      includeProviderPayload: false,
      requestedSections: ['macro_news', 'driver_string_dashboard', 'portfolio_pyramid', 'tara_order_entry', 'leaderboard_rank'],
    },
  };
}

export function createStudentDashboardCurrentTurnQueryResultValidationFailureEnvelope(
  input: StudentDashboardCurrentTurnQueryResultEnvelopeInput,
): StudentDashboardCurrentTurnQueryResultValidationFailureEnvelopeResult {
  const result = createStudentDashboardCurrentTurnQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student dashboard current-turn query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_dashboard_current_turn_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'validation_failed',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundExactHoldingsForStudents: input.descriptor.includeOtherFundExactHoldingsForStudents,
      includeInstructorGodModeData: input.descriptor.includeInstructorGodModeData,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createStudentDashboardCurrentTurnQueryResultEnvelope(
  input: StudentDashboardCurrentTurnQueryResultEnvelopeInput,
): StudentDashboardCurrentTurnQueryResultEnvelopeResult {
  const errors: StudentDashboardCurrentTurnQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_student_dashboard_snapshot',
          message: 'Student dashboard query result envelopes require the already-authorized current-turn snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Student dashboard query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Student dashboard query result month must match the descriptor current month.',
    });
  }

  if (input.snapshot.viewerFundId !== input.descriptor.viewerFundId) {
    errors.push({
      code: 'mismatched_viewer_fund_id',
      message: 'Student dashboard query result viewer fund must match the descriptor viewer fund.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_dashboard_current_turn_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'ready',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundExactHoldingsForStudents: input.descriptor.includeOtherFundExactHoldingsForStudents,
      includeInstructorGodModeData: input.descriptor.includeInstructorGodModeData,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function buildStudentDashboardCurrentTurnSnapshot(
  input: StudentDashboardCurrentTurnSnapshotInput,
): StudentDashboardCurrentTurnSnapshotResult {
  const macroNewsResult = buildStudentMacroNewsSnapshot({
    currentMonthIndex: input.currentMonthIndex,
    macroNarratives: input.macroNarratives,
    marketMetrics: input.marketMetrics,
  });
  const driverStringDashboardResult = buildCurrentTurnDriverStringDashboard({
    currentMonthIndex: input.currentMonthIndex,
    macroNarratives: input.macroNarratives,
    marketMetrics: input.marketMetrics,
  });
  const portfolioPyramidResult = buildPortfolioPyramidSnapshot({
    currentWeights: input.currentWeights,
    intendedWeights: input.intendedWeights,
    dangerousDriftThresholdPct: input.dangerousDriftThresholdPct,
  });
  const taraOrderEntryResult = createStudentTaraOrderEntrySnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    viewerFundId: input.viewerFundId,
    currentAum: input.currentAum,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    apexUnrealizedGainPct: input.apexUnrealizedGainPct,
  });
  const leaderboardRankResult = createStudentLeaderboardRankSnapshot({
    classId: input.classId,
    monthIndex: input.currentMonthIndex,
    viewerFundId: input.viewerFundId,
    funds: input.leaderboardFunds,
  });
  const errors: StudentDashboardCurrentTurnSnapshotError[] = [];

  if (!macroNewsResult.ok) {
    errors.push(...macroNewsResult.errors.map((error) => ({ source: 'macro_news' as const, ...error })));
  }

  if (!driverStringDashboardResult.ok) {
    errors.push(...driverStringDashboardResult.errors.map((error) => ({ source: 'driver_string_dashboard' as const, ...error })));
  }

  if (!portfolioPyramidResult.ok) {
    errors.push(
      ...portfolioPyramidResult.errors.map(({ code, message }) => ({
        source: 'portfolio_pyramid' as const,
        code,
        message,
      })),
    );
  }

  if (!taraOrderEntryResult.ok) {
    errors.push(...taraOrderEntryResult.errors.map((error) => ({ source: 'tara_order_entry' as const, ...error })));
  }

  if (!leaderboardRankResult.ok) {
    errors.push(...leaderboardRankResult.errors.map((error) => ({ source: 'leaderboard_rank' as const, ...error })));
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (
    !macroNewsResult.ok ||
    !driverStringDashboardResult.ok ||
    !portfolioPyramidResult.ok ||
    !taraOrderEntryResult.ok ||
    !leaderboardRankResult.ok
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      snapshotType: 'student_dashboard_current_turn',
      classId: taraOrderEntryResult.value.classId,
      monthIndex: input.currentMonthIndex,
      viewerFundId: taraOrderEntryResult.value.viewerFundId,
      macroNews: macroNewsResult.value,
      driverStringDashboard: driverStringDashboardResult.value,
      portfolioPyramid: portfolioPyramidResult.value,
      taraOrderEntry: taraOrderEntryResult.value,
      leaderboardRank: leaderboardRankResult.value,
    },
  };
}

export type StudentDashboardPostTurnSnapshotInput = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  ledgerDraft: StudentAttributionReportLedgerDraftInput;
  leaderboardFunds: StudentLeaderboardRankFundInput[];
};

export type StudentDashboardPostTurnSnapshot = {
  snapshotType: 'student_dashboard_post_turn';
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  attributionReport: StudentAttributionReportSnapshot;
  leaderboardRank: StudentLeaderboardRankSnapshot;
};

export type StudentDashboardPostTurnSnapshotErrorSource = 'attribution_report' | 'leaderboard_rank';

export type StudentDashboardPostTurnSnapshotError = {
  source: StudentDashboardPostTurnSnapshotErrorSource;
  code: string;
  message: string;
};

export type StudentDashboardPostTurnSnapshotResult =
  | { ok: true; value: StudentDashboardPostTurnSnapshot }
  | { ok: false; errors: StudentDashboardPostTurnSnapshotError[] };

export type StudentDashboardPostTurnQuerySection = 'attribution_report' | 'leaderboard_rank';

export type StudentDashboardPostTurnQueryDescriptorInput = {
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
};

export type StudentDashboardPostTurnQueryDescriptor = {
  descriptorType: 'student_dashboard_post_turn_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_student_dashboard_post_turn';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
  processedTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeOtherFundExactHoldingsForStudents: false;
  includeOrderDetails: false;
  includeInstructorGodModeData: false;
  includeClassAggregatePayload: false;
  includeProviderPayload: false;
  includeLedgerDrafts: false;
  requestedSections: StudentDashboardPostTurnQuerySection[];
};

export type StudentDashboardPostTurnQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_processed_month_index'
  | 'invalid_viewer_fund_id';

export type StudentDashboardPostTurnQueryDescriptorError = {
  code: StudentDashboardPostTurnQueryDescriptorErrorCode;
  message: string;
};

export type StudentDashboardPostTurnQueryDescriptorResult =
  | { ok: true; value: StudentDashboardPostTurnQueryDescriptor }
  | { ok: false; errors: StudentDashboardPostTurnQueryDescriptorError[] };

export type StudentDashboardPostTurnQueryResultEnvelope = {
  envelopeType: 'student_dashboard_post_turn_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_dashboard_post_turn';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  processedTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeOtherFundExactHoldingsForStudents: false;
  includeOrderDetails: false;
  includeInstructorGodModeData: false;
  includeClassAggregatePayload: false;
  includeProviderPayload: false;
  includeLedgerDrafts: false;
  snapshot: StudentDashboardPostTurnSnapshot;
};

export type StudentDashboardPostTurnQueryResultEnvelopeInput = {
  descriptor: StudentDashboardPostTurnQueryDescriptor;
  snapshot?: StudentDashboardPostTurnSnapshot;
};

export type StudentDashboardPostTurnQueryResultEnvelopeErrorCode =
  | 'missing_student_dashboard_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_processed_month_index'
  | 'mismatched_viewer_fund_id';

export type StudentDashboardPostTurnQueryResultEnvelopeError = {
  code: StudentDashboardPostTurnQueryResultEnvelopeErrorCode;
  message: string;
};

export type StudentDashboardPostTurnQueryResultEnvelopeResult =
  | { ok: true; value: StudentDashboardPostTurnQueryResultEnvelope }
  | { ok: false; errors: StudentDashboardPostTurnQueryResultEnvelopeError[] };

export type StudentDashboardPostTurnQueryResultValidationFailureEnvelope = {
  envelopeType: 'student_dashboard_post_turn_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_dashboard_post_turn';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  processedTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeOtherFundExactHoldingsForStudents: false;
  includeOrderDetails: false;
  includeInstructorGodModeData: false;
  includeClassAggregatePayload: false;
  includeProviderPayload: false;
  includeLedgerDrafts: false;
  validationErrors: StudentDashboardPostTurnQueryResultEnvelopeError[];
};

export type StudentDashboardPostTurnQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type StudentDashboardPostTurnQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: StudentDashboardPostTurnQueryResultValidationFailureEnvelope }
  | { ok: false; errors: StudentDashboardPostTurnQueryResultValidationFailureEnvelopeError[] };

export function createStudentDashboardPostTurnQueryDescriptor(
  input: StudentDashboardPostTurnQueryDescriptorInput,
): StudentDashboardPostTurnQueryDescriptorResult {
  const errors: StudentDashboardPostTurnQueryDescriptorError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (!Number.isInteger(input.processedMonthIndex) || input.processedMonthIndex < 0) {
    errors.push({
      code: 'invalid_processed_month_index',
      message: 'Processed month index must be a non-negative integer.',
    });
  }

  if (viewerFundId === '') {
    errors.push({
      code: 'invalid_viewer_fund_id',
      message: 'Viewer fund id is required.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      descriptorType: 'student_dashboard_post_turn_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.processedMonthIndex}:fund:${viewerFundId}:student-dashboard-post-turn-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_student_dashboard_post_turn',
      requiredScope: 'viewer_fund_in_class',
      classId,
      processedMonthIndex: input.processedMonthIndex,
      viewerFundId,
      processedTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundIds: false,
      includeOtherFundExactHoldingsForStudents: false,
      includeOrderDetails: false,
      includeInstructorGodModeData: false,
      includeClassAggregatePayload: false,
      includeProviderPayload: false,
      includeLedgerDrafts: false,
      requestedSections: ['attribution_report', 'leaderboard_rank'],
    },
  };
}

export function createStudentDashboardPostTurnQueryResultValidationFailureEnvelope(
  input: StudentDashboardPostTurnQueryResultEnvelopeInput,
): StudentDashboardPostTurnQueryResultValidationFailureEnvelopeResult {
  const result = createStudentDashboardPostTurnQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student dashboard post-turn query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_dashboard_post_turn_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      processedMonthIndex: input.descriptor.processedMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'validation_failed',
      processedTurnOnly: input.descriptor.processedTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeOtherFundExactHoldingsForStudents: input.descriptor.includeOtherFundExactHoldingsForStudents,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeInstructorGodModeData: input.descriptor.includeInstructorGodModeData,
      includeClassAggregatePayload: input.descriptor.includeClassAggregatePayload,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      validationErrors: result.errors,
    },
  };
}

export function createStudentDashboardPostTurnQueryResultEnvelope(
  input: StudentDashboardPostTurnQueryResultEnvelopeInput,
): StudentDashboardPostTurnQueryResultEnvelopeResult {
  const errors: StudentDashboardPostTurnQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_student_dashboard_snapshot',
          message: 'Student dashboard post-turn query result envelopes require the already-authorized post-turn snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Student dashboard post-turn query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.processedMonthIndex) {
    errors.push({
      code: 'mismatched_processed_month_index',
      message: 'Student dashboard post-turn query result month must match the descriptor processed month.',
    });
  }

  if (input.snapshot.viewerFundId !== input.descriptor.viewerFundId) {
    errors.push({
      code: 'mismatched_viewer_fund_id',
      message: 'Student dashboard post-turn query result viewer fund must match the descriptor viewer fund.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_dashboard_post_turn_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      processedMonthIndex: input.descriptor.processedMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'ready',
      processedTurnOnly: input.descriptor.processedTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeOtherFundExactHoldingsForStudents: input.descriptor.includeOtherFundExactHoldingsForStudents,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeInstructorGodModeData: input.descriptor.includeInstructorGodModeData,
      includeClassAggregatePayload: input.descriptor.includeClassAggregatePayload,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      snapshot: input.snapshot,
    },
  };
}

export function buildStudentDashboardPostTurnSnapshot(
  input: StudentDashboardPostTurnSnapshotInput,
): StudentDashboardPostTurnSnapshotResult {
  const attributionReportResult = createStudentAttributionReportSnapshot({
    classId: input.classId,
    monthIndex: input.monthIndex,
    viewerFundId: input.viewerFundId,
    ledgerDraft: input.ledgerDraft,
  });
  const leaderboardRankResult = createStudentLeaderboardRankSnapshot({
    classId: input.classId,
    monthIndex: input.monthIndex,
    viewerFundId: input.viewerFundId,
    funds: input.leaderboardFunds,
  });
  const errors: StudentDashboardPostTurnSnapshotError[] = [];

  if (!attributionReportResult.ok) {
    errors.push(...attributionReportResult.errors.map((error) => ({ source: 'attribution_report' as const, ...error })));
  }

  if (!leaderboardRankResult.ok) {
    errors.push(...leaderboardRankResult.errors.map((error) => ({ source: 'leaderboard_rank' as const, ...error })));
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (!attributionReportResult.ok || !leaderboardRankResult.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      snapshotType: 'student_dashboard_post_turn',
      classId: attributionReportResult.value.classId,
      monthIndex: attributionReportResult.value.monthIndex,
      viewerFundId: attributionReportResult.value.viewerFundId,
      attributionReport: attributionReportResult.value,
      leaderboardRank: leaderboardRankResult.value,
    },
  };
}
