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

export type InstructorLiveMonthAdvanceServerActionCommandDescriptor = {
  descriptorType: 'instructor_live_month_advance_server_action_command';
  commandKey: string;
  commandBoundary: 'server_action_command_boundary';
  commandName: 'advance_instructor_live_month';
  requiredScope: 'instructor_administered_manual_class';
  instructorId: string;
  classId: string;
  triggerMode: Extract<ClassTriggerMode, 'manual'>;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  processingIntent: 'enqueue_shared_month_advance_processing';
};

export type InstructorLiveMonthAdvanceReceipt = {
  receiptType: 'instructor_live_month_advance_receipt';
  advancementKey: string;
  instructorId: string;
  classId: string;
  triggerMode: Extract<ClassTriggerMode, 'manual'>;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  processingIntent: 'enqueue_shared_month_advance_processing';
};

export type InstructorLiveMonthAdvanceServerActionResultEnvelope = {
  envelopeType: 'instructor_live_month_advance_server_action_result';
  resultKey: string;
  commandKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'advance_instructor_live_month';
  requiredScope: 'instructor_administered_manual_class';
  instructorId: string;
  classId: string;
  idempotencyKey: string;
  resultStatus: 'accepted_live_month_advance';
  processingIntent: 'enqueue_shared_month_advance_processing';
  deliverySemantics: 'instructor_safe_live_month_advance_receipt';
  receipt: InstructorLiveMonthAdvanceReceipt;
};

export type InstructorLiveMonthAdvanceServerActionValidationFailureEnvelope = {
  envelopeType: 'instructor_live_month_advance_server_action_validation_failure';
  resultKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'advance_instructor_live_month';
  requiredScope: 'instructor_administered_manual_class';
  instructorId: string | null;
  classId: string | null;
  currentMonthIndex: number | null;
  nextMonthIndex: number | null;
  resultStatus: 'validation_failed';
  processingIntent: 'none_validation_failed';
  deliverySemantics: 'instructor_safe_validation_errors';
  validationErrors: InstructorLiveMonthAdvanceError[];
};

export type InstructorLiveMonthAdvanceServerActionValidationFailureEnvelopeError = {
  code: 'request_is_valid';
  message: string;
};

export type InstructorLiveMonthAdvanceServerActionValidationFailureEnvelopeResult =
  | { ok: true; value: InstructorLiveMonthAdvanceServerActionValidationFailureEnvelope }
  | { ok: false; errors: InstructorLiveMonthAdvanceServerActionValidationFailureEnvelopeError[] };

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

export type AutoMonthAdvanceScheduledTriggerDescriptor = {
  descriptorType: 'auto_month_advance_scheduled_trigger_descriptor';
  triggerKey: string;
  triggerBoundary: 'scheduled_trigger_boundary';
  triggerName: 'advance_auto_month';
  requiredScope: 'auto_paced_class';
  classId: string;
  triggerMode: Extract<ClassTriggerMode, 'auto'>;
  triggerSource: Extract<MonthAdvanceTriggerSource, 'auto'>;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  processingIntent: 'create_shared_month_advance_processing_request';
};

export type AutoMonthAdvanceScheduledTriggerReceipt = {
  receiptType: 'auto_month_advance_scheduled_trigger_receipt';
  advancementKey: string;
  classId: string;
  triggerMode: Extract<ClassTriggerMode, 'auto'>;
  triggerSource: Extract<MonthAdvanceTriggerSource, 'auto'>;
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  processingIntent: 'create_shared_month_advance_processing_request';
};

export type AutoMonthAdvanceScheduledTriggerResultEnvelope = {
  envelopeType: 'auto_month_advance_scheduled_trigger_result';
  resultKey: string;
  triggerKey: string;
  triggerBoundary: 'scheduled_trigger_result_boundary';
  triggerName: 'advance_auto_month';
  requiredScope: 'auto_paced_class';
  classId: string;
  idempotencyKey: string;
  resultStatus: 'accepted_auto_month_advance';
  processingIntent: 'create_shared_month_advance_processing_request';
  deliverySemantics: 'scheduled_trigger_safe_auto_month_advance_receipt';
  receipt: AutoMonthAdvanceScheduledTriggerReceipt;
};

