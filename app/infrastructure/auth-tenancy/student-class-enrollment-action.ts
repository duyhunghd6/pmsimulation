import {
  createStudentClassJoinCommandDescriptor,
  createStudentClassJoinRequest,
  createStudentClassJoinResultEnvelope,
  createStudentClassJoinValidationFailureEnvelope,
  type StudentClassJoinError,
  type StudentClassJoinInput,
  type StudentClassJoinResultEnvelope,
  type StudentClassJoinValidationFailureEnvelope,
} from '../../domain/classes/class-enrollment';
import { parseStudentClassEnrollmentRow, type AuthTenancyDatabaseRowFailureCode, type StudentClassEnrollmentRow } from './rows';
import type { AuthTenancySession } from './session';

export type StudentClassEnrollmentActionStore = {
  joinClassByCode(input: {
    session: AuthTenancySession;
    command: ReturnType<typeof createStudentClassJoinCommandDescriptor>;
  }): Promise<unknown>;
};

export type StudentClassEnrollmentActionFailureCode =
  | 'invalid_role'
  | 'invalid_join_request'
  | 'invalid_validation_failure_envelope'
  | 'persisted_enrollment_row_rejected'
  | 'persisted_enrollment_mismatch';

export type StudentClassEnrollmentActionFailure = {
  code: StudentClassEnrollmentActionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly StudentClassJoinError[];
};

export type StudentClassEnrollmentActionResult =
  | { ok: true; value: StudentClassJoinResultEnvelope }
  | { ok: false; safeFailure?: StudentClassJoinValidationFailureEnvelope; failure: StudentClassEnrollmentActionFailure };

export async function executeStudentClassEnrollmentAction(input: {
  session: AuthTenancySession;
  joinInput: StudentClassJoinInput;
  store: StudentClassEnrollmentActionStore;
}): Promise<StudentClassEnrollmentActionResult> {
  if (input.session.role !== 'student') {
    return { ok: false, failure: { code: 'invalid_role' } };
  }

  const requestInput: StudentClassJoinInput = {
    studentId: input.session.subjectId,
    joinCode: input.joinInput.joinCode,
  };
  const requestResult = createStudentClassJoinRequest(requestInput);
  if (!requestResult.ok) {
    const safeFailure = createStudentClassJoinValidationFailureEnvelope(requestInput);
    if (!safeFailure.ok) {
      return { ok: false, failure: { code: 'invalid_validation_failure_envelope' } };
    }

    return {
      ok: false,
      safeFailure: safeFailure.value,
      failure: { code: 'invalid_join_request', validationErrors: requestResult.errors },
    };
  }

  const command = createStudentClassJoinCommandDescriptor(requestResult.value);
  const persistedRow = await input.store.joinClassByCode({ session: input.session, command });
  const parsedPersistedEnrollment = parseStudentClassEnrollmentRow(persistedRow, {
    session: input.session,
    joinCode: command.joinCode,
  });
  if (!parsedPersistedEnrollment.ok) {
    return {
      ok: false,
      failure: { code: 'persisted_enrollment_row_rejected', rowFailureCode: parsedPersistedEnrollment.code },
    };
  }
  if (!persistedEnrollmentMatchesCommand(parsedPersistedEnrollment.row, command)) {
    return { ok: false, failure: { code: 'persisted_enrollment_mismatch' } };
  }

  return {
    ok: true,
    value: createStudentClassJoinResultEnvelope({
      descriptor: command,
      classId: parsedPersistedEnrollment.row.classId,
      fundId: parsedPersistedEnrollment.row.fundId,
      className: parsedPersistedEnrollment.row.displayName,
      currentMonthIndex: parsedPersistedEnrollment.row.currentMonthIndex,
    }),
  };
}

function persistedEnrollmentMatchesCommand(
  row: StudentClassEnrollmentRow,
  command: ReturnType<typeof createStudentClassJoinCommandDescriptor>,
): boolean {
  return row.studentId === command.studentId && row.studentJoinCode === command.joinCode;
}
