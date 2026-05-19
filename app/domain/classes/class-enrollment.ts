export type StudentClassJoinInput = {
  studentId: string;
  joinCode: string;
};

export type StudentClassJoinRequest = {
  studentId: string;
  joinCode: string;
};

export type StudentClassJoinCommandDescriptor = {
  descriptorType: 'student_class_join_command';
  commandKey: string;
  commandBoundary: 'server_action_command_boundary';
  commandName: 'join_class_by_code';
  requiredScope: 'student_joins_class_by_code';
  studentId: string;
  joinCode: string;
  idempotencyKey: string;
  persistenceIntent: 'create_class_enrollment_initial_fund_and_holdings';
};

export type StudentClassEnrollmentReceipt = {
  receiptType: 'student_class_enrollment_receipt';
  enrollmentKey: string;
  studentId: string;
  classId: string;
  fundId: string;
  className: string;
  currentMonthIndex: number;
  joinCode: string;
  dashboardPath: '/dashboard';
};

export type StudentClassJoinResultEnvelope = {
  envelopeType: 'student_class_join_result';
  resultKey: string;
  commandKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'join_class_by_code';
  requiredScope: 'student_joins_class_by_code';
  studentId: string;
  idempotencyKey: string;
  resultStatus: 'accepted_class_enrollment';
  persistenceIntent: 'create_class_enrollment_initial_fund_and_holdings';
  deliverySemantics: 'student_safe_class_enrollment_receipt';
  receipt: StudentClassEnrollmentReceipt;
};

export type StudentClassJoinValidationFailureEnvelope = {
  envelopeType: 'student_class_join_validation_failure';
  resultKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'join_class_by_code';
  requiredScope: 'student_joins_class_by_code';
  studentId: string | null;
  resultStatus: 'validation_failed';
  persistenceIntent: 'none_validation_failed';
  deliverySemantics: 'student_safe_validation_errors';
  validationErrors: StudentClassJoinError[];
};

export type StudentClassJoinValidationFailureEnvelopeError = {
  code: 'join_request_is_valid';
  message: string;
};

export type StudentClassJoinValidationFailureEnvelopeResult =
  | { ok: true; value: StudentClassJoinValidationFailureEnvelope }
  | { ok: false; errors: StudentClassJoinValidationFailureEnvelopeError[] };

export type StudentClassJoinErrorCode = 'invalid_student_id' | 'invalid_join_code';

export type StudentClassJoinError = {
  code: StudentClassJoinErrorCode;
  message: string;
};

export type StudentClassJoinRequestResult =
  | { ok: true; value: StudentClassJoinRequest }
  | { ok: false; errors: StudentClassJoinError[] };

const JOIN_CODE_PATTERN = /^[A-Z0-9]{6,12}$/;

export function createStudentClassJoinRequest(input: StudentClassJoinInput): StudentClassJoinRequestResult {
  const errors: StudentClassJoinError[] = [];
  const studentId = input.studentId.trim();
  const joinCode = input.joinCode.trim().toUpperCase();

  if (studentId === '') {
    errors.push({ code: 'invalid_student_id', message: 'Student id is required.' });
  }

  if (!JOIN_CODE_PATTERN.test(joinCode)) {
    errors.push({ code: 'invalid_join_code', message: 'Join code must be 6 to 12 uppercase alphanumeric characters.' });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { studentId, joinCode } };
}

export function createStudentClassJoinCommandDescriptor(request: StudentClassJoinRequest): StudentClassJoinCommandDescriptor {
  const idempotencyKey = `student:${request.studentId}:join:${request.joinCode}:enroll-class`;

  return {
    descriptorType: 'student_class_join_command',
    commandKey: `${idempotencyKey}:server-action-command`,
    commandBoundary: 'server_action_command_boundary',
    commandName: 'join_class_by_code',
    requiredScope: 'student_joins_class_by_code',
    studentId: request.studentId,
    joinCode: request.joinCode,
    idempotencyKey,
    persistenceIntent: 'create_class_enrollment_initial_fund_and_holdings',
  };
}

export function createStudentClassJoinResultEnvelope(input: {
  descriptor: StudentClassJoinCommandDescriptor;
  classId: string;
  fundId: string;
  className: string;
  currentMonthIndex: number;
}): StudentClassJoinResultEnvelope {
  return {
    envelopeType: 'student_class_join_result',
    resultKey: `${input.descriptor.commandKey}:result-envelope`,
    commandKey: input.descriptor.commandKey,
    commandBoundary: 'server_action_result_boundary',
    commandName: input.descriptor.commandName,
    requiredScope: input.descriptor.requiredScope,
    studentId: input.descriptor.studentId,
    idempotencyKey: input.descriptor.idempotencyKey,
    resultStatus: 'accepted_class_enrollment',
    persistenceIntent: input.descriptor.persistenceIntent,
    deliverySemantics: 'student_safe_class_enrollment_receipt',
    receipt: {
      receiptType: 'student_class_enrollment_receipt',
      enrollmentKey: input.descriptor.idempotencyKey,
      studentId: input.descriptor.studentId,
      classId: input.classId,
      fundId: input.fundId,
      className: input.className,
      currentMonthIndex: input.currentMonthIndex,
      joinCode: input.descriptor.joinCode,
      dashboardPath: '/dashboard',
    },
  };
}

export function createStudentClassJoinValidationFailureEnvelope(
  input: StudentClassJoinInput,
): StudentClassJoinValidationFailureEnvelopeResult {
  const requestResult = createStudentClassJoinRequest(input);

  if (requestResult.ok) {
    return {
      ok: false,
      errors: [{ code: 'join_request_is_valid', message: 'Validation failure envelopes require an invalid class join request.' }],
    };
  }

  const studentId = input.studentId.trim();
  const joinCode = input.joinCode.trim().toUpperCase();
  const studentKeyPart = studentId === '' ? 'unknown-student' : studentId;
  const joinKeyPart = JOIN_CODE_PATTERN.test(joinCode) ? joinCode : 'invalid-join-code';

  return {
    ok: true,
    value: {
      envelopeType: 'student_class_join_validation_failure',
      resultKey: `student:${studentKeyPart}:join:${joinKeyPart}:enroll-class:validation-failure`,
      commandBoundary: 'server_action_result_boundary',
      commandName: 'join_class_by_code',
      requiredScope: 'student_joins_class_by_code',
      studentId: studentId === '' ? null : studentId,
      resultStatus: 'validation_failed',
      persistenceIntent: 'none_validation_failed',
      deliverySemantics: 'student_safe_validation_errors',
      validationErrors: requestResult.errors,
    },
  };
}