export type AutoMonthAdvanceScheduledTriggerValidationFailureEnvelope = {
  envelopeType: 'auto_month_advance_scheduled_trigger_validation_failure';
  resultKey: string;
  triggerBoundary: 'scheduled_trigger_validation_boundary';
  triggerName: 'advance_auto_month';
  requiredScope: 'auto_paced_class';
  classId: string | null;
  currentMonthIndex: number | null;
  nextMonthIndex: number | null;
  resultStatus: 'validation_failed';
  processingIntent: 'none_validation_failed';
  deliverySemantics: 'scheduled_trigger_safe_validation_errors';
  validationErrors: AutoMonthAdvanceError[];
};

export type AutoMonthAdvanceScheduledTriggerValidationFailureEnvelopeError = {
  code: 'request_is_valid';
  message: string;
};

export type AutoMonthAdvanceScheduledTriggerValidationFailureEnvelopeResult =
  | { ok: true; value: AutoMonthAdvanceScheduledTriggerValidationFailureEnvelope }
  | { ok: false; errors: AutoMonthAdvanceScheduledTriggerValidationFailureEnvelopeError[] };

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

export type SharedMonthAdvanceProcessingValidationFailureEnvelope = {
  envelopeType: 'shared_month_advance_processing_validation_failure';
  resultKey: string;
  processingBoundary: 'shared_processing_validation_boundary';
  classId: string | null;
  currentMonthIndex: number | null;
  nextMonthIndex: number | null;
  resultStatus: 'validation_failed';
  processingPath: 'none_validation_failed';
  deliverySemantics: 'shared_processing_safe_validation_errors';
  validationErrors: SharedMonthAdvanceProcessingError[];
};

export type SharedMonthAdvanceProcessingValidationFailureEnvelopeError = {
  code: 'request_is_valid';
  message: string;
};

export type SharedMonthAdvanceProcessingValidationFailureEnvelopeResult =
  | { ok: true; value: SharedMonthAdvanceProcessingValidationFailureEnvelope }
  | { ok: false; errors: SharedMonthAdvanceProcessingValidationFailureEnvelopeError[] };

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

