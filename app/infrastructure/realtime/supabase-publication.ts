import {
  type MonthAdvanceRealtimeRefreshSignal,
  type SupabaseRealtimePublicationDescriptor,
} from '../../domain/classes/month-advancement';

export type SupabaseRealtimeBroadcastMessage = {
  type: 'broadcast';
  event: SupabaseRealtimePublicationDescriptor['broadcastEventName'];
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type SupabaseRealtimeChannel = {
  send(message: SupabaseRealtimeBroadcastMessage): Promise<unknown>;
};

export type SupabaseRealtimeClient = {
  channel(channelName: string): SupabaseRealtimeChannel;
};

export type SupabaseRealtimePublicationAck = 'ok' | 'timed out' | 'error';

export type SupabaseRealtimePublicationResultEnvelope = {
  envelopeType: 'supabase_realtime_publication_result';
  resultKey: string;
  publicationKey: string;
  providerBoundary: 'supabase_realtime_publication_boundary';
  channelName: string;
  broadcastEventName: SupabaseRealtimePublicationDescriptor['broadcastEventName'];
  audience: 'class_participants';
  deliverySemantics: 'refresh_only_refetch_authorized_surfaces';
  publicationStatus: 'published';
  providerAck: Extract<SupabaseRealtimePublicationAck, 'ok'>;
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type SupabaseRealtimePublicationFailureCode = 'provider_error' | 'provider_timed_out' | 'invalid_provider_ack';

export type SupabaseRealtimePublicationFailureEnvelope = {
  envelopeType: 'supabase_realtime_publication_failure';
  resultKey: string;
  publicationKey: string;
  providerBoundary: 'supabase_realtime_publication_boundary';
  channelName: string;
  broadcastEventName: SupabaseRealtimePublicationDescriptor['broadcastEventName'];
  audience: 'class_participants';
  deliverySemantics: 'refresh_only_refetch_authorized_surfaces';
  publicationStatus: 'publication_failed';
  failureCode: SupabaseRealtimePublicationFailureCode;
  providerAck: Exclude<SupabaseRealtimePublicationAck, 'ok'> | null;
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type SupabaseRealtimePublicationResult =
  | { ok: true; value: SupabaseRealtimePublicationResultEnvelope }
  | { ok: false; failure: SupabaseRealtimePublicationFailureEnvelope };

export function createSupabaseRealtimeBroadcastMessage(
  descriptor: SupabaseRealtimePublicationDescriptor,
): SupabaseRealtimeBroadcastMessage {
  return {
    type: 'broadcast',
    event: descriptor.broadcastEventName,
    payload: descriptor.payload,
  };
}

export async function publishSupabaseRealtimeRefresh(input: {
  descriptor: SupabaseRealtimePublicationDescriptor;
  client: SupabaseRealtimeClient;
}): Promise<SupabaseRealtimePublicationResult> {
  const channel = input.client.channel(input.descriptor.channelName);

  let ack: unknown;
  try {
    ack = await channel.send(createSupabaseRealtimeBroadcastMessage(input.descriptor));
  } catch {
    return { ok: false, failure: createFailureEnvelope(input.descriptor, 'invalid_provider_ack', null) };
  }

  if (ack === 'ok') {
    return { ok: true, value: createResultEnvelope(input.descriptor) };
  }
  if (ack === 'timed out') {
    return { ok: false, failure: createFailureEnvelope(input.descriptor, 'provider_timed_out', ack) };
  }
  if (ack === 'error') {
    return { ok: false, failure: createFailureEnvelope(input.descriptor, 'provider_error', ack) };
  }

  return { ok: false, failure: createFailureEnvelope(input.descriptor, 'invalid_provider_ack', null) };
}

function createResultEnvelope(
  descriptor: SupabaseRealtimePublicationDescriptor,
): SupabaseRealtimePublicationResultEnvelope {
  return {
    envelopeType: 'supabase_realtime_publication_result',
    resultKey: `${descriptor.publicationKey}:publication-result`,
    publicationKey: descriptor.publicationKey,
    providerBoundary: 'supabase_realtime_publication_boundary',
    channelName: descriptor.channelName,
    broadcastEventName: descriptor.broadcastEventName,
    audience: descriptor.audience,
    deliverySemantics: descriptor.deliverySemantics,
    publicationStatus: 'published',
    providerAck: 'ok',
    payload: descriptor.payload,
  };
}

function createFailureEnvelope(
  descriptor: SupabaseRealtimePublicationDescriptor,
  failureCode: SupabaseRealtimePublicationFailureCode,
  providerAck: SupabaseRealtimePublicationFailureEnvelope['providerAck'],
): SupabaseRealtimePublicationFailureEnvelope {
  return {
    envelopeType: 'supabase_realtime_publication_failure',
    resultKey: `${descriptor.publicationKey}:publication-failure`,
    publicationKey: descriptor.publicationKey,
    providerBoundary: 'supabase_realtime_publication_boundary',
    channelName: descriptor.channelName,
    broadcastEventName: descriptor.broadcastEventName,
    audience: descriptor.audience,
    deliverySemantics: descriptor.deliverySemantics,
    publicationStatus: 'publication_failed',
    failureCode,
    providerAck,
    payload: descriptor.payload,
  };
}
