import { randomUUID } from 'node:crypto';

import type { InstructorClassCreationActionStore } from './instructor-class-creation-action';

type SupabaseSingleResult = {
  data: unknown | null;
  error: unknown | null;
};

type SupabaseRpcSingleQuery = {
  single(): PromiseLike<SupabaseSingleResult>;
};

type SupabaseInstructorClassCreationClient = {
  rpc(functionName: string, args: Record<string, unknown>): SupabaseRpcSingleQuery;
};

export function createSupabaseInstructorClassCreationStore(
  client: SupabaseInstructorClassCreationClient,
): InstructorClassCreationActionStore {
  return {
    async createInstructorClass({ command }) {
      const result = await client
        .rpc('create_instructor_class', {
          target_class_id: randomUUID(),
          target_current_month_index: command.initialMonthIndex,
          target_display_name: command.className,
          target_student_join_code: command.joinCode,
          target_total_months: 12,
          target_trigger_mode: command.triggerMode,
        })
        .single();

      if (result.error !== null && result.error !== undefined) {
        throw new Error('Supabase instructor class creation write failed: create_instructor_class');
      }

      return result.data;
    },
  };
}
