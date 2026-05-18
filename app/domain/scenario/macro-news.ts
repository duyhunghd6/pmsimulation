export type MacroNarrativeRow = {
  monthIndex: number;
  newsHeadline: string;
  investmentClockPhase: string;
  pmi: number;
  iip: number;
  m2Growth: number;
  gdpGrowthYoy: number;
  inflationCpi: number;
  policyRate: number;
  bondYield: number;
  interbankRate: number;
  usdVndMovement: number;
  vix: number;
  scenarioPersistence: string;
};

export type MarketMetricRow = {
  monthIndex: number;
  vnIndexLevel: number;
  equityMarketTradingValue: number;
  foreignInvestorNetTradingValue: number;
  retailInvestorNetTradingValue: number;
  marketEarningsGrowthExpectation: string;
  valuationSentiment: string;
  businessCyclePhase: string;
};

export type StudentMacroNewsSnapshotInput = {
  currentMonthIndex: number;
  macroNarratives: readonly MacroNarrativeRow[];
  marketMetrics: readonly MarketMetricRow[];
};

export type StudentMacroNewsSnapshot = {
  monthIndex: number;
  newsHeadline: string;
  investmentClockPhase: string;
  scenarioPersistence: string;
  macroDrivers: {
    pmi: number;
    iip: number;
    m2Growth: number;
    gdpGrowthYoy: number;
    inflationCpi: number;
    policyRate: number;
    bondYield: number;
    interbankRate: number;
    usdVndMovement: number;
    vix: number;
  };
  marketStrings: {
    vnIndexLevel: number;
    equityMarketTradingValue: number;
    foreignInvestorNetTradingValue: number;
    retailInvestorNetTradingValue: number;
    marketEarningsGrowthExpectation: string;
    valuationSentiment: string;
    businessCyclePhase: string;
  };
};

export type StudentMacroNewsSnapshotErrorCode =
  | 'invalid_current_month_index'
  | 'missing_current_macro_narrative'
  | 'duplicate_current_macro_narrative'
  | 'missing_current_market_metrics'
  | 'duplicate_current_market_metrics';

export type StudentMacroNewsSnapshotError = {
  code: StudentMacroNewsSnapshotErrorCode;
  message: string;
};

export type StudentMacroNewsSnapshotResult =
  | { ok: true; value: StudentMacroNewsSnapshot }
  | { ok: false; errors: StudentMacroNewsSnapshotError[] };

export type StudentMacroNewsQueryDescriptorInput = {
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
};

export type StudentMacroNewsQueryDescriptor = {
  descriptorType: 'student_macro_news_query_descriptor';
  queryDescriptorKey: string;
  queryBoundary: 'server_query_descriptor_boundary';
  queryName: 'get_student_macro_news';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
};

export type StudentMacroNewsQueryDescriptorErrorCode =
  | 'invalid_class_id'
  | 'invalid_current_month_index'
  | 'invalid_viewer_fund_id';

export type StudentMacroNewsQueryDescriptorError = {
  code: StudentMacroNewsQueryDescriptorErrorCode;
  message: string;
};

export type StudentMacroNewsQueryDescriptorResult =
  | { ok: true; value: StudentMacroNewsQueryDescriptor }
  | { ok: false; errors: StudentMacroNewsQueryDescriptorError[] };

export type StudentMacroNewsQueryResultEnvelope = {
  envelopeType: 'student_macro_news_query_result';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_macro_news';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'ready';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  snapshot: StudentMacroNewsSnapshot;
};

export type StudentMacroNewsQueryResultValidationFailureEnvelope = {
  envelopeType: 'student_macro_news_query_result_validation_failure';
  queryResultKey: string;
  queryBoundary: 'server_query_result_boundary';
  queryDescriptorKey: string;
  queryName: 'get_student_macro_news';
  requiredScope: 'viewer_fund_in_class';
  classId: string;
  currentMonthIndex: number;
  viewerFundId: string;
  resultStatus: 'validation_failed';
  currentTurnOnly: true;
  includeFutureScenarioRows: false;
  includeOtherFundIds: false;
  includeExactHoldings: false;
  includeTargetWeights: false;
  includeOrderDetails: false;
  includeLedgerDrafts: false;
  includeProviderPayload: false;
  validationErrors: StudentMacroNewsQueryResultEnvelopeError[];
};

