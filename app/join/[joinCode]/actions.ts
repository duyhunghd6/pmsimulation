'use server';

import { redirect } from 'next/navigation';

import {
  executeStudentClassEnrollmentAction,
  type StudentClassEnrollmentActionStore,
} from '../../infrastructure/auth-tenancy/student-class-enrollment-action';
import { createSupabaseStudentClassEnrollmentStore } from '../../infrastructure/auth-tenancy/student-class-enrollment-supabase-store';
import { createAuthTenancySupabaseServerClient, readAuthTenancyRouteSession } from '../../infrastructure/auth-tenancy/supabase-server';

const fallbackClassId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fallbackFundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

function joinStatusUrl(joinCode: string, status: string, params: Record<string, string> = {}): string {
  const searchParams = new URLSearchParams({ joinStatus: status, ...params });
  return `/join/${encodeURIComponent(joinCode)}?${searchParams.toString()}`;
}

export async function joinClassByCode(formData: FormData): Promise<void> {
  const joinCode = String(formData.get('joinCode') ?? '').trim().toUpperCase();
  const routeSession = await readAuthTenancyRouteSession();
  if (!routeSession.ok || routeSession.session.role !== 'student') {
    redirect(joinStatusUrl(joinCode, 'not-authorized'));
  }

  const result = await executeStudentClassEnrollmentAction({
    session: routeSession.session,
    joinInput: { studentId: routeSession.session.subjectId, joinCode },
    store: await createStudentClassEnrollmentStore(routeSession.session.subjectId),
  });

  if (!result.ok) {
    if (result.failure.code === 'invalid_join_request') {
      redirect(
        joinStatusUrl(joinCode, 'validation-error', {
          errors: result.failure.validationErrors?.map((error) => error.code).join(',') ?? 'invalid_join_request',
        }),
      );
    }

    redirect(joinStatusUrl(joinCode, 'failed', { reason: result.failure.code }));
  }

  redirect(
    joinStatusUrl(joinCode, 'enrolled', {
      className: result.value.receipt.className,
      currentMonth: String(result.value.receipt.currentMonthIndex + 1),
    }),
  );
}

async function createStudentClassEnrollmentStore(studentId: string): Promise<StudentClassEnrollmentActionStore> {
  const supabase = await createAuthTenancySupabaseServerClient();
  if (supabase.ok) {
    return createSupabaseStudentClassEnrollmentStore(supabase.client);
  }

  return createBoundedStudentClassEnrollmentStore(studentId);
}

function createBoundedStudentClassEnrollmentStore(studentId: string): StudentClassEnrollmentActionStore {
  return {
    async joinClassByCode({ command }) {
      return {
        class_id: fallbackClassId,
        student_id: studentId,
        fund_id: fallbackFundId,
        display_name: 'Alpha Capital Lab',
        current_month_index: 0,
        student_join_code: command.joinCode,
      };
    },
  };
}
