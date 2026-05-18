import { describe, expect, it } from 'vitest';

import {
  createAutoMonthAdvanceRequest,
  createAutoMonthAdvanceScheduledTriggerDescriptor,
  createAutoMonthAdvanceScheduledTriggerResultEnvelope,
  createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope,
  createClassMonthAdvanceProcessingResult,
  createClassMonthAdvanceProcessingValidationFailureEnvelope,
  createInstructorLiveMonthAdvanceControlSnapshot,
  createInstructorLiveMonthAdvanceRequest,
  createInstructorLiveMonthAdvanceServerActionCommandDescriptor,
  createInstructorLiveMonthAdvanceServerActionResultEnvelope,
  createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope,
  createMonthAdvanceFundProcessingResult,
  createMonthAdvanceFundProcessingValidationFailureEnvelope,
  createMonthAdvanceRealtimePublicationEnvelope,
  createMonthAdvanceRealtimeRefreshSignal,
  createMonthAdvanceTurnCompletionEvent,
  createMonthAdvanceWorkerJob,
  createMonthAdvanceWorkerJobResultEnvelope,
  createRealtimeAuthorizedCurrentTurnQueryDescriptor,
  createSharedMonthAdvanceProcessingValidationFailureEnvelope,
  createRealtimeAuthorizedCurrentTurnRefetchPlan,
  createSharedMonthAdvanceProcessingRequest,
  createSupabaseRealtimePublicationDescriptor,
  createSupabaseRealtimeSubscriptionDescriptor,
} from './month-advancement';

const defaultInput = {
  classId: 'class-001',
  instructorId: 'instructor-001',
  triggerMode: 'manual',
  currentMonthIndex: 3,
  totalMonths: 12,
};

const defaultAutoInput = {
  classId: 'class-001',
  triggerMode: 'auto',
  currentMonthIndex: 3,
  totalMonths: 12,
};

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

const defaultFundProcessingInput = {
  processingRequest: defaultProcessingRequest,
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

function errorCodesFor(input: Parameters<typeof createInstructorLiveMonthAdvanceRequest>[0]): string[] {
  const result = createInstructorLiveMonthAdvanceRequest(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

function autoErrorCodesFor(input: Parameters<typeof createAutoMonthAdvanceRequest>[0]): string[] {
  const result = createAutoMonthAdvanceRequest(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

function controlErrorCodesFor(input: Parameters<typeof createInstructorLiveMonthAdvanceControlSnapshot>[0]): string[] {
  const result = createInstructorLiveMonthAdvanceControlSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

function processingErrorCodesFor(input: Parameters<typeof createSharedMonthAdvanceProcessingRequest>[0]): string[] {
  const result = createSharedMonthAdvanceProcessingRequest(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

function fundProcessingErrorCodesFor(input: Parameters<typeof createMonthAdvanceFundProcessingResult>[0]): string[] {
  const result = createMonthAdvanceFundProcessingResult(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

function classProcessingErrorCodesFor(input: Parameters<typeof createClassMonthAdvanceProcessingResult>[0]): string[] {
  const result = createClassMonthAdvanceProcessingResult(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorLiveMonthAdvanceControlSnapshot', () => {
  it('creates an enabled live fast-forward control for a manual class', () => {
    const result = createInstructorLiveMonthAdvanceControlSnapshot({
      classId: ' class-001 ',
      triggerMode: 'manual',
      currentMonthIndex: 3,
      totalMonths: 12,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        controlType: 'instructor_live_month_advance_control',
        classId: 'class-001',
        triggerMode: 'manual',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        canAdvance: true,
        disabledReason: null,
        requestIdempotencyKey: 'class:class-001:advance:3->4',
      },
    });
  });

  it('disables live fast-forward for auto-paced classes without creating a request key', () => {
    const result = createInstructorLiveMonthAdvanceControlSnapshot({
      classId: 'class-001',
      triggerMode: 'auto',
      currentMonthIndex: 3,
      totalMonths: 12,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        triggerMode: 'auto',
        nextMonthIndex: null,
        canAdvance: false,
        disabledReason: 'auto_mode',
        requestIdempotencyKey: null,
      }),
    });
  });

  it('disables live fast-forward when the simulation is complete', () => {
    const result = createInstructorLiveMonthAdvanceControlSnapshot({
      classId: 'class-001',
      triggerMode: 'manual',
      currentMonthIndex: 11,
      totalMonths: 12,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        currentMonthIndex: 11,
        nextMonthIndex: null,
        canAdvance: false,
        disabledReason: 'simulation_complete',
        requestIdempotencyKey: null,
      }),
    });
  });

  it('keeps the control snapshot free of fund, ledger, worker, and realtime payloads', () => {
    const result = createInstructorLiveMonthAdvanceControlSnapshot({
      classId: 'class-001',
      triggerMode: 'manual',
      currentMonthIndex: 3,
      totalMonths: 12,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect('fundInputs' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('workerJobKey' in result.value).toBe(false);
    expect('channelName' in result.value).toBe(false);
  });

  it('rejects invalid control snapshot fields', () => {
    expect(
      controlErrorCodesFor({
        classId: '   ',
        triggerMode: 'manual',
        currentMonthIndex: 3,
        totalMonths: 12,
      }),
    ).toContain('invalid_class_id');
    expect(
      controlErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'live',
        currentMonthIndex: 3,
        totalMonths: 12,
      }),
    ).toContain('invalid_trigger_mode');
    expect(
      controlErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        currentMonthIndex: 12,
        totalMonths: 12,
      }),
    ).toContain('invalid_current_month_index');
    expect(
      controlErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        currentMonthIndex: 3,
        totalMonths: 25,
      }),
    ).toContain('invalid_total_months');
  });
});

describe('createMonthAdvanceWorkerJob', () => {
  it('creates a provider-neutral worker job from a shared processing request', () => {
    const job = createMonthAdvanceWorkerJob(defaultProcessingRequest);

    expect(job).toEqual({
      jobType: 'month_advance_processing',
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
    });
    expect('fundInputs' in job).toBe(false);
    expect('ledgerDrafts' in job).toBe(false);
    expect('fundProcessingKeys' in job).toBe(false);
    expect('totalEndingAum' in job).toBe(false);
  });

  it('preserves auto trigger metadata on the same shared worker path', () => {
    const job = createMonthAdvanceWorkerJob({
      ...defaultProcessingRequest,
      triggerMode: 'auto',
      triggerSource: 'auto',
    });

    expect(job).toEqual(
      expect.objectContaining({
        jobType: 'month_advance_processing',
        workerJobKey: 'class:class-001:advance:3->4:worker-job',
        triggerMode: 'auto',
        triggerSource: 'auto',
        processingPath: 'shared_month_advance',
        queueDiscipline: 'class_month_idempotent',
      }),
    );
  });

  it('maps a worker job to a worker-safe result envelope', () => {
    const job = createMonthAdvanceWorkerJob(defaultProcessingRequest);

    expect(createMonthAdvanceWorkerJobResultEnvelope(job)).toEqual({
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
    });
  });

  it('keeps the worker job result envelope free of provider execution and gameplay payloads', () => {
    const envelope = createMonthAdvanceWorkerJobResultEnvelope(createMonthAdvanceWorkerJob(defaultProcessingRequest));

    expect(envelope.receipt.workerJobKey).toBe(envelope.workerJobKey);
    expect(envelope.receipt.processingPath).toBe(envelope.processingPath);
    expect('inngestEvent' in envelope).toBe(false);
    expect('qstashMessage' in envelope).toBe(false);
    expect('workerExecution' in envelope).toBe(false);
    expect('databaseRows' in envelope).toBe(false);
    expect('realtimePayload' in envelope).toBe(false);
    expect('fundInputs' in envelope).toBe(false);
    expect('ledgerDrafts' in envelope).toBe(false);
    expect('processingResult' in envelope).toBe(false);
    expect('ledgerDrafts' in envelope.receipt).toBe(false);
    expect('processingResult' in envelope.receipt).toBe(false);
  });
});

describe('createMonthAdvanceRealtimePublicationEnvelope', () => {
  it('wraps a refresh signal in a provider-neutral publication envelope', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const event = createMonthAdvanceTurnCompletionEvent(processingResult.value);
    const signal = createMonthAdvanceRealtimeRefreshSignal(event);
    const envelope = createMonthAdvanceRealtimePublicationEnvelope(signal);

    expect(envelope).toEqual({
      publicationType: 'realtime_refresh_publication',
      publicationKey: 'class:class-001:advance:3->4:turn-completion:refresh:publication',
      providerBoundary: 'provider_neutral',
      channelName: 'class:class-001:month-advance',
      eventName: 'month_advance_refresh_available',
      audience: 'class_participants',
      deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
      payload: signal,
    });
  });

  it('keeps realtime publication payload refresh-only without gameplay details', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const signal = createMonthAdvanceRealtimeRefreshSignal(createMonthAdvanceTurnCompletionEvent(processingResult.value));
    const envelope = createMonthAdvanceRealtimePublicationEnvelope(signal);

    expect('ledgerDrafts' in envelope).toBe(false);
    expect('fundProcessingKeys' in envelope).toBe(false);
    expect('totalEndingAum' in envelope).toBe(false);
    expect('ledgerDrafts' in envelope.payload).toBe(false);
    expect('fundProcessingKeys' in envelope.payload).toBe(false);
    expect('totalEndingAum' in envelope.payload).toBe(false);
  });

  it('preserves auto-path refresh metadata in the publication envelope', () => {
    const signal = createMonthAdvanceRealtimeRefreshSignal({
      eventType: 'month_advance_completed',
      turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
      classId: 'class-001',
      triggerMode: 'auto',
      triggerSource: 'auto',
      processedMonthIndex: 3,
      advancedToMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      processingPath: 'shared_month_advance',
      processedFundCount: 1,
      totalStartingAum: 50_000_000,
      totalMarketBetaImpact: 2_000_000,
      totalFeeDrag: 250_000,
      totalTaxPaid: 500_000,
      totalPvpSlippagePaid: 500_000,
      totalEndingAum: 50_750_000,
    });

    expect(createMonthAdvanceRealtimePublicationEnvelope(signal)).toEqual(
      expect.objectContaining({
        publicationKey: 'class:class-001:advance:3->4:turn-completion:refresh:publication',
        channelName: 'class:class-001:month-advance',
        payload: expect.objectContaining({
          currentMonthIndex: 4,
          idempotencyKey: 'class:class-001:advance:3->4',
        }),
      }),
    );
  });
});

