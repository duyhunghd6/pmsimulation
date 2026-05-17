import { calculateTaraTurnAttribution, type TaraTurnAttributionError } from '../tara/attribution';
import { type ClassTriggerMode } from './class-draft';

export const MIN_SIMULATION_MONTHS = 12;
export const MAX_SIMULATION_MONTHS = 24;

export type InstructorLiveMonthAdvanceInput = {
  classId: string;
  instructorId: string;
  triggerMode: string;
  currentMonthIndex: number;
  totalMonths: number;
};

export type InstructorLiveMonthAdvanceRequest = {
  classId: string;
  instructorId: string;
  triggerMode: Extract<ClassTriggerMode, 'manual'>;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
};

export type InstructorLiveMonthAdvanceErrorCode =
  | 'invalid_class_id'
  | 'invalid_instructor_id'
  | 'invalid_trigger_mode'
  | 'invalid_current_month_index'
  | 'invalid_total_months'
  | 'simulation_complete';

export type InstructorLiveMonthAdvanceError = {
  code: InstructorLiveMonthAdvanceErrorCode;
  message: string;
};

export type InstructorLiveMonthAdvanceResult =
  | { ok: true; value: InstructorLiveMonthAdvanceRequest }
  | { ok: false; errors: InstructorLiveMonthAdvanceError[] };

export type InstructorLiveMonthAdvanceControlInput = {
  classId: string;
  triggerMode: string;
  currentMonthIndex: number;
  totalMonths: number;
};

export type InstructorLiveMonthAdvanceControlDisabledReason = 'auto_mode' | 'simulation_complete';

export type InstructorLiveMonthAdvanceControlSnapshot = {
  controlType: 'instructor_live_month_advance_control';
  classId: string;
  triggerMode: ClassTriggerMode;
  currentMonthIndex: number;
  nextMonthIndex: number | null;
  totalMonths: number;
  canAdvance: boolean;
  disabledReason: InstructorLiveMonthAdvanceControlDisabledReason | null;
  requestIdempotencyKey: string | null;
};

export type InstructorLiveMonthAdvanceControlError = {
  code: Exclude<InstructorLiveMonthAdvanceErrorCode, 'invalid_instructor_id' | 'simulation_complete'>;
  message: string;
};

export type InstructorLiveMonthAdvanceControlResult =
  | { ok: true; value: InstructorLiveMonthAdvanceControlSnapshot }
  | { ok: false; errors: InstructorLiveMonthAdvanceControlError[] };

export type AutoMonthAdvanceInput = {
  classId: string;
  triggerMode: string;
  currentMonthIndex: number;
  totalMonths: number;
};

export type AutoMonthAdvanceRequest = {
  classId: string;
  triggerMode: Extract<ClassTriggerMode, 'auto'>;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
};

export type AutoMonthAdvanceErrorCode =
  | 'invalid_class_id'
  | 'invalid_trigger_mode'
  | 'invalid_current_month_index'
  | 'invalid_total_months'
  | 'simulation_complete';

export type AutoMonthAdvanceError = {
  code: AutoMonthAdvanceErrorCode;
  message: string;
};

export type AutoMonthAdvanceResult =
  | { ok: true; value: AutoMonthAdvanceRequest }
  | { ok: false; errors: AutoMonthAdvanceError[] };

export type MonthAdvanceTriggerSource = 'live' | 'auto';

export type SharedMonthAdvanceProcessingInput = {
  classId: string;
  triggerMode: string;
  triggerSource: string;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
};

export type SharedMonthAdvanceProcessingRequest = {
  classId: string;
  triggerMode: ClassTriggerMode;
  triggerSource: MonthAdvanceTriggerSource;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  processingPath: 'shared_month_advance';
};

export type SharedMonthAdvanceProcessingErrorCode =
  | 'invalid_class_id'
  | 'invalid_trigger_mode'
  | 'invalid_trigger_source'
  | 'invalid_current_month_index'
  | 'invalid_next_month_index'
  | 'invalid_total_months'
  | 'invalid_idempotency_key';

