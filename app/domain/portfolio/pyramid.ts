import {
  ASSET_TIERS,
  validateTaraAllocationWeights,
  type AllocationValidationError,
  type AssetTier,
} from '../tara/allocation';

export type PortfolioPyramidDriftDirection = 'underweight' | 'on_target' | 'overweight';

export type PortfolioPyramidTier = {
  tier: AssetTier;
  currentWeightPct: number;
  intendedWeightPct: number;
  driftPct: number;
  driftDirection: PortfolioPyramidDriftDirection;
  isDangerousDrift: boolean;
};

export type PortfolioPyramidSnapshot = {
  snapshotType: 'student_portfolio_pyramid';
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  tiers: PortfolioPyramidTier[];
  hasDangerousDrift: boolean;
};

export type PortfolioPyramidSnapshotInput = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  currentWeights: Record<string, number>;
  intendedWeights: Record<string, number>;
  dangerousDriftThresholdPct: number;
};

export type PortfolioPyramidSnapshotErrorCode =
  | AllocationValidationError['code']
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_viewer_fund_id'
  | 'invalid_drift_threshold';

export type PortfolioPyramidSnapshotError = {
  code: PortfolioPyramidSnapshotErrorCode;
  message: string;
  source: 'class_id' | 'month_index' | 'viewer_fund_id' | 'current_weights' | 'intended_weights' | 'drift_threshold';
  tier?: string;
  total?: number;
};

export type PortfolioPyramidSnapshotResult =
  | { ok: true; value: PortfolioPyramidSnapshot }
  | { ok: false; errors: PortfolioPyramidSnapshotError[] };

export type StudentPortfolioPyramidQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
};

export type StudentPortfolioPyramidQueryDescriptor = {
  descriptorType: 'student_portfolio_pyramid_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_student_portfolio_pyramid';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeOtherFundExactHoldings: false;
  includeInstructorGodModeData: false;
  includePendingOrderStatus: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
};

export type StudentPortfolioPyramidQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_current_month_index'
  | 'invalid_viewer_fund_id';

export type StudentPortfolioPyramidQueryDescriptorError = {
  code: StudentPortfolioPyramidQueryDescriptorErrorCode;
  message: string;
};

export type StudentPortfolioPyramidQueryDescriptorResult =
  | { ok: true; value: StudentPortfolioPyramidQueryDescriptor }
  | { ok: false; errors: StudentPortfolioPyramidQueryDescriptorError[] };

export type StudentPortfolioPyramidQueryResultEnvelope = {
  envelopeType: 'student_portfolio_pyramid_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_portfolio_pyramid';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeOtherFundExactHoldings: false;
  includeInstructorGodModeData: false;
  includePendingOrderStatus: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  snapshot: PortfolioPyramidSnapshot;
};

export type StudentPortfolioPyramidQueryResultValidationFailureEnvelope = {
  envelopeType: 'student_portfolio_pyramid_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_portfolio_pyramid';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeOtherFundExactHoldings: false;
  includeInstructorGodModeData: false;
  includePendingOrderStatus: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeEstimatedTaxDrag: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  validationErrors: StudentPortfolioPyramidQueryResultEnvelopeError[];
};

export type StudentPortfolioPyramidQueryResultEnvelopeInput = {
  descriptor: StudentPortfolioPyramidQueryDescriptor;
  snapshot?: PortfolioPyramidSnapshot;
};

export type StudentPortfolioPyramidQueryResultEnvelopeErrorCode =
  | 'missing_student_portfolio_pyramid_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_current_month_index'
  | 'mismatched_viewer_fund_id';

export type StudentPortfolioPyramidQueryResultEnvelopeError = {
  code: StudentPortfolioPyramidQueryResultEnvelopeErrorCode;
  message: string;
};

export type StudentPortfolioPyramidQueryResultEnvelopeResult =
  | { ok: true; value: StudentPortfolioPyramidQueryResultEnvelope }
  | { ok: false; errors: StudentPortfolioPyramidQueryResultEnvelopeError[] };

export type StudentPortfolioPyramidQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type StudentPortfolioPyramidQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: StudentPortfolioPyramidQueryResultValidationFailureEnvelope }
  | { ok: false; errors: StudentPortfolioPyramidQueryResultValidationFailureEnvelopeError[] };

export function createStudentPortfolioPyramidQueryDescriptor(
  input: StudentPortfolioPyramidQueryDescriptorInput,
): StudentPortfolioPyramidQueryDescriptorResult {
  const errors: StudentPortfolioPyramidQueryDescriptorError[] = [];
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
      descriptorType: 'student_portfolio_pyramid_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:fund:${viewerFundId}:student-portfolio-pyramid-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_student_portfolio_pyramid',
      requiredScope: 'viewer_fund_in_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      viewerFundId,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundIds: false,
      includeOtherFundExactHoldings: false,
      includeInstructorGodModeData: false,
      includePendingOrderStatus: false,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeEstimatedTaxDrag: false,
      includeLedgerDrafts: false,
      includeProviderPayload: false,
    },
  };
}