describe('createSupabaseRealtimePublicationDescriptor', () => {
  it('creates a Supabase Realtime broadcast descriptor from the provider-neutral envelope', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const signal = createMonthAdvanceRealtimeRefreshSignal(createMonthAdvanceTurnCompletionEvent(processingResult.value));
    const envelope = createMonthAdvanceRealtimePublicationEnvelope(signal);

    expect(createSupabaseRealtimePublicationDescriptor(envelope)).toEqual({
      publicationType: 'supabase_realtime_broadcast_descriptor',
      publicationKey: 'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime',
      providerBoundary: 'supabase_realtime',
      channelName: 'class:class-001:month-advance',
      broadcastEventName: 'month_advance_refresh_available',
      audience: 'class_participants',
      deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
      payload: signal,
    });
  });

  it('keeps Supabase Realtime descriptor payload refresh-only without gameplay details', () => {
    const signal = createMonthAdvanceRealtimeRefreshSignal({
      eventType: 'month_advance_completed',
      turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
      classId: 'class-001',
      triggerMode: 'auto',
      triggerSource: 'auto',
      processedMonthIndex: 3,
      advancedToMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      processingPath: 'shared_month_advance',
      processedFundCount: 1,
      totalStartingAum: 50_000_000,
      totalMarketBetaImpact: 2_000_000,
      totalFeeDrag: 250_000,
      totalTaxPaid: 500_000,
      totalPvpSlippagePaid: 500_000,
      totalEndingAum: 50_750_000,
    });
    const descriptor = createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal));

    expect(descriptor).toEqual(
      expect.objectContaining({
        providerBoundary: 'supabase_realtime',
        broadcastEventName: 'month_advance_refresh_available',
        payload: expect.objectContaining({
          currentMonthIndex: 4,
          idempotencyKey: 'class:class-001:advance:3->4',
        }),
      }),
    );
    expect('ledgerDrafts' in descriptor).toBe(false);
    expect('fundProcessingKeys' in descriptor).toBe(false);
    expect('totalEndingAum' in descriptor).toBe(false);
    expect('ledgerDrafts' in descriptor.payload).toBe(false);
    expect('fundProcessingKeys' in descriptor.payload).toBe(false);
    expect('totalEndingAum' in descriptor.payload).toBe(false);
  });
});

describe('createSupabaseRealtimeSubscriptionDescriptor', () => {
  it('creates a Supabase Realtime subscription descriptor from the publication descriptor', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const signal = createMonthAdvanceRealtimeRefreshSignal(createMonthAdvanceTurnCompletionEvent(processingResult.value));
    const publication = createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal));

    expect(createSupabaseRealtimeSubscriptionDescriptor(publication)).toEqual({
      subscriptionType: 'supabase_realtime_subscription_descriptor',
      subscriptionKey: 'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription',
      providerBoundary: 'supabase_realtime',
      channelName: 'class:class-001:month-advance',
      broadcastEventName: 'month_advance_refresh_available',
      audience: 'class_participants',
      deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
      clientAction: 'refetch_authorized_current_turn_surfaces',
      payload: signal,
    });
  });

  it('keeps subscription payload refresh-only without gameplay details', () => {
    const signal = createMonthAdvanceRealtimeRefreshSignal({
      eventType: 'month_advance_completed',
      turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
      classId: 'class-001',
      triggerMode: 'auto',
      triggerSource: 'auto',
      processedMonthIndex: 3,
      advancedToMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      processingPath: 'shared_month_advance',
      processedFundCount: 1,
      totalStartingAum: 50_000_000,
      totalMarketBetaImpact: 2_000_000,
      totalFeeDrag: 250_000,
      totalTaxPaid: 500_000,
      totalPvpSlippagePaid: 500_000,
      totalEndingAum: 50_750_000,
    });
    const descriptor = createSupabaseRealtimeSubscriptionDescriptor(
      createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
    );

    expect(descriptor).toEqual(
      expect.objectContaining({
        clientAction: 'refetch_authorized_current_turn_surfaces',
        payload: expect.objectContaining({
          currentMonthIndex: 4,
          idempotencyKey: 'class:class-001:advance:3->4',
        }),
      }),
    );
    expect('ledgerDrafts' in descriptor).toBe(false);
    expect('fundProcessingKeys' in descriptor).toBe(false);
    expect('totalEndingAum' in descriptor).toBe(false);
    expect('ledgerDrafts' in descriptor.payload).toBe(false);
    expect('fundProcessingKeys' in descriptor.payload).toBe(false);
    expect('totalEndingAum' in descriptor.payload).toBe(false);
  });
});

