import { describe, expect, it } from 'vitest';

import { buildPortfolioPyramidSnapshot } from './pyramid';

describe('portfolio pyramid snapshot', () => {
  it('projects current and intended tier weights with drift directions', () => {
    const result = buildPortfolioPyramidSnapshot({
      currentWeights: { Base: 45, Core: 35, Apex: 20 },
      intendedWeights: { Base: 50, Core: 30, Apex: 20 },
      dangerousDriftThresholdPct: 5,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        tiers: [
          {
            tier: 'Base',
            currentWeightPct: 45,
            intendedWeightPct: 50,
            driftPct: -5,
            driftDirection: 'underweight',
            isDangerousDrift: false,
          },
          {
            tier: 'Core',
            currentWeightPct: 35,
            intendedWeightPct: 30,
            driftPct: 5,
            driftDirection: 'overweight',
            isDangerousDrift: false,
          },
          {
            tier: 'Apex',
            currentWeightPct: 20,
            intendedWeightPct: 20,
            driftPct: 0,
            driftDirection: 'on_target',
            isDangerousDrift: false,
          },
        ],
        hasDangerousDrift: false,
      },
    });
  });

  it('flags drift only when the absolute drift exceeds the supplied threshold', () => {
    const result = buildPortfolioPyramidSnapshot({
      currentWeights: { Base: 42, Core: 38, Apex: 20 },
      intendedWeights: { Base: 50, Core: 30, Apex: 20 },
      dangerousDriftThresholdPct: 5,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        tiers: [
          {
            tier: 'Base',
            currentWeightPct: 42,
            intendedWeightPct: 50,
            driftPct: -8,
            driftDirection: 'underweight',
            isDangerousDrift: true,
          },
          {
            tier: 'Core',
            currentWeightPct: 38,
            intendedWeightPct: 30,
            driftPct: 8,
            driftDirection: 'overweight',
            isDangerousDrift: true,
          },
          {
            tier: 'Apex',
            currentWeightPct: 20,
            intendedWeightPct: 20,
            driftPct: 0,
            driftDirection: 'on_target',
            isDangerousDrift: false,
          },
        ],
        hasDangerousDrift: true,
      },
    });
  });

  it('rejects invalid current and intended weights through allocation validation', () => {
    const result = buildPortfolioPyramidSnapshot({
      currentWeights: { Base: 50, Core: 30, Apex: 25, Satellite: 5 },
      intendedWeights: { Base: 50, Core: 50 },
      dangerousDriftThresholdPct: 5,
    });

    expect(result).toEqual({
      ok: false,
      errors: expect.arrayContaining([
        {
          code: 'unknown_tier',
          message: 'Satellite is not an MVP asset tier.',
          tier: 'Satellite',
          source: 'current_weights',
        },
        {
          code: 'total_must_equal_100',
          message: 'TARA target allocations must total exactly 100.0%.',
          total: 105,
          source: 'current_weights',
        },
        {
          code: 'missing_tier',
          message: 'Apex allocation is required.',
          tier: 'Apex',
          source: 'intended_weights',
        },
      ]),
    });
  });

  it('rejects invalid dangerous drift thresholds', () => {
    const result = buildPortfolioPyramidSnapshot({
      currentWeights: { Base: 50, Core: 30, Apex: 20 },
      intendedWeights: { Base: 50, Core: 30, Apex: 20 },
      dangerousDriftThresholdPct: 0,
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'invalid_drift_threshold',
          message: 'Dangerous drift threshold must be a finite, positive percentage with at most one decimal place.',
          source: 'drift_threshold',
        },
      ],
    });
  });
});
