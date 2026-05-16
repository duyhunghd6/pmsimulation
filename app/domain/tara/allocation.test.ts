import { describe, expect, it } from 'vitest';

import { validateTaraAllocationWeights } from './allocation';

function errorCodesFor(input: Record<string, number>): string[] {
  const result = validateTaraAllocationWeights(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('validateTaraAllocationWeights', () => {
  it('accepts whole-percent Base/Core/Apex weights totaling 100.0%', () => {
    const result = validateTaraAllocationWeights({ Base: 40, Core: 40, Apex: 20 });

    expect(result).toEqual({ ok: true, value: { Base: 40, Core: 40, Apex: 20 } });
  });

  it('accepts one-decimal weights totaling 100.0%', () => {
    const result = validateTaraAllocationWeights({ Base: 33.3, Core: 33.3, Apex: 33.4 });

    expect(result).toEqual({ ok: true, value: { Base: 33.3, Core: 33.3, Apex: 33.4 } });
  });

  it('accepts zero-weight tiers when the total equals 100.0%', () => {
    const result = validateTaraAllocationWeights({ Base: 100, Core: 0, Apex: 0 });

    expect(result).toEqual({ ok: true, value: { Base: 100, Core: 0, Apex: 0 } });
  });

  it('rejects totals below 100.0%', () => {
    expect(errorCodesFor({ Base: 40, Core: 40, Apex: 19.9 })).toContain('total_must_equal_100');
  });

  it('rejects totals above 100.0%', () => {
    expect(errorCodesFor({ Base: 40, Core: 40, Apex: 20.1 })).toContain('total_must_equal_100');
  });

  it('rejects missing MVP tiers', () => {
    expect(errorCodesFor({ Base: 50, Core: 50 })).toContain('missing_tier');
    expect(errorCodesFor({ Base: 50, Apex: 50 })).toContain('missing_tier');
    expect(errorCodesFor({ Core: 50, Apex: 50 })).toContain('missing_tier');
  });

  it('rejects unknown tiers', () => {
    expect(errorCodesFor({ Base: 40, Core: 40, Apex: 20, Crypto: 0 })).toContain('unknown_tier');
  });

  it('rejects negative weights', () => {
    expect(errorCodesFor({ Base: -1, Core: 51, Apex: 50 })).toContain('invalid_weight');
  });

  it('rejects non-finite weights', () => {
    expect(errorCodesFor({ Base: Number.NaN, Core: 50, Apex: 50 })).toContain('invalid_weight');
    expect(errorCodesFor({ Base: Number.POSITIVE_INFINITY, Core: 50, Apex: 50 })).toContain('invalid_weight');
  });

  it('rejects weights beyond one decimal place', () => {
    expect(errorCodesFor({ Base: 33.333, Core: 33.333, Apex: 33.334 })).toContain('invalid_weight');
  });
});
