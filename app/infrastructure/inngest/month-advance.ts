import { createClient } from '@supabase/supabase-js';
import { Inngest } from 'inngest';

import {
  createAutoMonthAdvanceRequest,
  createClassMonthAdvanceProcessingResult,
  createClassMonthAdvanceProcessingValidationFailureEnvelope,
  createMonthAdvanceRealtimePublicationEnvelope,
  createMonthAdvanceRealtimeRefreshSignal,
  createMonthAdvanceTurnCompletionEvent,
  createMonthAdvanceWorkerJob,
  createMonthAdvanceWorkerJobResultEnvelope,
  createSharedMonthAdvanceProcessingRequest,
  createSharedMonthAdvanceProcessingValidationFailureEnvelope,
  createSupabaseRealtimePublicationDescriptor,
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
import {
  publishSupabaseRealtimeRefresh,
  type SupabaseRealtimeClient,
  type SupabaseRealtimePublicationResult,
} from '../realtime/supabase-publication';
import { createSupabaseMonthAdvanceClassMonthProcessingStore } from './month-advance-supabase-store';

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
  realtimePublication: SupabaseRealtimePublicationResult;
};

export type MonthAdvanceClassMonthProcessingResult =
  | { ok: true; value: MonthAdvanceClassMonthProcessingCompleted }
  | { ok: false; failure: SharedMonthAdvanceProcessingValidationFailureEnvelope | ClassMonthAdvanceProcessingValidationFailureEnvelope };

export type MonthAdvanceAutoClassDiscoveryRow = {
  classId: string;
  triggerMode: 'auto';
  currentMonthIndex: number;
  totalMonths: number;
};

export type MonthAdvanceAutoClassDiscoveryReader = {
  readAutoClassRows(): Promise<MonthAdvanceAutoClassDiscoveryRow[]>;
};

export type MonthAdvanceAutoClassDiscoveryCompleted = {
  resultStatus: 'accepted_auto_month_advance_discovery';
  discoveryBoundary: 'auto_month_advance_discovery_boundary';
  discoveredClassCount: number;
  acceptedClassCount: number;
  workerHandoffs: MonthAdvanceWorkerJobResultEnvelope[];
  deliverySemantics: 'scheduled_trigger_safe_auto_month_advance_receipt';
};

export type MonthAdvanceAutoClassDiscoveryFailure = {
  resultStatus: 'auto_month_advance_discovery_failed';
  discoveryBoundary: 'auto_month_advance_discovery_boundary';
  failureCode: 'provider_error';
  deliverySemantics: 'scheduled_trigger_safe_provider_failure';
};

export type MonthAdvanceAutoClassDiscoveryHandoffResult =
  | { ok: true; value: MonthAdvanceAutoClassDiscoveryCompleted }
  | { ok: false; failure: MonthAdvanceAutoClassDiscoveryFailure };

export type MonthAdvanceWorkerRuntimeEnvironment = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

export type MonthAdvanceWorkerRuntimeEnvironmentFailureCode =
  | 'environment_not_object'
  | 'missing_supabase_url'
  | 'invalid_supabase_url'
  | 'missing_supabase_service_role_key'
  | 'invalid_supabase_service_role_key';

export type MonthAdvanceWorkerRuntimeEnvironmentParseResult =
  | { ok: true; env: MonthAdvanceWorkerRuntimeEnvironment }
  | { ok: false; code: MonthAdvanceWorkerRuntimeEnvironmentFailureCode };

export type MonthAdvanceRuntimeWorkerBoundaries = {
  reader: MonthAdvanceClassMonthProcessingReader;
  writer: MonthAdvanceClassMonthProcessingWriter;
  realtimeClient: SupabaseRealtimeClient;
};

export type MonthAdvanceRuntimeWorkerBoundariesResult =
  | { ok: true; boundaries: MonthAdvanceRuntimeWorkerBoundaries }
  | { ok: false; code: MonthAdvanceWorkerRuntimeEnvironmentFailureCode };

export type MonthAdvanceAutoClassDiscoveryReaderResult =
  | { ok: true; reader: MonthAdvanceAutoClassDiscoveryReader }
  | { ok: false; code: MonthAdvanceWorkerRuntimeEnvironmentFailureCode };

type SupabaseAutoClassDiscoveryResult = {
  data: unknown[] | null;
  error: unknown;
};

type SupabaseAutoClassDiscoveryQuery = {
  eq(column: string, value: unknown): PromiseLike<SupabaseAutoClassDiscoveryResult>;
};

type SupabaseAutoClassDiscoveryClient = {
  from(table: string): {
    select(columns: string): SupabaseAutoClassDiscoveryQuery;
  };
};

