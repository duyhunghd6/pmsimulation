import { describe, expect, it } from 'vitest';

import {
  createStudentClassJoinCommandDescriptor,
  createStudentClassJoinRequest,
  createStudentClassJoinResultEnvelope,
  createStudentClassJoinValidationFailureEnvelope,
} from './class-enrollment';

const studentId = '11111111-1111-4111-8111-111111111111';
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

describe('student class enrollment domain envelopes', () => {
  it('normalizes a join-code request and creates a student-safe result envelope', () => {
    const request = createStudentClassJoinRequest({ studentId, joinCode: ' alpha01 ' });

    expect(request).toEqual({ ok: true, value: { studentId, joinCode: 'ALPHA01' } });
    if (!request.ok) {
      return;
    }

    const descriptor = createStudentClassJoinCommandDescriptor(request.value);
    expect(descriptor).toEqual({
      descriptorType: 'student_class_join_command',
      commandKey: 'student:11111111-1111-4111-8111-111111111111:join:ALPHA01:enroll-class:server-action-command',
      commandBoundary: 'server_action_command_boundary',
      commandName: 'join_class_by_code',
      requiredScope: 'student_joins_class_by_code',
      studentId,
      joinCode: 'ALPHA01',
      idempotencyKey: 'student:11111111-1111-4111-8111-111111111111:join:ALPHA01:enroll-class',
      persistenceIntent: 'create_class_enrollment_initial_fund_and_holdings',
    });

    const envelope = createStudentClassJoinResultEnvelope({
      descriptor,
      classId,
      fundId,
      className: 'Alpha Capital Lab',
      currentMonthIndex: 0,
    });

    expect(envelope).toEqual({
      envelopeType: 'student_class_join_result',
      resultKey: `${descriptor.commandKey}:result-envelope`,
      commandKey: descriptor.commandKey,
      commandBoundary: 'server_action_result_boundary',
      commandName: 'join_class_by_code',
      requiredScope: 'student_joins_class_by_code',
      studentId,
      idempotencyKey: descriptor.idempotencyKey,
      resultStatus: 'accepted_class_enrollment',
      persistenceIntent: 'create_class_enrollment_initial_fund_and_holdings',
      deliverySemantics: 'student_safe_class_enrollment_receipt',
      receipt: {
        receiptType: 'student_class_enrollment_receipt',
        enrollmentKey: descriptor.idempotencyKey,
        studentId,
        classId,
        fundId,
        className: 'Alpha Capital Lab',
        currentMonthIndex: 0,
        joinCode: 'ALPHA01',
        dashboardPath: '/dashboard',
      },
    });
    expect('databaseRows' in envelope).toBe(false);
    expect('providerPayload' in envelope).toBe(false);
    expect('futureScenarioRows' in envelope).toBe(false);
  });

  it('returns a student-safe validation envelope for invalid join requests', () => {
    const request = createStudentClassJoinRequest({ studentId: '   ', joinCode: 'bad-code' });
    const failure = createStudentClassJoinValidationFailureEnvelope({ studentId: '   ', joinCode: 'bad-code' });

    expect(request).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_student_id', message: 'Student id is required.' },
        { code: 'invalid_join_code', message: 'Join code must be 6 to 12 uppercase alphanumeric characters.' },
      ],
    });
    expect(failure).toEqual({
      ok: true,
      value: expect.objectContaining({
        envelopeType: 'student_class_join_validation_failure',
        studentId: null,
        resultStatus: 'validation_failed',
        persistenceIntent: 'none_validation_failed',
        deliverySemantics: 'student_safe_validation_errors',
      }),
    });
  });
});
