'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { RealtimeRefreshPanelConfig } from './realtime-refresh-plan';
import { parseSupabaseRealtimeRefreshPayload } from './infrastructure/realtime/supabase-subscription';

type RealtimeRefreshPanelProps = Readonly<{
  config: RealtimeRefreshPanelConfig;
  viewerRole: 'student' | 'instructor';
}>;

type SubscriptionStatus =
  | { kind: 'configuration_missing'; label: string; detail: string }
  | { kind: 'subscribing'; label: string; detail: string }
  | { kind: 'subscribed'; label: string; detail: string }
  | { kind: 'refreshing'; label: string; detail: string }
  | { kind: 'rejected'; label: string; detail: string }
  | { kind: 'provider_error'; label: string; detail: string };

export function RealtimeRefreshPanel({ config, viewerRole }: RealtimeRefreshPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<SubscriptionStatus>(() =>
    config.browserEnv
      ? {
          kind: 'subscribing',
          label: 'Connecting',
          detail: 'Supabase Realtime browser configuration is present; waiting for a channel acknowledgement.',
        }
      : {
          kind: 'configuration_missing',
          label: 'Safe fallback',
          detail: `Browser Supabase Realtime is not configured: ${config.browserEnvFailureCode ?? 'unknown_environment_failure'}.`,
        },
  );
  const surfaceList = useMemo(() => config.refetchPlan.surfaces.join(', '), [config.refetchPlan.surfaces]);
  const serverQueryResultLabel = config.serverQueryResult.kind === 'ready' ? 'Ready' : 'Validation stopped';

  useEffect(() => {
    if (!config.browserEnv) {
      return;
    }

    const client = createClient(config.browserEnv.supabaseUrl, config.browserEnv.supabaseAnonKey);
    const channel = client
      .channel(config.refetchPlan.channelName)
      .on('broadcast', { event: config.refetchPlan.broadcastEventName }, (message: { payload: unknown }) => {
        const parsedPayload = parseSupabaseRealtimeRefreshPayload(message.payload, config.refetchPlan);

        if (!parsedPayload.ok) {
          setStatus({
            kind: 'rejected',
            label: 'Payload rejected',
            detail: `Realtime payload was ignored before refetch: ${parsedPayload.code}.`,
          });
          return;
        }

        setStatus({
          kind: 'refreshing',
          label: 'Refresh requested',
          detail: `Validated refresh-only payload for M${parsedPayload.payload.currentMonthIndex + 1}; refetching authorized server surfaces.`,
        });
        router.refresh();
      })
      .subscribe((providerStatus) => {
        if (providerStatus === 'SUBSCRIBED') {
          setStatus({
            kind: 'subscribed',
            label: 'Listening',
            detail: 'Subscribed to the class channel; valid turn-completion broadcasts will trigger an authorized route refresh.',
          });
          return;
        }

        if (providerStatus === 'CHANNEL_ERROR' || providerStatus === 'TIMED_OUT' || providerStatus === 'CLOSED') {
          setStatus({
            kind: 'provider_error',
            label: 'Provider unavailable',
            detail: `Supabase Realtime channel status: ${providerStatus}.`,
          });
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [config.browserEnv, config.refetchPlan, router]);

  return (
    <article className="terminal-panel wide">
      <div className="panel-heading">
        <span className="eyebrow">Realtime refresh subscription</span>
        <strong>{status.label}</strong>
      </div>
      <p>
        This {viewerRole} browser listens for refresh-only month-advance broadcasts and calls an authorized route refresh instead of
        accepting gameplay data from Realtime.
      </p>
      <dl className="metric-grid compact">
        <MetricTile label="Channel" value={config.refetchPlan.channelName} />
        <MetricTile label="Event" value={config.refetchPlan.broadcastEventName} />
        <MetricTile label="Current month" value={`M${config.refetchPlan.currentMonthIndex + 1}`} />
        <MetricTile label="Processed month" value={`M${config.refetchPlan.processedMonthIndex + 1}`} />
        <MetricTile label="Authorization" value={config.refetchPlan.requiredAuthorization} />
        <MetricTile label="Query descriptor" value={config.queryDescriptorKey} />
        <MetricTile label="Server query result" value={serverQueryResultLabel} />
      </dl>
      <p className={status.kind === 'provider_error' || status.kind === 'rejected' ? 'route-banner danger' : 'route-banner'}>{status.detail}</p>
      <p className={config.serverQueryResult.kind === 'ready' ? 'route-banner' : 'route-banner danger'}>
        {config.serverQueryResult.detail} Result key: {config.serverQueryResult.queryResultKey}.
      </p>
      <p className="route-banner">
        Refetch surfaces: {surfaceList}. Realtime payload parsing rejects cross-class, stale-month, wrong-idempotency, and non-refresh
        broadcasts before any router refresh.
      </p>
    </article>
  );
}

function MetricTile({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="metric-tile">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
