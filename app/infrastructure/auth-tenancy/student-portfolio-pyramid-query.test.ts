import { describe, expect, it } from 'vitest';

import {
  executeStudentPortfolioPyramidQuery,
  type StudentPortfolioPyramidQueryRowReader,
} from './student-portfolio-pyramid-query';

const studentSession = { subjectId: '11111111-1111-4111-8111-111111111111', role: 'student' as const };
const instructorSession = { subjectId: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', role: 'instructor' as const };
const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fundId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const otherFundId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const scope = { classId, fundId, monthIndex: 1 };
const intendedWeights = { Base: 50, Core: 30, Apex: 20 };

const holdingRows = [
  {
    id: '60000000-0000-4000-8000-000000000001',
    class_id: classId,
    fund_id: fundId,
    tier: 'Base',
    allocation_weight_pct: '45.00',
  },
  {
    id: '60000000-0000-4000-8000-000000000002',
    class_id: classId,
    fund_id: fundId,
    tier: 'Core',
    allocation_weight_pct: '35.00',
  },
  {
    id: '60000000-0000-4000-8000-000000000003',
    class_id: classId,
    fund_id: fundId,
    tier: 'Apex',
    allocation_weight_pct: '20.00',
  },
];

function rowReader(rows: { holdings: readonly unknown[] }): StudentPortfolioPyramidQueryRowReader {
  return {
    async readStudentPortfolioPyramidRows() {
      return rows;
    },
  };
}

describe('executeStudentPortfolioPyramidQuery', () => {
  it('returns a student portfolio pyramid query result envelope from parsed own-holding rows', async () => {
    await expect(
      executeStudentPortfolioPyramidQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ holdings: holdingRows }),
        intendedWeights,
        dangerousDriftThresholdPct: 5,
      }),
    ).resolves.toEqual({
      ok: true,
      value: {
        envelopeType: 'student_portfolio_pyramid_query_result',
        queryResultKey: `class:${classId}:month:1:fund:${fundId}:student-portfolio-pyramid-query:result-envelope`,
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: `class:${classId}:month:1:fund:${fundId}:student-portfolio-pyramid-query`,
        queryName: 'get_student_portfolio_pyramid',
        requiredScope: 'viewer_fund_in_class',
        classId,
        currentMonthIndex: 1,
        viewerFundId: fundId,
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeOtherFundExactHoldings: false,
        includeInstructorGodModeData: false,
        includePendingOrderStatus: false,
        includeTargetWeights: false,
        includeOrderDetails: false,
        includeEstimatedTaxDrag: false,
        includeLedgerDrafts: false,
        includeProviderPayload: false,
        snapshot: {
          snapshotType: 'student_portfolio_pyramid',
          classId,
          monthIndex: 1,
          viewerFundId: fundId,
          tiers: [
            {
              tier: 'Base',
              currentWeightPct: 45,
              intendedWeightPct: 50,
              driftPct: -5,
              driftDirection: 'underweight',
              isDangerousDrift: false,
            },
            {
              tier: 'Core',
              currentWeightPct: 35,
              intendedWeightPct: 30,
              driftPct: 5,
              driftDirection: 'overweight',
              isDangerousDrift: false,
            },
            {
              tier: 'Apex',
              currentWeightPct: 20,
              intendedWeightPct: 20,
              driftPct: 0,
              driftDirection: 'on_target',
              isDangerousDrift: false,
            },
          ],
          hasDangerousDrift: false,
        },
      },
    });
  });

  it('rejects non-student sessions before reading rows', async () => {
    const reader: StudentPortfolioPyramidQueryRowReader = {
      async readStudentPortfolioPyramidRows() {
        throw new Error('rows should not be read for invalid roles');
      },
    };

    await expect(
      executeStudentPortfolioPyramidQuery({
        session: instructorSession,
        scope,
        rowReader: reader,
        intendedWeights,
        dangerousDriftThresholdPct: 5,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'invalid_role' },
    });
  });

  it('rejects missing fund scope before reading rows', async () => {
    const reader: StudentPortfolioPyramidQueryRowReader = {
      async readStudentPortfolioPyramidRows() {
        throw new Error('rows should not be read without a fund scope');
      },
    };

    await expect(
      executeStudentPortfolioPyramidQuery({
        session: studentSession,
        scope: { classId, monthIndex: 1 },
        rowReader: reader,
        intendedWeights,
        dangerousDriftThresholdPct: 5,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'missing_fund_scope' },
    });
  });

  it('rejects other-fund holding rows before result delivery', async () => {
    await expect(
      executeStudentPortfolioPyramidQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({
          holdings: [{ ...holdingRows[0], fund_id: otherFundId }],
        }),
        intendedWeights,
        dangerousDriftThresholdPct: 5,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'holding_row_rejected', rowFailureCode: 'scope_mismatch' },
    });
  });

  it('rejects incomplete holding rows without returning raw database rows', async () => {
    await expect(
      executeStudentPortfolioPyramidQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ holdings: [holdingRows[0], holdingRows[1]] }),
        intendedWeights,
        dangerousDriftThresholdPct: 5,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: {
        code: 'invalid_snapshot',
        validationErrors: [
          {
            code: 'missing_tier',
            message: 'Apex allocation is required.',
            tier: 'Apex',
            source: 'current_weights',
          },
          {
            code: 'total_must_equal_100',
            message: 'TARA target allocations must total exactly 100.0%.',
            total: 80,
            source: 'current_weights',
          },
        ],
      },
    });
  });

  it('rejects duplicate holding tiers before snapshot construction', async () => {
    await expect(
      executeStudentPortfolioPyramidQuery({
        session: studentSession,
        scope,
        rowReader: rowReader({ holdings: [holdingRows[0], { ...holdingRows[1], tier: 'Base' }] }),
        intendedWeights,
        dangerousDriftThresholdPct: 5,
      }),
    ).resolves.toEqual({
      ok: false,
      failure: { code: 'duplicate_holding_tier' },
    });
  });
});
