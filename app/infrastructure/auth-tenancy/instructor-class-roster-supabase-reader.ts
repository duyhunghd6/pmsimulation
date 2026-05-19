import type { AuthTenancySession } from './session';
import {
  parseInstructorClassRosterRow,
  type AuthTenancyDatabaseRowFailureCode,
  type InstructorClassRosterRow,
} from './rows';

type SupabaseClassRosterResult = {
  data: readonly unknown[] | null;
  error: unknown | null;
};

type SupabaseClassRosterOrderQuery = PromiseLike<SupabaseClassRosterResult>;

type SupabaseClassRosterFilterQuery = {
  order(column: string, options: { ascending: boolean }): SupabaseClassRosterOrderQuery;
};

type SupabaseClassRosterSelectQuery = {
  match(filters: Record<string, string>): SupabaseClassRosterFilterQuery;
};

type SupabaseInstructorClassRosterClient = {
  from(tableName: string): {
    select(columns: string): SupabaseClassRosterSelectQuery;
  };
};

export type InstructorClassRosterReadFailureCode = 'provider_read_failed' | 'roster_row_rejected';

export type InstructorClassRosterReadResult =
  | { ok: true; roster: readonly InstructorClassRosterRow[] }
  | {
      ok: false;
      code: InstructorClassRosterReadFailureCode;
      rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
    };

export function createSupabaseInstructorClassRosterReader(client: SupabaseInstructorClassRosterClient) {
  return {
    async readInstructorClassRoster(input: { session: AuthTenancySession; classId: string }): Promise<InstructorClassRosterReadResult> {
      const result = await client
        .from('funds')
        .select('id,class_id,student_id,current_aum')
        .match({ class_id: input.classId })
        .order('student_id', { ascending: true });

      if ((result.error !== null && result.error !== undefined) || !Array.isArray(result.data)) {
        return { ok: false, code: 'provider_read_failed' };
      }

      const roster: InstructorClassRosterRow[] = [];
      for (const row of result.data) {
        const parsed = parseInstructorClassRosterRow(row, {
          session: input.session,
          scope: { classId: input.classId },
        });
        if (!parsed.ok) {
          return { ok: false, code: 'roster_row_rejected', rowFailureCode: parsed.code };
        }
        roster.push(parsed.row);
      }

      return { ok: true, roster };
    },
  };
}
