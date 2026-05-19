import {
  createMonthAdvanceRealtimePublicationEnvelope,
  createMonthAdvanceRealtimeRefreshSignal,
  createRealtimeAuthorizedCurrentTurnQueryDescriptor,
  createRealtimeAuthorizedCurrentTurnRefetchPlan,
  createSupabaseRealtimePublicationDescriptor,
  createSupabaseRealtimeSubscriptionDescriptor,
} from './domain/classes/month-advancement';
import type { RealtimeAuthorizedCurrentTurnRefetchPlan } from './domain/classes/month-advancement';
import { parseAuthTenancyBrowserAuthEnvironment } from './infrastructure/auth-tenancy/environment';
import type { AuthTenancyBrowserAuthEnvironment } from './infrastructure/auth-tenancy/environment';

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
  browserEnv: AuthTenancyBrowserAuthEnvironment | null;
  browserEnvFailureCode: string | null;
};

export function createRealtimeRefreshPanelConfig(input: {
  classId: string;
  currentMonthIndex: number;
  totalMonths: number;
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
  const queryDescriptor = createRealtimeAuthorizedCurrentTurnQueryDescriptor(refetchPlan);
  const browserEnvResult = parseAuthTenancyBrowserAuthEnvironment(process.env);

  return {
    refetchPlan,
    queryDescriptorKey: queryDescriptor.queryDescriptorKey,
    browserEnv: browserEnvResult.ok ? browserEnvResult.env : null,
    browserEnvFailureCode: browserEnvResult.ok ? null : browserEnvResult.code,
  };
}
