import { describe, expect, it } from 'vitest';

import { createSupabaseInstructorClassListReader } from './instructor-class-list-supabase-reader';

const instructorId = '11111111-1111-4111-8111-111111111111';
const otherInstructorId = '22222222-2222-4222-8222-222222222222';
const instructorSession = { subjectId: instructorId, role: 'instructor' as const };

type SelectCall = {
  tableName: string;
  columns: string;
  filterColumn: string;
  filterValue: string;
  orderColumn: string;
  ascending: boolean;
};

function createClassRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    instructor_id: instructorId,
    display_name: 'Alpha Capital Lab',
    trigger_mode: 'manual',
    current_month_index: 2,
    total_months: 12,
    student_join_code: 'ALPHA01',
    created_at: '2026-05-19T00:00:00.000Z',
    ...overrides,
  };
}

function createClient(rows: unknown[], calls: SelectCall[] = []) {
  return {
    calls,
    from(tableName: string) {
      return {
        select(columns: string) {
          return {
            eq(filterColumn: string, filterValue: string) {
              return {
                order<TResult1 = { data: unknown[]; error: null }, TResult2 = never>(
                  orderColumn: string,
                  options: { ascending: boolean },
                  onfulfilled?: ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
                  onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
                ) {
                  calls.push({ tableName, columns, filterColumn, filterValue, orderColumn, ascending: options.ascending });
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

describe('createSupabaseInstructorClassListReader', () => {
  it('reads instructor-owned classes through the Supabase classes table', async () => {
    const calls: SelectCall[] = [];
    const reader = createSupabaseInstructorClassListReader(createClient([createClassRow()], calls));

    const result = await reader.readInstructorClasses({ session: instructorSession });

    expect(result).toEqual({
      ok: true,
      classes: [
        {
          classId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          instructorId,
          displayName: 'Alpha Capital Lab',
          triggerMode: 'manual',
          currentMonthIndex: 2,
          totalMonths: 12,
          studentJoinCode: 'ALPHA01',
        },
      ],
    });
    expect(calls).toEqual([
      {
        tableName: 'classes',
        columns: 'id,instructor_id,display_name,trigger_mode,current_month_index,total_months,student_join_code,created_at',
        filterColumn: 'instructor_id',
        filterValue: instructorId,
        orderColumn: 'created_at',
        ascending: false,
      },
    ]);
  });

  it('fails closed when the provider read fails', async () => {
    const client = {
      from() {
        return {
          select() {
            return {
              eq() {
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

    await expect(createSupabaseInstructorClassListReader(client).readInstructorClasses({ session: instructorSession })).resolves.toEqual({
      ok: false,
      code: 'provider_read_failed',
    });
  });

  it('rejects rows outside the trusted instructor scope before browser delivery', async () => {
    const reader = createSupabaseInstructorClassListReader(createClient([createClassRow({ instructor_id: otherInstructorId })]));

    await expect(reader.readInstructorClasses({ session: instructorSession })).resolves.toEqual({
      ok: false,
      code: 'class_row_rejected',
      rowFailureCode: 'scope_mismatch',
    });
  });
});
