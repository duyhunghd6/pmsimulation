import { describe, expect, it } from 'vitest';

import { createStudentClassJoinCommandDescriptor, createStudentClassJoinRequest } from '../../domain/classes/class-enrollment';
import { createSupabaseStudentClassEnrollmentStore } from './student-class-enrollment-supabase-store';

const studentId = '11111111-1111-4111-8111-111111111111';
const studentSession = { subjectId: studentId, role: 'student' as const };

type RpcCall = {
  functionName: string;
  args: Record<string, unknown>;
};

function createCommand() {
  const request = createStudentClassJoinRequest({ studentId, joinCode: 'ALPHA01' });

  if (!request.ok) {
    throw new Error('test command setup failed');
  }

  return createStudentClassJoinCommandDescriptor(request.value);
}

function createClient(calls: RpcCall[] = []) {
  return {
    calls,
    rpc(functionName: string, args: Record<string, unknown>) {
      calls.push({ functionName, args });

      return {
        single<TResult1 = { data: unknown; error: null }, TResult2 = never>(
          onfulfilled?: ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
          onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
        ) {
          return Promise.resolve({
            data: {
              class_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
              student_id: studentId,
              fund_id: args.target_fund_id,
              display_name: 'Alpha Capital Lab',
              current_month_index: 0,
              student_join_code: args.target_student_join_code,
            },
            error: null,
          }).then(onfulfilled, onrejected);
        },
      };
    },
  };
}

describe('createSupabaseStudentClassEnrollmentStore', () => {
  it('writes a student-scoped enrollment through the bounded Supabase RPC', async () => {
    const calls: RpcCall[] = [];
    const client = createClient(calls);
    const command = createCommand();

    const row = await createSupabaseStudentClassEnrollmentStore(client).joinClassByCode({
      session: studentSession,
      command,
    });

    expect(row).toEqual({
      class_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      student_id: studentId,
      fund_id: calls[0]!.args.target_fund_id,
      display_name: 'Alpha Capital Lab',
      current_month_index: 0,
      student_join_code: 'ALPHA01',
    });
    expect(calls).toEqual([
      {
        functionName: 'join_class_by_code',
        args: {
          target_fund_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
          target_student_join_code: 'ALPHA01',
        },
      },
    ]);
  });

  it('fails closed without returning provider error details when writes fail', async () => {
    const client = {
      rpc() {
        return {
          single<TResult1 = { data: null; error: { message: string } }, TResult2 = never>(
            onfulfilled?: ((value: { data: null; error: { message: string } }) => TResult1 | PromiseLike<TResult1>) | null,
            onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
          ) {
            return Promise.resolve({ data: null, error: { message: 'provider failed with internal details' } }).then(
              onfulfilled,
              onrejected,
            );
          },
        };
      },
    };

    await expect(
      createSupabaseStudentClassEnrollmentStore(client).joinClassByCode({
        session: studentSession,
        command: createCommand(),
      }),
    ).rejects.toThrow('Supabase student class enrollment write failed: join_class_by_code');
  });
});