describe('createRealtimeAuthorizedCurrentTurnRefetchPlan', () => {
  it('creates an authorized current-turn surface refetch plan from a Supabase subscription descriptor', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const signal = createMonthAdvanceRealtimeRefreshSignal(createMonthAdvanceTurnCompletionEvent(processingResult.value));
    const subscription = createSupabaseRealtimeSubscriptionDescriptor(
      createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
    );

    expect(createRealtimeAuthorizedCurrentTurnRefetchPlan(subscription)).toEqual({
      planType: 'authorized_current_turn_surface_refetch',
      refetchPlanKey:
        'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription:authorized-current-turn-refetch',
      providerBoundary: 'client_refetch',
      subscriptionKey: 'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription',
      channelName: 'class:class-001:month-advance',
      broadcastEventName: 'month_advance_refresh_available',
      audience: 'class_participants',
      deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
      clientAction: 'refetch_authorized_current_turn_surfaces',
      requiredAuthorization: 'server_scoped_current_turn_queries',
      surfaces: ['student_dashboard_current_turn', 'instructor_dashboard_current_turn'],
      classId: 'class-001',
      processedMonthIndex: 3,
      currentMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      payload: signal,
    });
  });

  it('keeps the refetch plan free of gameplay data and provider client details', () => {
    const signal = createMonthAdvanceRealtimeRefreshSignal({
      eventType: 'month_advance_completed',
      turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
      classId: 'class-001',
      triggerMode: 'auto',
      triggerSource: 'auto',
      processedMonthIndex: 3,
      advancedToMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      processingPath: 'shared_month_advance',
      processedFundCount: 1,
      totalStartingAum: 50_000_000,
      totalMarketBetaImpact: 2_000_000,
      totalFeeDrag: 250_000,
      totalTaxPaid: 500_000,
      totalPvpSlippagePaid: 500_000,
      totalEndingAum: 50_750_000,
    });
    const plan = createRealtimeAuthorizedCurrentTurnRefetchPlan(
      createSupabaseRealtimeSubscriptionDescriptor(
        createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
      ),
    );

    expect(plan).toEqual(
      expect.objectContaining({
        providerBoundary: 'client_refetch',
        clientAction: 'refetch_authorized_current_turn_surfaces',
        requiredAuthorization: 'server_scoped_current_turn_queries',
        currentMonthIndex: 4,
      }),
    );
    expect('ledgerDrafts' in plan).toBe(false);
    expect('fundProcessingKeys' in plan).toBe(false);
    expect('totalEndingAum' in plan).toBe(false);
    expect('supabaseClient' in plan).toBe(false);
    expect('databaseRows' in plan).toBe(false);
    expect('ledgerDrafts' in plan.payload).toBe(false);
    expect('fundProcessingKeys' in plan.payload).toBe(false);
    expect('totalEndingAum' in plan.payload).toBe(false);
  });
});

describe('createRealtimeAuthorizedCurrentTurnQueryDescriptor', () => {
  it('creates server-scoped query instructions from an authorized refetch plan', () => {
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
      processedFundCount: 1,
      totalStartingAum: 50_000_000,
      totalMarketBetaImpact: 2_000_000,
      totalFeeDrag: 250_000,
      totalTaxPaid: 500_000,
      totalPvpSlippagePaid: 500_000,
      totalEndingAum: 50_750_000,
    });
    const refetchPlan = createRealtimeAuthorizedCurrentTurnRefetchPlan(
      createSupabaseRealtimeSubscriptionDescriptor(
        createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
      ),
    );

    expect(createRealtimeAuthorizedCurrentTurnQueryDescriptor(refetchPlan)).toEqual({
      descriptorType: 'authorized_current_turn_query_descriptor',
      queryDescriptorKey:
        'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription:authorized-current-turn-refetch:server-query-descriptor',
      providerBoundary: 'server_query_boundary',
      refetchPlanKey:
        'class:class-001:advance:3->4:turn-completion:refresh:publication:supabase-realtime:subscription:authorized-current-turn-refetch',
      requiredAuthorization: 'server_scoped_current_turn_queries',
      classId: 'class-001',
      processedMonthIndex: 3,
      currentMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      surfaces: [
        {
          surface: 'student_dashboard_current_turn',
          queryBoundary: 'server_scoped_current_turn_query',
          requiredScope: 'viewer_fund_in_class',
          currentTurnOnly: true,
          includeFutureScenarioRows: false,
          includeOtherFundExactHoldingsForStudents: false,
          includeProviderPayload: false,
        },
        {
          surface: 'instructor_dashboard_current_turn',
          queryBoundary: 'server_scoped_current_turn_query',
          requiredScope: 'instructor_administered_class',
          currentTurnOnly: true,
          includeFutureScenarioRows: false,
          includeOtherFundExactHoldingsForStudents: false,
          includeProviderPayload: false,
        },
      ],
      payload: signal,
    });
  });

  it('keeps query descriptors free of gameplay data, database rows, and provider clients', () => {
    const signal = createMonthAdvanceRealtimeRefreshSignal({
      eventType: 'month_advance_completed',
      turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
      classId: 'class-001',
      triggerMode: 'auto',
      triggerSource: 'auto',
      processedMonthIndex: 3,
      advancedToMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      processingPath: 'shared_month_advance',
      processedFundCount: 1,
      totalStartingAum: 50_000_000,
      totalMarketBetaImpact: 2_000_000,
      totalFeeDrag: 250_000,
      totalTaxPaid: 500_000,
      totalPvpSlippagePaid: 500_000,
      totalEndingAum: 50_750_000,
    });
    const descriptor = createRealtimeAuthorizedCurrentTurnQueryDescriptor(
      createRealtimeAuthorizedCurrentTurnRefetchPlan(
        createSupabaseRealtimeSubscriptionDescriptor(
          createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
        ),
      ),
    );

    expect(descriptor).toEqual(
      expect.objectContaining({
        providerBoundary: 'server_query_boundary',
        requiredAuthorization: 'server_scoped_current_turn_queries',
        currentMonthIndex: 4,
      }),
    );
    expect(descriptor.surfaces.map((surface) => surface.requiredScope)).toEqual([
      'viewer_fund_in_class',
      'instructor_administered_class',
    ]);
    expect('ledgerDrafts' in descriptor).toBe(false);
    expect('fundProcessingKeys' in descriptor).toBe(false);
    expect('totalEndingAum' in descriptor).toBe(false);
    expect('databaseRows' in descriptor).toBe(false);
    expect('supabaseClient' in descriptor).toBe(false);
    expect('ledgerDrafts' in descriptor.payload).toBe(false);
    expect('fundProcessingKeys' in descriptor.payload).toBe(false);
    expect('totalEndingAum' in descriptor.payload).toBe(false);
    expect(descriptor.surfaces.every((surface) => surface.includeProviderPayload === false)).toBe(true);
  });
});

