# Product Overview

## Product

Apex Alpha Portfolio Simulator is a web-based financial training simulator for instructor-led classrooms. Students act as fund managers, start with virtual `$50M` AUM, and compete over 12-to-24 monthly turns.

The product is desktop-first and uses a dark, terminal-style financial interface.

## Problem

Traditional investment training is often too theoretical. Students may memorize formulas without experiencing how macroeconomic shifts, portfolio drift, tax drag, liquidity pressure, and competitive behavior affect portfolio outcomes.

## Product Goal

Provide a secure, anti-cheat, multiplayer simulation that uses deterministic curriculum-designed market physics rather than random market data.

The simulation should teach:

1. Portfolio structure through the Asset Pyramid.
2. Macro driver interpretation through lagged economic indicators.
3. Rules-based rebalancing through the TARA Matrix.

## Core Product Principles

- Deterministic outcomes over random-number market simulation.
- Current-turn server-side access over browser-exposed future timeline data.
- Classroom isolation through tenant-scoped data access.
- Instructor control over pacing and debriefing.
- Transparent attribution after each turn so students can explain AUM changes.

## MVP Scope

In scope:

- Student dashboard.
- Instructor class management.
- Deterministic month advancement.
- Tax drag and crowded-trade liquidity penalties.
- Realtime refresh after turn completion.

Out of scope for MVP:

- Live stock APIs.
- Individual ticker selection.
- Short selling.
- Leverage.
- Instructor scenario builder.
