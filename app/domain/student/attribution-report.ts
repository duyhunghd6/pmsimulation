export type StudentAttributionReportLedgerDraftInput = {
  fundId: string;
  monthIndex: number;
  startingAum: number;
  marketBetaImpact: number;
  feeDrag: number;
  taxPaid: number;
  taxDragPct: number;
  pvpSlippagePaid: number;
  liquidityPenaltyPct: number;
  classroomSellConcentrationPct: number;
  endingAum: number;
};

export type StudentAttributionReportInput = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  ledgerDraft: StudentAttributionReportLedgerDraftInput;
};

export type StudentAttributionReportSnapshot = {
  classId: string;
  monthIndex: number;
  viewerFundId: string;
  reportKey: string;
  startingAum: number;
  marketBetaImpact: number;
  feeDrag: number;
  taxPaid: number;
  taxDragPct: number;
  pvpSlippagePaid: number;
  liquidityPenaltyPct: number;
  classroomSellConcentrationPct: number;
  endingAum: number;
};

export type StudentAttributionReportErrorCode =
  | 'invalid_class_id'
  | 'invalid_month_index'
  | 'invalid_viewer_fund_id'
  | 'invalid_ledger_fund_id'
  | 'ledger_fund_mismatch'
  | 'ledger_month_mismatch'
  | 'invalid_starting_aum'
  | 'invalid_market_beta_impact'
  | 'invalid_fee_drag'
  | 'invalid_tax_paid'
  | 'invalid_tax_drag_pct'
  | 'invalid_pvp_slippage_paid'
  | 'invalid_liquidity_penalty_pct'
  | 'invalid_classroom_sell_concentration_pct'
  | 'invalid_ending_aum'
  | 'inconsistent_ending_aum';

export type StudentAttributionReportError = {
  code: StudentAttributionReportErrorCode;
  message: string;
};

export type StudentAttributionReportResult =
  | { ok: true; value: StudentAttributionReportSnapshot }
  | { ok: false; errors: StudentAttributionReportError[] };

export type StudentAttributionReportQueryDescriptorInput = {
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
};

export type StudentAttributionReportQueryDescriptor = {
  descriptorType: 'student_attribution_report_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_student_attribution_report';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeOtherFundLedgerDrafts: false;
  includeDatabaseRows: false;
  includeProviderPayload: false;
};

export type StudentAttributionReportQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_processed_month_index'
  | 'invalid_viewer_fund_id';

export type StudentAttributionReportQueryDescriptorError = {
  code: StudentAttributionReportQueryDescriptorErrorCode;
  message: string;
};

export type StudentAttributionReportQueryDescriptorResult =
  | { ok: true; value: StudentAttributionReportQueryDescriptor }
  | { ok: false; errors: StudentAttributionReportQueryDescriptorError[] };

export type StudentAttributionReportQueryResultEnvelope = {
  envelopeType: 'student_attribution_report_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_attribution_report';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeOtherFundLedgerDrafts: false;
  includeDatabaseRows: false;
  includeProviderPayload: false;
  snapshot: StudentAttributionReportSnapshot;
};

export type StudentAttributionReportQueryResultValidationFailureEnvelope = {
  envelopeType: 'student_attribution_report_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_attribution_report';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  processedMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeOtherFundLedgerDrafts: false;
  includeDatabaseRows: false;
  includeProviderPayload: false;
  validationErrors: StudentAttributionReportQueryResultEnvelopeError[];
};

export type StudentAttributionReportQueryResultEnvelopeInput = {
  descriptor: StudentAttributionReportQueryDescriptor;
  snapshot?: StudentAttributionReportSnapshot;
};

export type StudentAttributionReportQueryResultEnvelopeErrorCode =
  | 'missing_student_attribution_report_snapshot'
  | 'mismatched_class_id'
  | 'mismatched_processed_month_index'
  | 'mismatched_viewer_fund_id';

export type StudentAttributionReportQueryResultEnvelopeError = {
  code: StudentAttributionReportQueryResultEnvelopeErrorCode;
  message: string;
};