export type MonthAdvanceWorkerJobReceipt = {
  receiptType: 'month_advance_worker_job_receipt';
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

export type MonthAdvanceWorkerJobResultEnvelope = {
  envelopeType: 'month_advance_worker_job_result';
  resultKey: string;
  workerJobKey: string;
  workerBoundary: 'worker_job_result_boundary';
  jobType: 'month_advance_processing';
  classId: string;
  idempotencyKey: string;
  resultStatus: 'accepted_month_advance_worker_job';
  processingPath: 'shared_month_advance';
  deliverySemantics: 'worker_safe_month_advance_job_receipt';
  receipt: MonthAdvanceWorkerJobReceipt;
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

export type MonthAdvanceFundProcessingValidationFailureEnvelope = {
  envelopeType: 'month_advance_fund_processing_validation_failure';
  resultKey: string;
  processingBoundary: 'fund_month_processing_validation_boundary';
  classId: string;
  fundId: string | null;
  processedMonthIndex: number;
  advancedToMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  resultStatus: 'validation_failed';
  processingPath: 'none_validation_failed';
  deliverySemantics: 'fund_processing_safe_validation_errors';
  validationErrors: MonthAdvanceFundProcessingError[];
};

export type MonthAdvanceFundProcessingValidationFailureEnvelopeError = {
  code: 'processing_result_is_valid';
  message: string;
};

export type CreateMonthAdvanceFundProcessingValidationFailureEnvelopeResult =
  | { ok: true; value: MonthAdvanceFundProcessingValidationFailureEnvelope }
  | { ok: false; errors: MonthAdvanceFundProcessingValidationFailureEnvelopeError[] };

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

export type ClassMonthAdvanceProcessingValidationFailureEnvelope = {
  envelopeType: 'class_month_advance_processing_validation_failure';
  resultKey: string;
  processingBoundary: 'class_month_processing_validation_boundary';
  classId: string;
  processedMonthIndex: number;
  advancedToMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  resultStatus: 'validation_failed';
  processingPath: 'none_validation_failed';
  deliverySemantics: 'class_month_processing_safe_validation_errors';
  validationErrors: ClassMonthAdvanceProcessingError[];
};

export type ClassMonthAdvanceProcessingValidationFailureEnvelopeError = {
  code: 'processing_result_is_valid';
  message: string;
};

export type CreateClassMonthAdvanceProcessingValidationFailureEnvelopeResult =
  | { ok: true; value: ClassMonthAdvanceProcessingValidationFailureEnvelope }
  | { ok: false; errors: ClassMonthAdvanceProcessingValidationFailureEnvelopeError[] };

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

export type RealtimeAuthorizedCurrentTurnQuerySurface = {
  surface: RealtimeAuthorizedCurrentTurnSurface;
  queryBoundary: 'server_scoped_current_turn_query';
  requiredScope: 'viewer_fund_in_class' | 'instructor_administered_class';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundExactHoldingsForStudents: false;
  includeProviderPayload: false;
};

export type RealtimeAuthorizedCurrentTurnQueryDescriptor = {
  descriptorType: 'authorized_current_turn_query_descriptor';
  queryDescriptorKey: string;
  providerBoundary: 'server_query_boundary';
  refetchPlanKey: string;
  requiredAuthorization: 'server_scoped_current_turn_queries';
  classId: string;
  processedMonthIndex: number;
  currentMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  surfaces: RealtimeAuthorizedCurrentTurnQuerySurface[];
  payload: MonthAdvanceRealtimeRefreshSignal;
};

function createMonthAdvanceIdempotencyKey(classId: string, currentMonthIndex: number, nextMonthIndex: number): string {
  return `class:${classId}:advance:${currentMonthIndex}->${nextMonthIndex}`;
}

export function createInstructorLiveMonthAdvanceServerActionCommandDescriptor(
  request: InstructorLiveMonthAdvanceRequest,
): InstructorLiveMonthAdvanceServerActionCommandDescriptor {
  return {
    descriptorType: 'instructor_live_month_advance_server_action_command',
    commandKey: `${request.idempotencyKey}:instructor:${request.instructorId}:live-month-advance:server-action-command`,
    commandBoundary: 'server_action_command_boundary',
    commandName: 'advance_instructor_live_month',
    requiredScope: 'instructor_administered_manual_class',
    instructorId: request.instructorId,
    classId: request.classId,
    triggerMode: request.triggerMode,
    currentMonthIndex: request.currentMonthIndex,
    nextMonthIndex: request.nextMonthIndex,
    totalMonths: request.totalMonths,
    idempotencyKey: request.idempotencyKey,
    processingIntent: 'enqueue_shared_month_advance_processing',
  };
}

export function createInstructorLiveMonthAdvanceServerActionResultEnvelope(
  descriptor: InstructorLiveMonthAdvanceServerActionCommandDescriptor,
): InstructorLiveMonthAdvanceServerActionResultEnvelope {
  return {
    envelopeType: 'instructor_live_month_advance_server_action_result',
    resultKey: `${descriptor.commandKey}:result-envelope`,
    commandKey: descriptor.commandKey,
    commandBoundary: 'server_action_result_boundary',
    commandName: descriptor.commandName,
    requiredScope: descriptor.requiredScope,
    instructorId: descriptor.instructorId,
    classId: descriptor.classId,
    idempotencyKey: descriptor.idempotencyKey,
    resultStatus: 'accepted_live_month_advance',
    processingIntent: descriptor.processingIntent,
    deliverySemantics: 'instructor_safe_live_month_advance_receipt',
    receipt: {
      receiptType: 'instructor_live_month_advance_receipt',
      advancementKey: descriptor.idempotencyKey,
      instructorId: descriptor.instructorId,
      classId: descriptor.classId,
      triggerMode: descriptor.triggerMode,
      currentMonthIndex: descriptor.currentMonthIndex,
      nextMonthIndex: descriptor.nextMonthIndex,
      totalMonths: descriptor.totalMonths,
      processingIntent: descriptor.processingIntent,
    },
  };
}

export function createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope(
  input: InstructorLiveMonthAdvanceInput,
): InstructorLiveMonthAdvanceServerActionValidationFailureEnvelopeResult {
  const requestResult = createInstructorLiveMonthAdvanceRequest(input);

  if (requestResult.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'request_is_valid',
          message: 'Validation failure envelopes require an invalid instructor live month-advance request.',
        },
      ],
    };
  }

  const classId = input.classId.trim();
  const instructorId = input.instructorId.trim();
  const currentMonthIndexIsValid = Number.isInteger(input.currentMonthIndex) && input.currentMonthIndex >= 0;
  const totalMonthsIsValid =
    Number.isInteger(input.totalMonths) &&
    input.totalMonths >= MIN_SIMULATION_MONTHS &&
    input.totalMonths <= MAX_SIMULATION_MONTHS;
  const nextMonthIndex =
    currentMonthIndexIsValid && totalMonthsIsValid && input.currentMonthIndex < input.totalMonths - 1
      ? input.currentMonthIndex + 1
      : null;
  const classKeyPart = classId === '' ? 'unknown-class' : classId;
  const instructorKeyPart = instructorId === '' ? 'unknown-instructor' : instructorId;
  const transitionKeyPart = nextMonthIndex === null ? 'invalid-transition' : `${input.currentMonthIndex}->${nextMonthIndex}`;

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_live_month_advance_server_action_validation_failure',
      resultKey: `class:${classKeyPart}:instructor:${instructorKeyPart}:advance:${transitionKeyPart}:live-month-advance:validation-failure`,
      commandBoundary: 'server_action_result_boundary',
      commandName: 'advance_instructor_live_month',
      requiredScope: 'instructor_administered_manual_class',
      instructorId: instructorId === '' ? null : instructorId,
      classId: classId === '' ? null : classId,
      currentMonthIndex: currentMonthIndexIsValid ? input.currentMonthIndex : null,
      nextMonthIndex,
      resultStatus: 'validation_failed',
      processingIntent: 'none_validation_failed',
      deliverySemantics: 'instructor_safe_validation_errors',
      validationErrors: requestResult.errors,
    },
  };
}

