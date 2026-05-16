# User Surfaces

## Student Dashboard

The student dashboard is a responsive desktop-first terminal-style interface.

Required surfaces:

- Macro news terminal.
- Current macro, market-string, and scenario-driver metrics.
- Pyramid/funnel portfolio visualizer.
- TARA order entry.
- Estimated tax drag preview.
- Post-turn attribution report.
- Leaderboard rank view.

### Macro News Terminal

Shows the current month's headline, macro regime, market-string dashboard, and scenario-driver metrics relevant to the current turn. It may show past data already revealed to the student, but it must not expose future scenario or metric rows.

### Pyramid Visualizer

Shows the student's current allocation across Base, Core, and Apex tiers. It should highlight dangerous portfolio drift from intended structure.

### TARA Order Entry

Students adjust target allocations with interactive controls. The submission must require total allocation to equal exactly `100.0%`.

The UI should preview estimated tax drag before submission.

### Attribution Report

After turn processing, students receive a breakdown explaining why AUM changed.

Required attribution categories include market beta impact, fee drag, tax penalties, tax drag, PvP slippage, liquidity penalty, classroom sell concentration, and ending AUM.

## Instructor Dashboard

Required surfaces:

- Class creation.
- Join-link generation.
- Live leaderboard.
- Pending-order visibility.
- God Mode portfolio visibility.
- Class-wide aggregate analytics.
- Manual fast-forward control for live mode.

## Realtime Refresh

After the engine completes monthly processing, connected student screens must refresh to the new month without requiring manual reload.

Future implementation should use Supabase Realtime or the accepted realtime provider in `docs/product/runtime-architecture.md`.
