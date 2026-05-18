import {
  createInstructorClassDraft,
  createInstructorClassServerActionCommandDescriptor,
  createInstructorClassServerActionResultEnvelope,
  createInstructorClassServerActionValidationFailureEnvelope,
  type InstructorClassDraftError,
  type InstructorClassDraftInput,
  type InstructorClassServerActionResultEnvelope,
  type InstructorClassServerActionValidationFailureEnvelope,
} from '../../domain/classes/class-draft';
import type { AuthTenancySession } from './session';
import { parseInstructorCreatedClassRow, type AuthTenancyDatabaseRowFailureCode, type InstructorCreatedClassRow } from './rows';

export type InstructorClassCreationActionInput = Omit<InstructorClassDraftInput, 'instructorId'>;

export type InstructorClassCreationActionStore = {
  createInstructorClass(input: {
    session: AuthTenancySession;
    command: ReturnType<typeof createInstructorClassServerActionCommandDescriptor>;
  }): Promise<unknown>;
};

export type InstructorClassCreationActionFailureCode =
  | 'invalid_role'
  | 'invalid_draft'
  | 'invalid_validation_failure_envelope'
  | 'persisted_class_row_rejected'
  | 'persisted_class_mismatch';

export type InstructorClassCreationActionFailure = {
  code: InstructorClassCreationActionFailureCode;
  rowFailureCode?: AuthTenancyDatabaseRowFailureCode;
  validationErrors?: readonly InstructorClassDraftError[];
};

export type InstructorClassCreationActionResult =
  | { ok: true; value: InstructorClassServerActionResultEnvelope }
  | { ok: false; safeFailure?: InstructorClassServerActionValidationFailureEnvelope; failure: InstructorClassCreationActionFailure };

export async function executeInstructorClassCreationAction(input: {
  session: AuthTenancySession;
  draftInput: InstructorClassCreationActionInput;
  store: InstructorClassCreationActionStore;
}): Promise<InstructorClassCreationActionResult> {
  if (input.session.role !== 'instructor') {
    return { ok: false, failure: { code: 'invalid_role' } };
  }

  const draftInput: InstructorClassDraftInput = {
    instructorId: input.session.subjectId,
    className: input.draftInput.className,
    triggerMode: input.draftInput.triggerMode,
    joinCode: input.draftInput.joinCode,
  };
  const draftResult = createInstructorClassDraft(draftInput);
  if (!draftResult.ok) {
    const safeFailure = createInstructorClassServerActionValidationFailureEnvelope(draftInput);
    if (!safeFailure.ok) {
      return { ok: false, failure: { code: 'invalid_validation_failure_envelope' } };
    }
    return {
      ok: false,
      safeFailure: safeFailure.value,
      failure: { code: 'invalid_draft', validationErrors: draftResult.errors },
    };
  }

  const command = createInstructorClassServerActionCommandDescriptor(draftResult.value);
  const persistedRow = await input.store.createInstructorClass({ session: input.session, command });
  const parsedPersistedClass = parseInstructorCreatedClassRow(persistedRow, { session: input.session });
  if (!parsedPersistedClass.ok) {
    return { ok: false, failure: { code: 'persisted_class_row_rejected', rowFailureCode: parsedPersistedClass.code } };
  }
  if (!persistedClassMatchesCommand(parsedPersistedClass.row, command)) {
    return { ok: false, failure: { code: 'persisted_class_mismatch' } };
  }

  return { ok: true, value: createInstructorClassServerActionResultEnvelope(command) };
}

function persistedClassMatchesCommand(
  row: InstructorCreatedClassRow,
  command: ReturnType<typeof createInstructorClassServerActionCommandDescriptor>,
): boolean {
  return (
    row.instructorId === command.instructorId &&
    row.displayName === command.className &&
    row.triggerMode === command.triggerMode &&
    row.currentMonthIndex === command.initialMonthIndex &&
    row.studentJoinCode === command.joinCode
  );
}