export type StudentMacroNewsQueryResultEnvelopeInput = {
  descriptor: StudentMacroNewsQueryDescriptor;
  snapshot?: StudentMacroNewsSnapshot;
};

export type StudentMacroNewsQueryResultEnvelopeErrorCode =
  | 'missing_student_macro_news_snapshot'
  | 'mismatched_current_month_index';

export type StudentMacroNewsQueryResultEnvelopeError = {
  code: StudentMacroNewsQueryResultEnvelopeErrorCode;
  message: string;
};

export type StudentMacroNewsQueryResultEnvelopeResult =
  | { ok: true; value: StudentMacroNewsQueryResultEnvelope }
  | { ok: false; errors: StudentMacroNewsQueryResultEnvelopeError[] };

export type StudentMacroNewsQueryResultValidationFailureEnvelopeError = {
  code: 'query_result_is_valid';
  message: string;
};

export type StudentMacroNewsQueryResultValidationFailureEnvelopeResult =
  | { ok: true; value: StudentMacroNewsQueryResultValidationFailureEnvelope }
  | { ok: false; errors: StudentMacroNewsQueryResultValidationFailureEnvelopeError[] };

export function createStudentMacroNewsQueryDescriptor(
  input: StudentMacroNewsQueryDescriptorInput,
): StudentMacroNewsQueryDescriptorResult {
  const errors: StudentMacroNewsQueryDescriptorError[] = [];
  const classId = input.classId.trim();
  const viewerFundId = input.viewerFundId.trim();

  if (classId === '') {
    errors.push({
      code: 'invalid_class_id',
      message: 'Class id is required.',
    });
  }

  if (!Number.isInteger(input.currentMonthIndex) || input.currentMonthIndex < 0) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  if (viewerFundId === '') {
    errors.push({
      code: 'invalid_viewer_fund_id',
      message: 'Viewer fund id is required.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      descriptorType: 'student_macro_news_query_descriptor',
      queryDescriptorKey: `class:${classId}:month:${input.currentMonthIndex}:fund:${viewerFundId}:student-macro-news-query`,
      queryBoundary: 'server_query_descriptor_boundary',
      queryName: 'get_student_macro_news',
      requiredScope: 'viewer_fund_in_class',
      classId,
      currentMonthIndex: input.currentMonthIndex,
      viewerFundId,
      currentTurnOnly: true,
      includeFutureScenarioRows: false,
      includeOtherFundIds: false,
      includeExactHoldings: false,
      includeTargetWeights: false,
      includeOrderDetails: false,
      includeLedgerDrafts: false,
      includeProviderPayload: false,
    },
  };
}

export function createStudentMacroNewsQueryResultValidationFailureEnvelope(
  input: StudentMacroNewsQueryResultEnvelopeInput,
): StudentMacroNewsQueryResultValidationFailureEnvelopeResult {
  const result = createStudentMacroNewsQueryResultEnvelope(input);

  if (result.ok) {
    return {
      ok: false,
      errors: [
        {
          code: 'query_result_is_valid',
          message: 'Validation failure envelopes require an invalid student macro news query result.',
        },
      ],
    };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_macro_news_query_result_validation_failure',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:validation-failure`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'validation_failed',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeExactHoldings: input.descriptor.includeExactHoldings,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      validationErrors: result.errors,
    },
  };
}

