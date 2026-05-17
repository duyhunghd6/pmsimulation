import { describe, expect, it } from 'vitest';

import {
  MVP_ASSET_DNA_CATALOG,
  getAssetDnaDefinition,
  listAssetDnaDefinitions,
} from './catalog';

describe('MVP asset DNA catalog', () => {
  it('contains exactly one definition for each MVP asset tier', () => {
    const definitions = listAssetDnaDefinitions();
    const tiers = definitions.map((definition) => definition.assetTier);

    expect(tiers).toEqual(['Base', 'Core', 'Apex']);
    expect(new Set(tiers).size).toBe(MVP_ASSET_DNA_CATALOG.length);
  });

  it('looks up tier definitions without inventing unknown tiers', () => {
    expect(getAssetDnaDefinition('Base')?.assetTier).toBe('Base');
    expect(getAssetDnaDefinition('Core')?.assetTier).toBe('Core');
    expect(getAssetDnaDefinition('Apex')?.assetTier).toBe('Apex');
    expect(getAssetDnaDefinition('Satellite')).toBeNull();
  });

  it('models Apex as most sensitive to liquidity and most harmed by rate and volatility shocks', () => {
    const base = getAssetDnaDefinition('Base');
    const core = getAssetDnaDefinition('Core');
    const apex = getAssetDnaDefinition('Apex');

    expect(base).not.toBeNull();
    expect(core).not.toBeNull();
    expect(apex).not.toBeNull();

    if (base === null || core === null || apex === null) {
      return;
    }

    expect(apex.betaM2).toBeGreaterThan(core.betaM2);
    expect(core.betaM2).toBeGreaterThan(base.betaM2);
    expect(apex.betaMarketLiquidity).toBeGreaterThan(core.betaMarketLiquidity);
    expect(core.betaMarketLiquidity).toBeGreaterThan(base.betaMarketLiquidity);
    expect(apex.betaPolicyRate).toBeLessThan(core.betaPolicyRate);
    expect(apex.betaPolicyRate).toBeLessThan(base.betaPolicyRate);
    expect(apex.betaVix).toBeLessThan(core.betaVix);
    expect(core.betaVix).toBeLessThan(base.betaVix);
  });

  it('keeps seeded coefficients and base fees finite', () => {
    for (const definition of MVP_ASSET_DNA_CATALOG) {
      expect(Number.isFinite(definition.betaM2)).toBe(true);
      expect(Number.isFinite(definition.betaCpi)).toBe(true);
      expect(Number.isFinite(definition.betaGdp)).toBe(true);
      expect(Number.isFinite(definition.betaVix)).toBe(true);
      expect(Number.isFinite(definition.betaPolicyRate)).toBe(true);
      expect(Number.isFinite(definition.betaUsdVnd)).toBe(true);
      expect(Number.isFinite(definition.betaMarketLiquidity)).toBe(true);
      expect(definition.baseFeePct).toBeGreaterThanOrEqual(0);
    }
  });
});
