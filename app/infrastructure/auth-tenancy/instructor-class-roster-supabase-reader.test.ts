import { describe, expect, it } from 'vitest';

import { createSupabaseInstructorClassRosterReader } from './instructor-class-roster-supabase-reader';

const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherClassId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const studentId = '22222222-2222-4222-8222-222222222222';

type SelectCall = {
  tableName: string;
  columns: string;
  filters: Record<string, string>;
  orderColumn: string;
  ascending: boolean;
};

function createRosterRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    class_id: classId,
    student_id: studentId,
    current_aum: '50000000.00',
    ...overrides,
  };
}

function createClient(rows: readonly unknown[], calls: SelectCall[] = []) {
  return {
    calls,
    from(tableName: string) {
      return {
        select(columns: string) {
          return {
            match(filters: Record<string, string>) {
              return {
                order<TResult1 = { data: readonly unknown[]; error: null }, TResult2 = never>(
                  orderColumn: string,
                  options: { ascending: boolean },
                  onfulfilled?: ((value: { data: readonly unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
                  onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
                ) {
                  calls.push({ tableName, columns, filters, orderColumn, ascending: options.ascending });
                  return Promise.resolve({ data: rows, error: null }).then(onfulfilled, onrejected);
                },
              };
            },
          };
        },
      };
    },
  };
}

describe('createSupabaseInstructorClassRosterReader', () => {
  it('reads roster-safe fund rows scoped to the instructor class', async () => {
    const calls: SelectCall[] = [];
    const reader = createSupabaseInstructorClassRosterReader(createClient([createRosterRow()], calls));

    const result = await reader.readInstructorClassRoster({ session: instructorSession, classId });

    expect(result).toEqual({
      ok: true,
      roster: [
        {
          classId,
          studentId,
          fundId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          currentAum: 50000000,
        },
      ],
    });
    expect(calls).toEqual([
      {
        tableName: 'funds',
        columns: 'id,class_id,student_id,current_aum',
        filters: { class_id: classId },
        orderColumn: 'student_id',
        ascending: true,
      },
    ]);
    expect(Object.prototype.hasOwnProperty.call(createRosterRow(), 'target_weights_json')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(createRosterRow(), 'asset_holdings')).toBe(false);
  });

  it('fails closed when the provider read fails', async () => {
    const client = {
      from() {
        return {
          select() {
            return {
              match() {
                return {
                  order<TResult1 = { data: null; error: { message: string } }, TResult2 = never>(
                    _orderColumn: string,
                    _options: { ascending: boolean },
                    onfulfilled?: ((value: { data: null; error: { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
                    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
                  ) {
                    return Promise.resolve({ data: null, error: { message: 'provider details' } }).then(onfulfilled, onrejected);
                  },
                };
              },
            };
          },
        };
      },
    };

    await expect(createSupabaseInstructorClassRosterReader(client).readInstructorClassRoster({ session: instructorSession, classId })).resolves.toEqual({
      ok: false,
      code: 'provider_read_failed',
    });
  });

  it('rejects rows outside the trusted class scope before browser delivery', async () => {
    const reader = createSupabaseInstructorClassRosterReader(createClient([createRosterRow({ class_id: otherClassId })]));

    await expect(reader.readInstructorClassRoster({ session: instructorSession, classId })).resolves.toEqual({
      ok: false,
      code: 'roster_row_rejected',
      rowFailureCode: 'scope_mismatch',
    });
  });
});
