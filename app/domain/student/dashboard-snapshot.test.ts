import { describe, expect, it } from 'vitest';

import {
  buildStudentDashboardCurrentTurnSnapshot,
  buildStudentDashboardPostTurnSnapshot,
  createStudentDashboardCurrentTurnQueryDescriptor,
  createStudentDashboardPostTurnQueryDescriptor,
  createStudentDashboardCurrentTurnQueryResultEnvelope,
  createStudentDashboardCurrentTurnQueryResultValidationFailureEnvelope,
  createStudentDashboardPostTurnQueryResultEnvelope,
  createStudentDashboardPostTurnQueryResultValidationFailureEnvelope,
} from './dashboard-snapshot';

const currentMacroNarrative = {
  monthIndex: 2,
  newsHeadline: 'Liquidity tightens as policy rates rise',
  investmentClockPhase: 'slowdown',
  pmi: 49.2,
  iip: 51.1,
  m2Growth: 8.4,
  gdpGrowthYoy: 5.7,
  inflationCpi: 3.2,
  policyRate: 5,
  bondYield: 4.8,
  interbankRate: 4.2,
  usdVndMovement: 1.1,
  vix: 28,
  scenarioPersistence: 'rate_hike_stress',
};

const currentMarketMetric = {
  monthIndex: 2,
  vnIndexLevel: 1175,
  equityMarketTradingValue: 14_000,
  foreignInvestorNetTradingValue: -900,
  retailInvestorNetTradingValue: 500,
  marketEarningsGrowthExpectation: 'downgraded',
  valuationSentiment: 'cautious',
  businessCyclePhase: 'late_cycle',
};

const defaultInput = {
  classId: 'class-001',
  currentMonthIndex: 2,
  viewerFundId: 'fund-001',
  macroNarratives: [
    currentMacroNarrative,
    {
      ...currentMacroNarrative,
      monthIndex: 3,
      newsHeadline: 'Future CPI shock should stay hidden',
    },
  ],
  marketMetrics: [
    currentMarketMetric,
    {
      ...currentMarketMetric,
      monthIndex: 3,
      valuationSentiment: 'future panic',
    },
  ],
  currentWeights: {
    Base: 25,
    Core: 45,
    Apex: 30,
  },
  intendedWeights: {
    Base: 30,
    Core: 50,
    Apex: 20,
  },
  dangerousDriftThresholdPct: 8,
  targetWeights: {
    Base: 35,
    Core: 50,
    Apex: 15,
  },
  currentAum: 50_000_000,
  apexUnrealizedGainPct: 20,
  leaderboardFunds: [
    {
      fundId: 'fund-002',
      studentDisplayName: 'Beta Fund',
      currentAum: 52_000_000,
      sharpeRatio: 1.1,
    },
    {
      fundId: 'fund-001',
      studentDisplayName: 'Viewer Fund',
      currentAum: 50_000_000,
      sharpeRatio: 1.2,
    },
  ],
};

function errorSourcesFor(input: Parameters<typeof buildStudentDashboardCurrentTurnSnapshot>[0]): string[] {
  const result = buildStudentDashboardCurrentTurnSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.source);
}

describe('createStudentDashboardCurrentTurnQueryDescriptor', () => {
  it('creates a server-query descriptor for a scoped student current-turn dashboard', () => {
    const result = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: ' class-001 ',
      currentMonthIndex: 2,
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'student_dashboard_current_turn_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:2:fund:fund-001:student-dashboard-current-turn-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_student_dashboard_current_turn',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 2,
        viewerFundId: 'fund-001',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundExactHoldingsForStudents: false,
        includeInstructorGodModeData: false,
        includeProviderPayload: false,
        requestedSections: ['macro_news', 'driver_string_dashboard', 'portfolio_pyramid', 'tara_order_entry', 'leaderboard_rank'],
      },
    });
  });

  it('keeps the descriptor free of query results, provider clients, and other-fund data', () => {
    const result = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('viewer_fund_in_class');
    expect(result.value.currentTurnOnly).toBe(true);
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundExactHoldingsForStudents).toBe(false);
    expect(result.value.includeInstructorGodModeData).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('otherFundIds' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
  });

  it('rejects invalid student dashboard query descriptor scope inputs', () => {
    const result = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: ' ',
      currentMonthIndex: 1.5,
      viewerFundId: ' ',
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_current_month_index', message: 'Current month index must be a non-negative integer.' },
        { code: 'invalid_viewer_fund_id', message: 'Viewer fund id is required.' },
      ],
    });
  });
});