export type StudentAttributionReportQueryResultEnvelopeResult =
  | { ok: true; value: StudentAttributionReportQueryResultEnvelope }
  | { ok: false; errors: StudentAttributionReportQueryResultEnvelopeError[] };

export type StudentAttributionReportQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type StudentAttributionReportQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: StudentAttributionReportQueryResultValidationFailureEnvelope }
  | { ok: false; errors: StudentAttributionReportQueryResultValidationFailureEnvelopeError[] };

const ENDING_AUM_TOLERANCE = 0.000001;

export function createStudentAttributionReportQueryDescriptor(
  input: StudentAttributionReportQueryDescriptorInput,
): StudentAttributionReportQueryDescriptorResult {
  const errors: StudentAttributionReportQueryDescriptorError[] = [];
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
      descriptorType: 'student_attribution_report_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.processedMonthIndex}:fund:${viewerFundId}:student-attribution-report-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_student_attribution_report',
      requiredScope: 'viewer_fund_in_class',
      classId,
      processedMonthIndex: input.processedMonthIndex,
      viewerFundId,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeOtherFundLedgerDrafts: false,
      includeDatabaseRows: false,
      includeProviderPayload: false,
    },
  };
}

export function createStudentAttributionReportQueryResultEnvelope(
  input: StudentAttributionReportQueryResultEnvelopeInput,
): StudentAttributionReportQueryResultEnvelopeResult {
  if (input.snapshot === undefined) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_student_attribution_report_snapshot',
          message: 'Student attribution report query result envelopes require the already-authorized report snapshot.',
        },
      ],
    };
  }

  const errors: StudentAttributionReportQueryResultEnvelopeError[] = [];
  const snapshot = input.snapshot;

  if (snapshot.classId !== input.descriptor.classId) {
    errors.push({
      code: 'mismatched_class_id',
      message: 'Student attribution report query result class must match the descriptor class.',
    });
  }

  if (snapshot.monthIndex !== input.descriptor.processedMonthIndex) {
    errors.push({
      code: 'mismatched_processed_month_index',
      message: 'Student attribution report query result month must match the descriptor processed month.',
    });
  }

  if (snapshot.viewerFundId !== input.descriptor.viewerFundId) {
    errors.push({
      code: 'mismatched_viewer_fund_id',
      message: 'Student attribution report query result viewer fund must match the descriptor viewer fund.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_attribution_report_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      processedMonthIndex: input.descriptor.processedMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'ready',
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeOtherFundLedgerDrafts: false,
      includeDatabaseRows: false,
      includeProviderPayload: false,
      snapshot,
    },
  };
}

export function createStudentAttributionReportQueryResultValidationFailureEnvelope(
  input: StudentAttributionReportQueryResultEnvelopeInput,
): StudentAttributionReportQueryResultValidationFailureEnvelopeResult {
  const result = createStudentAttributionReportQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student attribution report query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_attribution_report_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      processedMonthIndex: input.descriptor.processedMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'validation_failed',
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeOtherFundLedgerDrafts: false,
      includeDatabaseRows: false,
      includeProviderPayload: false,
      validationErrors: result.errors,
    },
  };
}

