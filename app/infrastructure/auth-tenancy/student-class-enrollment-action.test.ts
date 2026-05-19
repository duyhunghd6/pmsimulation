import { describe, expect, it } from 'vitest';

import {
  executeStudentClassEnrollmentAction,
  type StudentClassEnrollmentActionStore,
} from './student-class-enrollment-action';
import type { AuthTenancySession } from './session';

const studentId = '11111111-1111-4111-8111-111111111111';
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const studentSession: AuthTenancySession = { subjectId: studentId, role: 'student' };
const joinInput = { studentId, joinCode: 'ALPHA01' };

function createStore(options: { persistedRow?: unknown } = {}) {
  const writes: unknown[] = [];
  const store: StudentClassEnrollmentActionStore = {
    async joinClassByCode({ command }) {
      writes.push(command);
      return (
        options.persistedRow ?? {
          class_id: classId,
          student_id: studentId,
          fund_id: fundId,
          display_name: 'Alpha Capital Lab',
          current_month_index: 0,
          student_join_code: command.joinCode,
        }
      );
    },
  };

  return { store, writes };
}

describe('executeStudentClassEnrollmentAction', () => {
  it('validates a student join code, persists enrollment, and returns a safe receipt envelope', async () => {
    const { store, writes } = createStore();

    const result = await executeStudentClassEnrollmentAction({ session: studentSession, joinInput, store });

    expect(result.ok).toBe(true);
    expect(writes).toHaveLength(1);

    if (!result.ok) {
      return;
    }

    expect(result.value).toEqual({
      envelopeType: 'student_class_join_result',
      resultKey: 'student:11111111-1111-4111-8111-111111111111:join:ALPHA01:enroll-class:server-action-command:result-envelope',
      commandKey: 'student:11111111-1111-4111-8111-111111111111:join:ALPHA01:enroll-class:server-action-command',
      commandBoundary: 'server_action_result_boundary',
      commandName: 'join_class_by_code',
      requiredScope: 'student_joins_class_by_code',
      studentId,
      idempotencyKey: 'student:11111111-1111-4111-8111-111111111111:join:ALPHA01:enroll-class',
      resultStatus: 'accepted_class_enrollment',
      persistenceIntent: 'create_class_enrollment_initial_fund_and_holdings',
      deliverySemantics: 'student_safe_class_enrollment_receipt',
      receipt: {
        receiptType: 'student_class_enrollment_receipt',
        enrollmentKey: 'student:11111111-1111-4111-8111-111111111111:join:ALPHA01:enroll-class',
        studentId,
        classId,
        fundId,
        className: 'Alpha Capital Lab',
        currentMonthIndex: 0,
        joinCode: 'ALPHA01',
        dashboardPath: '/dashboard',
      },
    });
    expect('databaseRows' in result.value).toBe(false);
    expect('providerPayload' in result.value).toBe(false);
    expect('instructorData' in result.value).toBe(false);
  });

  it('blocks non-student sessions before writing roster rows', async () => {
    const { store, writes } = createStore();

    const result = await executeStudentClassEnrollmentAction({
      session: { subjectId: studentId, role: 'instructor' },
      joinInput,
      store,
    });

    expect(result).toEqual({ ok: false, failure: { code: 'invalid_role' } });
    expect(writes).toHaveLength(0);
  });

  it('returns a student-safe validation failure and skips persistence for invalid join codes', async () => {
    const { store, writes } = createStore();

    const result = await executeStudentClassEnrollmentAction({
      session: studentSession,
      joinInput: { studentId, joinCode: 'bad-code' },
      store,
    });

    expect(result.ok).toBe(false);
    expect(writes).toHaveLength(0);

    if (result.ok) {
      return;
    }

    expect(result.failure.code).toBe('invalid_join_request');
    expect(result.safeFailure).toEqual(
      expect.objectContaining({
        envelopeType: 'student_class_join_validation_failure',
        studentId,
        resultStatus: 'validation_failed',
        persistenceIntent: 'none_validation_failed',
        deliverySemantics: 'student_safe_validation_errors',
      }),
    );
    expect(result.safeFailure?.validationErrors).toEqual([expect.objectContaining({ code: 'invalid_join_code' })]);
  });

  it('parses the persisted enrollment row before delivering the receipt', async () => {
    const { store } = createStore({
      persistedRow: {
        class_id: classId,
        student_id: '22222222-2222-4222-8222-222222222222',
        fund_id: fundId,
        display_name: 'Alpha Capital Lab',
        current_month_index: 0,
        student_join_code: 'ALPHA01',
      },
    });

    const result = await executeStudentClassEnrollmentAction({ session: studentSession, joinInput, store });

    expect(result).toEqual({
      ok: false,
      failure: { code: 'persisted_enrollment_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects persisted rows that do not match the validated join command', async () => {
    const { store } = createStore({
      persistedRow: {
        class_id: classId,
        student_id: studentId,
        fund_id: fundId,
        display_name: 'Alpha Capital Lab',
        current_month_index: 0,
        student_join_code: 'BETA02',
      },
    });

    const result = await executeStudentClassEnrollmentAction({ session: studentSession, joinInput, store });

    expect(result).toEqual({
      ok: false,
      failure: { code: 'persisted_enrollment_row_rejected', rowFailureCode: 'invalid_join_code' },
    });
  });
});
