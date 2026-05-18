import { describe, expect, it } from 'vitest';

import {
  createInstructorClassDraft,
  createInstructorClassServerActionCommandDescriptor,
  createInstructorClassServerActionResultEnvelope,
  createInstructorClassServerActionValidationFailureEnvelope,
} from './class-draft';

const defaultInput = {
  instructorId: 'instructor-001',
  className: 'Cohort 2026A',
  triggerMode: 'manual',
  joinCode: 'ALPHA26',
};

function errorCodesFor(input: Parameters<typeof createInstructorClassDraft>[0]): string[] {
  const result = createInstructorClassDraft(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.code);
}

describe('createInstructorClassDraft', () => {
  it('creates a class draft with a join path for an instructor-controlled class', () => {
    const result = createInstructorClassDraft(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: {
        instructorId: 'instructor-001',
        className: 'Cohort 2026A',
        triggerMode: 'manual',
        currentMonthIndex: 0,
        joinCode: 'ALPHA26',
        studentJoinPath: '/join/ALPHA26',
      },
    });
  });

  it('accepts auto trigger mode for cron-paced classes', () => {
    const result = createInstructorClassDraft({ ...defaultInput, triggerMode: 'auto' });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.triggerMode).toBe('auto');
  });

  it('trims instructor ids, class names, and join codes', () => {
    const result = createInstructorClassDraft({
      instructorId: ' instructor-001 ',
      className: ' Cohort 2026A ',
      triggerMode: 'manual',
      joinCode: ' ALPHA26 ',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        instructorId: 'instructor-001',
        className: 'Cohort 2026A',
        joinCode: 'ALPHA26',
        studentJoinPath: '/join/ALPHA26',
      }),
    });
  });

  it('maps a valid class draft to a future server-action command descriptor', () => {
    const draftResult = createInstructorClassDraft(defaultInput);

    expect(draftResult.ok).toBe(true);

    if (!draftResult.ok) {
      return;
    }

    expect(createInstructorClassServerActionCommandDescriptor(draftResult.value)).toEqual({
      descriptorType: 'instructor_class_server_action_command',
      commandKey: 'instructor:instructor-001:join:ALPHA26:create-class:server-action-command',
      commandBoundary: 'server_action_command_boundary',
      commandName: 'create_instructor_class',
      requiredScope: 'instructor_creates_own_class',
      instructorId: 'instructor-001',
      className: 'Cohort 2026A',
      triggerMode: 'manual',
      initialMonthIndex: 0,
      joinCode: 'ALPHA26',
      studentJoinPath: '/join/ALPHA26',
      idempotencyKey: 'instructor:instructor-001:join:ALPHA26:create-class',
      persistenceIntent: 'create_class_with_join_code',
    });
  });

  it('maps a command descriptor to a future server-action result envelope', () => {
    const draftResult = createInstructorClassDraft(defaultInput);

    expect(draftResult.ok).toBe(true);

    if (!draftResult.ok) {
      return;
    }

    const descriptor = createInstructorClassServerActionCommandDescriptor(draftResult.value);

    expect(createInstructorClassServerActionResultEnvelope(descriptor)).toEqual({
      envelopeType: 'instructor_class_server_action_result',
      resultKey: 'instructor:instructor-001:join:ALPHA26:create-class:server-action-command:result-envelope',
      commandKey: 'instructor:instructor-001:join:ALPHA26:create-class:server-action-command',
      commandBoundary: 'server_action_result_boundary',
      commandName: 'create_instructor_class',
      requiredScope: 'instructor_creates_own_class',
      instructorId: 'instructor-001',
      idempotencyKey: 'instructor:instructor-001:join:ALPHA26:create-class',
      resultStatus: 'accepted_class_creation',
      persistenceIntent: 'create_class_with_join_code',
      deliverySemantics: 'instructor_safe_class_creation_receipt',
      receipt: {
        receiptType: 'instructor_class_creation_receipt',
        creationKey: 'instructor:instructor-001:join:ALPHA26:create-class',
        instructorId: 'instructor-001',
        className: 'Cohort 2026A',
        triggerMode: 'manual',
        currentMonthIndex: 0,
        joinCode: 'ALPHA26',
        studentJoinPath: '/join/ALPHA26',
      },
    });
  });

  it('keeps the result envelope instructor-scoped without platform execution payloads', () => {
    const draftResult = createInstructorClassDraft(defaultInput);

    expect(draftResult.ok).toBe(true);

    if (!draftResult.ok) {
      return;
    }

    const descriptor = createInstructorClassServerActionCommandDescriptor(draftResult.value);
    const envelope = createInstructorClassServerActionResultEnvelope(descriptor);

    expect(envelope.requiredScope).toBe('instructor_creates_own_class');
    expect(envelope.receipt.creationKey).toBe(envelope.idempotencyKey);
    expect('authSession' in envelope).toBe(false);
    expect('databaseRows' in envelope).toBe(false);
    expect('classId' in envelope).toBe(false);
    expect('serverActionExecution' in envelope).toBe(false);
    expect('workerPayload' in envelope).toBe(false);
    expect('realtimePayload' in envelope).toBe(false);
  });

  it('creates an instructor-safe validation failure envelope for invalid server-action input', () => {
    const result = createInstructorClassServerActionValidationFailureEnvelope({
      ...defaultInput,
      className: '   ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        envelopeType: 'instructor_class_server_action_validation_failure',
        resultKey: 'instructor:instructor-001:join:ALPHA26:create-class:validation-failure',
        commandBoundary: 'server_action_result_boundary',
        commandName: 'create_instructor_class',
        requiredScope: 'instructor_creates_own_class',
        instructorId: 'instructor-001',
        resultStatus: 'validation_failed',
        persistenceIntent: 'none_validation_failed',
        deliverySemantics: 'instructor_safe_validation_errors',
        validationErrors: [
          {
            code: 'invalid_class_name',
            message: 'Class name is required.',
          },
        ],
      },
    });
  });

  it('uses deterministic fallback key parts when invalid scope cannot identify instructor or join code', () => {
    const result = createInstructorClassServerActionValidationFailureEnvelope({
      ...defaultInput,
      instructorId: '   ',
      triggerMode: 'live',
      joinCode: 'abc123',
    });

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        resultKey: 'instructor:unknown-instructor:join:invalid-join-code:create-class:validation-failure',
        instructorId: null,
        validationErrors: [
          expect.objectContaining({ code: 'invalid_instructor_id' }),
          expect.objectContaining({ code: 'invalid_trigger_mode' }),
          expect.objectContaining({ code: 'invalid_join_code' }),
        ],
      }),
    });
  });

  it('does not create a failure envelope for a valid accepted class draft', () => {
    const result = createInstructorClassServerActionValidationFailureEnvelope(defaultInput);

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: 'draft_is_valid',
          message: 'Validation failure envelopes require an invalid instructor class draft.',
        },
      ],
    });
  });

  it('excludes raw class draft payloads and platform execution details from validation failures', () => {
    const result = createInstructorClassServerActionValidationFailureEnvelope({
      ...defaultInput,
      joinCode: 'abc123',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect('className' in result.value).toBe(false);
    expect('triggerMode' in result.value).toBe(false);
    expect('joinCode' in result.value).toBe(false);
    expect('studentJoinPath' in result.value).toBe(false);
    expect('authSession' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('classId' in result.value).toBe(false);
    expect('serverActionExecution' in result.value).toBe(false);
    expect('workerPayload' in result.value).toBe(false);
    expect('realtimePayload' in result.value).toBe(false);
  });

  it('rejects blank instructor ids', () => {
    expect(errorCodesFor({ ...defaultInput, instructorId: '   ' })).toContain('invalid_instructor_id');
  });

  it('rejects blank class names', () => {
    expect(errorCodesFor({ ...defaultInput, className: '   ' })).toContain('invalid_class_name');
  });

  it('rejects unknown trigger modes', () => {
    expect(errorCodesFor({ ...defaultInput, triggerMode: 'live' })).toContain('invalid_trigger_mode');
  });

  it('rejects malformed join codes', () => {
    expect(errorCodesFor({ ...defaultInput, joinCode: 'abc123' })).toContain('invalid_join_code');
    expect(errorCodesFor({ ...defaultInput, joinCode: 'A1B2C' })).toContain('invalid_join_code');
    expect(errorCodesFor({ ...defaultInput, joinCode: 'A1B2C3D4E5F6G' })).toContain('invalid_join_code');
  });
});