export function createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope(
  input: AutoMonthAdvanceInput,
): AutoMonthAdvanceScheduledTriggerValidationFailureEnvelopeResult {
  const requestResult = createAutoMonthAdvanceRequest(input);

  if (requestResult.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'request_is_valid',
          message: 'Validation failure envelopes require an invalid auto month-advance request.',
        },
      ],
    };
  }

  const classId = input.classId.trim();
  const currentMonthIndexIsValid = Number.isInteger(input.currentMonthIndex) && input.currentMonthIndex >= 0;
  const totalMonthsIsValid =
    Number.isInteger(input.totalMonths) &&
    input.totalMonths >= MIN_SIMULATION_MONTHS &&
    input.totalMonths <= MAX_SIMULATION_MONTHS;
  const nextMonthIndex =
    currentMonthIndexIsValid && totalMonthsIsValid && input.currentMonthIndex < input.totalMonths - 1
      ? input.currentMonthIndex + 1
      : null;
  const classKeyPart = classId === '' ? 'unknown-class' : classId;
  const transitionKeyPart = nextMonthIndex === null ? 'invalid-transition' : `${input.currentMonthIndex}->${nextMonthIndex}`;

  return {
    ok: true,
    value: {
      envelopeType: 'auto_month_advance_scheduled_trigger_validation_failure',
      resultKey: `class:${classKeyPart}:advance:${transitionKeyPart}:scheduled-auto-trigger:validation-failure`,
      triggerBoundary: 'scheduled_trigger_validation_boundary',
      triggerName: 'advance_auto_month',
      requiredScope: 'auto_paced_class',
      classId: classId === '' ? null : classId,
      currentMonthIndex: currentMonthIndexIsValid ? input.currentMonthIndex : null,
      nextMonthIndex,
      resultStatus: 'validation_failed',
      processingIntent: 'none_validation_failed',
      deliverySemantics: 'scheduled_trigger_safe_validation_errors',
      validationErrors: requestResult.errors,
    },
  };
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

