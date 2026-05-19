import {
  createMonthAdvanceRealtimePublicationEnvelope,
  createMonthAdvanceRealtimeRefreshSignal,
  createRealtimeAuthorizedCurrentTurnQueryDescriptor,
  createRealtimeAuthorizedCurrentTurnRefetchPlan,
  createSupabaseRealtimePublicationDescriptor,
  createSupabaseRealtimeSubscriptionDescriptor,
} from './domain/classes/month-advancement';
import type {
  RealtimeAuthorizedCurrentTurnQueryDescriptor,
  RealtimeAuthorizedCurrentTurnRefetchPlan,
  RealtimeAuthorizedCurrentTurnSurface,
} from './domain/classes/month-advancement';
import { parseAuthTenancyBrowserAuthEnvironment } from './infrastructure/auth-tenancy/environment';
import type { AuthTenancyBrowserAuthEnvironment } from './infrastructure/auth-tenancy/environment';
import {
  createRealtimeAuthorizedCurrentTurnQueryResultEnvelope,
  createRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope,
} from './domain/classes/realtime-query-result';
import type { InstructorDashboardCurrentTurnSnapshot } from './domain/classes/dashboard-snapshot';
import type { StudentDashboardCurrentTurnSnapshot } from './domain/student/dashboard-snapshot';

export type RealtimeRefreshServerQueryResultStatus =
  | {
      kind: 'ready';
      queryResultKey: string;
      surfaces: RealtimeAuthorizedCurrentTurnSurface[];
      detail: string;
    }
  | {
      kind: 'validation_failed';
      queryResultKey: string;
      validationErrors: { code: string; surface: RealtimeAuthorizedCurrentTurnSurface }[];
      detail: string;
    };

export type RealtimeRefreshPanelConfig = {
  refetchPlan: Pick<
    RealtimeAuthorizedCurrentTurnRefetchPlan,
    | 'refetchPlanKey'
    | 'channelName'
    | 'broadcastEventName'
    | 'deliverySemantics'
    | 'requiredAuthorization'
    | 'surfaces'
    | 'classId'
    | 'processedMonthIndex'
    | 'currentMonthIndex'
    | 'totalMonths'
    | 'idempotencyKey'
    | 'payload'
  >;
  queryDescriptorKey: string;
  serverQueryResult: RealtimeRefreshServerQueryResultStatus;
  browserEnv: AuthTenancyBrowserAuthEnvironment | null;
  browserEnvFailureCode: string | null;
};

export function createRealtimeRefreshPanelConfig(input: {
  classId: string;
  currentMonthIndex: number;
  totalMonths: number;
  surface: RealtimeAuthorizedCurrentTurnSurface;
  studentDashboard?: StudentDashboardCurrentTurnSnapshot;
  instructorDashboard?: InstructorDashboardCurrentTurnSnapshot;
}): RealtimeRefreshPanelConfig {
  const processedMonthIndex = Math.max(0, input.currentMonthIndex - 1);
  const signal = createMonthAdvanceRealtimeRefreshSignal({
    eventType: 'month_advance_completed',
    turnCompletionEventKey: `class:${input.classId}:advance:${processedMonthIndex}->${input.currentMonthIndex}:turn-completion`,
    classId: input.classId,
    triggerMode: 'manual',
    triggerSource: 'live',
    processedMonthIndex,
    advancedToMonthIndex: input.currentMonthIndex,
    totalMonths: input.totalMonths,
    idempotencyKey: `class:${input.classId}:advance:${processedMonthIndex}->${input.currentMonthIndex}`,
    processingPath: 'shared_month_advance',
    processedFundCount: 0,
    totalStartingAum: 0,
    totalMarketBetaImpact: 0,
    totalFeeDrag: 0,
    totalTaxPaid: 0,
    totalPvpSlippagePaid: 0,
    totalEndingAum: 0,
  });
  const refetchPlan = createRealtimeAuthorizedCurrentTurnRefetchPlan(
    createSupabaseRealtimeSubscriptionDescriptor(
      createSupabaseRealtimePublicationDescriptor(createMonthAdvanceRealtimePublicationEnvelope(signal)),
    ),
  );
  const scopedRefetchPlan = { ...refetchPlan, surfaces: [input.surface] };
  const queryDescriptor = createRealtimeAuthorizedCurrentTurnQueryDescriptor(scopedRefetchPlan);
  const queryResult = createRealtimeAuthorizedCurrentTurnQueryResultEnvelope({
    descriptor: queryDescriptor,
    studentDashboard: input.studentDashboard,
    instructorDashboard: input.instructorDashboard,
  });
  const browserEnvResult = parseAuthTenancyBrowserAuthEnvironment(process.env);

  return {
    refetchPlan: scopedRefetchPlan,
    queryDescriptorKey: queryDescriptor.queryDescriptorKey,
    serverQueryResult: queryResult.ok
      ? {
          kind: 'ready',
          queryResultKey: queryResult.value.queryResultKey,
          surfaces: queryResult.value.surfaces.map((surface) => surface.surface),
          detail: 'This route render validated an authorized current-turn server query result for the refreshed surface.',
        }
      : createServerQueryValidationFailureStatus(queryDescriptor, {
          studentDashboard: input.studentDashboard,
          instructorDashboard: input.instructorDashboard,
        }),
    browserEnv: browserEnvResult.ok ? browserEnvResult.env : null,
    browserEnvFailureCode: browserEnvResult.ok ? null : browserEnvResult.code,
  };
}

function createServerQueryValidationFailureStatus(
  queryDescriptor: RealtimeAuthorizedCurrentTurnQueryDescriptor,
  snapshots: {
    studentDashboard?: StudentDashboardCurrentTurnSnapshot;
    instructorDashboard?: InstructorDashboardCurrentTurnSnapshot;
  },
): RealtimeRefreshServerQueryResultStatus {
  const validationFailure = createRealtimeAuthorizedCurrentTurnQueryResultValidationFailureEnvelope({
    descriptor: queryDescriptor,
    studentDashboard: snapshots.studentDashboard,
    instructorDashboard: snapshots.instructorDashboard,
  });

  if (validationFailure.ok) {
    return {
      kind: 'validation_failed',
      queryResultKey: validationFailure.value.queryResultKey,
      validationErrors: validationFailure.value.validationErrors.map((error) => ({ code: error.code, surface: error.surface })),
      detail: 'This route render rejected the refreshed server query result before exposing current-turn dashboard data.',
    };
  }

  return {
    kind: 'validation_failed',
    queryResultKey: `${queryDescriptor.queryDescriptorKey}:validation-failure`,
    validationErrors: [],
    detail: validationFailure.errors.map((error) => error.code).join(','),
  };
}
