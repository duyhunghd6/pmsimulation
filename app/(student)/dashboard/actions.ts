'use server';

import { redirect } from 'next/navigation';

import {
  executeStudentTaraOrderSubmissionAction,
  type StudentTaraOrderSubmissionActionStore,
} from '../../infrastructure/auth-tenancy/student-tara-order-submission-action';
import { readAuthTenancyRouteSession } from '../../infrastructure/auth-tenancy/supabase-server';
import type { TaraTargetWeights } from '../../infrastructure/auth-tenancy/rows';

const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const currentMonthIndex = 2;

function dashboardOrderStatusUrl(status: string, params: Record<string, string> = {}): string {
  const searchParams = new URLSearchParams({ orderSubmissionStatus: status, ...params });
  return `/dashboard?${searchParams.toString()}`;
}

export async function submitStudentTaraOrder(formData: FormData): Promise<void> {
  const routeSession = await readAuthTenancyRouteSession();
  if (!routeSession.ok || routeSession.session.role !== 'student') {
    redirect(dashboardOrderStatusUrl('not-authorized'));
  }

  const targetWeights: TaraTargetWeights = {
    Base: Number(formData.get('baseTarget')),
    Core: Number(formData.get('coreTarget')),
    Apex: Number(formData.get('apexTarget')),
  };

  const result = await executeStudentTaraOrderSubmissionAction({
    session: routeSession.session,
    scope: { classId, fundId, monthIndex: currentMonthIndex },
    targetWeights,
    store: createBoundedStudentTaraOrderSubmissionStore(routeSession.session.subjectId),
  });

  if (!result.ok) {
    if (result.failure.code === 'invalid_submission') {
      redirect(
        dashboardOrderStatusUrl('validation-error', {
          errors: result.failure.validationErrors?.map((error) => error.code).join(',') ?? 'invalid_submission',
        }),
      );
    }

    redirect(dashboardOrderStatusUrl('failed', { reason: result.failure.code }));
  }

  redirect(
    dashboardOrderStatusUrl('accepted', {
      base: String(result.value.receipt.targetWeights.Base),
      core: String(result.value.receipt.targetWeights.Core),
      apex: String(result.value.receipt.targetWeights.Apex),
      taxDragPct: String(result.value.receipt.estimatedTaxDrag.taxDragPct),
    }),
  );
}

function createBoundedStudentTaraOrderSubmissionStore(studentId: string): StudentTaraOrderSubmissionActionStore {
  return {
    async readStudentTaraOrderSubmissionRows() {
      return {
        funds: [
          {
            id: fundId,
            class_id: classId,
            student_id: studentId,
            current_aum: '50000000.00',
            sharpe_ratio: '1.20',
          },
        ],
        holdings: [
          {
            id: '30000000-0000-4000-8000-000000000001',
            class_id: classId,
            fund_id: fundId,
            tier: 'Base',
            allocation_weight_pct: '40.00',
          },
          {
            id: '30000000-0000-4000-8000-000000000002',
            class_id: classId,
            fund_id: fundId,
            tier: 'Core',
            allocation_weight_pct: '30.00',
          },
          {
            id: '30000000-0000-4000-8000-000000000003',
            class_id: classId,
            fund_id: fundId,
            tier: 'Apex',
            allocation_weight_pct: '30.00',
          },
        ],
        orders: [],
        trackedMetrics: [
          {
            id: '50000000-0000-4000-8000-000000000001',
            class_id: classId,
            fund_id: fundId,
            scope_type: 'fund',
            scope_id: fundId,
            month_index: currentMonthIndex,
            metric_id: 'apex_unrealized_gain_pct',
            display_label: 'Apex unrealized gain',
            metric_family: 'portfolio_state',
            value_numeric: '10.00',
            value_text: null,
            unit: 'percent',
            source_type: 'computed',
            source_note: 'Current unrealized gain for Apex tax preview.',
            convention_note: 'Percentage gain over cost basis.',
          },
        ],
      };
    },
    async createPendingStudentTaraOrder({ command }) {
      return {
        id: '40000000-0000-4000-8000-000000000001',
        class_id: classId,
        fund_id: fundId,
        month_index: currentMonthIndex,
        target_weights_json: command.targetWeights,
        estimated_tax_drag: String(command.estimatedTaxDrag.taxDragPct),
        rebalance_trigger: command.rebalanceTrigger,
        status: command.status,
      };
    },
  };
}
