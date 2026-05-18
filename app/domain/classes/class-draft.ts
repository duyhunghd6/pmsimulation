export const CLASS_TRIGGER_MODES = ['auto', 'manual'] as const;
export const INITIAL_CLASS_MONTH_INDEX = 0;

export type ClassTriggerMode = (typeof CLASS_TRIGGER_MODES)[number];

export type InstructorClassDraftInput = {
  instructorId: string;
  className: string;
  triggerMode: string;
  joinCode: string;
};

export type InstructorClassDraft = {
  instructorId: string;
  className: string;
  triggerMode: ClassTriggerMode;
  currentMonthIndex: typeof INITIAL_CLASS_MONTH_INDEX;
  joinCode: string;
  studentJoinPath: string;
};

export type InstructorClassServerActionCommandDescriptor = {
  descriptorType: 'instructor_class_server_action_command';
  commandKey: string;
  commandBoundary: 'server_action_command_boundary';
  commandName: 'create_instructor_class';
  requiredScope: 'instructor_creates_own_class';
  instructorId: string;
  className: string;
  triggerMode: ClassTriggerMode;
  initialMonthIndex: typeof INITIAL_CLASS_MONTH_INDEX;
  joinCode: string;
  studentJoinPath: string;
  idempotencyKey: string;
  persistenceIntent: 'create_class_with_join_code';
};

export type InstructorClassCreationReceipt = {
  receiptType: 'instructor_class_creation_receipt';
  creationKey: string;
  instructorId: string;
  className: string;
  triggerMode: ClassTriggerMode;
  currentMonthIndex: typeof INITIAL_CLASS_MONTH_INDEX;
  joinCode: string;
  studentJoinPath: string;
};

export type InstructorClassServerActionResultEnvelope = {
  envelopeType: 'instructor_class_server_action_result';
  resultKey: string;
  commandKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'create_instructor_class';
  requiredScope: 'instructor_creates_own_class';
  instructorId: string;
  idempotencyKey: string;
  resultStatus: 'accepted_class_creation';
  persistenceIntent: 'create_class_with_join_code';
  deliverySemantics: 'instructor_safe_class_creation_receipt';
  receipt: InstructorClassCreationReceipt;
};

export type InstructorClassServerActionValidationFailureEnvelope = {
  envelopeType: 'instructor_class_server_action_validation_failure';
  resultKey: string;
  commandBoundary: 'server_action_result_boundary';
  commandName: 'create_instructor_class';
  requiredScope: 'instructor_creates_own_class';
  instructorId: string | null;
  resultStatus: 'validation_failed';
  persistenceIntent: 'none_validation_failed';
  deliverySemantics: 'instructor_safe_validation_errors';
  validationErrors: InstructorClassDraftError[];
};

export type InstructorClassServerActionValidationFailureEnvelopeError = {
  code: 'draft_is_valid';
  message: string;
};

export type InstructorClassServerActionValidationFailureEnvelopeResult =
  | { ok: true; value: InstructorClassServerActionValidationFailureEnvelope }
  | { ok: false; errors: InstructorClassServerActionValidationFailureEnvelopeError[] };

export type InstructorClassDraftErrorCode =
  | 'invalid_instructor_id'
  | 'invalid_class_name'
  | 'invalid_trigger_mode'
  | 'invalid_join_code';

export type InstructorClassDraftError = {
  code: InstructorClassDraftErrorCode;
  message: string;
};

export type InstructorClassDraftResult =
  | { ok: true; value: InstructorClassDraft }
  | { ok: false; errors: InstructorClassDraftError[] };

const TRIGGER_MODE_SET = new Set<string>(CLASS_TRIGGER_MODES);
const JOIN_CODE_PATTERN = /^[A-Z0-9]{6,12}$/;

