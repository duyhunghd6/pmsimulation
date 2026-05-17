import {
  estimateTaraLiquidityPenalty,
  type TaraLiquidityPenaltyError,
  type TaraLiquidityPenaltyPreview,
} from './liquidity-penalty';
import { estimateTaraTaxDragPreview, type TaraTaxDragPreview, type TaraTaxDragPreviewError } from './tax-drag';

export type TaraTurnAttributionInput = {
  currentAum: number;
  grossMarketReturnPct: number;
  feeDragPct: number;
  currentWeights: Record<string, number>;
  targetWeights: Record<string, number>;
  apexUnrealizedGainPct: number;
  classroomSellConcentrationPct: Record<string, number>;
};

export type TaraTurnAttribution = {
  startingAum: number;
  marketBetaImpact: number;
  feeDrag: number;
  taxPaid: number;
  taxDragPct: number;
  pvpSlippagePaid: number;
  liquidityPenaltyPct: number;
  classroomSellConcentrationPct: number;
  endingAum: number;
  taxDragPreview: TaraTaxDragPreview;
  liquidityPenaltyPreview: TaraLiquidityPenaltyPreview;
};

export type TaraTurnAttributionErrorCode =
  | 'invalid_current_aum'
  | 'invalid_market_return'
  | 'invalid_fee_drag'
  | 'invalid_tax_drag_preview'
  | 'invalid_liquidity_penalty';

export type TaraTurnAttributionError = {
  code: TaraTurnAttributionErrorCode;
  message: string;
  taxDragErrors?: TaraTaxDragPreviewError[];
  liquidityPenaltyErrors?: TaraLiquidityPenaltyError[];
};

export type TaraTurnAttributionResult =
  | { ok: true; value: TaraTurnAttribution }
  | { ok: false; errors: TaraTurnAttributionError[] };

export function calculateTaraTurnAttribution(input: TaraTurnAttributionInput): TaraTurnAttributionResult {
  const errors: TaraTurnAttributionError[] = [];

  if (!Number.isFinite(input.currentAum) || input.currentAum < 0) {
    errors.push({
      code: 'invalid_current_aum',
      message: 'Current AUM must be a finite, non-negative number.',
    });
  }

  if (!Number.isFinite(input.grossMarketReturnPct)) {
    errors.push({
      code: 'invalid_market_return',
      message: 'Gross market return must be finite.',
    });
  }

  if (!Number.isFinite(input.feeDragPct) || input.feeDragPct < 0) {
    errors.push({
      code: 'invalid_fee_drag',
      message: 'Fee drag must be a finite, non-negative percentage.',
    });
  }

  const taxDragResult = estimateTaraTaxDragPreview({
    currentAum: input.currentAum,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    apexUnrealizedGainPct: input.apexUnrealizedGainPct,
  });
  const liquidityPenaltyResult = estimateTaraLiquidityPenalty({
    currentAum: input.currentAum,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    classroomSellConcentrationPct: input.classroomSellConcentrationPct,
  });

  if (!taxDragResult.ok) {
    errors.push({
      code: 'invalid_tax_drag_preview',
      message: 'TARA turn attribution requires a valid tax-drag preview.',
      taxDragErrors: taxDragResult.errors,
    });
  }

  if (!liquidityPenaltyResult.ok) {
    errors.push({
      code: 'invalid_liquidity_penalty',
      message: 'TARA turn attribution requires a valid liquidity penalty preview.',
      liquidityPenaltyErrors: liquidityPenaltyResult.errors,
    });
  }

  if (errors.length > 0 || !taxDragResult.ok || !liquidityPenaltyResult.ok) {
    return { ok: false, errors };
  }

  const marketBetaImpact = input.currentAum * (input.grossMarketReturnPct / 100);
  const feeDrag = input.currentAum * (input.feeDragPct / 100);
  const taxPaid = taxDragResult.value.estimatedTaxPaid;
  const pvpSlippagePaid = liquidityPenaltyResult.value.pvpSlippagePaid;
  const classroomSellConcentrationPct = Math.max(
    0,
    ...liquidityPenaltyResult.value.tierImpacts
      .filter((impact) => impact.sellWeightPct > 0)
      .map((impact) => impact.classroomSellConcentrationPct),
  );
  const endingAum = input.currentAum + marketBetaImpact - feeDrag - taxPaid - pvpSlippagePaid;

  return {
    ok: true,
    value: {
      startingAum: input.currentAum,
      marketBetaImpact,
      feeDrag,
      taxPaid,
      taxDragPct: taxDragResult.value.taxDragPct,
      pvpSlippagePaid,
      liquidityPenaltyPct: liquidityPenaltyResult.value.liquidityPenaltyPct,
      classroomSellConcentrationPct,
      endingAum,
      taxDragPreview: taxDragResult.value,
      liquidityPenaltyPreview: liquidityPenaltyResult.value,
    },
  };
}
