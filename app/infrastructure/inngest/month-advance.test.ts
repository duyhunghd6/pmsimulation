import { describe, expect, it } from 'vitest';

import {
  createMonthAdvanceInngestEvent,
  createMonthAdvanceWorkerJobResultFromInngestEventData,
  executeAutoMonthAdvanceInngestHandoff,
  executeLiveMonthAdvanceInngestHandoff,
  executeMonthAdvanceClassMonthProcessingFromInngestEventData,
  executeMonthAdvanceInngestHandoff,
  MONTH_ADVANCE_REQUESTED_EVENT,
  type MonthAdvanceInngestEvent,
} from './month-advance';

const defaultProcessingRequest = {
  classId: 'class-001',
  triggerMode: 'manual' as const,
  triggerSource: 'live' as const,
  currentMonthIndex: 3,
  nextMonthIndex: 4,
  totalMonths: 12,
  idempotencyKey: 'class:class-001:advance:3->4',
  processingPath: 'shared_month_advance' as const,
};

const defaultFundInput = {
  fundId: 'fund-001',
  currentAum: 50_000_000,
  grossMarketReturnPct: 4,
  feeDragPct: 0.5,
  currentWeights: {
    Base: 20,
    Core: 40,
    Apex: 40,
  },
  targetWeights: {
    Base: 30,
    Core: 50,
    Apex: 20,
  },
  apexUnrealizedGainPct: 25,
  classroomSellConcentrationPct: {
    Base: 10,
    Core: 10,
    Apex: 65,
  },
};

function createRealtimeClient(sentMessages: unknown[], ack: 'ok' | 'timed out' | 'error' = 'ok') {
  return {
    channel(channelName: string) {
      return {
        async send(message: unknown) {
          sentMessages.push({ channelName, message });
          return ack;
        },
      };
    },
  };
}

describe('createMonthAdvanceInngestEvent', () => {
  it('maps a shared processing request to the Inngest month-advance event', () => {
    expect(createMonthAdvanceInngestEvent(defaultProcessingRequest)).toEqual({
      id: 'class:class-001:advance:3->4',
      name: MONTH_ADVANCE_REQUESTED_EVENT,
      data: {
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
        processingPath: 'shared_month_advance',
      },
    });
  });

  it('keeps the event payload free of fund, ledger, and realtime payloads', () => {
    const event = createMonthAdvanceInngestEvent(defaultProcessingRequest);

    expect('fundInputs' in event.data).toBe(false);
    expect('ledgerDrafts' in event.data).toBe(false);
    expect('databaseRows' in event.data).toBe(false);
    expect('realtimePayload' in event.data).toBe(false);
  });
});

describe('executeMonthAdvanceInngestHandoff', () => {
  it('sends the bounded Inngest event and returns the existing worker-safe receipt envelope', async () => {
    const sentEvents: MonthAdvanceInngestEvent[] = [];
    const result = await executeMonthAdvanceInngestHandoff({
      processingRequest: defaultProcessingRequest,
      sender: {
        async send(event) {
          sentEvents.push(event);
        },
      },
    });

    expect(sentEvents).toEqual([createMonthAdvanceInngestEvent(defaultProcessingRequest)]);
    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'month_advance_worker_job_result',
        resultKey: 'class:class-001:advance:3->4:worker-job:result-envelope',
        workerJobKey: 'class:class-001:advance:3->4:worker-job',
        workerBoundary: 'worker_job_result_boundary',
        jobType: 'month_advance_processing',
        classId: 'class-001',
        idempotencyKey: 'class:class-001:advance:3->4',
        resultStatus: 'accepted_month_advance_worker_job',
        processingPath: 'shared_month_advance',
        deliverySemantics: 'worker_safe_month_advance_job_receipt',
        receipt: {
          receiptType: 'month_advance_worker_job_receipt',
          workerJobKey: 'class:class-001:advance:3->4:worker-job',
          classId: 'class-001',
          triggerMode: 'manual',
          triggerSource: 'live',
          currentMonthIndex: 3,
          nextMonthIndex: 4,
          totalMonths: 12,
          idempotencyKey: 'class:class-001:advance:3->4',
          processingPath: 'shared_month_advance',
          queueDiscipline: 'class_month_idempotent',
        },
      },
    });
  });

  it('preserves auto scheduled-trigger metadata on the same worker event path', async () => {
    const autoProcessingRequest = {
      ...defaultProcessingRequest,
      triggerMode: 'auto' as const,
      triggerSource: 'auto' as const,
    };
    const sentEvents: MonthAdvanceInngestEvent[] = [];
    const result = await executeMonthAdvanceInngestHandoff({
      processingRequest: autoProcessingRequest,
      sender: {
        async send(event) {
          sentEvents.push(event);
        },
      },
    });

    expect(sentEvents[0]).toEqual(
      expect.objectContaining({
        name: MONTH_ADVANCE_REQUESTED_EVENT,
        data: expect.objectContaining({
          triggerMode: 'auto',
          triggerSource: 'auto',
          processingPath: 'shared_month_advance',
        }),
      }),
    );
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.receipt).toEqual(
        expect.objectContaining({
          triggerMode: 'auto',
          triggerSource: 'auto',
          queueDiscipline: 'class_month_idempotent',
        }),
      );
    }
  });
});