describe('createStudentDashboardCurrentTurnQueryResultEnvelope', () => {
  it('wraps an already-authorized student current-turn dashboard snapshot for the descriptor scope', () => {
    const descriptor = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentDashboardCurrentTurnQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_dashboard_current_turn_query_result',
        queryResultKey: 'class:class-001:month:2:fund:fund-001:student-dashboard-current-turn-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:2:fund:fund-001:student-dashboard-current-turn-query',
        queryName: 'get_student_dashboard_current_turn',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 2,
        viewerFundId: 'fund-001',
        resultStatus: 'ready',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundExactHoldingsForStudents: false,
        includeInstructorGodModeData: false,
        includeProviderPayload: false,
        snapshot: snapshot.value,
      },
    });
  });

  it('keeps the query result envelope scoped to safe student dashboard payloads', () => {
    const descriptor = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createStudentDashboardCurrentTurnQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: snapshot.value,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const payload = JSON.stringify(result.value);

    expect(result.value.currentTurnOnly).toBe(true);
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundExactHoldingsForStudents).toBe(false);
    expect(result.value.includeInstructorGodModeData).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(payload).not.toContain('Future CPI shock should stay hidden');
    expect(payload).not.toContain('fund-002');
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });

  it('rejects missing or mismatched student current-turn dashboard query results', () => {
    const descriptor = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentDashboardCurrentTurnQueryResultEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_student_dashboard_snapshot',
          message: 'Student dashboard query result envelopes require the already-authorized current-turn snapshot.',
        },
      ],
    });

    expect(
      createStudentDashboardCurrentTurnQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: {
          ...snapshot.value,
          classId: 'class-999',
          monthIndex: 3,
          viewerFundId: 'fund-999',
        },
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'mismatched_class_id', message: 'Student dashboard query result class must match the descriptor class.' },
        {
          code: 'mismatched_current_month_index',
          message: 'Student dashboard query result month must match the descriptor current month.',
        },
        {
          code: 'mismatched_viewer_fund_id',
          message: 'Student dashboard query result viewer fund must match the descriptor viewer fund.',
        },
      ],
    });
  });

  it('creates a validation failure envelope for an invalid student current-turn dashboard query result', () => {
    const descriptor = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createStudentDashboardCurrentTurnQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_dashboard_current_turn_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:2:fund:fund-001:student-dashboard-current-turn-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:2:fund:fund-001:student-dashboard-current-turn-query',
        queryName: 'get_student_dashboard_current_turn',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        currentMonthIndex: 2,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        currentTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundExactHoldingsForStudents: false,
        includeInstructorGodModeData: false,
        includeProviderPayload: false,
        validationErrors: [
          {
            code: 'missing_student_dashboard_snapshot',
            message: 'Student dashboard query result envelopes require the already-authorized current-turn snapshot.',
          },
        ],
      },
    });
  });

  it('keeps query result validation failures free of snapshots, database rows, and provider clients', () => {
    const descriptor = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createStudentDashboardCurrentTurnQueryResultValidationFailureEnvelope({
      descriptor: descriptor.value,
      snapshot: {
        ...snapshot.value,
        viewerFundId: 'fund-999',
      },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect(result.value.validationErrors).toEqual([
      {
        code: 'mismatched_viewer_fund_id',
        message: 'Student dashboard query result viewer fund must match the descriptor viewer fund.',
      },
    ]);
    expect('snapshot' in result.value).toBe(false);
    expect('studentDashboard' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for a valid student dashboard query result', () => {
    const descriptor = createStudentDashboardCurrentTurnQueryDescriptor({
      classId: 'class-001',
      currentMonthIndex: 2,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentDashboardCurrentTurnQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student dashboard current-turn query result.',
        },
      ],
    });
  });
});

