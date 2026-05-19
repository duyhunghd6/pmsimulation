import { randomUUID } from 'node:crypto';

import type { StudentClassEnrollmentActionStore } from './student-class-enrollment-action';

type SupabaseSingleResult = {
  data: unknown | null;
  error: unknown | null;
};

type SupabaseRpcSingleQuery = {
  single(): PromiseLike<SupabaseSingleResult>;
};

type SupabaseStudentClassEnrollmentClient = {
  rpc(functionName: string, args: Record<string, unknown>): SupabaseRpcSingleQuery;
};

export function createSupabaseStudentClassEnrollmentStore(
  client: SupabaseStudentClassEnrollmentClient,
): StudentClassEnrollmentActionStore {
  return {
    async joinClassByCode({ command }) {
      const result = await client
        .rpc('join_class_by_code', {
          target_fund_id: randomUUID(),
          target_student_join_code: command.joinCode,
        })
        .single();

      if (result.error !== null && result.error !== undefined) {
        throw new Error('Supabase student class enrollment write failed: join_class_by_code');
      }

      return result.data;
    },
  };
}
