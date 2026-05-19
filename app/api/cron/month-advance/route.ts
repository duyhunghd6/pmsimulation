import { NextResponse, type NextRequest } from 'next/server';

import {
  createAutoMonthAdvanceRequest,
  createAutoMonthAdvanceScheduledTriggerDescriptor,
  createAutoMonthAdvanceScheduledTriggerResultEnvelope,
  createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope,
} from '../../../domain/classes/month-advancement';
import {
  createMonthAdvanceAutoClassDiscoveryReaderFromEnvironment,
  executeAutoMonthAdvanceInngestHandoff,
  executeMonthAdvanceAutoClassDiscoveryHandoff,
  sendMonthAdvanceRequestedEvent,
} from '../../../infrastructure/inngest/month-advance';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authorization = authorizeCronRequest(request.headers, process.env.CRON_SECRET);

  if (!authorization.ok) {
    return NextResponse.json(
      {
        status: authorization.code,
        deliverySemantics: 'scheduled_trigger_safe_validation_errors',
      },
      { status: authorization.status },
    );
  }

  if (!hasExplicitClassAdvanceParams(request)) {
    return executeDiscoveredAutoMonthAdvanceHandoff();
  }

  const input = {
    classId: request.nextUrl.searchParams.get('classId') ?? '',
    triggerMode: 'auto',
    currentMonthIndex: parseSearchInteger(request.nextUrl.searchParams.get('currentMonthIndex')),
    totalMonths: parseSearchInteger(request.nextUrl.searchParams.get('totalMonths')),
  };
  const requestResult = createAutoMonthAdvanceRequest(input);

  if (!requestResult.ok) {
    const failure = createAutoMonthAdvanceScheduledTriggerValidationFailureEnvelope(input);

    return NextResponse.json(
      {
        status: 'rejected_auto_month_advance',
        failure: failure.ok
          ? failure.value
          : {
              resultStatus: 'validation_failed',
              deliverySemantics: 'scheduled_trigger_safe_validation_errors',
              validationErrors: requestResult.errors,
            },
      },
      { status: 400 },
    );
  }

  const descriptor = createAutoMonthAdvanceScheduledTriggerDescriptor(requestResult.value);
  const result = createAutoMonthAdvanceScheduledTriggerResultEnvelope(descriptor);

  try {
    const handoffResult = await executeAutoMonthAdvanceInngestHandoff({
      request: requestResult.value,
      sender: { send: sendMonthAdvanceRequestedEvent },
    });

    if (!handoffResult.ok) {
      return NextResponse.json(
        {
          status: 'rejected_auto_month_advance_worker_handoff',
          result,
          failure: handoffResult.failure,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        status: 'accepted_auto_month_advance',
        result,
        workerHandoff: handoffResult.value,
      },
      { status: 202 },
    );
  } catch {
    return NextResponse.json(
      {
        status: 'worker_dispatch_failed',
        result,
        deliverySemantics: 'scheduled_trigger_safe_auto_month_advance_receipt',
      },
      { status: 502 },
    );
  }
}

async function executeDiscoveredAutoMonthAdvanceHandoff(): Promise<NextResponse> {
  const reader = createMonthAdvanceAutoClassDiscoveryReaderFromEnvironment(process.env);

  if (!reader.ok) {
    return NextResponse.json(
      {
        status: 'auto_month_advance_discovery_runtime_not_configured',
        code: reader.code,
        deliverySemantics: 'scheduled_trigger_safe_runtime_configuration_error',
      },
      { status: 503 },
    );
  }

  const result = await executeMonthAdvanceAutoClassDiscoveryHandoff({
    reader: reader.reader,
    sender: { send: sendMonthAdvanceRequestedEvent },
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        status: 'auto_month_advance_discovery_failed',
        failure: result.failure,
      },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      status: 'accepted_auto_month_advance_discovery',
      result: result.value,
    },
    { status: 202 },
  );
}

function hasExplicitClassAdvanceParams(request: NextRequest): boolean {
  return (
    request.nextUrl.searchParams.has('classId') ||
    request.nextUrl.searchParams.has('currentMonthIndex') ||
    request.nextUrl.searchParams.has('totalMonths')
  );
}

function authorizeCronRequest(headers: Headers, cronSecret: string | undefined):
  | { ok: true }
  | { ok: false; code: 'cron_secret_not_configured' | 'not_authorized'; status: 503 | 401 } {
  if (!cronSecret) {
    return { ok: false, code: 'cron_secret_not_configured', status: 503 };
  }

  if (headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return { ok: false, code: 'not_authorized', status: 401 };
  }

  return { ok: true };
}

function parseSearchInteger(value: string | null): number {
  return Number.parseInt(String(value ?? ''), 10);
}