export function createMonthAdvanceWorkerJobResultEnvelope(
  job: MonthAdvanceWorkerJob,
): MonthAdvanceWorkerJobResultEnvelope {
  return {
    envelopeType: 'month_advance_worker_job_result',
    resultKey: `${job.workerJobKey}:result-envelope`,
    workerJobKey: job.workerJobKey,
    workerBoundary: 'worker_job_result_boundary',
    jobType: job.jobType,
    classId: job.classId,
    idempotencyKey: job.idempotencyKey,
    resultStatus: 'accepted_month_advance_worker_job',
    processingPath: job.processingPath,
    deliverySemantics: 'worker_safe_month_advance_job_receipt',
    receipt: {
      receiptType: 'month_advance_worker_job_receipt',
      workerJobKey: job.workerJobKey,
      classId: job.classId,
      triggerMode: job.triggerMode,
      triggerSource: job.triggerSource,
      currentMonthIndex: job.currentMonthIndex,
      nextMonthIndex: job.nextMonthIndex,
      totalMonths: job.totalMonths,
      idempotencyKey: job.idempotencyKey,
      processingPath: job.processingPath,
      queueDiscipline: job.queueDiscipline,
    },
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

export function createRealtimeAuthorizedCurrentTurnQueryDescriptor(
  refetchPlan: RealtimeAuthorizedCurrentTurnRefetchPlan,
): RealtimeAuthorizedCurrentTurnQueryDescriptor {
  return {
    descriptorType: 'authorized_current_turn_query_descriptor',
    queryDescriptorKey: `${refetchPlan.refetchPlanKey}:server-query-descriptor`,
    providerBoundary: 'server_query_boundary',
    refetchPlanKey: refetchPlan.refetchPlanKey,
    requiredAuthorization: refetchPlan.requiredAuthorization,
    classId: refetchPlan.classId,
    processedMonthIndex: refetchPlan.processedMonthIndex,
    currentMonthIndex: refetchPlan.currentMonthIndex,
    totalMonths: refetchPlan.totalMonths,
    idempotencyKey: refetchPlan.idempotencyKey,
    surfaces: refetchPlan.surfaces.map((surface) => ({
      surface,
      queryBoundary: 'server_scoped_current_turn_query',
      requiredScope: surface === 'student_dashboard_current_turn' ? 'viewer_fund_in_class' : 'instructor_administered_class',
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundExactHoldingsForStudents: false,
      includeProviderPayload: false,
    })),
    payload: refetchPlan.payload,
  };
}

export function createClassMonthAdvanceProcessingValidationFailureEnvelope(
  input: ClassMonthAdvanceProcessingInput,
): CreateClassMonthAdvanceProcessingValidationFailureEnvelopeResult {
  const processingResult = createClassMonthAdvanceProcessingResult(input);

  if (processingResult.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'processing_result_is_valid',
          message: 'Validation failure envelopes require an invalid class-month processing result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'class_month_advance_processing_validation_failure',
      resultKey: `${input.processingRequest.idempotencyKey}:class-month-processing:validation-failure`,
      processingBoundary: 'class_month_processing_validation_boundary',
      classId: input.processingRequest.classId,
      processedMonthIndex: input.processingRequest.currentMonthIndex,
      advancedToMonthIndex: input.processingRequest.nextMonthIndex,
      totalMonths: input.processingRequest.totalMonths,
      idempotencyKey: input.processingRequest.idempotencyKey,
      resultStatus: 'validation_failed',
      processingPath: 'none_validation_failed',
      deliverySemantics: 'class_month_processing_safe_validation_errors',
      validationErrors: processingResult.errors,
    },
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

export function createMonthAdvanceFundProcessingValidationFailureEnvelope(
  input: MonthAdvanceFundProcessingInput,
): CreateMonthAdvanceFundProcessingValidationFailureEnvelopeResult {
  const processingResult = createMonthAdvanceFundProcessingResult(input);

  if (processingResult.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'processing_result_is_valid',
          message: 'Validation failure envelopes require an invalid fund month processing result.',
        },
      ],
    };
  }

  const fundId = input.fundId.trim();

  return {
    ok: true,
    value: {
      envelopeType: 'month_advance_fund_processing_validation_failure',
      resultKey: `${input.processingRequest.idempotencyKey}:fund:${fundId === '' ? 'unknown-fund' : fundId}:processing:validation-failure`,
      processingBoundary: 'fund_month_processing_validation_boundary',
      classId: input.processingRequest.classId,
      fundId: fundId === '' ? null : fundId,
      processedMonthIndex: input.processingRequest.currentMonthIndex,
      advancedToMonthIndex: input.processingRequest.nextMonthIndex,
      totalMonths: input.processingRequest.totalMonths,
      idempotencyKey: input.processingRequest.idempotencyKey,
      resultStatus: 'validation_failed',
      processingPath: 'none_validation_failed',
      deliverySemantics: 'fund_processing_safe_validation_errors',
      validationErrors: processingResult.errors,
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

export function createSharedMonthAdvanceProcessingValidationFailureEnvelope(
  input: SharedMonthAdvanceProcessingInput,
): SharedMonthAdvanceProcessingValidationFailureEnvelopeResult {
  const processingResult = createSharedMonthAdvanceProcessingRequest(input);

  if (processingResult.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'request_is_valid',
          message: 'Validation failure envelopes require an invalid shared month-advance processing request.',
        },
      ],
    };
  }

  const classId = input.classId.trim();
  const currentMonthIndexIsValid = Number.isInteger(input.currentMonthIndex) && input.currentMonthIndex >= 0;
  const nextMonthIndexIsValid = Number.isInteger(input.nextMonthIndex) && input.nextMonthIndex >= 0;
  const transitionKeyPart =
    currentMonthIndexIsValid && nextMonthIndexIsValid
      ? `${input.currentMonthIndex}->${input.nextMonthIndex}`
      : 'invalid-transition';

  return {
    ok: true,
    value: {
      envelopeType: 'shared_month_advance_processing_validation_failure',
      resultKey: `class:${classId === '' ? 'unknown-class' : classId}:advance:${transitionKeyPart}:shared-month-advance:validation-failure`,
      processingBoundary: 'shared_processing_validation_boundary',
      classId: classId === '' ? null : classId,
      currentMonthIndex: currentMonthIndexIsValid ? input.currentMonthIndex : null,
      nextMonthIndex: nextMonthIndexIsValid ? input.nextMonthIndex : null,
      resultStatus: 'validation_failed',
      processingPath: 'none_validation_failed',
      deliverySemantics: 'shared_processing_safe_validation_errors',
      validationErrors: processingResult.errors,
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

export function createAutoMonthAdvanceScheduledTriggerDescriptor(
  request: AutoMonthAdvanceRequest,
): AutoMonthAdvanceScheduledTriggerDescriptor {
  return {
    descriptorType: 'auto_month_advance_scheduled_trigger_descriptor',
    triggerKey: `${request.idempotencyKey}:scheduled-auto-trigger`,
    triggerBoundary: 'scheduled_trigger_boundary',
    triggerName: 'advance_auto_month',
    requiredScope: 'auto_paced_class',
    classId: request.classId,
    triggerMode: request.triggerMode,
    triggerSource: 'auto',
    currentMonthIndex: request.currentMonthIndex,
    nextMonthIndex: request.nextMonthIndex,
    totalMonths: request.totalMonths,
    idempotencyKey: request.idempotencyKey,
    processingIntent: 'create_shared_month_advance_processing_request',
  };
}

export function createAutoMonthAdvanceScheduledTriggerResultEnvelope(
  descriptor: AutoMonthAdvanceScheduledTriggerDescriptor,
): AutoMonthAdvanceScheduledTriggerResultEnvelope {
  return {
    envelopeType: 'auto_month_advance_scheduled_trigger_result',
    resultKey: `${descriptor.triggerKey}:result-envelope`,
    triggerKey: descriptor.triggerKey,
    triggerBoundary: 'scheduled_trigger_result_boundary',
    triggerName: descriptor.triggerName,
    requiredScope: descriptor.requiredScope,
    classId: descriptor.classId,
    idempotencyKey: descriptor.idempotencyKey,
    resultStatus: 'accepted_auto_month_advance',
    processingIntent: descriptor.processingIntent,
    deliverySemantics: 'scheduled_trigger_safe_auto_month_advance_receipt',
    receipt: {
      receiptType: 'auto_month_advance_scheduled_trigger_receipt',
      advancementKey: descriptor.idempotencyKey,
      classId: descriptor.classId,
      triggerMode: descriptor.triggerMode,
      triggerSource: descriptor.triggerSource,
      currentMonthIndex: descriptor.currentMonthIndex,
      nextMonthIndex: descriptor.nextMonthIndex,
      totalMonths: descriptor.totalMonths,
      processingIntent: descriptor.processingIntent,
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
