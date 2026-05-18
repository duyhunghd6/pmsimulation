import { type StudentDashboardCurrentTurnSnapshot } from '../student/dashboard-snapshot';
import { type InstructorDashboardCurrentTurnSnapshot } from './dashboard-snapshot';
import {
  type MonthAdvanceRealtimeRefreshSignal,
  type RealtimeAuthorizedCurrentTurnQueryDescriptor,
  type RealtimeAuthorizedCurrentTurnQuerySurface,
  type RealtimeAuthorizedCurrentTurnSurface,
} from './month-advancement';

export type RealtimeAuthorizedCurrentTurnQueryResultSnapshot =
  | StudentDashboardCurrentTurnSnapshot
  | InstructorDashboardCurrentTurnSnapshot;

export type RealtimeAuthorizedCurrentTurnQueryResultSurface = RealtimeAuthorizedCurrentTurnQuerySurface & {
  resultStatus: 'ready';
  snapshot: RealtimeAuthorizedCurrentTurnQueryResultSnapshot;
};

export type RealtimeAuthorizedCurrentTurnQueryResultEnvelope = {
  envelopeType: 'authorized_current_turn_query_result';
  queryResultKey: string;
  providerBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  requiredAuthorization: 'server_scoped_current_turn_queries';
  classId: string;
  processedMonthIndex: number;
  currentMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  deliverySemantics: 'authorized_current_turn_surfaces_only';
  surfaces: RealtimeAuthorizedCurrentTurnQueryResultSurface[];
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type RealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope = {
  envelopeType: 'authorized_current_turn_query_result_validation_failure';
  queryResultKey: string;
  providerBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  requiredAuthorization: 'server_scoped_current_turn_queries';
  classId: string;
  processedMonthIndex: number;
  currentMonthIndex: number;
  totalMonths: number;
  idempotencyKey: string;
  resultStatus: 'validation_failed';
  deliverySemantics: 'authorized_current_turn_query_validation_errors_only';
  validationErrors: RealtimeAuthorizedCurrentTurnQueryResultError[];
  payload: MonthAdvanceRealtimeRefreshSignal;
};

export type RealtimeAuthorizedCurrentTurnQueryResultInput = {
  descriptor: RealtimeAuthorizedCurrentTurnQueryDescriptor;
  studentDashboard?: StudentDashboardCurrentTurnSnapshot;
  instructorDashboard?: InstructorDashboardCurrentTurnSnapshot;
};

export type RealtimeAuthorizedCurrentTurnQueryResultErrorCode =
  | 'missing_student_dashboard_result'
  | 'missing_instructor_dashboard_result'
  | 'mismatched_student_dashboard_scope'
  | 'mismatched_instructor_dashboard_scope';

export type RealtimeAuthorizedCurrentTurnQueryResultError = {
  code: RealtimeAuthorizedCurrentTurnQueryResultErrorCode;
  message: string;
  surface: RealtimeAuthorizedCurrentTurnSurface;
};

export type CreateRealtimeAuthorizedCurrentTurnQueryResultEnvelopeResult =
  | { ok: true; value: RealtimeAuthorizedCurrentTurnQueryResultEnvelope }
  | { ok: false; errors: RealtimeAuthorizedCurrentTurnQueryResultError[] };

export type RealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type CreateRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: RealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope }
  | { ok: false; errors: RealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelopeError[] };

export function createRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope(
  input: RealtimeAuthorizedCurrentTurnQueryResultInput,
): CreateRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelopeResult {
  const result = createRealtimeAuthorizedCurrentTurnQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid authorized current-turn query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'authorized_current_turn_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      providerBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      requiredAuthorization: input.descriptor.requiredAuthorization,
      classId: input.descriptor.classId,
      processedMonthIndex: input.descriptor.processedMonthIndex,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      totalMonths: input.descriptor.totalMonths,
      idempotencyKey: input.descriptor.idempotencyKey,
      resultStatus: 'validation_failed',
      deliverySemantics: 'authorized_current_turn_query_validation_errors_only',
      validationErrors: result.errors,
      payload: input.descriptor.payload,
    },
  };
}

export function createRealtimeAuthorizedCurrentTurnQueryResultEnvelope(
  input: RealtimeAuthorizedCurrentTurnQueryResultInput,
): CreateRealtimeAuthorizedCurrentTurnQueryResultEnvelopeResult {
  const errors: RealtimeAuthorizedCurrentTurnQueryResultError[] = [];
  const surfaces: RealtimeAuthorizedCurrentTurnQueryResultSurface[] = [];

  for (const surface of input.descriptor.surfaces) {
    if (surface.surface === 'student_dashboard_current_turn') {
      if (!input.studentDashboard) {
        errors.push({
          code: 'missing_student_dashboard_result',
          message: 'Student current-turn query results require the already-authorized student dashboard snapshot.',
          surface: surface.surface,
        });
        continue;
      }

      if (
        input.studentDashboard.classId !== input.descriptor.classId ||
        input.studentDashboard.monthIndex !== input.descriptor.currentMonthIndex
      ) {
        errors.push({
          code: 'mismatched_student_dashboard_scope',
          message: 'Student current-turn query results must match the descriptor class and current month.',
          surface: surface.surface,
        });
        continue;
      }

      surfaces.push({
        ...surface,
        resultStatus: 'ready',
        snapshot: input.studentDashboard,
      });
    }

    if (surface.surface === 'instructor_dashboard_current_turn') {
      if (!input.instructorDashboard) {
        errors.push({
          code: 'missing_instructor_dashboard_result',
          message: 'Instructor current-turn query results require the already-authorized instructor dashboard snapshot.',
          surface: surface.surface,
        });
        continue;
      }

      if (
        input.instructorDashboard.classId !== input.descriptor.classId ||
        input.instructorDashboard.monthIndex !== input.descriptor.currentMonthIndex
      ) {
        errors.push({
          code: 'mismatched_instructor_dashboard_scope',
          message: 'Instructor current-turn query results must match the descriptor class and current month.',
          surface: surface.surface,
        });
        continue;
      }

      surfaces.push({
        ...surface,
        resultStatus: 'ready',
        snapshot: input.instructorDashboard,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'authorized_current_turn_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      providerBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      requiredAuthorization: input.descriptor.requiredAuthorization,
      classId: input.descriptor.classId,
      processedMonthIndex: input.descriptor.processedMonthIndex,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      totalMonths: input.descriptor.totalMonths,
      idempotencyKey: input.descriptor.idempotencyKey,
      deliverySemantics: 'authorized_current_turn_surfaces_only',
      surfaces,
      payload: input.descriptor.payload,
    },
  };
}