export function createInstructorClassServerActionCommandDescriptor(
  draft: InstructorClassDraft,
): InstructorClassServerActionCommandDescriptor {
  const idempotencyKey = `instructor:${draft.instructorId}:join:${draft.joinCode}:create-class`;

  return {
    descriptorType: 'instructor_class_server_action_command',
    commandKey: `${idempotencyKey}:server-action-command`,
    commandBoundary: 'server_action_command_boundary',
    commandName: 'create_instructor_class',
    requiredScope: 'instructor_creates_own_class',
    instructorId: draft.instructorId,
    className: draft.className,
    triggerMode: draft.triggerMode,
    initialMonthIndex: draft.currentMonthIndex,
    joinCode: draft.joinCode,
    studentJoinPath: draft.studentJoinPath,
    idempotencyKey,
    persistenceIntent: 'create_class_with_join_code',
  };
}

export function createInstructorClassServerActionResultEnvelope(
  descriptor: InstructorClassServerActionCommandDescriptor,
): InstructorClassServerActionResultEnvelope {
  return {
    envelopeType: 'instructor_class_server_action_result',
    resultKey: `${descriptor.commandKey}:result-envelope`,
    commandKey: descriptor.commandKey,
    commandBoundary: 'server_action_result_boundary',
    commandName: descriptor.commandName,
    requiredScope: descriptor.requiredScope,
    instructorId: descriptor.instructorId,
    idempotencyKey: descriptor.idempotencyKey,
    resultStatus: 'accepted_class_creation',
    persistenceIntent: descriptor.persistenceIntent,
    deliverySemantics: 'instructor_safe_class_creation_receipt',
    receipt: {
      receiptType: 'instructor_class_creation_receipt',
      creationKey: descriptor.idempotencyKey,
      instructorId: descriptor.instructorId,
      className: descriptor.className,
      triggerMode: descriptor.triggerMode,
      currentMonthIndex: descriptor.initialMonthIndex,
      joinCode: descriptor.joinCode,
      studentJoinPath: descriptor.studentJoinPath,
    },
  };
}

export function createInstructorClassServerActionValidationFailureEnvelope(
  input: InstructorClassDraftInput,
): InstructorClassServerActionValidationFailureEnvelopeResult {
  const draftResult = createInstructorClassDraft(input);

  if (draftResult.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'draft_is_valid',
          message: 'Validation failure envelopes require an invalid instructor class draft.',
        },
      ],
    };
  }

  const instructorId = input.instructorId.trim();
  const joinCode = input.joinCode.trim();
  const instructorKeyPart = instructorId === '' ? 'unknown-instructor' : instructorId;
  const joinKeyPart = JOIN_CODE_PATTERN.test(joinCode) ? joinCode : 'invalid-join-code';

  return {
    ok: true,
    value: {
      envelopeType: 'instructor_class_server_action_validation_failure',
      resultKey: `instructor:${instructorKeyPart}:join:${joinKeyPart}:create-class:validation-failure`,
      commandBoundary: 'server_action_result_boundary',
      commandName: 'create_instructor_class',
      requiredScope: 'instructor_creates_own_class',
      instructorId: instructorId === '' ? null : instructorId,
      resultStatus: 'validation_failed',
      persistenceIntent: 'none_validation_failed',
      deliverySemantics: 'instructor_safe_validation_errors',
      validationErrors: draftResult.errors,
    },
  };
}

export function createInstructorClassDraft(input: InstructorClassDraftInput): InstructorClassDraftResult {
  const errors: InstructorClassDraftError[] = [];
  const instructorId = input.instructorId.trim();
  const className = input.className.trim();
  const joinCode = input.joinCode.trim();

  if (instructorId === '') {
    errors.push({
      code: 'invalid_instructor_id',
      message: 'Instructor id is required.',
    });
  }

  if (className === '') {
    errors.push({
      code: 'invalid_class_name',
      message: 'Class name is required.',
    });
  }

  if (!TRIGGER_MODE_SET.has(input.triggerMode)) {
    errors.push({
      code: 'invalid_trigger_mode',
      message: 'Trigger mode must be auto or manual.',
    });
  }

  if (!JOIN_CODE_PATTERN.test(joinCode)) {
    errors.push({
      code: 'invalid_join_code',
      message: 'Join code must be 6 to 12 uppercase alphanumeric characters.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      instructorId,
      className,
      triggerMode: input.triggerMode as ClassTriggerMode,
      currentMonthIndex: INITIAL_CLASS_MONTH_INDEX,
      joinCode,
      studentJoinPath: `/join/${joinCode}`,
    },
  };
}
