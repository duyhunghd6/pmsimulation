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

The MVP pure-domain student dashboard current-turn snapshot composes the safe current macro news, Driver/String metrics, portfolio pyramid, TARA order-entry, and leaderboard-rank section payloads for one already-scoped viewer fund before UI, server queries, authorization enforcement, persistence, or database code exists.

The MVP pure-domain student post-turn dashboard snapshot composes the viewer fund attribution report and leaderboard-rank section payloads for one already-scoped viewer fund and processed class month before UI, server queries, authorization enforcement, persistence, or database code exists.

### Macro News Terminal

Shows the current month's headline, macro regime, market-string dashboard, and scenario-driver metrics relevant to the current turn. It may show past data already revealed to the student, but it must not expose future scenario or metric rows.

The MVP pure-domain scenario catalog provides deterministic current/past reveal-window rows from the 12-month MVP calendar for this surface before UI, server queries, persistence, or seed scripts exist.

### Pyramid Visualizer

Shows the student's current allocation across Base, Core, and Apex tiers. It should highlight dangerous portfolio drift from intended structure by comparing current weights against intended weights using an accepted drift threshold.

### TARA Order Entry

Students adjust target allocations with interactive controls. The submission must require total allocation to equal exactly `100.0%`.

The UI should preview estimated tax drag before submission.

The MVP pure-domain student TARA order-entry snapshot composes the viewer fund's current allocation, target allocation, pending draft status, rebalance trigger, and tax-drag preview without other-fund, classroom order, persistence, UI, auth, or database payloads.

The MVP pure-domain TARA risk register evidence snapshot captures the fund-month risk evidence and selected treatment action that future TARA surfaces can present or collect after UI and rubric workflows exist.

### Attribution Report

After turn processing, students receive a breakdown explaining why AUM changed.

Required attribution categories include market beta impact, fee drag, tax penalties, tax drag, PvP slippage, liquidity penalty, classroom sell concentration, and ending AUM.

The MVP pure-domain student attribution report snapshot emits these categories for one already-scoped viewer fund ledger draft and excludes target weights, order details, tax-drag previews, liquidity tier impacts, other fund details, and class aggregate payloads. The MVP pure-domain student post-turn dashboard snapshot composes that report with the permitted leaderboard-rank view without adding order, holdings, provider, or database payloads.

### Leaderboard Rank View

Shows the student's current class rank and permitted class leaderboard metrics for the already-scoped class month. The MVP pure-domain snapshot ranks by current AUM descending, Sharpe ratio descending, and fund id ascending as the final deterministic tie-breaker; marks the viewing fund; and excludes exact holdings, fund ids in row payloads, pending-order status, target weights, estimated tax drag, order details, ledger drafts, and future scenario rows.

## Instructor Dashboard

Required surfaces:

- Class creation.
- Join-link generation.
- Live leaderboard.
- Pending-order visibility.
- God Mode portfolio visibility.
- Class-wide aggregate analytics.
- Manual fast-forward control for live mode on manually paced classes.

The MVP pure-domain instructor dashboard current-turn snapshot composes pending-order visibility, live leaderboard, God Mode portfolio visibility, class aggregate analytics, and live month-advance control payloads for one already-scoped instructor class before UI, server queries, authorization enforcement, persistence, database code, provider clients, or platform code exists.

### Live Leaderboard

Shows ranked class fund rows with student fund identity, current AUM, Sharpe ratio, and pending-order status. The MVP pure-domain snapshot ranks by current AUM descending, Sharpe ratio descending, and fund id ascending as the final deterministic tie-breaker; it does not expose holdings, target weights, estimated tax drag, or other order detail payloads.

### Pending-Order Visibility

Shows which enrolled class funds have pending current-month TARA orders and which funds are still missing submissions. The MVP pure-domain snapshot is status-only and does not expose target weights, estimated tax drag, or other order detail payloads.

### God Mode Portfolio Visibility

Shows exact current Base/Core/Apex allocation weights for all funds in an instructor-scoped class month, alongside fund identity, current AUM, Sharpe ratio, and pending-order status. The MVP pure-domain snapshot is instructor-only portfolio visibility and excludes target weights, estimated tax drag, order detail payloads, and ledger drafts.

### Class Aggregate Analytics

Shows class-level fund count, total AUM, average AUM, average Sharpe ratio, pending-order count, missing-order count, pending-order AUM, and missing-order AUM for an instructor-scoped class month. The MVP pure-domain snapshot excludes per-fund rows, holdings, target weights, estimated tax drag, and other order detail payloads.

### Manual Fast-Forward Control

Shows whether an instructor-scoped class can currently use the live Fast-Forward Month action. The MVP pure-domain snapshot enables the control only for manual classes before the final simulation month, returns the next month and request idempotency key when enabled, and excludes fund, ledger, worker, realtime, UI, persistence, and authorization payloads.

## Realtime Refresh

After the engine completes monthly processing, connected student screens must refresh to the new month without requiring manual reload.

The MVP pure-domain turn-completion event carries only class-level processing metadata and aggregate totals for the future refresh signal; exact per-fund ledger drafts stay out of the class-level realtime payload.

The MVP pure-domain refresh signal derived from that event carries only class/month refresh metadata and dedupe keys so future clients refetch authorized current-month surfaces instead of receiving gameplay data directly through the refresh trigger.

The MVP pure-domain publication envelope wraps that refresh signal with provider-neutral class-channel, event, audience, and refresh-only delivery metadata before Supabase Realtime publication, subscriptions, auth, or client refetch code exists.

The MVP pure-domain Supabase Realtime publication descriptor maps the provider-neutral envelope into a typed broadcast boundary contract while preserving refresh-only payload semantics before provider clients, subscriptions, auth, or client refetch code exists.

The MVP pure-domain Supabase Realtime subscription descriptor maps that broadcast descriptor into a future client subscription boundary contract that instructs clients to refetch authorized current-turn surfaces without carrying gameplay data in the realtime payload.

The MVP pure-domain realtime authorized current-turn refetch descriptor maps that subscription descriptor into a future client refetch plan for authorized student and instructor current-turn surfaces without executing UI refetches or carrying gameplay data in the realtime payload.

Future implementation should use Supabase Realtime or the accepted realtime provider in `docs/product/runtime-architecture.md`.