export type SharedMonthAdvanceProcessingError = {
  code: SharedMonthAdvanceProcessingErrorCode;
  message: string;
};

export type SharedMonthAdvanceProcessingResult =
  | { ok: true; value: SharedMonthAdvanceProcessingRequest }
  | { ok: false; errors: SharedMonthAdvanceProcessingError[] };

export type MonthAdvanceWorkerJob = {
  jobType: 'month_advance_processing';
  workerJobKey: string;
  classId: string;
  triggerMode: ClassTriggerMode;
  triggerSource: MonthAdvanceTriggerSource;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  processingPath: 'shared_month_advance';
  queueDiscipline: 'class_month_idempotent';
};

export type MonthAdvanceFundProcessingInput = {
  processingRequest: SharedMonthAdvanceProcessingRequest;
  fundId: string;
  currentAum: number;
  grossMarketReturnPct: number;
  feeDragPct: number;
  currentWeights: Record<string, number>;
  targetWeights: Record<string, number>;
  apexUnrealizedGainPct: number;
  classroomSellConcentrationPct: Record<string, number>;
};

export type MonthAdvanceFundLedgerDraft = {
  fundId: string;
  monthIndex: number;
  startingAum: number;
  marketBetaImpact: number;
  feeDrag: number;
  taxPaid: number;
  taxDragPct: number;
  pvpSlippagePaid: number;
  liquidityPenaltyPct: number;
  classroomSellConcentrationPct: number;
  endingAum: number;
};

export type MonthAdvanceFundProcessingRecord = {
  classId: string;
  fundId: string;
  triggerMode: ClassTriggerMode;
  triggerSource: MonthAdvanceTriggerSource;
  processedMonthIndex: number;
  advancedToMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  fundProcessingKey: string;
  ledgerDraft: MonthAdvanceFundLedgerDraft;
};

export type MonthAdvanceFundProcessingErrorCode = 'invalid_fund_id' | 'invalid_attribution';

export type MonthAdvanceFundProcessingError = {
  code: MonthAdvanceFundProcessingErrorCode;
  message: string;
  attributionErrors?: TaraTurnAttributionError[];
};

export type CreateMonthAdvanceFundProcessingResult =
  | { ok: true; value: MonthAdvanceFundProcessingRecord }
  | { ok: false; errors: MonthAdvanceFundProcessingError[] };

export type ClassMonthAdvanceFundProcessingInput = Omit<MonthAdvanceFundProcessingInput, 'processingRequest'>;

export type ClassMonthAdvanceProcessingInput = {
  processingRequest: SharedMonthAdvanceProcessingRequest;
  fundInputs: ClassMonthAdvanceFundProcessingInput[];
};

export type ClassMonthAdvanceProcessingRecord = {
  classId: string;
  triggerMode: ClassTriggerMode;
  triggerSource: MonthAdvanceTriggerSource;
  processedMonthIndex: number;
  advancedToMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  processingPath: 'shared_month_advance';
  processedFundCount: number;
  fundProcessingKeys: string[];
  ledgerDrafts: MonthAdvanceFundLedgerDraft[];
  totalStartingAum: number;
  totalMarketBetaImpact: number;
  totalFeeDrag: number;
  totalTaxPaid: number;
  totalPvpSlippagePaid: number;
  totalEndingAum: number;
};

export type ClassMonthAdvanceProcessingErrorCode = 'duplicate_fund_id' | 'invalid_fund_processing';

export type ClassMonthAdvanceProcessingError = {
  code: ClassMonthAdvanceProcessingErrorCode;
  message: string;
  fundId?: string;
  fundProcessingErrors?: MonthAdvanceFundProcessingError[];
};

export type CreateClassMonthAdvanceProcessingResult =
  | { ok: true; value: ClassMonthAdvanceProcessingRecord }
  | { ok: false; errors: ClassMonthAdvanceProcessingError[] };

