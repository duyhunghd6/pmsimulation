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