describe('createMonthAdvanceRealtimeRefreshSignal', () => {
  it('creates a refresh signal from a turn-completion event without aggregate totals', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const event = createMonthAdvanceTurnCompletionEvent(processingResult.value);
    const signal = createMonthAdvanceRealtimeRefreshSignal(event);

    expect(signal).toEqual({
      signalType: 'month_advance_refresh_available',
      refreshSignalKey: 'class:class-001:advance:3->4:turn-completion:refresh',
      classId: 'class-001',
      audience: 'class_participants',
      processedMonthIndex: 3,
      currentMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      turnCompletionEventKey: 'class:class-001:advance:3->4:turn-completion',
    });
    expect('ledgerDrafts' in signal).toBe(false);
    expect('fundProcessingKeys' in signal).toBe(false);
    expect('totalEndingAum' in signal).toBe(false);
  });

  it('preserves auto completion metadata needed for client refresh dedupe', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: {
        ...defaultProcessingRequest,
        triggerMode: 'auto',
        triggerSource: 'auto',
      },
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const event = createMonthAdvanceTurnCompletionEvent(processingResult.value);

    expect(createMonthAdvanceRealtimeRefreshSignal(event)).toEqual(
      expect.objectContaining({
        refreshSignalKey: 'class:class-001:advance:3->4:turn-completion:refresh',
        currentMonthIndex: 4,
        turnCompletionEventKey: event.turnCompletionEventKey,
      }),
    );
  });
});

describe('createMonthAdvanceTurnCompletionEvent', () => {
  it('creates an aggregate completion event from a class-month processing result', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [
        defaultFundProcessingInput,
        {
          ...defaultFundProcessingInput,
          fundId: 'fund-002',
          currentAum: 25_000_000,
          grossMarketReturnPct: 2,
          feeDragPct: 0.2,
          targetWeights: defaultFundProcessingInput.currentWeights,
          classroomSellConcentrationPct: { Base: 80, Core: 80, Apex: 80 },
        },
      ],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    const event = createMonthAdvanceTurnCompletionEvent(processingResult.value);

    expect(event).toEqual({
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
      totalStartingAum: 75_000_000,
      totalMarketBetaImpact: 2_500_000,
      totalFeeDrag: 300_000,
      totalTaxPaid: 500_000,
      totalPvpSlippagePaid: 500_000,
      totalEndingAum: 76_200_000,
    });
    expect('ledgerDrafts' in event).toBe(false);
    expect('fundProcessingKeys' in event).toBe(false);
  });

  it('preserves auto trigger metadata in the completion event', () => {
    const processingResult = createClassMonthAdvanceProcessingResult({
      processingRequest: {
        ...defaultProcessingRequest,
        triggerMode: 'auto',
        triggerSource: 'auto',
      },
      fundInputs: [defaultFundProcessingInput],
    });

    expect(processingResult.ok).toBe(true);

    if (!processingResult.ok) {
      return;
    }

    expect(createMonthAdvanceTurnCompletionEvent(processingResult.value)).toEqual(
      expect.objectContaining({
        triggerMode: 'auto',
        triggerSource: 'auto',
        processingPath: 'shared_month_advance',
      }),
    );
  });
});

describe('createClassMonthAdvanceProcessingResult', () => {
  it('creates a class-month processing record for multiple funds', () => {
    const result = createClassMonthAdvanceProcessingResult({
      processingRequest: defaultProcessingRequest,
      fundInputs: [
        defaultFundProcessingInput,
        {
          ...defaultFundProcessingInput,
          fundId: 'fund-002',
          currentAum: 25_000_000,
          grossMarketReturnPct: 2,
          feeDragPct: 0.2,
          targetWeights: defaultFundProcessingInput.currentWeights,
          classroomSellConcentrationPct: { Base: 80, Core: 80, Apex: 80 },
        },
      ],
    });

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        processedMonthIndex: 3,
        advancedToMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
        processingPath: 'shared_month_advance',
        processedFundCount: 2,
        fundProcessingKeys: ['class:class-001:advance:3->4:fund:fund-001', 'class:class-001:advance:3->4:fund:fund-002'],
        ledgerDrafts: [
          expect.objectContaining({ fundId: 'fund-001', endingAum: 50_750_000 }),
          expect.objectContaining({ fundId: 'fund-002', endingAum: 25_450_000 }),
        ],
        totalStartingAum: 75_000_000,
        totalMarketBetaImpact: 2_500_000,
        totalFeeDrag: 300_000,
        totalTaxPaid: 500_000,
        totalPvpSlippagePaid: 500_000,
        totalEndingAum: 76_200_000,
      },
    });
  });

  it('preserves auto trigger metadata for the class-month record', () => {
    const result = createClassMonthAdvanceProcessingResult({
      processingRequest: {
        ...defaultProcessingRequest,
        triggerMode: 'auto',
        triggerSource: 'auto',
      },
      fundInputs: [defaultFundProcessingInput],
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        triggerMode: 'auto',
        triggerSource: 'auto',
        processingPath: 'shared_month_advance',
      }),
    });
  });

  it('rejects duplicate fund ids after trimming', () => {
    expect(
      classProcessingErrorCodesFor({
        processingRequest: defaultProcessingRequest,
        fundInputs: [defaultFundProcessingInput, { ...defaultFundProcessingInput, fundId: ' fund-001 ' }],
      }),
    ).toContain('duplicate_fund_id');
  });

  it('reports invalid per-fund processing inputs', () => {
    expect(
      classProcessingErrorCodesFor({
        processingRequest: defaultProcessingRequest,
        fundInputs: [{ ...defaultFundProcessingInput, fundId: '   ' }],
      }),
    ).toContain('invalid_fund_processing');
    expect(
      classProcessingErrorCodesFor({
        processingRequest: defaultProcessingRequest,
        fundInputs: [{ ...defaultFundProcessingInput, currentAum: -1 }],
      }),
    ).toContain('invalid_fund_processing');
  });

  it('creates a validation failure envelope for invalid class-month processing inputs', () => {
    const result = createClassMonthAdvanceProcessingValidationFailureEnvelope({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput, { ...defaultFundProcessingInput, fundId: ' fund-001 ' }],
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'class_month_advance_processing_validation_failure',
        resultKey: 'class:class-001:advance:3->4:class-month-processing:validation-failure',
        processingBoundary: 'class_month_processing_validation_boundary',
        classId: 'class-001',
        processedMonthIndex: 3,
        advancedToMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
        resultStatus: 'validation_failed',
        processingPath: 'none_validation_failed',
        deliverySemantics: 'class_month_processing_safe_validation_errors',
        validationErrors: [
          {
            code: 'duplicate_fund_id',
            message: 'Class month processing cannot include the same fund more than once.',
            fundId: 'fund-001',
          },
        ],
      },
    });
  });

  it('keeps class-month validation failures free of fund payloads and execution details', () => {
    const result = createClassMonthAdvanceProcessingValidationFailureEnvelope({
      processingRequest: defaultProcessingRequest,
      fundInputs: [{ ...defaultFundProcessingInput, currentAum: -1 }],
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect(result.value.validationErrors).toEqual([
      expect.objectContaining({ code: 'invalid_fund_processing', fundId: 'fund-001' }),
    ]);
    expect('fundInputs' in result.value).toBe(false);
    expect('fundProcessingKeys' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('processingResult' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('workerJob' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for valid class-month processing inputs', () => {
    const result = createClassMonthAdvanceProcessingValidationFailureEnvelope({
      processingRequest: defaultProcessingRequest,
      fundInputs: [defaultFundProcessingInput],
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'processing_result_is_valid',
          message: 'Validation failure envelopes require an invalid class-month processing result.',
        },
      ],
    });
  });
});

describe('createMonthAdvanceFundProcessingResult', () => {
  it('creates a per-fund processing record from a shared month advance request', () => {
    const result = createMonthAdvanceFundProcessingResult(defaultFundProcessingInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        fundId: 'fund-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        processedMonthIndex: 3,
        advancedToMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
        fundProcessingKey: 'class:class-001:advance:3->4:fund:fund-001',
        ledgerDraft: expect.objectContaining({
          fundId: 'fund-001',
          monthIndex: 3,
          startingAum: 50_000_000,
          marketBetaImpact: 2_000_000,
          feeDrag: 250_000,
          taxPaid: 500_000,
          pvpSlippagePaid: 500_000,
          endingAum: 50_750_000,
        }),
      },
    });
  });

  it('trims fund ids before creating the per-fund idempotency key', () => {
    const result = createMonthAdvanceFundProcessingResult({
      ...defaultFundProcessingInput,
      fundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        fundId: 'fund-001',
        fundProcessingKey: 'class:class-001:advance:3->4:fund:fund-001',
        ledgerDraft: expect.objectContaining({
          fundId: 'fund-001',
        }),
      }),
    });
  });

  it('preserves auto trigger metadata from the shared processing request', () => {
    const result = createMonthAdvanceFundProcessingResult({
      ...defaultFundProcessingInput,
      processingRequest: {
        ...defaultProcessingRequest,
        triggerMode: 'auto',
        triggerSource: 'auto',
      },
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        triggerMode: 'auto',
        triggerSource: 'auto',
      }),
    });
  });

  it('rejects blank fund ids', () => {
    expect(fundProcessingErrorCodesFor({ ...defaultFundProcessingInput, fundId: '   ' })).toContain('invalid_fund_id');
  });

  it('rejects invalid attribution inputs', () => {
    expect(fundProcessingErrorCodesFor({ ...defaultFundProcessingInput, currentAum: -1 })).toContain(
      'invalid_attribution',
    );
    expect(
      fundProcessingErrorCodesFor({
        ...defaultFundProcessingInput,
        targetWeights: {
          Base: 30,
          Core: 30,
          Apex: 20,
        },
      }),
    ).toContain('invalid_attribution');
  });

  it('maps invalid per-fund processing inputs to a fund-safe validation failure envelope', () => {
    const result = createMonthAdvanceFundProcessingValidationFailureEnvelope({
      ...defaultFundProcessingInput,
      fundId: ' fund-001 ',
      currentAum: -1,
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'month_advance_fund_processing_validation_failure',
        resultKey: 'class:class-001:advance:3->4:fund:fund-001:processing:validation-failure',
        processingBoundary: 'fund_month_processing_validation_boundary',
        classId: 'class-001',
        fundId: 'fund-001',
        processedMonthIndex: 3,
        advancedToMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
        resultStatus: 'validation_failed',
        processingPath: 'none_validation_failed',
        deliverySemantics: 'fund_processing_safe_validation_errors',
        validationErrors: [
          {
            code: 'invalid_attribution',
            message: 'Month advance fund processing requires valid attribution inputs.',
            attributionErrors: expect.any(Array),
          },
        ],
      },
    });
  });

  it('keeps fund-processing validation failure envelopes free of raw attribution and execution payloads', () => {
    const result = createMonthAdvanceFundProcessingValidationFailureEnvelope({
      ...defaultFundProcessingInput,
      fundId: '   ',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect(result.value.fundId).toBeNull();
    expect(result.value.validationErrors).toEqual([{ code: 'invalid_fund_id', message: 'Fund id is required.' }]);
    expect('currentAum' in result.value).toBe(false);
    expect('currentWeights' in result.value).toBe(false);
    expect('targetWeights' in result.value).toBe(false);
    expect('ledgerDraft' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('workerJob' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for valid per-fund processing inputs', () => {
    const result = createMonthAdvanceFundProcessingValidationFailureEnvelope(defaultFundProcessingInput);

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'processing_result_is_valid',
          message: 'Validation failure envelopes require an invalid fund month processing result.',
        },
      ],
    });
  });
});