export type MonthAdvanceRuntimeWorkerResult =
  | {
      status: 'completed_month_advance_worker_job';
      result: MonthAdvanceWorkerJobResultEnvelope;
      processing: MonthAdvanceClassMonthProcessingCompleted;
    }
  | { status: 'rejected_month_advance_worker_job'; failure: SharedMonthAdvanceProcessingValidationFailureEnvelope | ClassMonthAdvanceProcessingValidationFailureEnvelope }
  | {
      status: 'worker_runtime_not_configured';
      result: MonthAdvanceWorkerJobResultEnvelope;
      code: MonthAdvanceWorkerRuntimeEnvironmentFailureCode;
      deliverySemantics: 'worker_safe_runtime_configuration_error';
    }
  | {
      status: 'worker_runtime_failed';
      result: MonthAdvanceWorkerJobResultEnvelope;
      deliverySemantics: 'worker_safe_runtime_failure';
    };

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
  realtimeClient: SupabaseRealtimeClient;
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
  const signal = createMonthAdvanceRealtimeRefreshSignal(event);
  const publicationEnvelope = createMonthAdvanceRealtimePublicationEnvelope(signal);
  const publicationDescriptor = createSupabaseRealtimePublicationDescriptor(publicationEnvelope);
  const realtimePublication = await publishSupabaseRealtimeRefresh({
    descriptor: publicationDescriptor,
    client: input.realtimeClient,
  });

  return {
    ok: true,
    value: {
      resultStatus: 'completed_class_month_processing',
      processingPath: 'shared_month_advance',
      event,
      persistence,
      realtimePublication,
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

export function parseMonthAdvanceWorkerRuntimeEnvironment(input: unknown): MonthAdvanceWorkerRuntimeEnvironmentParseResult {
  if (!isRecord(input)) {
    return { ok: false, code: 'environment_not_object' };
  }

  const supabaseUrl = input.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl === undefined || supabaseUrl === '') {
    return { ok: false, code: 'missing_supabase_url' };
  }
  if (typeof supabaseUrl !== 'string' || !isSupabaseRuntimeUrl(supabaseUrl)) {
    return { ok: false, code: 'invalid_supabase_url' };
  }

  const supabaseServiceRoleKey = input.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseServiceRoleKey === undefined || supabaseServiceRoleKey === '') {
    return { ok: false, code: 'missing_supabase_service_role_key' };
  }
  if (typeof supabaseServiceRoleKey !== 'string' || supabaseServiceRoleKey.trim() !== supabaseServiceRoleKey) {
    return { ok: false, code: 'invalid_supabase_service_role_key' };
  }

  return { ok: true, env: { supabaseUrl, supabaseServiceRoleKey } };
}

