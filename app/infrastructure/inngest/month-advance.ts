import { Inngest } from 'inngest';

import {
  createClassMonthAdvanceProcessingResult,
  createClassMonthAdvanceProcessingValidationFailureEnvelope,
  createMonthAdvanceTurnCompletionEvent,
  createMonthAdvanceWorkerJob,
  createMonthAdvanceWorkerJobResultEnvelope,
  createSharedMonthAdvanceProcessingRequest,
  createSharedMonthAdvanceProcessingValidationFailureEnvelope,
  type AutoMonthAdvanceRequest,
  type ClassMonthAdvanceFundProcessingInput,
  type ClassMonthAdvanceProcessingRecord,
  type ClassMonthAdvanceProcessingValidationFailureEnvelope,
  type InstructorLiveMonthAdvanceRequest,
  type MonthAdvanceTurnCompletionEvent,
  type MonthAdvanceWorkerJobResultEnvelope,
  type SharedMonthAdvanceProcessingInput,
  type SharedMonthAdvanceProcessingResult,
  type SharedMonthAdvanceProcessingValidationFailureEnvelope,
  type SharedMonthAdvanceProcessingRequest,
} from '../../domain/classes/month-advancement';

export const MONTH_ADVANCE_REQUESTED_EVENT = 'app/month.advance.requested';

export const inngest = new Inngest({ id: 'apex-alpha-portfolio-simulator' });

export type MonthAdvanceInngestEventData = {
  classId: string;
  triggerMode: 'manual' | 'auto';
  triggerSource: 'live' | 'auto';
  currentMonthIndex: number;
  nextMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  processingPath: 'shared_month_advance';
};

export type MonthAdvanceInngestEvent = {
  id: string;
  name: typeof MONTH_ADVANCE_REQUESTED_EVENT;
  data: MonthAdvanceInngestEventData;
};

export type MonthAdvanceInngestWorkerResult =
  | { ok: true; value: MonthAdvanceWorkerJobResultEnvelope }
  | { ok: false; failure: SharedMonthAdvanceProcessingValidationFailureEnvelope };

export type MonthAdvanceInngestHandoffResult = MonthAdvanceInngestWorkerResult;

export type MonthAdvanceInngestEventSender = {
  send(event: MonthAdvanceInngestEvent): Promise<unknown>;
};

export type MonthAdvanceClassMonthProcessingReader = {
  readFundInputs(request: SharedMonthAdvanceProcessingRequest): Promise<ClassMonthAdvanceFundProcessingInput[]>;
};

export type MonthAdvanceClassMonthProcessingPersistenceReceipt = {
  receiptType: 'class_month_processing_persistence_receipt';
  classMonthWriteKey: string;
  ledgerWriteCount: number;
  processedMonthIndex: number;
  advancedToMonthIndex: number;
};

export type MonthAdvanceClassMonthProcessingWriter = {
  writeClassMonthProcessingResult(
    record: ClassMonthAdvanceProcessingRecord,
  ): Promise<MonthAdvanceClassMonthProcessingPersistenceReceipt>;
};

export type MonthAdvanceClassMonthProcessingCompleted = {
  resultStatus: 'completed_class_month_processing';
  processingPath: 'shared_month_advance';
  event: MonthAdvanceTurnCompletionEvent;
  persistence: MonthAdvanceClassMonthProcessingPersistenceReceipt;
};

export type MonthAdvanceClassMonthProcessingResult =
  | { ok: true; value: MonthAdvanceClassMonthProcessingCompleted }
  | { ok: false; failure: SharedMonthAdvanceProcessingValidationFailureEnvelope | ClassMonthAdvanceProcessingValidationFailureEnvelope };

export function createMonthAdvanceInngestEvent(request: SharedMonthAdvanceProcessingRequest): MonthAdvanceInngestEvent {
  return {
    id: request.idempotencyKey,
    name: MONTH_ADVANCE_REQUESTED_EVENT,
    data: {
      classId: request.classId,
      triggerMode: request.triggerMode,
      triggerSource: request.triggerSource,
      currentMonthIndex: request.currentMonthIndex,
      nextMonthIndex: request.nextMonthIndex,
      totalMonths: request.totalMonths,
      idempotencyKey: request.idempotencyKey,
      processingPath: request.processingPath,
    },
  };
}

