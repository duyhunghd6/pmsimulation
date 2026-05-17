import { describe, expect, it } from 'vitest';

import {
  MVP_MACRO_NARRATIVE_CATALOG,
  MVP_MARKET_METRIC_CATALOG,
  MVP_SCENARIO_MONTH_COUNT,
  getMvpMacroNarrative,
  getMvpMarketMetric,
  listMvpMacroNarratives,
  listMvpMarketMetrics,
  listRevealedMvpScenarioRows,
} from './catalog';

describe('MVP scenario catalog', () => {
  it('contains paired macro narrative and market metric rows for the full 12-month MVP calendar', () => {
    const macroRows = listMvpMacroNarratives();
    const marketRows = listMvpMarketMetrics();
    const expectedMonthIndexes = Array.from({ length: MVP_SCENARIO_MONTH_COUNT }, (_, monthIndex) => monthIndex);

    expect(macroRows).toHaveLength(MVP_SCENARIO_MONTH_COUNT);
    expect(marketRows).toHaveLength(MVP_SCENARIO_MONTH_COUNT);
    expect(macroRows.map((row) => row.monthIndex)).toEqual(expectedMonthIndexes);
    expect(marketRows.map((row) => row.monthIndex)).toEqual(expectedMonthIndexes);
    expect(new Set(macroRows.map((row) => row.monthIndex)).size).toBe(MVP_MACRO_NARRATIVE_CATALOG.length);
    expect(new Set(marketRows.map((row) => row.monthIndex)).size).toBe(MVP_MARKET_METRIC_CATALOG.length);
  });

  it('looks up seeded rows without inventing unknown months', () => {
    expect(getMvpMacroNarrative(1)?.newsHeadline).toBe('Growth confirmation broadens the rally');
    expect(getMvpMarketMetric(1)?.businessCyclePhase).toBe('Expansion');
    expect(getMvpMacroNarrative(MVP_SCENARIO_MONTH_COUNT)).toBeNull();
    expect(getMvpMarketMetric(MVP_SCENARIO_MONTH_COUNT)).toBeNull();
  });

  it('exposes only current and past rows through the student reveal window', () => {
    const result = listRevealedMvpScenarioRows(1);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.macroNarratives.map((row) => row.monthIndex)).toEqual([0, 1]);
    expect(result.value.marketMetrics.map((row) => row.monthIndex)).toEqual([0, 1]);
    expect(result.value.macroNarratives.some((row) => row.monthIndex === 2)).toBe(false);
    expect(result.value.marketMetrics.some((row) => row.monthIndex === 2)).toBe(false);
  });

  it('rejects invalid reveal windows', () => {
    expect(listRevealedMvpScenarioRows(-1)).toEqual({
      ok: false,
      errors: [
        {
          code: 'invalid_current_month_index',
          message: 'Current month index must be a non-negative integer.',
        },
      ],
    });

    expect(listRevealedMvpScenarioRows(1.5).ok).toBe(false);
  });

  it('models a deterministic rate-hike stress turn after inflation crosses the policy threshold', () => {
    const monthOne = getMvpMacroNarrative(1);
    const monthTwo = getMvpMacroNarrative(2);

    expect(monthOne).not.toBeNull();
    expect(monthTwo).not.toBeNull();

    if (monthOne === null || monthTwo === null) {
      return;
    }

    expect(monthOne.inflationCpi).toBeLessThan(3.0);
    expect(monthTwo.inflationCpi).toBeGreaterThan(3.0);
    expect(monthTwo.policyRate - monthOne.policyRate).toBeCloseTo(0.5);
    expect(monthTwo.vix).toBeGreaterThan(monthOne.vix);
  });
});