export function createMonthAdvanceRuntimeWorkerBoundariesFromEnvironment(
  environment: unknown,
): MonthAdvanceRuntimeWorkerBoundariesResult {
  const parsed = parseMonthAdvanceWorkerRuntimeEnvironment(environment);
  if (!parsed.ok) {
    return { ok: false, code: parsed.code };
  }

  const client = createClient(parsed.env.supabaseUrl, parsed.env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const store = createSupabaseMonthAdvanceClassMonthProcessingStore(client);

  return {
    ok: true,
    boundaries: {
      reader: store,
      writer: store,
      realtimeClient: client,
    },
  };
}

export function createSupabaseMonthAdvanceAutoClassDiscoveryReader(
  client: SupabaseAutoClassDiscoveryClient,
): MonthAdvanceAutoClassDiscoveryReader {
  return {
    async readAutoClassRows() {
      const result = await client
        .from('classes')
        .select('id, trigger_mode, current_month_index, total_months')
        .eq('trigger_mode', 'auto');

      if (result.error) {
        throw new Error('Supabase auto month advance discovery failed.');
      }

      return parseAutoClassDiscoveryRows(result.data);
    },
  };
}

export function createMonthAdvanceAutoClassDiscoveryReaderFromEnvironment(
  environment: unknown,
): MonthAdvanceAutoClassDiscoveryReaderResult {
  const parsed = parseMonthAdvanceWorkerRuntimeEnvironment(environment);
  if (!parsed.ok) {
    return { ok: false, code: parsed.code };
  }

  const client = createClient(parsed.env.supabaseUrl, parsed.env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as unknown as SupabaseAutoClassDiscoveryClient;

  return { ok: true, reader: createSupabaseMonthAdvanceAutoClassDiscoveryReader(client) };
}

export async function executeMonthAdvanceAutoClassDiscoveryHandoff(input: {
  reader: MonthAdvanceAutoClassDiscoveryReader;
  sender: MonthAdvanceInngestEventSender;
}): Promise<MonthAdvanceAutoClassDiscoveryHandoffResult> {
  try {
    const rows = await input.reader.readAutoClassRows();
    const workerHandoffs: MonthAdvanceWorkerJobResultEnvelope[] = [];

    for (const row of rows) {
      const requestResult = createAutoMonthAdvanceRequest({
        classId: row.classId,
        triggerMode: row.triggerMode,
        currentMonthIndex: row.currentMonthIndex,
        totalMonths: row.totalMonths,
      });

      if (!requestResult.ok) {
        continue;
      }

      const handoffResult = await executeAutoMonthAdvanceInngestHandoff({
        request: requestResult.value,
        sender: input.sender,
      });

      if (handoffResult.ok) {
        workerHandoffs.push(handoffResult.value);
      }
    }

    return {
      ok: true,
      value: {
        resultStatus: 'accepted_auto_month_advance_discovery',
        discoveryBoundary: 'auto_month_advance_discovery_boundary',
        discoveredClassCount: rows.length,
        acceptedClassCount: workerHandoffs.length,
        workerHandoffs,
        deliverySemantics: 'scheduled_trigger_safe_auto_month_advance_receipt',
      },
    };
  } catch {
    return {
      ok: false,
      failure: {
        resultStatus: 'auto_month_advance_discovery_failed',
        discoveryBoundary: 'auto_month_advance_discovery_boundary',
        failureCode: 'provider_error',
        deliverySemantics: 'scheduled_trigger_safe_provider_failure',
      },
    };
  }
}

export async function executeMonthAdvanceRuntimeWorkerFromInngestEventData(input: {
  data: unknown;
  environment: unknown;
  createBoundaries?: (environment: unknown) => MonthAdvanceRuntimeWorkerBoundariesResult;
}): Promise<MonthAdvanceRuntimeWorkerResult> {
  const result = createMonthAdvanceWorkerJobResultFromInngestEventData(input.data);

  if (!result.ok) {
    return {
      status: 'rejected_month_advance_worker_job',
      failure: result.failure,
    };
  }

  const boundaries = (input.createBoundaries ?? createMonthAdvanceRuntimeWorkerBoundariesFromEnvironment)(input.environment);
  if (!boundaries.ok) {
    return {
      status: 'worker_runtime_not_configured',
      result: result.value,
      code: boundaries.code,
      deliverySemantics: 'worker_safe_runtime_configuration_error',
    };
  }

  let processing: MonthAdvanceClassMonthProcessingResult;
  try {
    processing = await executeMonthAdvanceClassMonthProcessingFromInngestEventData({
      data: input.data,
      reader: boundaries.boundaries.reader,
      writer: boundaries.boundaries.writer,
      realtimeClient: boundaries.boundaries.realtimeClient,
    });
  } catch {
    return {
      status: 'worker_runtime_failed',
      result: result.value,
      deliverySemantics: 'worker_safe_runtime_failure',
    };
  }

  if (!processing.ok) {
    return {
      status: 'rejected_month_advance_worker_job',
      failure: processing.failure,
    };
  }

  return {
    status: 'completed_month_advance_worker_job',
    result: result.value,
    processing: processing.value,
  };
}

export const monthAdvanceRequestedFunction = inngest.createFunction(
  { id: 'month-advance-requested', triggers: { event: MONTH_ADVANCE_REQUESTED_EVENT } },
  async ({ event }) => executeMonthAdvanceRuntimeWorkerFromInngestEventData({ data: event.data, environment: process.env }),
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

function parseAutoClassDiscoveryRows(rows: unknown[] | null): MonthAdvanceAutoClassDiscoveryRow[] {
  if (!Array.isArray(rows)) {
    throw new Error('Supabase auto month advance discovery rows rejected.');
  }

  return rows.map(parseAutoClassDiscoveryRow);
}

function parseAutoClassDiscoveryRow(row: unknown): MonthAdvanceAutoClassDiscoveryRow {
  if (!isRecord(row)) {
    throw new Error('Supabase auto month advance discovery row rejected.');
  }

  const classId = readString(row.id).trim();
  const triggerMode = readString(row.trigger_mode);
  const currentMonthIndex = readNumber(row.current_month_index);
  const totalMonths = readNumber(row.total_months);

  if (
    classId === '' ||
    triggerMode !== 'auto' ||
    !Number.isInteger(currentMonthIndex) ||
    currentMonthIndex < 0 ||
    !Number.isInteger(totalMonths) ||
    totalMonths < 12 ||
    totalMonths > 24 ||
    currentMonthIndex >= totalMonths
  ) {
    throw new Error('Supabase auto month advance discovery row rejected.');
  }

  return {
    classId,
    triggerMode: 'auto',
    currentMonthIndex,
    totalMonths,
  };
}

function isSupabaseRuntimeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const isLocalSupabase = url.protocol === 'http:' && url.hostname === '127.0.0.1';
    const isHostedSupabase = url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');
    return isLocalSupabase || isHostedSupabase;
  } catch {
    return false;
  }
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
