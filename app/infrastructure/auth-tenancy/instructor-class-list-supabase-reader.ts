import type { AuthTenancySession } from './session';
import {
  parseInstructorOwnedClassRow,
  type AuthTenancyDatabaseRowFailureCode,
  type InstructorOwnedClassRow,
} from './rows';

type SupabaseClassListResult = {
  data: unknown[] | null;
  error: unknown | null;
};

type SupabaseClassListOrderQuery = PromiseLike<SupabaseClassListResult>;

type SupabaseClassListFilterQuery = {
  order(column: string, options: { ascending: boolean }): SupabaseClassListOrderQuery;
};

type SupabaseClassListSelectQuery = {
  eq(column: string, value: string): SupabaseClassListFilterQuery;
};

type SupabaseInstructorClassListClient = {
  from(tableName: string): {
    select(columns: string): SupabaseClassListSelectQuery;
  };
};

export type InstructorClassListReadFailureCode = 'provider_read_failed' | 'class_row_rejected';

export type InstructorClassListReadResult =
  | { ok: true; classes: readonly InstructorOwnedClassRow[] }
  | {
      ok: false;
      code: InstructorClassListReadFailureCode;
      rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
    };

export function createSupabaseInstructorClassListReader(client: SupabaseInstructorClassListClient) {
  return {
    async readInstructorClasses(input: { session: AuthTenancySession }): Promise<InstructorClassListReadResult> {
      const result = await client
        .from('classes')
        .select('id,instructor_id,display_name,trigger_mode,current_month_index,total_months,student_join_code,created_at')
        .eq('instructor_id', input.session.subjectId)
        .order('created_at', { ascending: false });

      if ((result.error !== null && result.error !== undefined) || !Array.isArray(result.data)) {
        return { ok: false, code: 'provider_read_failed' };
      }

      const classes: InstructorOwnedClassRow[] = [];
      for (const row of result.data) {
        const classId = readClassId(row);
        const parsed = parseInstructorOwnedClassRow(row, {
          session: input.session,
          scope: { classId },
        });
        if (!parsed.ok) {
          return { ok: false, code: 'class_row_rejected', rowFailureCode: parsed.code };
        }
        classes.push(parsed.row);
      }

      return { ok: true, classes };
    },
  };
}

function readClassId(row: unknown): string {
  if (typeof row === 'object' && row !== null && !Array.isArray(row) && typeof (row as { id?: unknown }).id === 'string') {
    return (row as { id: string }).id;
  }

  return '00000000-0000-4000-8000-000000000000';
}
