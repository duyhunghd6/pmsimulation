import { describe, expect, it } from 'vitest';

import {
  createMonthAdvanceRealtimePublicationEnvelope,
  createMonthAdvanceRealtimeRefreshSignal,
  createSupabaseRealtimePublicationDescriptor,
  type SupabaseRealtimePublicationDescriptor,
} from '../../domain/classes/month-advancement';
import {
  createSupabaseRealtimeBroadcastMessage,
  publishSupabaseRealtimeRefresh,
  type SupabaseRealtimeBroadcastMessage,
} from './supabase-publication';

function createDescriptor(): SupabaseRealtimePublicationDescriptor {
  const signal = createMonthAdvanceRealtimeRefreshSignal({
    eventType: 'month_advance_completed',
    turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
    classId: 'class-001',
    triggerMode: 'manual',
    triggerSource: 'live',
    processedMonthIndex: 3,
    advancedToMonthIndex: 4,
    totalMonths: 12,
    idempotencyKey: 'class:class-001:advance:3->4',
    processingPath: 'shared_month_advance',
    processedFundCount: 2,
    totalStartingAum: 100_000_000,
    totalMarketBetaImpact: 3_000_000,
    totalFeeDrag: 500_000,
    totalTaxPaid: 600_000,
    totalPvpSlippagePaid: 400_000,
    totalEndingAum: 101_500_000,
  });

  return createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal));
}

describe('createSupabaseRealtimeBroadcastMessage', () => {
  it('maps the accepted descriptor to a Supabase broadcast message', () => {
    const descriptor = createDescriptor();

    expect(createSupabaseRealtimeBroadcastMessage(descriptor)).toEqual({
      type: 'broadcast',
      event: 'month_advance_refresh_available',
      payload: descriptor.payload,
    });
  });
});

describe('publishSupabaseRealtimeRefresh', () => {
  it('publishes the refresh-only descriptor through the requested Supabase channel', async () => {
    const descriptor = createDescriptor();
    const channelNames: string[] = [];
    const sentMessages: SupabaseRealtimeBroadcastMessage[] = [];

    const result = await publishSupabaseRealtimeRefresh({
      descriptor,
      client: {
        channel(channelName) {
          channelNames.push(channelName);
          return {
            async send(message) {
              sentMessages.push(message);
              return 'ok';
            },
          };
        },
      },
    });

    expect(channelNames).toEqual(['class:class-001:month-advance']);
    expect(sentMessages).toEqual([createSupabaseRealtimeBroadcastMessage(descriptor)]);
    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'supabase_realtime_publication_result',
        resultKey: 'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:publication-result',
        publicationKey: 'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime',
        providerBoundary: 'supabase_realtime_publication_boundary',
        channelName: 'class:class-001:month-advance',
        broadcastEventName: 'month_advance_refresh_available',
        audience: 'class_participants',
        deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
        publicationStatus: 'published',
        providerAck: 'ok',
        payload: descriptor.payload,
      },
    });
  });

  it('keeps publication results free of gameplay data and provider clients', async () => {
    const descriptor = createDescriptor();
    const result = await publishSupabaseRealtimeRefresh({
      descriptor,
      client: {
        channel() {
          return {
            async send() {
              return 'ok';
            },
          };
        },
      },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.deliverySemantics).toBe('refresh_only_refetch_authorized_surfaces');
    expect('ledgerDrafts' in result.value.payload).toBe(false);
    expect('fundProcessingKeys' in result.value.payload).toBe(false);
    expect('totalEndingAum' in result.value.payload).toBe(false);
    expect('queryResult' in result.value).toBe(false);
    expect('serverQueryResults' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
  });

  it('returns a safe failure envelope for Supabase timeout and error acknowledgements', async () => {
    const descriptor = createDescriptor();
    const timedOutResult = await publishSupabaseRealtimeRefresh({
      descriptor,
      client: {
        channel() {
          return {
            async send() {
              return 'timed out';
            },
          };
        },
      },
    });
    const errorResult = await publishSupabaseRealtimeRefresh({
      descriptor,
      client: {
        channel() {
          return {
            async send() {
              return 'error';
            },
          };
        },
      },
    });

    expect(timedOutResult).toEqual({
      ok: false,
      failure: expect.objectContaining({
        envelopeType: 'supabase_realtime_publication_failure',
        publicationStatus: 'publication_failed',
        failureCode: 'provider_timed_out',
        providerAck: 'timed out',
        payload: descriptor.payload,
      }),
    });
    expect(errorResult).toEqual({
      ok: false,
      failure: expect.objectContaining({
        envelopeType: 'supabase_realtime_publication_failure',
        publicationStatus: 'publication_failed',
        failureCode: 'provider_error',
        providerAck: 'error',
        payload: descriptor.payload,
      }),
    });
  });

  it('returns a safe failure envelope for invalid or thrown provider acknowledgements', async () => {
    const descriptor = createDescriptor();
    const invalidResult = await publishSupabaseRealtimeRefresh({
      descriptor,
      client: {
        channel() {
          return {
            async send() {
              return { status: 'unexpected' };
            },
          };
        },
      },
    });
    const thrownResult = await publishSupabaseRealtimeRefresh({
      descriptor,
      client: {
        channel() {
          return {
            async send() {
              throw new Error('provider secret should not be returned');
            },
          };
        },
      },
    });

    expect(invalidResult).toEqual({
      ok: false,
      failure: expect.objectContaining({
        failureCode: 'invalid_provider_ack',
        providerAck: null,
      }),
    });
    expect(thrownResult).toEqual({
      ok: false,
      failure: expect.objectContaining({
        failureCode: 'invalid_provider_ack',
        providerAck: null,
      }),
    });
    if (!thrownResult.ok) {
      expect('providerError' in thrownResult.failure).toBe(false);
      expect('errorMessage' in thrownResult.failure).toBe(false);
    }
  });
});
