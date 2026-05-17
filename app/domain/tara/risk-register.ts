export const TARA_RISK_TREATMENT_CLASSES = ['transfer', 'avoid', 'reduce', 'accept'] as const;

export type TaraRiskTreatmentClass = (typeof TARA_RISK_TREATMENT_CLASSES)[number];

export type TaraRiskRegisterEvidenceInput = {
  fundId: string;
  monthIndex: number;
  riskType: string;
  riskDirection: string;
  impactWeight: number;
  riskTimeLag: number;
  riskProbabilityScore: number;
  riskImpactScore: number;
  taraRiskTreatmentClass: string;
  riskTreatmentAction: string;
};

export type TaraRiskRegisterEvidenceSnapshot = {
  fundId: string;
  monthIndex: number;
  riskType: string;
  riskDirection: string;
  impactWeight: number;
  riskTimeLag: number;
  riskProbabilityScore: number;
  riskImpactScore: number;
  taraRiskTreatmentClass: TaraRiskTreatmentClass;
  taraRiskMatrix: string;
  riskTreatmentAction: string;
};

export type TaraRiskRegisterEvidenceErrorCode =
  | 'invalid_fund_id'
  | 'invalid_month_index'
  | 'invalid_risk_type'
  | 'invalid_risk_direction'
  | 'invalid_impact_weight'
  | 'invalid_risk_time_lag'
  | 'invalid_risk_probability_score'
  | 'invalid_risk_impact_score'
  | 'invalid_tara_risk_treatment_class'
  | 'invalid_risk_treatment_action';

export type TaraRiskRegisterEvidenceError = {
  code: TaraRiskRegisterEvidenceErrorCode;
  message: string;
};

export type TaraRiskRegisterEvidenceResult =
  | { ok: true; value: TaraRiskRegisterEvidenceSnapshot }
  | { ok: false; errors: TaraRiskRegisterEvidenceError[] };

function isValidTreatmentClass(value: string): value is TaraRiskTreatmentClass {
  return TARA_RISK_TREATMENT_CLASSES.includes(value as TaraRiskTreatmentClass);
}

export function createTaraRiskRegisterEvidenceSnapshot(
  input: TaraRiskRegisterEvidenceInput,
): TaraRiskRegisterEvidenceResult {
  const errors: TaraRiskRegisterEvidenceError[] = [];
  const fundId = input.fundId.trim();
  const riskType = input.riskType.trim();
  const riskDirection = input.riskDirection.trim();
  const taraRiskTreatmentClass = input.taraRiskTreatmentClass.trim().toLowerCase();
  const riskTreatmentAction = input.riskTreatmentAction.trim();

  if (fundId === '') {
    errors.push({
      code: 'invalid_fund_id',
      message: 'Fund id is required.',
    });
  }

  if (!Number.isInteger(input.monthIndex) || input.monthIndex < 0) {
    errors.push({
      code: 'invalid_month_index',
      message: 'Month index must be a non-negative integer.',
    });
  }

  if (riskType === '') {
    errors.push({
      code: 'invalid_risk_type',
      message: 'Risk type is required.',
    });
  }

  if (riskDirection === '') {
    errors.push({
      code: 'invalid_risk_direction',
      message: 'Risk direction is required.',
    });
  }

  if (!Number.isFinite(input.impactWeight) || input.impactWeight <= 0) {
    errors.push({
      code: 'invalid_impact_weight',
      message: 'Impact weight must be a positive finite number.',
    });
  }

  if (!Number.isInteger(input.riskTimeLag) || input.riskTimeLag < 0) {
    errors.push({
      code: 'invalid_risk_time_lag',
      message: 'Risk time lag must be a non-negative integer.',
    });
  }

  if (!Number.isFinite(input.riskProbabilityScore) || input.riskProbabilityScore < 0) {
    errors.push({
      code: 'invalid_risk_probability_score',
      message: 'Risk probability score must be a non-negative finite number.',
    });
  }

  if (!Number.isFinite(input.riskImpactScore) || input.riskImpactScore < 0) {
    errors.push({
      code: 'invalid_risk_impact_score',
      message: 'Risk impact score must be a non-negative finite number.',
    });
  }

  if (!isValidTreatmentClass(taraRiskTreatmentClass)) {
    errors.push({
      code: 'invalid_tara_risk_treatment_class',
      message: 'TARA risk treatment class must be transfer, avoid, reduce, or accept.',
    });
  }

  if (riskTreatmentAction === '') {
    errors.push({
      code: 'invalid_risk_treatment_action',
      message: 'Risk treatment action is required.',
    });
  }

  if (errors.length > 0 || !isValidTreatmentClass(taraRiskTreatmentClass)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      fundId,
      monthIndex: input.monthIndex,
      riskType,
      riskDirection,
      impactWeight: input.impactWeight,
      riskTimeLag: input.riskTimeLag,
      riskProbabilityScore: input.riskProbabilityScore,
      riskImpactScore: input.riskImpactScore,
      taraRiskTreatmentClass,
      taraRiskMatrix: `${input.riskProbabilityScore}x${input.riskImpactScore}`,
      riskTreatmentAction,
    },
  };
}