export async function executeMonthAdvanceInngestHandoff(input: {
  processingRequest: SharedMonthAdvanceProcessingRequest;
  sender: MonthAdvanceInngestEventSender;
}): Promise<MonthAdvanceInngestHandoffResult> {
  const event = createMonthAdvanceInngestEvent(input.processingRequest);
  await input.sender.send(event);

  return createMonthAdvanceWorkerJobResultFromRequest(input.processingRequest);
}

export async function executeLiveMonthAdvanceInngestHandoff(input: {
  request: InstructorLiveMonthAdvanceRequest;
  sender: MonthAdvanceInngestEventSender;
}): Promise<MonthAdvanceInngestHandoffResult> {
  return executeTriggerMonthAdvanceInngestHandoff({
    request: input.request,
    triggerSource: 'live',
    sender: input.sender,
  });
}

export async function executeAutoMonthAdvanceInngestHandoff(input: {
  request: AutoMonthAdvanceRequest;
  sender: MonthAdvanceInngestEventSender;
}): Promise<MonthAdvanceInngestHandoffResult> {
  return executeTriggerMonthAdvanceInngestHandoff({
    request: input.request,
    triggerSource: 'auto',
    sender: input.sender,
  });
}

async function executeTriggerMonthAdvanceInngestHandoff(input: {
  request: InstructorLiveMonthAdvanceRequest | AutoMonthAdvanceRequest;
  triggerSource: 'live' | 'auto';
  sender: MonthAdvanceInngestEventSender;
}): Promise<MonthAdvanceInngestHandoffResult> {
  const processingInput: SharedMonthAdvanceProcessingInput = {
    classId: input.request.classId,
    triggerMode: input.request.triggerMode,
    triggerSource: input.triggerSource,
    currentMonthIndex: input.request.currentMonthIndex,
    nextMonthIndex: input.request.nextMonthIndex,
    totalMonths: input.request.totalMonths,
    idempotencyKey: input.request.idempotencyKey,
  };
  const processingRequest = createSharedMonthAdvanceProcessingRequest(processingInput);

  if (!processingRequest.ok) {
    const failure = createSharedMonthAdvanceProcessingValidationFailureEnvelope(processingInput);

    if (failure.ok) {
      return { ok: false, failure: failure.value };
    }

    return {
      ok: false,
      failure: {
        envelopeType: 'shared_month_advance_processing_validation_failure',
        resultKey: `class:${input.request.classId}:advance:${input.request.currentMonthIndex}->${input.request.nextMonthIndex}:shared-processing:validation-failure`,
        processingBoundary: 'shared_processing_validation_boundary',
        classId: input.request.classId,
        currentMonthIndex: input.request.currentMonthIndex,
        nextMonthIndex: input.request.nextMonthIndex,
        resultStatus: 'validation_failed',
        processingPath: 'none_validation_failed',
        deliverySemantics: 'shared_processing_safe_validation_errors',
        validationErrors: processingRequest.errors,
      },
    };
  }

  return executeMonthAdvanceInngestHandoff({ processingRequest: processingRequest.value, sender: input.sender });
}

export async function sendMonthAdvanceRequestedEvent(event: MonthAdvanceInngestEvent): Promise<unknown> {
  return inngest.send(event);
}

export function createSharedMonthAdvanceProcessingRequestFromInngestEventData(
  data: unknown,
): SharedMonthAdvanceProcessingResult {
  return createSharedMonthAdvanceProcessingRequest(parseMonthAdvanceInngestEventData(data));
}

