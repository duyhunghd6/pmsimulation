import { describe, expect, it } from 'vitest';

import { createTaraRiskRegisterEvidenceSnapshot } from './risk-register';

const defaultInput = {
  fundId: 'fund-001',
  monthIndex: 4,
  riskType: 'rate shock',
  riskDirection: 'downside',
  impactWeight: 0.8,
  riskTimeLag: 2,
  riskProbabilityScore: 4,
  riskImpactScore: 5,
  taraRiskTreatmentClass: 'Reduce',
  riskTreatmentAction: 'Cut Apex exposure and raise Base allocation.',
};

function errorCodesFor(input: Parameters<typeof createTaraRiskRegisterEvidenceSnapshot>[0]): string[] {
  const result = createTaraRiskRegisterEvidenceSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createTaraRiskRegisterEvidenceSnapshot', () => {
  it('creates a TARA risk register evidence snapshot for one scoped fund month', () => {
    const result = createTaraRiskRegisterEvidenceSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        fundId: 'fund-001',
        monthIndex: 4,
        riskType: 'rate shock',
        riskDirection: 'downside',
        impactWeight: 0.8,
        riskTimeLag: 2,
        riskProbabilityScore: 4,
        riskImpactScore: 5,
        taraRiskTreatmentClass: 'reduce',
        taraRiskMatrix: '4x5',
        riskTreatmentAction: 'Cut Apex exposure and raise Base allocation.',
      },
    });
  });

  it('trims text fields and normalizes the treatment class', () => {
    const result = createTaraRiskRegisterEvidenceSnapshot({
      ...defaultInput,
      fundId: ' fund-001 ',
      riskType: ' inflation persistence ',
      riskDirection: ' upside ',
      taraRiskTreatmentClass: ' ACCEPT ',
      riskTreatmentAction: ' Hold current Base allocation. ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        fundId: 'fund-001',
        riskType: 'inflation persistence',
        riskDirection: 'upside',
        taraRiskTreatmentClass: 'accept',
        riskTreatmentAction: 'Hold current Base allocation.',
      }),
    });
  });

  it('allows every TARA treatment class from the course matrix', () => {
    expect(createTaraRiskRegisterEvidenceSnapshot({ ...defaultInput, taraRiskTreatmentClass: 'transfer' })).toEqual({
      ok: true,
      value: expect.objectContaining({ taraRiskTreatmentClass: 'transfer' }),
    });
    expect(createTaraRiskRegisterEvidenceSnapshot({ ...defaultInput, taraRiskTreatmentClass: 'avoid' })).toEqual({
      ok: true,
      value: expect.objectContaining({ taraRiskTreatmentClass: 'avoid' }),
    });
    expect(createTaraRiskRegisterEvidenceSnapshot({ ...defaultInput, taraRiskTreatmentClass: 'reduce' })).toEqual({
      ok: true,
      value: expect.objectContaining({ taraRiskTreatmentClass: 'reduce' }),
    });
    expect(createTaraRiskRegisterEvidenceSnapshot({ ...defaultInput, taraRiskTreatmentClass: 'accept' })).toEqual({
      ok: true,
      value: expect.objectContaining({ taraRiskTreatmentClass: 'accept' }),
    });
  });

  it('does not expose class, other-fund, order, ledger, or persistence payloads', () => {
    const result = createTaraRiskRegisterEvidenceSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('classId' in result.value).toBe(false);
    expect('otherFunds' in result.value).toBe(false);
    expect('targetWeights' in result.value).toBe(false);
    expect('ledgerDraft' in result.value).toBe(false);
    expect('riskRegisterId' in result.value).toBe(false);
  });

  it('rejects invalid scope and risk evidence fields', () => {
    expect(errorCodesFor({ ...defaultInput, fundId: '   ' })).toContain('invalid_fund_id');
    expect(errorCodesFor({ ...defaultInput, monthIndex: -1 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, monthIndex: 1.5 })).toContain('invalid_month_index');
    expect(errorCodesFor({ ...defaultInput, riskType: '   ' })).toContain('invalid_risk_type');
    expect(errorCodesFor({ ...defaultInput, riskDirection: '   ' })).toContain('invalid_risk_direction');
    expect(errorCodesFor({ ...defaultInput, impactWeight: 0 })).toContain('invalid_impact_weight');
    expect(errorCodesFor({ ...defaultInput, impactWeight: Number.NaN })).toContain('invalid_impact_weight');
    expect(errorCodesFor({ ...defaultInput, riskTimeLag: -1 })).toContain('invalid_risk_time_lag');
    expect(errorCodesFor({ ...defaultInput, riskTimeLag: 1.5 })).toContain('invalid_risk_time_lag');
    expect(errorCodesFor({ ...defaultInput, riskProbabilityScore: -1 })).toContain(
      'invalid_risk_probability_score',
    );
    expect(errorCodesFor({ ...defaultInput, riskProbabilityScore: Number.POSITIVE_INFINITY })).toContain(
      'invalid_risk_probability_score',
    );
    expect(errorCodesFor({ ...defaultInput, riskImpactScore: -1 })).toContain('invalid_risk_impact_score');
    expect(errorCodesFor({ ...defaultInput, riskImpactScore: Number.NaN })).toContain('invalid_risk_impact_score');
    expect(errorCodesFor({ ...defaultInput, taraRiskTreatmentClass: 'hedge' })).toContain(
      'invalid_tara_risk_treatment_class',
    );
    expect(errorCodesFor({ ...defaultInput, riskTreatmentAction: '   ' })).toContain(
      'invalid_risk_treatment_action',
    );
  });
});