export function createStudentPortfolioPyramidQueryResultValidationFailureEnvelope(
  input: StudentPortfolioPyramidQueryResultEnvelopeInput,
): StudentPortfolioPyramidQueryResultValidationFailureEnvelopeResult {
  const result = createStudentPortfolioPyramidQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student portfolio pyramid query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_portfolio_pyramid_query_result_validation_failure',
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
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeOtherFundExactHoldings: input.descriptor.includeOtherFundExactHoldings,
      includeInstructorGodModeData: input.descriptor.includeInstructorGodModeData,
      includePendingOrderStatus: input.descriptor.includePendingOrderStatus,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createStudentPortfolioPyramidQueryResultEnvelope(
  input: StudentPortfolioPyramidQueryResultEnvelopeInput,
): StudentPortfolioPyramidQueryResultEnvelopeResult {
  const errors: StudentPortfolioPyramidQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_student_portfolio_pyramid_snapshot',
          message: 'Student portfolio pyramid query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Student portfolio pyramid query result class must match the descriptor class.',
    });
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Student portfolio pyramid query result month must match the descriptor current month.',
    });
  }

  if (input.snapshot.viewerFundId !== input.descriptor.viewerFundId) {
    errors.push({
      code: 'mismatched_viewer_fund_id',
      message: 'Student portfolio pyramid query result viewer fund must match the descriptor viewer fund.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_portfolio_pyramid_query_result',
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
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeOtherFundExactHoldings: input.descriptor.includeOtherFundExactHoldings,
      includeInstructorGodModeData: input.descriptor.includeInstructorGodModeData,
      includePendingOrderStatus: input.descriptor.includePendingOrderStatus,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeEstimatedTaxDrag: input.descriptor.includeEstimatedTaxDrag,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function buildPortfolioPyramidSnapshot(
  input: PortfolioPyramidSnapshotInput,
): PortfolioPyramidSnapshotResult {
  const errors: PortfolioPyramidSnapshotError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();
  const currentWeightsResult = validateTaraAllocationWeights(input.currentWeights);
  const intendedWeightsResult = validateTaraAllocationWeights(input.intendedWeights);

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
      source: 'class_id',
    });
  }

  if (!Number.isInteger(input.monthIndex) || input.monthIndex < 0) {
    errors.push({
      code: 'invalid_month_index',
      message: 'Month index must be a non-negative integer.',
      source: 'month_index',
    });
  }

  if (viewerFundId === '') {
    errors.push({
      code: 'invalid_viewer_fund_id',
      message: 'Viewer fund id is required.',
      source: 'viewer_fund_id',
    });
  }

  if (!currentWeightsResult.ok) {
    errors.push(...tagAllocationErrors(currentWeightsResult.errors, 'current_weights'));
  }

  if (!intendedWeightsResult.ok) {
    errors.push(...tagAllocationErrors(intendedWeightsResult.errors, 'intended_weights'));
  }

  if (toTenthsPercent(input.dangerousDriftThresholdPct) === null || input.dangerousDriftThresholdPct <= 0) {
    errors.push({
      code: 'invalid_drift_threshold',
      message: 'Dangerous drift threshold must be a finite, positive percentage with at most one decimal place.',
      source: 'drift_threshold',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (!currentWeightsResult.ok || !intendedWeightsResult.ok) {
    return { ok: false, errors };
  }

  const currentWeights = currentWeightsResult.value;
  const intendedWeights = intendedWeightsResult.value;
  const tiers = ASSET_TIERS.map((tier): PortfolioPyramidTier => {
    const currentWeightPct = currentWeights[tier];
    const intendedWeightPct = intendedWeights[tier];
    const driftPct = roundToTenths(currentWeightPct - intendedWeightPct);

    return {
      tier,
      currentWeightPct,
      intendedWeightPct,
      driftPct,
      driftDirection: driftDirection(driftPct),
      isDangerousDrift: Math.abs(driftPct) > input.dangerousDriftThresholdPct,
    };
  });

  return {
    ok: true,
    value: {
      snapshotType: 'student_portfolio_pyramid',
      classId,
      monthIndex: input.monthIndex,
      viewerFundId,
      tiers,
      hasDangerousDrift: tiers.some((tier) => tier.isDangerousDrift),
    },
  };
}

function tagAllocationErrors(
  errors: AllocationValidationError[],
  source: 'current_weights' | 'intended_weights',
): PortfolioPyramidSnapshotError[] {
  return errors.map((error) => ({ ...error, source }));
}

function driftDirection(driftPct: number): PortfolioPyramidDriftDirection {
  if (driftPct < 0) {
    return 'underweight';
  }

  if (driftPct > 0) {
    return 'overweight';
  }

  return 'on_target';
}

function toTenthsPercent(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  const tenths = value * 10;

  if (!Number.isInteger(tenths)) {
    return null;
  }

  return tenths;
}

function roundToTenths(value: number): number {
  return Math.round(value * 10) / 10;
}
