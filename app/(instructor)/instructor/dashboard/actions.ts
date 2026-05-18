'use server';

import { redirect } from 'next/navigation';

import {
  executeInstructorClassCreationAction,
  type InstructorClassCreationActionStore,
} from '../../../infrastructure/auth-tenancy/instructor-class-creation-action';
import { readAuthTenancyRouteSession } from '../../../infrastructure/auth-tenancy/supabase-server';

function dashboardStatusUrl(status: string, params: Record<string, string> = {}): string {
  const searchParams = new URLSearchParams({ classCreationStatus: status, ...params });
  return `/instructor/dashboard?${searchParams.toString()}`;
}

export async function createInstructorClass(formData: FormData): Promise<void> {
  const routeSession = await readAuthTenancyRouteSession();
  if (!routeSession.ok || routeSession.session.role !== 'instructor') {
    redirect(dashboardStatusUrl('not-authorized'));
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
        dashboardStatusUrl('validation-error', {
          errors: result.failure.validationErrors?.map((error) => error.code).join(',') ?? 'invalid_draft',
        }),
      );
    }

    redirect(dashboardStatusUrl('failed', { reason: result.failure.code }));
  }

  redirect(
    dashboardStatusUrl('created', {
      joinCode: result.value.receipt.joinCode,
      triggerMode: result.value.receipt.triggerMode,
    }),
  );
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