describe('createInstructorLiveMonthAdvanceRequest', () => {
  it('creates a deterministic live advancement request for a manual class', () => {
    const result = createInstructorLiveMonthAdvanceRequest(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        instructorId: 'instructor-001',
        triggerMode: 'manual',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      },
    });
  });

  it('trims class and instructor ids before creating the idempotency key', () => {
    const result = createInstructorLiveMonthAdvanceRequest({
      ...defaultInput,
      classId: ' class-001 ',
      instructorId: ' instructor-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        instructorId: 'instructor-001',
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    });
  });

  it('maps a live advancement request to a future server-action command descriptor', () => {
    const request = createInstructorLiveMonthAdvanceRequest(defaultInput);

    expect(request.ok).toBe(true);

    if (!request.ok) {
      return;
    }

    expect(createInstructorLiveMonthAdvanceServerActionCommandDescriptor(request.value)).toEqual({
      descriptorType: 'instructor_live_month_advance_server_action_command',
      commandKey: 'class:class-001:advance:3->4:instructor:instructor-001:live-month-advance:server-action-command',
      commandBoundary: 'server_action_command_boundary',
      commandName: 'advance_instructor_live_month',
      requiredScope: 'instructor_administered_manual_class',
      instructorId: 'instructor-001',
      classId: 'class-001',
      triggerMode: 'manual',
      currentMonthIndex: 3,
      nextMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      processingIntent: 'enqueue_shared_month_advance_processing',
    });
  });

  it('keeps the live advancement command descriptor free of execution and gameplay payloads', () => {
    const request = createInstructorLiveMonthAdvanceRequest(defaultInput);

    expect(request.ok).toBe(true);

    if (!request.ok) {
      return;
    }

    const descriptor = createInstructorLiveMonthAdvanceServerActionCommandDescriptor(request.value);

    expect(descriptor.requiredScope).toBe('instructor_administered_manual_class');
    expect(descriptor.idempotencyKey).toBe(request.value.idempotencyKey);
    expect('authSession' in descriptor).toBe(false);
    expect('databaseRows' in descriptor).toBe(false);
    expect('serverActionExecution' in descriptor).toBe(false);
    expect('workerPayload' in descriptor).toBe(false);
    expect('realtimePayload' in descriptor).toBe(false);
    expect('ledgerDrafts' in descriptor).toBe(false);
    expect('fundInputs' in descriptor).toBe(false);
  });

  it('maps a live advancement command descriptor to a future server-action result envelope', () => {
    const request = createInstructorLiveMonthAdvanceRequest(defaultInput);

    expect(request.ok).toBe(true);

    if (!request.ok) {
      return;
    }

    const descriptor = createInstructorLiveMonthAdvanceServerActionCommandDescriptor(request.value);

    expect(createInstructorLiveMonthAdvanceServerActionResultEnvelope(descriptor)).toEqual({
      envelopeType: 'instructor_live_month_advance_server_action_result',
      resultKey: 'class:class-001:advance:3->4:instructor:instructor-001:live-month-advance:server-action-command:result-envelope',
      commandKey: 'class:class-001:advance:3->4:instructor:instructor-001:live-month-advance:server-action-command',
      commandBoundary: 'server_action_result_boundary',
      commandName: 'advance_instructor_live_month',
      requiredScope: 'instructor_administered_manual_class',
      instructorId: 'instructor-001',
      classId: 'class-001',
      idempotencyKey: 'class:class-001:advance:3->4',
      resultStatus: 'accepted_live_month_advance',
      processingIntent: 'enqueue_shared_month_advance_processing',
      deliverySemantics: 'instructor_safe_live_month_advance_receipt',
      receipt: {
        receiptType: 'instructor_live_month_advance_receipt',
        advancementKey: 'class:class-001:advance:3->4',
        instructorId: 'instructor-001',
        classId: 'class-001',
        triggerMode: 'manual',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        processingIntent: 'enqueue_shared_month_advance_processing',
      },
    });
  });

  it('keeps the live advancement result envelope instructor-scoped without execution payloads', () => {
    const request = createInstructorLiveMonthAdvanceRequest(defaultInput);

    expect(request.ok).toBe(true);

    if (!request.ok) {
      return;
    }

    const descriptor = createInstructorLiveMonthAdvanceServerActionCommandDescriptor(request.value);
    const envelope = createInstructorLiveMonthAdvanceServerActionResultEnvelope(descriptor);

    expect(envelope.requiredScope).toBe('instructor_administered_manual_class');
    expect(envelope.receipt.advancementKey).toBe(envelope.idempotencyKey);
    expect(envelope.receipt.processingIntent).toBe(envelope.processingIntent);
    expect('authSession' in envelope).toBe(false);
    expect('databaseRows' in envelope).toBe(false);
    expect('serverActionExecution' in envelope).toBe(false);
    expect('workerPayload' in envelope).toBe(false);
    expect('workerJob' in envelope).toBe(false);
    expect('realtimePayload' in envelope).toBe(false);
    expect('ledgerDrafts' in envelope).toBe(false);
    expect('fundInputs' in envelope).toBe(false);
    expect('processingResult' in envelope).toBe(false);
  });

  it('creates an instructor-safe validation failure envelope for invalid live month-advance input', () => {
    const result = createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope({
      ...defaultInput,
      triggerMode: 'auto',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_live_month_advance_server_action_validation_failure',
        resultKey: 'class:class-001:instructor:instructor-001:advance:3->4:live-month-advance:validation-failure',
        commandBoundary: 'server_action_result_boundary',
        commandName: 'advance_instructor_live_month',
        requiredScope: 'instructor_administered_manual_class',
        instructorId: 'instructor-001',
        classId: 'class-001',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        resultStatus: 'validation_failed',
        processingIntent: 'none_validation_failed',
        deliverySemantics: 'instructor_safe_validation_errors',
        validationErrors: [
          {
            code: 'invalid_trigger_mode',
            message: 'Live month advancement requires manual trigger mode.',
          },
        ],
      },
    });
  });

  it('uses deterministic fallback key parts when invalid live scope or transition cannot be identified', () => {
    const result = createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope({
      ...defaultInput,
      classId: '   ',
      instructorId: '   ',
      triggerMode: 'live',
      currentMonthIndex: -1,
      totalMonths: 25,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        resultKey:
          'class:unknown-class:instructor:unknown-instructor:advance:invalid-transition:live-month-advance:validation-failure',
        classId: null,
        instructorId: null,
        currentMonthIndex: null,
        nextMonthIndex: null,
        validationErrors: [
          expect.objectContaining({ code: 'invalid_class_id' }),
          expect.objectContaining({ code: 'invalid_instructor_id' }),
          expect.objectContaining({ code: 'invalid_trigger_mode' }),
          expect.objectContaining({ code: 'invalid_current_month_index' }),
          expect.objectContaining({ code: 'invalid_total_months' }),
        ],
      }),
    });
  });

  it('does not create a failure envelope for a valid live month-advance request', () => {
    const result = createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope(defaultInput);

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'request_is_valid',
          message: 'Validation failure envelopes require an invalid instructor live month-advance request.',
        },
      ],
    });
  });

  it('excludes raw live advancement payloads and platform execution details from validation failures', () => {
    const result = createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope({
      ...defaultInput,
      currentMonthIndex: 11,
      totalMonths: 12,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect('triggerMode' in result.value).toBe(false);
    expect('totalMonths' in result.value).toBe(false);
    expect('idempotencyKey' in result.value).toBe(false);
    expect('authSession' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('serverActionExecution' in result.value).toBe(false);
    expect('workerPayload' in result.value).toBe(false);
    expect('workerJob' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('fundInputs' in result.value).toBe(false);
    expect('processingResult' in result.value).toBe(false);
  });

  it('allows advancing to the final valid month', () => {
    const result = createInstructorLiveMonthAdvanceRequest({
      ...defaultInput,
      currentMonthIndex: 10,
      totalMonths: 12,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        currentMonthIndex: 10,
        nextMonthIndex: 11,
      }),
    });
  });

  it('rejects blank ids', () => {
    expect(errorCodesFor({ ...defaultInput, classId: '   ' })).toContain('invalid_class_id');
    expect(errorCodesFor({ ...defaultInput, instructorId: '   ' })).toContain('invalid_instructor_id');
  });

  it('rejects non-manual trigger modes for live advancement', () => {
    expect(errorCodesFor({ ...defaultInput, triggerMode: 'auto' })).toContain('invalid_trigger_mode');
    expect(errorCodesFor({ ...defaultInput, triggerMode: 'live' })).toContain('invalid_trigger_mode');
  });

  it('rejects invalid month indexes and total month counts', () => {
    expect(errorCodesFor({ ...defaultInput, currentMonthIndex: -1 })).toContain('invalid_current_month_index');
    expect(errorCodesFor({ ...defaultInput, currentMonthIndex: 1.5 })).toContain('invalid_current_month_index');
    expect(errorCodesFor({ ...defaultInput, totalMonths: 11 })).toContain('invalid_total_months');
    expect(errorCodesFor({ ...defaultInput, totalMonths: 25 })).toContain('invalid_total_months');
    expect(errorCodesFor({ ...defaultInput, totalMonths: 12.5 })).toContain('invalid_total_months');
  });

  it('rejects classes outside the simulation calendar', () => {
    expect(errorCodesFor({ ...defaultInput, currentMonthIndex: 12, totalMonths: 12 })).toContain(
      'invalid_current_month_index',
    );
  });

  it('rejects completed simulations', () => {
    expect(errorCodesFor({ ...defaultInput, currentMonthIndex: 11, totalMonths: 12 })).toContain('simulation_complete');
  });
});

