import { describe, expect, it } from 'vitest';

import { createInstructorClassDraft, createInstructorClassServerActionCommandDescriptor } from '../../domain/classes/class-draft';
import { createSupabaseInstructorClassCreationStore } from './instructor-class-creation-supabase-store';

const instructorId = '11111111-1111-4111-8111-111111111111';
const instructorSession = { subjectId: instructorId, role: 'instructor' as const };

type RpcCall = {
  functionName: string;
  args: Record<string, unknown>;
};

function createCommand() {
  const draft = createInstructorClassDraft({
    instructorId,
    className: 'Alpha Capital Lab',
    triggerMode: 'manual',
    joinCode: 'ALPHA01',
  });

  if (!draft.ok) {
    throw new Error('test command setup failed');
  }

  return createInstructorClassServerActionCommandDescriptor(draft.value);
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
              id: args.target_class_id,
              instructor_id: instructorId,
              display_name: args.target_display_name,
              trigger_mode: args.target_trigger_mode,
              current_month_index: args.target_current_month_index,
              total_months: args.target_total_months,
              student_join_code: args.target_student_join_code,
            },
            error: null,
          }).then(onfulfilled, onrejected);
        },
      };
    },
  };
}

describe('createSupabaseInstructorClassCreationStore', () => {
  it('writes an instructor-scoped class through the bounded Supabase RPC', async () => {
    const calls: RpcCall[] = [];
    const client = createClient(calls);
    const command = createCommand();

    const row = await createSupabaseInstructorClassCreationStore(client).createInstructorClass({
      session: instructorSession,
      command,
    });

    expect(row).toEqual({
      id: calls[0]!.args.target_class_id,
      instructor_id: instructorId,
      display_name: 'Alpha Capital Lab',
      trigger_mode: 'manual',
      current_month_index: 0,
      total_months: 12,
      student_join_code: 'ALPHA01',
    });
    expect(calls).toEqual([
      {
        functionName: 'create_instructor_class',
        args: {
          target_class_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
          target_current_month_index: 0,
          target_display_name: 'Alpha Capital Lab',
          target_student_join_code: 'ALPHA01',
          target_total_months: 12,
          target_trigger_mode: 'manual',
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
      createSupabaseInstructorClassCreationStore(client).createInstructorClass({
        session: instructorSession,
        command: createCommand(),
      }),
    ).rejects.toThrow('Supabase instructor class creation write failed: create_instructor_class');
  });
});