describe('buildStudentDashboardCurrentTurnSnapshot', () => {
  it('composes current-turn student dashboard surfaces for the viewer fund', () => {
    const result = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        snapshotType: 'student_dashboard_current_turn',
        classId: 'class-001',
        monthIndex: 2,
        viewerFundId: 'fund-001',
        macroNews: expect.objectContaining({
          monthIndex: 2,
          newsHeadline: 'Liquidity tightens as policy rates rise',
        }),
        driverStringDashboard: expect.objectContaining({
          monthIndex: 2,
          context: expect.objectContaining({
            businessCyclePhase: 'late_cycle',
          }),
        }),
        portfolioPyramid: expect.objectContaining({
          hasDangerousDrift: true,
        }),
        taraOrderEntry: expect.objectContaining({
          classId: 'class-001',
          viewerFundId: 'fund-001',
          status: 'pending',
          targetWeights: {
            Base: 35,
            Core: 50,
            Apex: 15,
          },
        }),
        leaderboardRank: expect.objectContaining({
          viewerRank: 2,
          rankedFundCount: 2,
        }),
      }),
    });
  });

  it('keeps future scenario rows and other-fund sensitive fields out of the dashboard payload', () => {
    const result = buildStudentDashboardCurrentTurnSnapshot(defaultInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const payload = JSON.stringify(result.value);

    expect(payload).not.toContain('Future CPI shock should stay hidden');
    expect(payload).not.toContain('future panic');
    expect(payload).not.toContain('fund-002');
    expect('targetWeights' in result.value.leaderboardRank.rows[0]).toBe(false);
    expect('currentWeights' in result.value.leaderboardRank.rows[0]).toBe(false);
    expect('pendingOrderStatus' in result.value.leaderboardRank.rows[0]).toBe(false);
    expect('godModePortfolios' in result.value).toBe(false);
  });

  it('returns source-tagged errors from invalid child snapshots', () => {
    expect(
      errorSourcesFor({
        ...defaultInput,
        currentMonthIndex: 4,
        viewerFundId: 'fund-999',
        targetWeights: {
          Base: 30,
          Core: 30,
          Apex: 20,
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        'macro_news',
        'driver_string_dashboard',
        'tara_order_entry',
        'leaderboard_rank',
      ]),
    );
  });
});

const defaultPostTurnInput = {
  classId: ' class-001 ',
  monthIndex: 3,
  viewerFundId: ' fund-001 ',
  ledgerDraft: {
    fundId: ' fund-001 ',
    monthIndex: 3,
    startingAum: 50_000_000,
    marketBetaImpact: 1_000_000,
    feeDrag: 100_000,
    taxPaid: 200_000,
    taxDragPct: 0.4,
    pvpSlippagePaid: 50_000,
    liquidityPenaltyPct: 0.1,
    classroomSellConcentrationPct: 65,
    endingAum: 50_650_000,
  },
  leaderboardFunds: [
    {
      fundId: 'fund-002',
      studentDisplayName: 'Beta Fund',
      currentAum: 51_000_000,
      sharpeRatio: 1.1,
    },
    {
      fundId: 'fund-001',
      studentDisplayName: 'Viewer Fund',
      currentAum: 50_650_000,
      sharpeRatio: 1.2,
    },
  ],
};

function postTurnErrorSourcesFor(input: Parameters<typeof buildStudentDashboardPostTurnSnapshot>[0]): string[] {
  const result = buildStudentDashboardPostTurnSnapshot(input);

  if (result.ok) {
    return [];
  }

  return result.errors.map((error) => error.source);
}

describe('createStudentDashboardPostTurnQueryDescriptor', () => {
  it('creates a server-query descriptor for a scoped student post-turn dashboard', () => {
    const result = createStudentDashboardPostTurnQueryDescriptor({
      classId: ' class-001 ',
      processedMonthIndex: 3,
      viewerFundId: ' fund-001 ',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        descriptorType: 'student_dashboard_post_turn_query_descriptor',
        queryDescriptorKey: 'class:class-001:month:3:fund:fund-001:student-dashboard-post-turn-query',
        queryBoundary: 'server_query_descriptor_boundary',
        queryName: 'get_student_dashboard_post_turn',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        processedMonthIndex: 3,
        viewerFundId: 'fund-001',
        processedTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeOtherFundExactHoldingsForStudents: false,
        includeOrderDetails: false,
        includeInstructorGodModeData: false,
        includeClassAggregatePayload: false,
        includeProviderPayload: false,
        includeLedgerDrafts: false,
        requestedSections: ['attribution_report', 'leaderboard_rank'],
      },
    });
  });

  it('keeps the post-turn descriptor free of results, provider clients, and sensitive student payloads', () => {
    const result = createStudentDashboardPostTurnQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 3,
      viewerFundId: 'fund-001',
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.requiredScope).toBe('viewer_fund_in_class');
    expect(result.value.processedTurnOnly).toBe(true);
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeOtherFundExactHoldingsForStudents).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeInstructorGodModeData).toBe(false);
    expect(result.value.includeClassAggregatePayload).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(result.value.includeLedgerDrafts).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('attributionReport' in result.value).toBe(false);
  });

  it('rejects invalid student post-turn query descriptor scope inputs', () => {
    const result = createStudentDashboardPostTurnQueryDescriptor({
      classId: ' ',
      processedMonthIndex: 1.5,
      viewerFundId: ' ',
    });

    expect(result).toEqual({
      ok: false,
      errors: [
        { code: 'invalid_class_id', message: 'Class id is required.' },
        { code: 'invalid_processed_month_index', message: 'Processed month index must be a non-negative integer.' },
        { code: 'invalid_viewer_fund_id', message: 'Viewer fund id is required.' },
      ],
    });
  });
});

