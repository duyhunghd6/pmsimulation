# Simulation Engine

## Engine Model

The simulation engine is deterministic and curriculum-driven. It must not use random market returns or live stock API data for MVP outcomes.

The engine advances by monthly turns. Each turn reads a scripted macro narrative row, applies deterministic macro relationships, calculates asset-tier returns, processes TARA orders, applies friction, and writes attribution results.

## Macro Scenario Rules

Macro data comes from a pre-scripted scenario array.

Indicator timing:

- Leading indicators: `PMI`, `M2 Growth`.
- Coincident indicators: `GDP`, `VIX`.
- Lagging indicators: `CPI / Inflation`, `CB Rate`.

Lag rules:

- `GDP` lags `PMI` by one turn.
- `CPI / Inflation` lags `M2 Growth` by two turns.
- `CB Rate` hikes mechanically by `+0.50%` when `CPI` crosses `3.0%`.
- `VIX` spikes on sudden rate hikes.

## Asset Factor Matrix

Assets are modeled as tiers rather than individual tickers:

- Base: safety-oriented assets.
- Core: yield-oriented assets.
- Apex: alpha-oriented assets.

Asset returns are calculated from hardcoded beta sensitivities to macro deltas. Apex assets have high positive sensitivity to liquidity and severe negative sensitivity to interest-rate and volatility shocks.

## Rebalancing Friction

The engine penalizes naive or crowded rebalancing.

### Tax Drag

Selling profitable Apex assets incurs a simulated `20%` capital gains tax deducted from AUM.

### Crowded-Trade Liquidity Penalty

During end-of-turn processing, if more than `50%` of classroom volume submits identical sell orders for the same asset tier, the engine applies an additional liquidity penalty to that trade.

## TARA Order Rules

Student target allocations must total exactly `100.0%` before submission.

Future implementation should validate the allocation at both the client boundary and the server boundary. Client validation improves usability; server validation is the authoritative guard.

## Processing Requirements

Month advancement must be safe from either trigger path:

- Auto mode via scheduled cron.
- Live mode via instructor action.

Processing must be idempotent so duplicate trigger attempts do not double-apply returns, taxes, slippage, or ledger rows.

## Attribution Requirements

Post-turn results must explain AUM changes by source, including at least:

- Market beta impact.
- Tax penalties.
- PvP slippage or liquidity penalties.
- Ending AUM.