export type MonthAdvanceTurnCompletionEvent = {
  eventType: 'month_advance_completed';
  turnCompletionEventKey: string;
  classId: string;
  triggerMode: ClassTriggerMode;
  triggerSource: MonthAdvanceTriggerSource;
  processedMonthIndex: number;
  advancedToMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  processingPath: 'shared_month_advance';
  processedFundCount: number;
  totalStartingAum: number;
  totalMarketBetaImpact: number;
  totalFeeDrag: number;
  totalTaxPaid: number;
  totalPvpSlippagePaid: number;
  totalEndingAum: number;
};

export type MonthAdvanceRealtimeRefreshSignal = {
  signalType: 'month_advance_refresh_available';
  refreshSignalKey: string;
  classId: string;
  audience: 'class_participants';
  processedMonthIndex: number;
  currentMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  turnCompletionEventKey: string;
};

export type MonthAdvanceRealtimePublicationEnvelope = {
  publicationType: 'realtime_refresh_publication';
  publicationKey: string;
  providerBoundary: 'provider_neutral';
  channelName: string;
  eventName: 'month_advance_refresh_available';
  audience: 'class_participants';
  deliverySemantics: 'refresh_only_refetch_authorized_surfaces';
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type SupabaseRealtimePublicationDescriptor = {
  publicationType: 'supabase_realtime_broadcast_descriptor';
  publicationKey: string;
  providerBoundary: 'supabase_realtime';
  channelName: string;
  broadcastEventName: 'month_advance_refresh_available';
  audience: 'class_participants';
  deliverySemantics: 'refresh_only_refetch_authorized_surfaces';
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type SupabaseRealtimeSubscriptionDescriptor = {
  subscriptionType: 'supabase_realtime_subscription_descriptor';
  subscriptionKey: string;
  providerBoundary: 'supabase_realtime';
  channelName: string;
  broadcastEventName: 'month_advance_refresh_available';
  audience: 'class_participants';
  deliverySemantics: 'refresh_only_refetch_authorized_surfaces';
  clientAction: 'refetch_authorized_current_turn_surfaces';
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type RealtimeAuthorizedCurrentTurnSurface =
  | 'student_dashboard_current_turn'
  | 'instructor_dashboard_current_turn';

export type RealtimeAuthorizedCurrentTurnRefetchPlan = {
  planType: 'authorized_current_turn_surface_refetch';
  refetchPlanKey: string;
  providerBoundary: 'client_refetch';
  subscriptionKey: string;
  channelName: string;
  broadcastEventName: 'month_advance_refresh_available';
  audience: 'class_participants';
  deliverySemantics: 'refresh_only_refetch_authorized_surfaces';
  clientAction: 'refetch_authorized_current_turn_surfaces';
  requiredAuthorization: 'server_scoped_current_turn_queries';
  surfaces: RealtimeAuthorizedCurrentTurnSurface[];
  classId: string;
  processedMonthIndex: number;
  currentMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  payload: MonthAdvanceRealtimeRefreshSignal;
};

function createMonthAdvanceIdempotencyKey(classId: string, currentMonthIndex: number, nextMonthIndex: number): string {
  return `class:${classId}:advance:${currentMonthIndex}->${nextMonthIndex}`;
}

export function createMonthAdvanceWorkerJob(processingRequest: SharedMonthAdvanceProcessingRequest): MonthAdvanceWorkerJob {
  return {
    jobType: 'month_advance_processing',
    workerJobKey: `${processingRequest.idempotencyKey}:worker-job`,
    classId: processingRequest.classId,
    triggerMode: processingRequest.triggerMode,
    triggerSource: processingRequest.triggerSource,
    currentMonthIndex: processingRequest.currentMonthIndex,
    nextMonthIndex: processingRequest.nextMonthIndex,
    totalMonths: processingRequest.totalMonths,
    idempotencyKey: processingRequest.idempotencyKey,
    processingPath: processingRequest.processingPath,
    queueDiscipline: 'class_month_idempotent',
  };
}

export function createMonthAdvanceTurnCompletionEvent(
  processingResult: ClassMonthAdvanceProcessingRecord,
): MonthAdvanceTurnCompletionEvent {
  return {
    eventType: 'month_advance_completed',
    turnCompletionEventKey: `${processingResult.idempotencyKey}:turn-completion`,
    classId: processingResult.classId,
    triggerMode: processingResult.triggerMode,
    triggerSource: processingResult.triggerSource,
    processedMonthIndex: processingResult.processedMonthIndex,
    advancedToMonthIndex: processingResult.advancedToMonthIndex,
    totalMonths: processingResult.totalMonths,
    idempotencyKey: processingResult.idempotencyKey,
    processingPath: processingResult.processingPath,
    processedFundCount: processingResult.processedFundCount,
    totalStartingAum: processingResult.totalStartingAum,
    totalMarketBetaImpact: processingResult.totalMarketBetaImpact,
    totalFeeDrag: processingResult.totalFeeDrag,
    totalTaxPaid: processingResult.totalTaxPaid,
    totalPvpSlippagePaid: processingResult.totalPvpSlippagePaid,
    totalEndingAum: processingResult.totalEndingAum,
  };
}

export function createMonthAdvanceRealtimeRefreshSignal(
  event: MonthAdvanceTurnCompletionEvent,
): MonthAdvanceRealtimeRefreshSignal {
  return {
    signalType: 'month_advance_refresh_available',
    refreshSignalKey: `${event.turnCompletionEventKey}:refresh`,
    classId: event.classId,
    audience: 'class_participants',
    processedMonthIndex: event.processedMonthIndex,
    currentMonthIndex: event.advancedToMonthIndex,
    totalMonths: event.totalMonths,
    idempotencyKey: event.idempotencyKey,
    turnCompletionEventKey: event.turnCompletionEventKey,
  };
}

export function createMonthAdvanceRealtimePublicationEnvelope(
  signal: MonthAdvanceRealtimeRefreshSignal,
): MonthAdvanceRealtimePublicationEnvelope {
  return {
    publicationType: 'realtime_refresh_publication',
    publicationKey: `${signal.refreshSignalKey}:publication`,
    providerBoundary: 'provider_neutral',
    channelName: `class:${signal.classId}:month-advance`,
    eventName: signal.signalType,
    audience: signal.audience,
    deliverySemantics: 'refresh_only_refetch_authorized_surfaces',
    payload: signal,
  };
}

export function createSupabaseRealtimePublicationDescriptor(
  envelope: MonthAdvanceRealtimePublicationEnvelope,
): SupabaseRealtimePublicationDescriptor {
  return {
    publicationType: 'supabase_realtime_broadcast_descriptor',
    publicationKey: `${envelope.publicationKey}:supabase-realtime`,
    providerBoundary: 'supabase_realtime',
    channelName: envelope.channelName,
    broadcastEventName: envelope.eventName,
    audience: envelope.audience,
    deliverySemantics: envelope.deliverySemantics,
    payload: envelope.payload,
  };
}

export function createSupabaseRealtimeSubscriptionDescriptor(
  publication: SupabaseRealtimePublicationDescriptor,
): SupabaseRealtimeSubscriptionDescriptor {
  return {
    subscriptionType: 'supabase_realtime_subscription_descriptor',
    subscriptionKey: `${publication.publicationKey}:subscription`,
    providerBoundary: publication.providerBoundary,
    channelName: publication.channelName,
    broadcastEventName: publication.broadcastEventName,
    audience: publication.audience,
    deliverySemantics: publication.deliverySemantics,
    clientAction: 'refetch_authorized_current_turn_surfaces',
    payload: publication.payload,
  };
}

export function createRealtimeAuthorizedCurrentTurnRefetchPlan(
  subscription: SupabaseRealtimeSubscriptionDescriptor,
): RealtimeAuthorizedCurrentTurnRefetchPlan {
  return {
    planType: 'authorized_current_turn_surface_refetch',
    refetchPlanKey: `${subscription.subscriptionKey}:authorized-current-turn-refetch`,
    providerBoundary: 'client_refetch',
    subscriptionKey: subscription.subscriptionKey,
    channelName: subscription.channelName,
    broadcastEventName: subscription.broadcastEventName,
    audience: subscription.audience,
    deliverySemantics: subscription.deliverySemantics,
    clientAction: subscription.clientAction,
    requiredAuthorization: 'server_scoped_current_turn_queries',
    surfaces: ['student_dashboard_current_turn', 'instructor_dashboard_current_turn'],
    classId: subscription.payload.classId,
    processedMonthIndex: subscription.payload.processedMonthIndex,
    currentMonthIndex: subscription.payload.currentMonthIndex,
    totalMonths: subscription.payload.totalMonths,
    idempotencyKey: subscription.payload.idempotencyKey,
    payload: subscription.payload,
  };
}

export function createClassMonthAdvanceProcessingResult(
  input: ClassMonthAdvanceProcessingInput,
): CreateClassMonthAdvanceProcessingResult {
  const errors: ClassMonthAdvanceProcessingError[] = [];
  const seenFundIds = new Set<string>();
  const fundRecords: MonthAdvanceFundProcessingRecord[] = [];

  for (const fundInput of input.fundInputs) {
    const fundId = fundInput.fundId.trim();

    if (fundId !== '') {
      if (seenFundIds.has(fundId)) {
        errors.push({
          code: 'duplicate_fund_id',
          message: 'Class month processing cannot include the same fund more than once.',
          fundId,
        });
      } else {
        seenFundIds.add(fundId);
      }
    }

    const fundProcessingResult = createMonthAdvanceFundProcessingResult({
      ...fundInput,
      processingRequest: input.processingRequest,
    });

    if (fundProcessingResult.ok) {
      fundRecords.push(fundProcessingResult.value);
    } else {
      errors.push({
        code: 'invalid_fund_processing',
        message: 'Class month processing requires every fund processing input to be valid.',
        fundId: fundId || undefined,
        fundProcessingErrors: fundProcessingResult.errors,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const ledgerDrafts = fundRecords.map((record) => record.ledgerDraft);

  return {
    ok: true,
    value: {
      classId: input.processingRequest.classId,
      triggerMode: input.processingRequest.triggerMode,
      triggerSource: input.processingRequest.triggerSource,
      processedMonthIndex: input.processingRequest.currentMonthIndex,
      advancedToMonthIndex: input.processingRequest.nextMonthIndex,
      totalMonths: input.processingRequest.totalMonths,
      idempotencyKey: input.processingRequest.idempotencyKey,
      processingPath: input.processingRequest.processingPath,
      processedFundCount: fundRecords.length,
      fundProcessingKeys: fundRecords.map((record) => record.fundProcessingKey),
      ledgerDrafts,
      totalStartingAum: ledgerDrafts.reduce((total, draft) => total + draft.startingAum, 0),
      totalMarketBetaImpact: ledgerDrafts.reduce((total, draft) => total + draft.marketBetaImpact, 0),
      totalFeeDrag: ledgerDrafts.reduce((total, draft) => total + draft.feeDrag, 0),
      totalTaxPaid: ledgerDrafts.reduce((total, draft) => total + draft.taxPaid, 0),
      totalPvpSlippagePaid: ledgerDrafts.reduce((total, draft) => total + draft.pvpSlippagePaid, 0),
      totalEndingAum: ledgerDrafts.reduce((total, draft) => total + draft.endingAum, 0),
    },
  };
}

export function createMonthAdvanceFundProcessingResult(
  input: MonthAdvanceFundProcessingInput,
): CreateMonthAdvanceFundProcessingResult {
  const errors: MonthAdvanceFundProcessingError[] = [];
  const fundId = input.fundId.trim();

  if (fundId === '') {
    errors.push({
      code: 'invalid_fund_id',
      message: 'Fund id is required.',
    });
  }

  const attributionResult = calculateTaraTurnAttribution({
    currentAum: input.currentAum,
    grossMarketReturnPct: input.grossMarketReturnPct,
    feeDragPct: input.feeDragPct,
    currentWeights: input.currentWeights,
    targetWeights: input.targetWeights,
    apexUnrealizedGainPct: input.apexUnrealizedGainPct,
    classroomSellConcentrationPct: input.classroomSellConcentrationPct,
  });

  if (!attributionResult.ok) {
    errors.push({
      code: 'invalid_attribution',
      message: 'Month advance fund processing requires valid attribution inputs.',
      attributionErrors: attributionResult.errors,
    });
  }

  if (errors.length > 0 || !attributionResult.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      classId: input.processingRequest.classId,
      fundId,
      triggerMode: input.processingRequest.triggerMode,
      triggerSource: input.processingRequest.triggerSource,
      processedMonthIndex: input.processingRequest.currentMonthIndex,
      advancedToMonthIndex: input.processingRequest.nextMonthIndex,
      totalMonths: input.processingRequest.totalMonths,
      idempotencyKey: input.processingRequest.idempotencyKey,
      fundProcessingKey: `${input.processingRequest.idempotencyKey}:fund:${fundId}`,
      ledgerDraft: {
        fundId,
        monthIndex: input.processingRequest.currentMonthIndex,
        startingAum: attributionResult.value.startingAum,
        marketBetaImpact: attributionResult.value.marketBetaImpact,
        feeDrag: attributionResult.value.feeDrag,
        taxPaid: attributionResult.value.taxPaid,
        taxDragPct: attributionResult.value.taxDragPct,
        pvpSlippagePaid: attributionResult.value.pvpSlippagePaid,
        liquidityPenaltyPct: attributionResult.value.liquidityPenaltyPct,
        classroomSellConcentrationPct: attributionResult.value.classroomSellConcentrationPct,
        endingAum: attributionResult.value.endingAum,
      },
    },
  };
}

export function createInstructorLiveMonthAdvanceControlSnapshot(
  input: InstructorLiveMonthAdvanceControlInput,
): InstructorLiveMonthAdvanceControlResult {
  const errors: InstructorLiveMonthAdvanceControlError[] = [];
  const classId = input.classId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  const triggerModeIsValid = input.triggerMode === 'manual' || input.triggerMode === 'auto';
  const currentMonthIndexIsValid = Number.isInteger(input.currentMonthIndex) && input.currentMonthIndex >= 0;
  const totalMonthsIsValid =
    Number.isInteger(input.totalMonths) &&
    input.totalMonths >= MIN_SIMULATION_MONTHS &&
    input.totalMonths <= MAX_SIMULATION_MONTHS;

  if (!triggerModeIsValid) {
    errors.push({
      code: 'invalid_trigger_mode',
      message: 'Trigger mode must be auto or manual.',
    });
  }

  if (!currentMonthIndexIsValid) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  if (!totalMonthsIsValid) {
    errors.push({
      code: 'invalid_total_months',
      message: 'Total simulation months must be an integer from 12 to 24.',
    });
  }

  if (currentMonthIndexIsValid && totalMonthsIsValid && input.currentMonthIndex >= input.totalMonths) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be within the simulation calendar.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const triggerMode = input.triggerMode as ClassTriggerMode;
  const nextMonthIndex = input.currentMonthIndex + 1;
  const simulationComplete = input.currentMonthIndex === input.totalMonths - 1;
  const canAdvance = triggerMode === 'manual' && !simulationComplete;

  return {
    ok: true,
    value: {
      controlType: 'instructor_live_month_advance_control',
      classId,
      triggerMode,
      currentMonthIndex: input.currentMonthIndex,
      nextMonthIndex: canAdvance ? nextMonthIndex : null,
      totalMonths: input.totalMonths,
      canAdvance,
      disabledReason: canAdvance ? null : triggerMode === 'auto' ? 'auto_mode' : 'simulation_complete',
      requestIdempotencyKey: canAdvance
        ? createMonthAdvanceIdempotencyKey(classId, input.currentMonthIndex, nextMonthIndex)
        : null,
    },
  };
}

export function createInstructorLiveMonthAdvanceRequest(
  input: InstructorLiveMonthAdvanceInput,
): InstructorLiveMonthAdvanceResult {
  const errors: InstructorLiveMonthAdvanceError[] = [];
  const classId = input.classId.trim();
  const instructorId = input.instructorId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (instructorId === '') {
    errors.push({
      code: 'invalid_instructor_id',
      message: 'Instructor id is required.',
    });
  }

  if (input.triggerMode !== 'manual') {
    errors.push({
      code: 'invalid_trigger_mode',
      message: 'Live month advancement requires manual trigger mode.',
    });
  }

  const currentMonthIndexIsValid = Number.isInteger(input.currentMonthIndex) && input.currentMonthIndex >= 0;
  const totalMonthsIsValid =
    Number.isInteger(input.totalMonths) &&
    input.totalMonths >= MIN_SIMULATION_MONTHS &&
    input.totalMonths <= MAX_SIMULATION_MONTHS;

  if (!currentMonthIndexIsValid) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  if (!totalMonthsIsValid) {
    errors.push({
      code: 'invalid_total_months',
      message: 'Total simulation months must be an integer from 12 to 24.',
    });
  }

  if (currentMonthIndexIsValid && totalMonthsIsValid) {
    if (input.currentMonthIndex >= input.totalMonths) {
      errors.push({
        code: 'invalid_current_month_index',
        message: 'Current month index must be within the simulation calendar.',
      });
    } else if (input.currentMonthIndex === input.totalMonths - 1) {
      errors.push({
        code: 'simulation_complete',
        message: 'Completed simulations cannot advance to another month.',
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const nextMonthIndex = input.currentMonthIndex + 1;

  return {
    ok: true,
    value: {
      classId,
      instructorId,
      triggerMode: 'manual',
      currentMonthIndex: input.currentMonthIndex,
      nextMonthIndex,
      totalMonths: input.totalMonths,
      idempotencyKey: createMonthAdvanceIdempotencyKey(classId, input.currentMonthIndex, nextMonthIndex),
    },
  };
}

export function createSharedMonthAdvanceProcessingRequest(
  input: SharedMonthAdvanceProcessingInput,
): SharedMonthAdvanceProcessingResult {
  const errors: SharedMonthAdvanceProcessingError[] = [];
  const classId = input.classId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  const triggerModeIsValid = input.triggerMode === 'manual' || input.triggerMode === 'auto';
  const triggerSourceIsValid = input.triggerSource === 'live' || input.triggerSource === 'auto';
  const currentMonthIndexIsValid = Number.isInteger(input.currentMonthIndex) && input.currentMonthIndex >= 0;
  const nextMonthIndexIsValid = Number.isInteger(input.nextMonthIndex) && input.nextMonthIndex >= 0;
  const totalMonthsIsValid =
    Number.isInteger(input.totalMonths) &&
    input.totalMonths >= MIN_SIMULATION_MONTHS &&
    input.totalMonths <= MAX_SIMULATION_MONTHS;

  if (!triggerModeIsValid) {
    errors.push({
      code: 'invalid_trigger_mode',
      message: 'Trigger mode must be auto or manual.',
    });
  }

  if (!triggerSourceIsValid) {
    errors.push({
      code: 'invalid_trigger_source',
      message: 'Trigger source must be live or auto.',
    });
  }

  if (input.triggerSource === 'live' && input.triggerMode !== 'manual') {
    errors.push({
      code: 'invalid_trigger_mode',
      message: 'Live processing requests require manual trigger mode.',
    });
  }

  if (input.triggerSource === 'auto' && input.triggerMode !== 'auto') {
    errors.push({
      code: 'invalid_trigger_mode',
      message: 'Auto processing requests require auto trigger mode.',
    });
  }

  if (!currentMonthIndexIsValid) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  if (!nextMonthIndexIsValid) {
    errors.push({
      code: 'invalid_next_month_index',
      message: 'Next month index must be a non-negative integer.',
    });
  }

  if (!totalMonthsIsValid) {
    errors.push({
      code: 'invalid_total_months',
      message: 'Total simulation months must be an integer from 12 to 24.',
    });
  }

  if (currentMonthIndexIsValid && nextMonthIndexIsValid && input.nextMonthIndex !== input.currentMonthIndex + 1) {
    errors.push({
      code: 'invalid_next_month_index',
      message: 'Next month index must advance by exactly one month.',
    });
  }

  if (nextMonthIndexIsValid && totalMonthsIsValid && input.nextMonthIndex >= input.totalMonths) {
    errors.push({
      code: 'invalid_next_month_index',
      message: 'Next month index must be within the simulation calendar.',
    });
  }

  const expectedIdempotencyKey = createMonthAdvanceIdempotencyKey(
    classId,
    input.currentMonthIndex,
    input.nextMonthIndex,
  );

  if (input.idempotencyKey !== expectedIdempotencyKey) {
    errors.push({
      code: 'invalid_idempotency_key',
      message: 'Idempotency key must match the class and month transition.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      classId,
      triggerMode: input.triggerMode as ClassTriggerMode,
      triggerSource: input.triggerSource as MonthAdvanceTriggerSource,
      currentMonthIndex: input.currentMonthIndex,
      nextMonthIndex: input.nextMonthIndex,
      totalMonths: input.totalMonths,
      idempotencyKey: input.idempotencyKey,
      processingPath: 'shared_month_advance',
    },
  };
}

export function createAutoMonthAdvanceRequest(input: AutoMonthAdvanceInput): AutoMonthAdvanceResult {
  const errors: AutoMonthAdvanceError[] = [];
  const classId = input.classId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (input.triggerMode !== 'auto') {
    errors.push({
      code: 'invalid_trigger_mode',
      message: 'Auto month advancement requires auto trigger mode.',
    });
  }

  const currentMonthIndexIsValid = Number.isInteger(input.currentMonthIndex) && input.currentMonthIndex >= 0;
  const totalMonthsIsValid =
    Number.isInteger(input.totalMonths) &&
    input.totalMonths >= MIN_SIMULATION_MONTHS &&
    input.totalMonths <= MAX_SIMULATION_MONTHS;

  if (!currentMonthIndexIsValid) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  if (!totalMonthsIsValid) {
    errors.push({
      code: 'invalid_total_months',
      message: 'Total simulation months must be an integer from 12 to 24.',
    });
  }

  if (currentMonthIndexIsValid && totalMonthsIsValid) {
    if (input.currentMonthIndex >= input.totalMonths) {
      errors.push({
        code: 'invalid_current_month_index',
        message: 'Current month index must be within the simulation calendar.',
      });
    } else if (input.currentMonthIndex === input.totalMonths - 1) {
      errors.push({
        code: 'simulation_complete',
        message: 'Completed simulations cannot advance to another month.',
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const nextMonthIndex = input.currentMonthIndex + 1;

  return {
    ok: true,
    value: {
      classId,
      triggerMode: 'auto',
      currentMonthIndex: input.currentMonthIndex,
      nextMonthIndex,
      totalMonths: input.totalMonths,
      idempotencyKey: createMonthAdvanceIdempotencyKey(classId, input.currentMonthIndex, nextMonthIndex),
    },
  };
}