describe('createStudentDashboardPostTurnQueryResultEnvelope', () => {
  it('wraps an already-authorized student post-turn dashboard snapshot for the descriptor scope', () => {
    const descriptor = createStudentDashboardPostTurnQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 3,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentDashboardPostTurnQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_dashboard_post_turn_query_result',
        queryResultKey: 'class:class-001:month:3:fund:fund-001:student-dashboard-post-turn-query:result-envelope',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:3:fund:fund-001:student-dashboard-post-turn-query',
        queryName: 'get_student_dashboard_post_turn',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        processedMonthIndex: 3,
        viewerFundId: 'fund-001',
        resultStatus: 'ready',
        processedTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeOtherFundExactHoldingsForStudents: false,
        includeOrderDetails: false,
        includeInstructorGodModeData: false,
        includeClassAggregatePayload: false,
        includeProviderPayload: false,
        includeLedgerDrafts: false,
        snapshot: snapshot.value,
      },
    });
  });

  it('keeps the post-turn query result envelope scoped to safe student payloads', () => {
    const descriptor = createStudentDashboardPostTurnQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 3,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createStudentDashboardPostTurnQueryResultEnvelope({
      descriptor: descriptor.value,
      snapshot: snapshot.value,
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const payload = JSON.stringify(result.value);

    expect(result.value.processedTurnOnly).toBe(true);
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeOtherFundExactHoldingsForStudents).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeInstructorGodModeData).toBe(false);
    expect(result.value.includeClassAggregatePayload).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(result.value.includeLedgerDrafts).toBe(false);
    expect(payload).not.toContain('fund-002');
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
  });

  it('rejects missing or mismatched student post-turn dashboard query results', () => {
    const descriptor = createStudentDashboardPostTurnQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 3,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentDashboardPostTurnQueryResultEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'missing_student_dashboard_snapshot',
          message: 'Student dashboard post-turn query result envelopes require the already-authorized post-turn snapshot.',
        },
      ],
    });

    expect(
      createStudentDashboardPostTurnQueryResultEnvelope({
        descriptor: descriptor.value,
        snapshot: {
          ...snapshot.value,
          classId: 'class-999',
          monthIndex: 4,
          viewerFundId: 'fund-999',
        },
      }),
    ).toEqual({
      ok: false,
      errors: [
        { code: 'mismatched_class_id', message: 'Student dashboard post-turn query result class must match the descriptor class.' },
        {
          code: 'mismatched_processed_month_index',
          message: 'Student dashboard post-turn query result month must match the descriptor processed month.',
        },
        {
          code: 'mismatched_viewer_fund_id',
          message: 'Student dashboard post-turn query result viewer fund must match the descriptor viewer fund.',
        },
      ],
    });
  });

  it('creates a validation failure envelope for an invalid student post-turn dashboard query result', () => {
    const descriptor = createStudentDashboardPostTurnQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 3,
      viewerFundId: 'fund-001',
    });

    expect(descriptor.ok).toBe(true);

    if (!descriptor.ok) {
      return;
    }

    expect(
      createStudentDashboardPostTurnQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
      }),
    ).toEqual({
      ok: true,
      value: {
        envelopeType: 'student_dashboard_post_turn_query_result_validation_failure',
        queryResultKey: 'class:class-001:month:3:fund:fund-001:student-dashboard-post-turn-query:validation-failure',
        queryBoundary: 'server_query_result_boundary',
        queryDescriptorKey: 'class:class-001:month:3:fund:fund-001:student-dashboard-post-turn-query',
        queryName: 'get_student_dashboard_post_turn',
        requiredScope: 'viewer_fund_in_class',
        classId: 'class-001',
        processedMonthIndex: 3,
        viewerFundId: 'fund-001',
        resultStatus: 'validation_failed',
        processedTurnOnly: true,
        includeFutureScenarioRows: false,
        includeOtherFundIds: false,
        includeOtherFundExactHoldingsForStudents: false,
        includeOrderDetails: false,
        includeInstructorGodModeData: false,
        includeClassAggregatePayload: false,
        includeProviderPayload: false,
        includeLedgerDrafts: false,
        validationErrors: [
          {
            code: 'missing_student_dashboard_snapshot',
            message: 'Student dashboard post-turn query result envelopes require the already-authorized post-turn snapshot.',
          },
        ],
      },
    });
  });

  it('keeps post-turn query result validation failures free of snapshots and sensitive payloads', () => {
    const descriptor = createStudentDashboardPostTurnQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 3,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    const result = createStudentDashboardPostTurnQueryResultValidationFailureEnvelope({
      descriptor: descriptor.value,
      snapshot: {
        ...snapshot.value,
        viewerFundId: 'fund-999',
      },
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.resultStatus).toBe('validation_failed');
    expect(result.value.validationErrors).toEqual([
      {
        code: 'mismatched_viewer_fund_id',
        message: 'Student dashboard post-turn query result viewer fund must match the descriptor viewer fund.',
      },
    ]);
    expect(result.value.includeFutureScenarioRows).toBe(false);
    expect(result.value.includeOtherFundIds).toBe(false);
    expect(result.value.includeOtherFundExactHoldingsForStudents).toBe(false);
    expect(result.value.includeOrderDetails).toBe(false);
    expect(result.value.includeInstructorGodModeData).toBe(false);
    expect(result.value.includeClassAggregatePayload).toBe(false);
    expect(result.value.includeProviderPayload).toBe(false);
    expect(result.value.includeLedgerDrafts).toBe(false);
    expect('snapshot' in result.value).toBe(false);
    expect('attributionReport' in result.value).toBe(false);
    expect('databaseRows' in result.value).toBe(false);
    expect('supabaseClient' in result.value).toBe(false);
    expect('uiState' in result.value).toBe(false);
  });

  it('does not create a validation failure envelope for a valid student post-turn dashboard query result', () => {
    const descriptor = createStudentDashboardPostTurnQueryDescriptor({
      classId: 'class-001',
      processedMonthIndex: 3,
      viewerFundId: 'fund-001',
    });
    const snapshot = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(descriptor.ok).toBe(true);
    expect(snapshot.ok).toBe(true);

    if (!descriptor.ok || !snapshot.ok) {
      return;
    }

    expect(
      createStudentDashboardPostTurnQueryResultValidationFailureEnvelope({
        descriptor: descriptor.value,
        snapshot: snapshot.value,
      }),
    ).toEqual({
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student dashboard post-turn query result.',
        },
      ],
    });
  });
});

