import { describe, expect, it } from 'vitest';

import {
  executeInstructorClassCreationAction,
  type InstructorClassCreationActionStore,
} from './instructor-class-creation-action';
import type { AuthTenancySession } from './session';

const instructorId = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa';
const createdClassId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const instructorSession: AuthTenancySession = { subjectId: instructorId, role: 'instructor' };
const draftInput = {
  className: 'Alpha Capital Lab',
  triggerMode: 'manual',
  joinCode: 'ALPHA01',
};

function createStore(options: { persistedRow?: unknown } = {}) {
  const writes: unknown[] = [];
  const store: InstructorClassCreationActionStore = {
    async createInstructorClass({ command }) {
      writes.push(command);
      return (
        options.persistedRow ?? {
          id: createdClassId,
          instructor_id: instructorId,
          display_name: command.className,
          trigger_mode: command.triggerMode,
          current_month_index: command.initialMonthIndex,
          total_months: 12,
          student_join_code: command.joinCode,
        }
      );
    },
  };

  return { store, writes };
}

describe('executeInstructorClassCreationAction', () => {
  it('validates an instructor-scoped class draft, persists it, and returns the safe receipt envelope', async () => {
    const { store, writes } = createStore();

    const result = await executeInstructorClassCreationAction({
      session: instructorSession,
      draftInput,
      store,
    });

    expect(result.ok).toBe(true);
    expect(writes).toHaveLength(1);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual({
      envelopeType: 'instructor_class_server_action_result',
      resultKey: 'instructor:aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa:join:ALPHA01:create-class:server-action-command:result-envelope',
      commandKey: 'instructor:aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa:join:ALPHA01:create-class:server-action-command',
      commandBoundary: 'server_action_result_boundary',
      commandName: 'create_instructor_class',
      requiredScope: 'instructor_creates_own_class',
      instructorId,
      idempotencyKey: 'instructor:aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa:join:ALPHA01:create-class',
      resultStatus: 'accepted_class_creation',
      persistenceIntent: 'create_class_with_join_code',
      deliverySemantics: 'instructor_safe_class_creation_receipt',
      receipt: {
        receiptType: 'instructor_class_creation_receipt',
        creationKey: 'instructor:aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa:join:ALPHA01:create-class',
        instructorId,
        className: 'Alpha Capital Lab',
        triggerMode: 'manual',
        currentMonthIndex: 0,
        joinCode: 'ALPHA01',
        studentJoinPath: '/join/ALPHA01',
      },
    });
    expect('databaseRows' in result.value).toBe(false);
    expect('classId' in result.value).toBe(false);
    expect('authSession' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
  });

  it('blocks non-instructor sessions before creating class rows', async () => {
    const { store, writes } = createStore();

    const result = await executeInstructorClassCreationAction({
      session: { subjectId: instructorId, role: 'student' },
      draftInput,
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'invalid_role' } });
    expect(writes).toHaveLength(0);
  });

  it('returns an instructor-safe validation failure and skips persistence for invalid draft input', async () => {
    const { store, writes } = createStore();

    const result = await executeInstructorClassCreationAction({
      session: instructorSession,
      draftInput: { ...draftInput, className: '   ' },
      store,
    });

    expect(result.ok).toBe(false);
    expect(writes).toHaveLength(0);

    if (result.ok) {
      return;
    }

    expect(result.failure.code).toBe('invalid_draft');
    expect(result.safeFailure).toEqual(
      expect.objectContaining({
        envelopeType: 'instructor_class_server_action_validation_failure',
        instructorId,
        resultStatus: 'validation_failed',
        persistenceIntent: 'none_validation_failed',
        deliverySemantics: 'instructor_safe_validation_errors',
      }),
    );
    expect(result.safeFailure?.validationErrors).toEqual([
      expect.objectContaining({ code: 'invalid_class_name' }),
    ]);
  });

  it('parses the persisted class row before delivering the receipt', async () => {
    const { store } = createStore({
      persistedRow: {
        id: createdClassId,
        instructor_id: 'bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb',
        display_name: 'Alpha Capital Lab',
        trigger_mode: 'manual',
        current_month_index: 0,
        total_months: 12,
        student_join_code: 'ALPHA01',
      },
    });

    const result = await executeInstructorClassCreationAction({
      session: instructorSession,
      draftInput,
      store,
    });

    expect(result).toEqual({
      ok: false,
      failure: { code: 'persisted_class_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects persisted rows that do not match the validated command payload', async () => {
    const { store } = createStore({
      persistedRow: {
        id: createdClassId,
        instructor_id: instructorId,
        display_name: 'Different Lab',
        trigger_mode: 'manual',
        current_month_index: 0,
        total_months: 12,
        student_join_code: 'ALPHA01',
      },
    });

    const result = await executeInstructorClassCreationAction({
      session: instructorSession,
      draftInput,
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'persisted_class_mismatch' } });
  });
});
