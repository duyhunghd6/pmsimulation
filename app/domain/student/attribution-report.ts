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

const ENDING_AUM_TOLERANCE = 0.000001;

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