export async function executeMonthAdvanceClassMonthProcessingFromInngestEventData(input: {
  data: unknown;
  reader: MonthAdvanceClassMonthProcessingReader;
  writer: MonthAdvanceClassMonthProcessingWriter;
}): Promise<MonthAdvanceClassMonthProcessingResult> {
  const processingInput = parseMonthAdvanceInngestEventData(input.data);
  const processingRequest = createSharedMonthAdvanceProcessingRequest(processingInput);

  if (!processingRequest.ok) {
    return { ok: false, failure: createSharedProcessingFailure(processingInput, processingRequest) };
  }

  const fundInputs = await input.reader.readFundInputs(processingRequest.value);
  const classMonthProcessingResult = createClassMonthAdvanceProcessingResult({
    processingRequest: processingRequest.value,
    fundInputs,
  });

  if (!classMonthProcessingResult.ok) {
    const failure = createClassMonthAdvanceProcessingValidationFailureEnvelope({
      processingRequest: processingRequest.value,
      fundInputs,
    });

    if (!failure.ok) {
      throw new Error('Class-month processing failure envelope could not be created.');
    }

    return { ok: false, failure: failure.value };
  }

  const persistence = await input.writer.writeClassMonthProcessingResult(classMonthProcessingResult.value);
  const event = createMonthAdvanceTurnCompletionEvent(classMonthProcessingResult.value);

  return {
    ok: true,
    value: {
      resultStatus: 'completed_class_month_processing',
      processingPath: 'shared_month_advance',
      event,
      persistence,
    },
  };
}

export function createMonthAdvanceWorkerJobResultFromInngestEventData(data: unknown): MonthAdvanceInngestWorkerResult {
  const processingInput = parseMonthAdvanceInngestEventData(data);
  const processingRequest = createSharedMonthAdvanceProcessingRequest(processingInput);

  if (!processingRequest.ok) {
    return { ok: false, failure: createSharedProcessingFailure(processingInput, processingRequest) };
  }

  return createMonthAdvanceWorkerJobResultFromRequest(processingRequest.value);
}

export const monthAdvanceRequestedFunction = inngest.createFunction(
  { id: 'month-advance-requested', triggers: { event: MONTH_ADVANCE_REQUESTED_EVENT } },
  async ({ event }) => {
    const result = createMonthAdvanceWorkerJobResultFromInngestEventData(event.data);

    if (!result.ok) {
      return {
        status: 'rejected_month_advance_worker_job',
        failure: result.failure,
      };
    }

    return {
      status: 'accepted_month_advance_worker_job',
      result: result.value,
    };
  },
);

function createMonthAdvanceWorkerJobResultFromRequest(
  processingRequest: SharedMonthAdvanceProcessingRequest,
): MonthAdvanceInngestWorkerResult {
  const workerJob = createMonthAdvanceWorkerJob(processingRequest);
  return { ok: true, value: createMonthAdvanceWorkerJobResultEnvelope(workerJob) };
}

function createSharedProcessingFailure(
  processingInput: SharedMonthAdvanceProcessingInput,
  processingRequest: Extract<SharedMonthAdvanceProcessingResult, { ok: false }>,
): SharedMonthAdvanceProcessingValidationFailureEnvelope {
  const failure = createSharedMonthAdvanceProcessingValidationFailureEnvelope(processingInput);

  if (failure.ok) {
    return failure.value;
  }

  return {
    envelopeType: 'shared_month_advance_processing_validation_failure',
    resultKey: 'class:unknown-class:advance:invalid-transition:shared-processing:validation-failure',
    processingBoundary: 'shared_processing_validation_boundary',
    classId: null,
    currentMonthIndex: null,
    nextMonthIndex: null,
    resultStatus: 'validation_failed',
    processingPath: 'none_validation_failed',
    deliverySemantics: 'shared_processing_safe_validation_errors',
    validationErrors: processingRequest.errors,
  };
}

function parseMonthAdvanceInngestEventData(data: unknown): SharedMonthAdvanceProcessingInput {
  const record = isRecord(data) ? data : {};

  return {
    classId: readString(record.classId),
    triggerMode: readString(record.triggerMode),
    triggerSource: readString(record.triggerSource),
    currentMonthIndex: readNumber(record.currentMonthIndex),
    nextMonthIndex: readNumber(record.nextMonthIndex),
    totalMonths: readNumber(record.totalMonths),
    idempotencyKey: readString(record.idempotencyKey),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number.NaN;
}