describe('createSharedMonthAdvanceProcessingRequest', () => {
  it('creates a shared processing request from a valid live advancement request', () => {
    const liveRequest = createInstructorLiveMonthAdvanceRequest(defaultInput);

    expect(liveRequest.ok).toBe(true);

    if (!liveRequest.ok) {
      return;
    }

    const result = createSharedMonthAdvanceProcessingRequest({
      ...liveRequest.value,
      triggerSource: 'live',
    });

    expect(result).toEqual({
      ok: true,
      value: {
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

  it('creates the same shared processing path from a valid auto advancement request', () => {
    const autoRequest = createAutoMonthAdvanceRequest(defaultAutoInput);

    expect(autoRequest.ok).toBe(true);

    if (!autoRequest.ok) {
      return;
    }

    const result = createSharedMonthAdvanceProcessingRequest({
      ...autoRequest.value,
      triggerSource: 'auto',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        triggerMode: 'auto',
        triggerSource: 'auto',
        idempotencyKey: 'class:class-001:advance:3->4',
        processingPath: 'shared_month_advance',
      }),
    });
  });

  it('trims class ids before validating the shared idempotency key', () => {
    const result = createSharedMonthAdvanceProcessingRequest({
      classId: ' class-001 ',
      triggerMode: 'manual',
      triggerSource: 'live',
      currentMonthIndex: 3,
      nextMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
      }),
    });
  });

  it('rejects mismatched trigger source and trigger mode combinations', () => {
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'auto',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    ).toContain('invalid_trigger_mode');
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'auto',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    ).toContain('invalid_trigger_mode');
  });

  it('rejects non-sequential or out-of-calendar next month indexes', () => {
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 5,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->5',
      }),
    ).toContain('invalid_next_month_index');
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 11,
        nextMonthIndex: 12,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:11->12',
      }),
    ).toContain('invalid_next_month_index');
  });

  it('rejects invalid shared processing request fields', () => {
    expect(
      processingErrorCodesFor({
        classId: '   ',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    ).toContain('invalid_class_id');
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'live',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    ).toContain('invalid_trigger_mode');
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'manual',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    ).toContain('invalid_trigger_source');
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 3.5,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3.5->4',
      }),
    ).toContain('invalid_current_month_index');
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 4.5,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4.5',
      }),
    ).toContain('invalid_next_month_index');
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 25,
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    ).toContain('invalid_total_months');
  });

  it('rejects idempotency keys that do not match the class and month transition', () => {
    expect(
      processingErrorCodesFor({
        classId: 'class-001',
        triggerMode: 'manual',
        triggerSource: 'live',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->5',
      }),
    ).toContain('invalid_idempotency_key');
  });

  it('creates a shared-processing-safe validation failure envelope for invalid processing input', () => {
    const result = createSharedMonthAdvanceProcessingValidationFailureEnvelope({
      classId: 'class-001',
      triggerMode: 'auto',
      triggerSource: 'live',
      currentMonthIndex: 3,
      nextMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'shared_month_advance_processing_validation_failure',
        resultKey: 'class:class-001:advance:3->4:shared-month-advance:validation-failure',
        processingBoundary: 'shared_processing_validation_boundary',
        classId: 'class-001',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        resultStatus: 'validation_failed',
        processingPath: 'none_validation_failed',
        deliverySemantics: 'shared_processing_safe_validation_errors',
        validationErrors: [
          {
            code: 'invalid_trigger_mode',
            message: 'Live processing requests require manual trigger mode.',
          },
        ],
      },
    });
  });

  it('uses deterministic fallback key parts when invalid shared processing scope or transition cannot be identified', () => {
    const result = createSharedMonthAdvanceProcessingValidationFailureEnvelope({
      classId: '   ',
      triggerMode: 'manual',
      triggerSource: 'live',
      currentMonthIndex: -1,
      nextMonthIndex: 4.5,
      totalMonths: 25,
      idempotencyKey: 'not-the-shared-key',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        resultKey: 'class:unknown-class:advance:invalid-transition:shared-month-advance:validation-failure',
        classId: null,
        currentMonthIndex: null,
        nextMonthIndex: null,
        validationErrors: [
          expect.objectContaining({ code: 'invalid_class_id' }),
          expect.objectContaining({ code: 'invalid_current_month_index' }),
          expect.objectContaining({ code: 'invalid_next_month_index' }),
          expect.objectContaining({ code: 'invalid_total_months' }),
          expect.objectContaining({ code: 'invalid_idempotency_key' }),
        ],
      }),
    });
  });

  it('does not create a shared processing validation failure envelope for a valid request', () => {
    const result = createSharedMonthAdvanceProcessingValidationFailureEnvelope({
      classId: 'class-001',
      triggerMode: 'manual',
      triggerSource: 'live',
      currentMonthIndex: 3,
      nextMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'request_is_valid',
          message: 'Validation failure envelopes require an invalid shared month-advance processing request.',
        },
      ],
    });
  });

  it('excludes raw processing inputs, worker jobs, realtime payloads, and ledger drafts from shared validation failures', () => {
    const result = createSharedMonthAdvanceProcessingValidationFailureEnvelope({
      classId: 'class-001',
      triggerMode: 'manual',
      triggerSource: 'auto',
      currentMonthIndex: 3,
      nextMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect('triggerMode' in result.value).toBe(false);
    expect('triggerSource' in result.value).toBe(false);
    expect('totalMonths' in result.value).toBe(false);
    expect('idempotencyKey' in result.value).toBe(false);
    expect('workerJob' in result.value).toBe(false);
    expect('workerPayload' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('fundInputs' in result.value).toBe(false);
    expect('processingResult' in result.value).toBe(false);
  });
});

describe('createAutoMonthAdvanceScheduledTriggerDescriptor', () => {
  function createAutoRequest() {
    const requestResult = createAutoMonthAdvanceRequest(defaultAutoInput);

    expect(requestResult.ok).toBe(true);

    if (!requestResult.ok) {
      throw new Error('Expected a valid auto month-advance request.');
    }

    return requestResult.value;
  }

  it('creates a provider-neutral scheduled trigger descriptor from a valid auto advancement request', () => {
    const descriptor = createAutoMonthAdvanceScheduledTriggerDescriptor(createAutoRequest());

    expect(descriptor).toEqual({
      descriptorType: 'auto_month_advance_scheduled_trigger_descriptor',
      triggerKey: 'class:class-001:advance:3->4:scheduled-auto-trigger',
      triggerBoundary: 'scheduled_trigger_boundary',
      triggerName: 'advance_auto_month',
      requiredScope: 'auto_paced_class',
      classId: 'class-001',
      triggerMode: 'auto',
      triggerSource: 'auto',
      currentMonthIndex: 3,
      nextMonthIndex: 4,
      totalMonths: 12,
      idempotencyKey: 'class:class-001:advance:3->4',
      processingIntent: 'create_shared_month_advance_processing_request',
    });
  });

  it('can feed the existing shared month-advance processing request path', () => {
    const descriptor = createAutoMonthAdvanceScheduledTriggerDescriptor(createAutoRequest());
    const result = createSharedMonthAdvanceProcessingRequest({
      classId: descriptor.classId,
      triggerMode: descriptor.triggerMode,
      triggerSource: descriptor.triggerSource,
      currentMonthIndex: descriptor.currentMonthIndex,
      nextMonthIndex: descriptor.nextMonthIndex,
      totalMonths: descriptor.totalMonths,
      idempotencyKey: descriptor.idempotencyKey,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        triggerMode: 'auto',
        triggerSource: 'auto',
        processingPath: 'shared_month_advance',
      }),
    });
  });

  it('excludes platform, provider, auth, worker, realtime, fund, and ledger payloads', () => {
    const descriptor = createAutoMonthAdvanceScheduledTriggerDescriptor(createAutoRequest());

    expect('cronExpression' in descriptor).toBe(false);
    expect('vercelProjectId' in descriptor).toBe(false);
    expect('authSession' in descriptor).toBe(false);
    expect('databaseRows' in descriptor).toBe(false);
    expect('workerPayload' in descriptor).toBe(false);
    expect('realtimePayload' in descriptor).toBe(false);
    expect('fundInputs' in descriptor).toBe(false);
    expect('ledgerDrafts' in descriptor).toBe(false);
  });

  it('maps a scheduled trigger descriptor to a scheduled-trigger-safe result envelope', () => {
    const descriptor = createAutoMonthAdvanceScheduledTriggerDescriptor(createAutoRequest());

    expect(createAutoMonthAdvanceScheduledTriggerResultEnvelope(descriptor)).toEqual({
      envelopeType: 'auto_month_advance_scheduled_trigger_result',
      resultKey: 'class:class-001:advance:3->4:scheduled-auto-trigger:result-envelope',
      triggerKey: 'class:class-001:advance:3->4:scheduled-auto-trigger',
      triggerBoundary: 'scheduled_trigger_result_boundary',
      triggerName: 'advance_auto_month',
      requiredScope: 'auto_paced_class',
      classId: 'class-001',
      idempotencyKey: 'class:class-001:advance:3->4',
      resultStatus: 'accepted_auto_month_advance',
      processingIntent: 'create_shared_month_advance_processing_request',
      deliverySemantics: 'scheduled_trigger_safe_auto_month_advance_receipt',
      receipt: {
        receiptType: 'auto_month_advance_scheduled_trigger_receipt',
        advancementKey: 'class:class-001:advance:3->4',
        classId: 'class-001',
        triggerMode: 'auto',
        triggerSource: 'auto',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        processingIntent: 'create_shared_month_advance_processing_request',
      },
    });
  });

  it('keeps the scheduled trigger result envelope free of execution and gameplay payloads', () => {
    const descriptor = createAutoMonthAdvanceScheduledTriggerDescriptor(createAutoRequest());
    const envelope = createAutoMonthAdvanceScheduledTriggerResultEnvelope(descriptor);

    expect(envelope.requiredScope).toBe('auto_paced_class');
    expect(envelope.receipt.advancementKey).toBe(envelope.idempotencyKey);
    expect(envelope.receipt.processingIntent).toBe(envelope.processingIntent);
    expect('cronExpression' in envelope).toBe(false);
    expect('vercelProjectId' in envelope).toBe(false);
    expect('authSession' in envelope).toBe(false);
    expect('databaseRows' in envelope).toBe(false);
    expect('scheduledTriggerExecution' in envelope).toBe(false);
    expect('workerPayload' in envelope).toBe(false);
    expect('workerJob' in envelope).toBe(false);
    expect('realtimePayload' in envelope).toBe(false);
    expect('ledgerDrafts' in envelope).toBe(false);
    expect('fundInputs' in envelope).toBe(false);
    expect('processingResult' in envelope).toBe(false);
  });

  it('creates a scheduled-trigger-safe validation failure envelope for invalid auto advancement input', () => {
    const result = createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope({
      ...defaultAutoInput,
      triggerMode: 'manual',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'auto_month_advance_scheduled_trigger_validation_failure',
        resultKey: 'class:class-001:advance:3->4:scheduled-auto-trigger:validation-failure',
        triggerBoundary: 'scheduled_trigger_validation_boundary',
        triggerName: 'advance_auto_month',
        requiredScope: 'auto_paced_class',
        classId: 'class-001',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        resultStatus: 'validation_failed',
        processingIntent: 'none_validation_failed',
        deliverySemantics: 'scheduled_trigger_safe_validation_errors',
        validationErrors: [
          {
            code: 'invalid_trigger_mode',
            message: 'Auto month advancement requires auto trigger mode.',
          },
        ],
      },
    });
  });

  it('uses deterministic fallback key parts when invalid auto scope or transition cannot be identified', () => {
    const result = createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope({
      ...defaultAutoInput,
      classId: '   ',
      triggerMode: 'manual',
      currentMonthIndex: -1,
      totalMonths: 25,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        resultKey: 'class:unknown-class:advance:invalid-transition:scheduled-auto-trigger:validation-failure',
        classId: null,
        currentMonthIndex: null,
        nextMonthIndex: null,
        validationErrors: [
          expect.objectContaining({ code: 'invalid_class_id' }),
          expect.objectContaining({ code: 'invalid_trigger_mode' }),
          expect.objectContaining({ code: 'invalid_current_month_index' }),
          expect.objectContaining({ code: 'invalid_total_months' }),
        ],
      }),
    });
  });

  it('does not create a scheduled-trigger validation failure envelope for a valid auto request', () => {
    const result = createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope(defaultAutoInput);

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'request_is_valid',
          message: 'Validation failure envelopes require an invalid auto month-advance request.',
        },
      ],
    });
  });

  it('excludes raw auto advancement payloads and platform execution details from validation failures', () => {
    const result = createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope({
      ...defaultAutoInput,
      currentMonthIndex: 11,
      totalMonths: 12,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect('triggerMode' in result.value).toBe(false);
    expect('totalMonths' in result.value).toBe(false);
    expect('idempotencyKey' in result.value).toBe(false);
    expect('cronExpression' in result.value).toBe(false);
    expect('vercelProjectId' in result.value).toBe(false);
    expect('authSession' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('workerPayload' in result.value).toBe(false);
    expect('workerJob' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('fundInputs' in result.value).toBe(false);
    expect('processingResult' in result.value).toBe(false);
  });
});

describe('createAutoMonthAdvanceRequest', () => {
  it('creates a deterministic auto advancement request for a cron-paced class', () => {
    const result = createAutoMonthAdvanceRequest(defaultAutoInput);

    expect(result).toEqual({
      ok: true,
      value: {
        classId: 'class-001',
        triggerMode: 'auto',
        currentMonthIndex: 3,
        nextMonthIndex: 4,
        totalMonths: 12,
        idempotencyKey: 'class:class-001:advance:3->4',
      },
    });
  });

  it('trims class ids before creating the shared processing idempotency key', () => {
    const result = createAutoMonthAdvanceRequest({
      ...defaultAutoInput,
      classId: ' class-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        classId: 'class-001',
        idempotencyKey: 'class:class-001:advance:3->4',
      }),
    });
  });

  it('allows advancing to the final valid month', () => {
    const result = createAutoMonthAdvanceRequest({
      ...defaultAutoInput,
      currentMonthIndex: 10,
      totalMonths: 12,
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        currentMonthIndex: 10,
        nextMonthIndex: 11,
      }),
    });
  });

  it('rejects blank class ids', () => {
    expect(autoErrorCodesFor({ ...defaultAutoInput, classId: '   ' })).toContain('invalid_class_id');
  });

  it('rejects non-auto trigger modes for auto advancement', () => {
    expect(autoErrorCodesFor({ ...defaultAutoInput, triggerMode: 'manual' })).toContain('invalid_trigger_mode');
    expect(autoErrorCodesFor({ ...defaultAutoInput, triggerMode: 'live' })).toContain('invalid_trigger_mode');
  });

  it('rejects invalid month indexes and total month counts', () => {
    expect(autoErrorCodesFor({ ...defaultAutoInput, currentMonthIndex: -1 })).toContain('invalid_current_month_index');
    expect(autoErrorCodesFor({ ...defaultAutoInput, currentMonthIndex: 1.5 })).toContain('invalid_current_month_index');
    expect(autoErrorCodesFor({ ...defaultAutoInput, totalMonths: 11 })).toContain('invalid_total_months');
    expect(autoErrorCodesFor({ ...defaultAutoInput, totalMonths: 25 })).toContain('invalid_total_months');
    expect(autoErrorCodesFor({ ...defaultAutoInput, totalMonths: 12.5 })).toContain('invalid_total_months');
  });

  it('rejects classes outside the simulation calendar', () => {
    expect(autoErrorCodesFor({ ...defaultAutoInput, currentMonthIndex: 12, totalMonths: 12 })).toContain(
      'invalid_current_month_index',
    );
  });

  it('rejects completed simulations', () => {
    expect(autoErrorCodesFor({ ...defaultAutoInput, currentMonthIndex: 11, totalMonths: 12 })).toContain(
      'simulation_complete',
    );
  });
});
