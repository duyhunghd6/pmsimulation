import { describe, expect, it } from 'vitest';

import { createInstructorClassDraft } from './class-draft';

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