describe('executeLiveMonthAdvanceInngestHandoff', () => {
  it('converges the instructor live server action request onto the shared worker event path', async () => {
    const sentEvents: MonthAdvanceInngestEvent[] = [];
    const result = await executeLiveMonthAdvanceInngestHandoff({
      request: {
        classId: 'class-001',
        instructorId: 'instructor-001',
        triggerMode: 'manual',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      },
      sender: {
        async send(event) {
          sentEvents.push(event);
        },
      },
    });

    expect(sentEvents).toEqual([createMonthAdvanceInngestEvent(defaultProcessingRequest)]);
    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          resultStatus: 'accepted_month_advance_worker_job',
          deliverySemantics: 'worker_safe_month_advance_job_receipt',
          receipt: expect.objectContaining({
            triggerMode: 'manual',
            triggerSource: 'live',
            queueDiscipline: 'class_month_idempotent',
          }),
        }),
      }),
    );
  });
});

describe('executeAutoMonthAdvanceInngestHandoff', () => {
  it('converges a scheduled auto trigger request onto the shared worker event path', async () => {
    const sentEvents: MonthAdvanceInngestEvent[] = [];
    const result = await executeAutoMonthAdvanceInngestHandoff({
      request: {
        classId: 'class-001',
        triggerMode: 'auto',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      },
      sender: {
        async send(event) {
          sentEvents.push(event);
        },
      },
    });

    expect(sentEvents).toEqual([
      createMonthAdvanceInngestEvent({
        ...defaultProcessingRequest,
        triggerMode: 'auto',
        triggerSource: 'auto',
      }),
    ]);
    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        value: expect.objectContaining({
          resultStatus: 'accepted_month_advance_worker_job',
          deliverySemantics: 'worker_safe_month_advance_job_receipt',
          receipt: expect.objectContaining({
            triggerMode: 'auto',
            triggerSource: 'auto',
            queueDiscipline: 'class_month_idempotent',
          }),
        }),
      }),
    );
  });
});

