'use server';

import { redirect } from 'next/navigation';

import {
  createInstructorLiveMonthAdvanceRequest,
  createInstructorLiveMonthAdvanceServerActionCommandDescriptor,
  createInstructorLiveMonthAdvanceServerActionResultEnvelope,
  createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope,
} from '../../../domain/classes/month-advancement';
import {
  executeInstructorClassCreationAction,
  type InstructorClassCreationActionStore,
} from '../../../infrastructure/auth-tenancy/instructor-class-creation-action';
import { readAuthTenancyRouteSession } from '../../../infrastructure/auth-tenancy/supabase-server';

function classCreationStatusUrl(status: string, params: Record<string, string> = {}): string {
  const searchParams = new URLSearchParams({ classCreationStatus: status, ...params });
  return `/instructor/dashboard?${searchParams.toString()}`;
}

function liveMonthAdvanceStatusUrl(status: string, params: Record<string, string> = {}): string {
  const searchParams = new URLSearchParams({ liveMonthAdvanceStatus: status, ...params });
  return `/instructor/dashboard?${searchParams.toString()}`;
}

export async function createInstructorClass(formData: FormData): Promise<void> {
  const routeSession = await readAuthTenancyRouteSession();
  if (!routeSession.ok || routeSession.session.role !== 'instructor') {
    redirect(classCreationStatusUrl('not-authorized'));
  }

  const result = await executeInstructorClassCreationAction({
    session: routeSession.session,
    draftInput: {
      className: String(formData.get('className') ?? ''),
      triggerMode: String(formData.get('triggerMode') ?? ''),
      joinCode: String(formData.get('joinCode') ?? '').trim().toUpperCase(),
    },
    store: createBoundedInstructorClassCreationStore(),
  });

  if (!result.ok) {
    if (result.failure.code === 'invalid_draft') {
      redirect(
        classCreationStatusUrl('validation-error', {
          errors: result.failure.validationErrors?.map((error) => error.code).join(',') ?? 'invalid_draft',
        }),
      );
    }

    redirect(classCreationStatusUrl('failed', { reason: result.failure.code }));
  }

  redirect(
    classCreationStatusUrl('created', {
      joinCode: result.value.receipt.joinCode,
      triggerMode: result.value.receipt.triggerMode,
    }),
  );
}

export async function advanceInstructorLiveMonth(formData: FormData): Promise<void> {
  const routeSession = await readAuthTenancyRouteSession();
  if (!routeSession.ok || routeSession.session.role !== 'instructor') {
    redirect(liveMonthAdvanceStatusUrl('not-authorized'));
  }

  const input = {
    classId: String(formData.get('classId') ?? ''),
    instructorId: routeSession.session.subjectId,
    triggerMode: String(formData.get('triggerMode') ?? ''),
    currentMonthIndex: parseFormInteger(formData.get('currentMonthIndex')),
    totalMonths: parseFormInteger(formData.get('totalMonths')),
  };
  const requestResult = createInstructorLiveMonthAdvanceRequest(input);

  if (!requestResult.ok) {
    const failureEnvelope = createInstructorLiveMonthAdvanceServerActionValidationFailureEnvelope(input);
    redirect(
      liveMonthAdvanceStatusUrl('validation-error', {
        errors: failureEnvelope.ok
          ? failureEnvelope.value.validationErrors.map((error) => error.code).join(',')
          : requestResult.errors.map((error) => error.code).join(','),
      }),
    );
  }

  const command = createInstructorLiveMonthAdvanceServerActionCommandDescriptor(requestResult.value);
  const result = createInstructorLiveMonthAdvanceServerActionResultEnvelope(command);

  redirect(
    liveMonthAdvanceStatusUrl('accepted', {
      advancementKey: result.receipt.advancementKey,
      currentMonth: String(result.receipt.currentMonthIndex + 1),
      nextMonth: String(result.receipt.nextMonthIndex + 1),
    }),
  );
}

function parseFormInteger(value: FormDataEntryValue | null): number {
  return Number.parseInt(String(value ?? ''), 10);
}

function createBoundedInstructorClassCreationStore(): InstructorClassCreationActionStore {
  return {
    async createInstructorClass({ command, session }) {
      return {
        id: '22222222-2222-4222-8222-222222222222',
        instructor_id: session.subjectId,
        display_name: command.className,
        trigger_mode: command.triggerMode,
        current_month_index: command.initialMonthIndex,
        total_months: 12,
        student_join_code: command.joinCode,
      };
    },
  };
}
