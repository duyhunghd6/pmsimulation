import { ASSET_TIERS, type AssetTier } from '../tara/allocation';

export type AssetDnaDefinition = {
  assetTier: AssetTier;
  betaM2: number;
  betaCpi: number;
  betaGdp: number;
  betaVix: number;
  betaPolicyRate: number;
  betaUsdVnd: number;
  betaMarketLiquidity: number;
  baseFeePct: number;
};

export const MVP_ASSET_DNA_CATALOG = [
  assetDna('Base', 0.05, -0.05, 0.1, -0.05, 0.2, -0.05, 0.05, 0.1),
  assetDna('Core', 0.25, -0.15, 0.35, -0.2, -0.25, -0.1, 0.3, 0.5),
  assetDna('Apex', 0.8, -0.5, 0.65, -0.8, -0.9, -0.3, 1, 1),
] as const satisfies readonly AssetDnaDefinition[];

const definitionsByTier = new Map(MVP_ASSET_DNA_CATALOG.map((definition) => [definition.assetTier, definition]));

export function getAssetDnaDefinition(assetTier: string): AssetDnaDefinition | null {
  return definitionsByTier.get(assetTier as AssetTier) ?? null;
}

export function listAssetDnaDefinitions(): AssetDnaDefinition[] {
  return ASSET_TIERS.map((assetTier) => definitionsByTier.get(assetTier)).filter(
    (definition): definition is AssetDnaDefinition => definition !== undefined,
  );
}

function assetDna(
  assetTier: AssetTier,
  betaM2: number,
  betaCpi: number,
  betaGdp: number,
  betaVix: number,
  betaPolicyRate: number,
  betaUsdVnd: number,
  betaMarketLiquidity: number,
  baseFeePct: number,
): AssetDnaDefinition {
  return {
    assetTier,
    betaM2,
    betaCpi,
    betaGdp,
    betaVix,
    betaPolicyRate,
    betaUsdVnd,
    betaMarketLiquidity,
    baseFeePct,
  };
}