describe('executeMonthAdvanceClassMonthProcessingFromInngestEventData', () => {
  it('processes injected class fund inputs, persists ledger drafts, and publishes a refresh signal without returning drafts', async () => {
    const persistedRecords: unknown[] = [];
    const sentRealtimeMessages: unknown[] = [];
    const result = await executeMonthAdvanceClassMonthProcessingFromInngestEventData({
      data: createMonthAdvanceInngestEvent(defaultProcessingRequest).data,
      reader: {
        async readFundInputs(request) {
          expect(request).toEqual(defaultProcessingRequest);
          return [defaultFundInput];
        },
      },
      writer: {
        async writeClassMonthProcessingResult(record) {
          persistedRecords.push(record);
          return {
            receiptType: 'class_month_processing_persistence_receipt',
            classMonthWriteKey: `${record.idempotencyKey}:class-month-write`,
            ledgerWriteCount: record.ledgerDrafts.length,
            processedMonthIndex: record.processedMonthIndex,
            advancedToMonthIndex: record.advancedToMonthIndex,
          };
        },
      },
      realtimeClient: createRealtimeClient(sentRealtimeMessages),
    });

    expect(persistedRecords).toHaveLength(1);
    expect(result).toEqual({
      ok: true,
      value: {
        resultStatus: 'completed_class_month_processing',
        processingPath: 'shared_month_advance',
        event: expect.objectContaining({
          eventType: 'month_advance_completed',
          classId: 'class-001',
          processedFundCount: 1,
          processedMonthIndex: 3,
          advancedToMonthIndex: 4,
          idempotencyKey: 'class:class-001:advance:3->4',
        }),
        persistence: {
          receiptType: 'class_month_processing_persistence_receipt',
          classMonthWriteKey: 'class:class-001:advance:3->4:class-month-write',
          ledgerWriteCount: 1,
          processedMonthIndex: 3,
          advancedToMonthIndex: 4,
        },
        realtimePublication: {
          ok: true,
          value: expect.objectContaining({
            envelopeType: 'supabase_realtime_publication_result',
            channelName: 'class:class-001:month-advance',
            broadcastEventName: 'month_advance_refresh_available',
            deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
            payload: expect.objectContaining({
              signalType: 'month_advance_refresh_available',
              classId: 'class-001',
              processedMonthIndex: 3,
              currentMonthIndex: 4,
              idempotencyKey: 'class:class-001:advance:3->4',
            }),
          }),
        },
      },
    });
    expect(sentRealtimeMessages).toEqual([
      {
        channelName: 'class:class-001:month-advance',
        message: {
          type: 'broadcast',
          event: 'month_advance_refresh_available',
          payload: expect.objectContaining({
            signalType: 'month_advance_refresh_available',
            classId: 'class-001',
            currentMonthIndex: 4,
            idempotencyKey: 'class:class-001:advance:3->4',
          }),
        },
      },
    ]);

    if (result.ok) {
      expect('ledgerDrafts' in result.value).toBe(false);
      expect('fundInputs' in result.value).toBe(false);
      expect('databaseRows' in result.value).toBe(false);
      expect('providerPayload' in result.value).toBe(false);
    }
  });

  it('returns a safe publication failure without exposing provider details when realtime send fails', async () => {
    const result = await executeMonthAdvanceClassMonthProcessingFromInngestEventData({
      data: createMonthAdvanceInngestEvent(defaultProcessingRequest).data,
      reader: {
        async readFundInputs() {
          return [defaultFundInput];
        },
      },
      writer: {
        async writeClassMonthProcessingResult(record) {
          return {
            receiptType: 'class_month_processing_persistence_receipt',
            classMonthWriteKey: `${record.idempotencyKey}:class-month-write`,
            ledgerWriteCount: record.ledgerDrafts.length,
            processedMonthIndex: record.processedMonthIndex,
            advancedToMonthIndex: record.advancedToMonthIndex,
          };
        },
      },
      realtimeClient: createRealtimeClient([], 'error'),
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        resultStatus: 'completed_class_month_processing',
        realtimePublication: {
          ok: false,
          failure: expect.objectContaining({
            envelopeType: 'supabase_realtime_publication_failure',
            failureCode: 'provider_error',
            providerAck: 'error',
            deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
          }),
        },
      }),
    });

    if (result.ok) {
      expect('providerError' in result.value.realtimePublication).toBe(false);
      expect('providerClient' in result.value.realtimePublication).toBe(false);
      expect('ledgerDrafts' in result.value.realtimePublication).toBe(false);
    }
  });

  it('returns class-month-safe validation failure without persisting invalid fund inputs or publishing realtime', async () => {
    let writerCalled = false;
    const sentRealtimeMessages: unknown[] = [];
    const result = await executeMonthAdvanceClassMonthProcessingFromInngestEventData({
      data: createMonthAdvanceInngestEvent(defaultProcessingRequest).data,
      reader: {
        async readFundInputs() {
          return [{ ...defaultFundInput, fundId: '', currentAum: Number.NaN }];
        },
      },
      writer: {
        async writeClassMonthProcessingResult(record) {
          writerCalled = true;
          return {
            receiptType: 'class_month_processing_persistence_receipt',
            classMonthWriteKey: `${record.idempotencyKey}:class-month-write`,
            ledgerWriteCount: record.ledgerDrafts.length,
            processedMonthIndex: record.processedMonthIndex,
            advancedToMonthIndex: record.advancedToMonthIndex,
          };
        },
      },
      realtimeClient: createRealtimeClient(sentRealtimeMessages),
    });

    expect(writerCalled).toBe(false);
    expect(sentRealtimeMessages).toEqual([]);
    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({
        envelopeType: 'class_month_advance_processing_validation_failure',
        deliverySemantics: 'class_month_processing_safe_validation_errors',
        validationErrors: expect.arrayContaining([
          expect.objectContaining({ code: 'invalid_fund_processing' }),
        ]),
      }),
    });
  });
});

describe('createMonthAdvanceWorkerJobResultFromInngestEventData', () => {
  it('parses event data before returning a worker-safe result envelope', () => {
    const result = createMonthAdvanceWorkerJobResultFromInngestEventData(createMonthAdvanceInngestEvent(defaultProcessingRequest).data);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.receipt.workerJobKey).toBe('class:class-001:advance:3->4:worker-job');
      expect('fundInputs' in result.value).toBe(false);
      expect('ledgerDrafts' in result.value).toBe(false);
      expect('processingResult' in result.value).toBe(false);
      expect('realtimePayload' in result.value).toBe(false);
    }
  });

  it('rejects malformed event data through the shared processing validation envelope', () => {
    const result = createMonthAdvanceWorkerJobResultFromInngestEventData({
      classId: 'class-001',
      triggerMode: 'manual',
      triggerSource: 'auto',
      currentMonthIndex: 3,
      nextMonthIndex: 6,
      totalMonths: 12,
      idempotencyKey: 'wrong-key',
    });

    expect(result).toEqual({
      ok: false,
      failure: expect.objectContaining({
        envelopeType: 'shared_month_advance_processing_validation_failure',
        deliverySemantics: 'shared_processing_safe_validation_errors',
        validationErrors: expect.arrayContaining([
          expect.objectContaining({ code: 'invalid_trigger_mode' }),
          expect.objectContaining({ code: 'invalid_next_month_index' }),
          expect.objectContaining({ code: 'invalid_idempotency_key' }),
        ]),
      }),
    });
  });
});