export function createStudentMacroNewsQueryResultEnvelope(
  input: StudentMacroNewsQueryResultEnvelopeInput,
): StudentMacroNewsQueryResultEnvelopeResult {
  const errors: StudentMacroNewsQueryResultEnvelopeError[] = [];

  if (!input.snapshot) {
    return {
      ok: false,
      errors: [
        {
          code: 'missing_student_macro_news_snapshot',
          message: 'Student macro news query result envelopes require the already-authorized snapshot.',
        },
      ],
    };
  }

  if (input.snapshot.monthIndex !== input.descriptor.currentMonthIndex) {
    errors.push({
      code: 'mismatched_current_month_index',
      message: 'Student macro news query result month must match the descriptor current month.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      envelopeType: 'student_macro_news_query_result',
      queryResultKey: `${input.descriptor.queryDescriptorKey}:result-envelope`,
      queryBoundary: 'server_query_result_boundary',
      queryDescriptorKey: input.descriptor.queryDescriptorKey,
      queryName: input.descriptor.queryName,
      requiredScope: input.descriptor.requiredScope,
      classId: input.descriptor.classId,
      currentMonthIndex: input.descriptor.currentMonthIndex,
      viewerFundId: input.descriptor.viewerFundId,
      resultStatus: 'ready',
      currentTurnOnly: input.descriptor.currentTurnOnly,
      includeFutureScenarioRows: input.descriptor.includeFutureScenarioRows,
      includeOtherFundIds: input.descriptor.includeOtherFundIds,
      includeExactHoldings: input.descriptor.includeExactHoldings,
      includeTargetWeights: input.descriptor.includeTargetWeights,
      includeOrderDetails: input.descriptor.includeOrderDetails,
      includeLedgerDrafts: input.descriptor.includeLedgerDrafts,
      includeProviderPayload: input.descriptor.includeProviderPayload,
      snapshot: input.snapshot,
    },
  };
}

export function buildStudentMacroNewsSnapshot(
  input: StudentMacroNewsSnapshotInput,
): StudentMacroNewsSnapshotResult {
  const errors: StudentMacroNewsSnapshotError[] = [];

  if (!Number.isInteger(input.currentMonthIndex) || input.currentMonthIndex < 0) {
    errors.push({
      code: 'invalid_current_month_index',
      message: 'Current month index must be a non-negative integer.',
    });
  }

  const currentMacroNarratives = input.macroNarratives.filter(
    (row) => row.monthIndex === input.currentMonthIndex,
  );
  const currentMarketMetrics = input.marketMetrics.filter((row) => row.monthIndex === input.currentMonthIndex);

  if (currentMacroNarratives.length === 0) {
    errors.push({
      code: 'missing_current_macro_narrative',
      message: 'A current-month macro narrative row is required.',
    });
  }

  if (currentMacroNarratives.length > 1) {
    errors.push({
      code: 'duplicate_current_macro_narrative',
      message: 'Only one current-month macro narrative row may be shown to students.',
    });
  }

  if (currentMarketMetrics.length === 0) {
    errors.push({
      code: 'missing_current_market_metrics',
      message: 'A current-month market metrics row is required.',
    });
  }

  if (currentMarketMetrics.length > 1) {
    errors.push({
      code: 'duplicate_current_market_metrics',
      message: 'Only one current-month market metrics row may be shown to students.',
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const macroNarrative = currentMacroNarratives[0];
  const marketMetric = currentMarketMetrics[0];

  return {
    ok: true,
    value: {
      monthIndex: input.currentMonthIndex,
      newsHeadline: macroNarrative.newsHeadline,
      investmentClockPhase: macroNarrative.investmentClockPhase,
      scenarioPersistence: macroNarrative.scenarioPersistence,
      macroDrivers: {
        pmi: macroNarrative.pmi,
        iip: macroNarrative.iip,
        m2Growth: macroNarrative.m2Growth,
        gdpGrowthYoy: macroNarrative.gdpGrowthYoy,
        inflationCpi: macroNarrative.inflationCpi,
        policyRate: macroNarrative.policyRate,
        bondYield: macroNarrative.bondYield,
        interbankRate: macroNarrative.interbankRate,
        usdVndMovement: macroNarrative.usdVndMovement,
        vix: macroNarrative.vix,
      },
      marketStrings: {
        vnIndexLevel: marketMetric.vnIndexLevel,
        equityMarketTradingValue: marketMetric.equityMarketTradingValue,
        foreignInvestorNetTradingValue: marketMetric.foreignInvestorNetTradingValue,
        retailInvestorNetTradingValue: marketMetric.retailInvestorNetTradingValue,
        marketEarningsGrowthExpectation: marketMetric.marketEarningsGrowthExpectation,
        valuationSentiment: marketMetric.valuationSentiment,
        businessCyclePhase: marketMetric.businessCyclePhase,
      },
    },
  };
}