export function createStudentAttributionReportSnapshot(
  input: StudentAttributionReportInput,
): StudentAttributionReportResult {
  const errors: StudentAttributionReportError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();
  const ledgerFundId = input.ledgerDraft.fundId.trim();
  const monthIndexIsValid = Number.isInteger(input.monthIndex) && input.monthIndex >= 0;
  const ledgerMonthIndexIsValid = Number.isInteger(input.ledgerDraft.monthIndex) && input.ledgerDraft.monthIndex >= 0;

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

  if (viewerFundId === '') {
    errors.push({
      code: 'invalid_viewer_fund_id',
      message: 'Viewer fund id is required.',
    });
  }

  if (ledgerFundId === '') {
    errors.push({
      code: 'invalid_ledger_fund_id',
      message: 'Ledger fund id is required.',
    });
  }

  if (viewerFundId !== '' && ledgerFundId !== '' && viewerFundId !== ledgerFundId) {
    errors.push({
      code: 'ledger_fund_mismatch',
      message: 'Student attribution reports can only be created from the viewer fund ledger.',
    });
  }

  if (!ledgerMonthIndexIsValid || (monthIndexIsValid && input.ledgerDraft.monthIndex !== input.monthIndex)) {
    errors.push({
      code: 'ledger_month_mismatch',
      message: 'Ledger month index must match the requested report month.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.startingAum) || input.ledgerDraft.startingAum < 0) {
    errors.push({
      code: 'invalid_starting_aum',
      message: 'Starting AUM must be a non-negative finite number.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.marketBetaImpact)) {
    errors.push({
      code: 'invalid_market_beta_impact',
      message: 'Market beta impact must be finite.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.feeDrag) || input.ledgerDraft.feeDrag < 0) {
    errors.push({
      code: 'invalid_fee_drag',
      message: 'Fee drag must be a non-negative finite number.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.taxPaid) || input.ledgerDraft.taxPaid < 0) {
    errors.push({
      code: 'invalid_tax_paid',
      message: 'Tax paid must be a non-negative finite number.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.taxDragPct) || input.ledgerDraft.taxDragPct < 0) {
    errors.push({
      code: 'invalid_tax_drag_pct',
      message: 'Tax drag percentage must be a non-negative finite number.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.pvpSlippagePaid) || input.ledgerDraft.pvpSlippagePaid < 0) {
    errors.push({
      code: 'invalid_pvp_slippage_paid',
      message: 'PvP slippage paid must be a non-negative finite number.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.liquidityPenaltyPct) || input.ledgerDraft.liquidityPenaltyPct < 0) {
    errors.push({
      code: 'invalid_liquidity_penalty_pct',
      message: 'Liquidity penalty percentage must be a non-negative finite number.',
    });
  }

  if (
    !Number.isFinite(input.ledgerDraft.classroomSellConcentrationPct) ||
    input.ledgerDraft.classroomSellConcentrationPct < 0 ||
    input.ledgerDraft.classroomSellConcentrationPct > 100
  ) {
    errors.push({
      code: 'invalid_classroom_sell_concentration_pct',
      message: 'Classroom sell concentration percentage must be a finite number from 0 to 100.',
    });
  }

  if (!Number.isFinite(input.ledgerDraft.endingAum) || input.ledgerDraft.endingAum < 0) {
    errors.push({
      code: 'invalid_ending_aum',
      message: 'Ending AUM must be a non-negative finite number.',
    });
  }

  const expectedEndingAum =
    input.ledgerDraft.startingAum +
    input.ledgerDraft.marketBetaImpact -
    input.ledgerDraft.feeDrag -
    input.ledgerDraft.taxPaid -
    input.ledgerDraft.pvpSlippagePaid;

  if (
    Number.isFinite(expectedEndingAum) &&
    Number.isFinite(input.ledgerDraft.endingAum) &&
    Math.abs(expectedEndingAum - input.ledgerDraft.endingAum) > ENDING_AUM_TOLERANCE
  ) {
    errors.push({
      code: 'inconsistent_ending_aum',
      message: 'Ending AUM must match starting AUM plus market impact minus costs.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      classId,
      monthIndex: input.monthIndex,
      viewerFundId,
      reportKey: `class:${classId}:month:${input.monthIndex}:fund:${viewerFundId}:attribution-report`,
      startingAum: input.ledgerDraft.startingAum,
      marketBetaImpact: input.ledgerDraft.marketBetaImpact,
      feeDrag: input.ledgerDraft.feeDrag,
      taxPaid: input.ledgerDraft.taxPaid,
      taxDragPct: input.ledgerDraft.taxDragPct,
      pvpSlippagePaid: input.ledgerDraft.pvpSlippagePaid,
      liquidityPenaltyPct: input.ledgerDraft.liquidityPenaltyPct,
      classroomSellConcentrationPct: input.ledgerDraft.classroomSellConcentrationPct,
      endingAum: input.ledgerDraft.endingAum,
    },
  };
}