describe('buildStudentDashboardPostTurnSnapshot', () => {
  it('composes post-turn student dashboard surfaces for the viewer fund', () => {
    const result = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        snapshotType: 'student_dashboard_post_turn',
        classId: 'class-001',
        monthIndex: 3,
        viewerFundId: 'fund-001',
        attributionReport: expect.objectContaining({
          reportKey: 'class:class-001:month:3:fund:fund-001:attribution-report',
          endingAum: 50_650_000,
        }),
        leaderboardRank: expect.objectContaining({
          viewerRank: 2,
          rankedFundCount: 2,
        }),
      }),
    });
  });

  it('keeps order, holdings, and other-fund ids out of the post-turn dashboard payload', () => {
    const result = buildStudentDashboardPostTurnSnapshot(defaultPostTurnInput);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    const payload = JSON.stringify(result.value);

    expect(payload).not.toContain('fund-002');
    expect('targetWeights' in result.value).toBe(false);
    expect('currentWeights' in result.value).toBe(false);
    expect('taraOrderEntry' in result.value).toBe(false);
    expect('ledgerDrafts' in result.value).toBe(false);
    expect('fundId' in result.value.leaderboardRank.rows[0]).toBe(false);
  });

  it('returns source-tagged errors from invalid post-turn child snapshots', () => {
    expect(
      postTurnErrorSourcesFor({
        ...defaultPostTurnInput,
        viewerFundId: 'fund-999',
        ledgerDraft: {
          ...defaultPostTurnInput.ledgerDraft,
          endingAum: 1,
        },
      }),
    ).toEqual(expect.arrayContaining(['attribution_report', 'leaderboard_rank']));
  });
});
