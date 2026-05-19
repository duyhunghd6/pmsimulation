import { describe, expect, it } from 'vitest';

import { createRealtimeRefreshPanelConfig } from './realtime-refresh-plan';
import type { InstructorDashboardCurrentTurnSnapshot } from './domain/classes/dashboard-snapshot';
import type { StudentDashboardCurrentTurnSnapshot } from './domain/student/dashboard-snapshot';

const classId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const studentDashboard = {
  snapshotType: 'student_dashboard_current_turn',
  classId,
  monthIndex: 2,
  viewerFundId: 'fund-001',
  macroNews: {},
  driverStringDashboard: {},
  portfolioPyramid: {},
  taraOrderEntry: {},
  leaderboardRank: {},
} as StudentDashboardCurrentTurnSnapshot;

const instructorDashboard = {
  snapshotType: 'instructor_dashboard_current_turn',
  classId,
  monthIndex: 2,
  pendingOrderVisibility: {},
  liveLeaderboard: {},
  godModePortfolioVisibility: {},
  classAggregateAnalytics: {},
  liveMonthAdvanceControl: {},
} as InstructorDashboardCurrentTurnSnapshot;

describe('createRealtimeRefreshPanelConfig', () => {
  it('scopes the authorized server query result proof to the student dashboard route surface', () => {
    const config = createRealtimeRefreshPanelConfig({
      classId,
      currentMonthIndex: 2,
      totalMonths: 12,
      surface: 'student_dashboard_current_turn',
      studentDashboard,
    });

    expect(config.refetchPlan.surfaces).toEqual(['student_dashboard_current_turn']);
    expect(config.serverQueryResult).toEqual(
      expect.objectContaining({
        kind: 'ready',
        surfaces: ['student_dashboard_current_turn'],
      }),
    );
    expect(config.serverQueryResult.queryResultKey).toContain(':server-query-descriptor:result-envelope');
  });

  it('scopes the authorized server query result proof to the instructor dashboard route surface', () => {
    const config = createRealtimeRefreshPanelConfig({
      classId,
      currentMonthIndex: 2,
      totalMonths: 12,
      surface: 'instructor_dashboard_current_turn',
      instructorDashboard,
    });

    expect(config.refetchPlan.surfaces).toEqual(['instructor_dashboard_current_turn']);
    expect(config.serverQueryResult).toEqual(
      expect.objectContaining({
        kind: 'ready',
        surfaces: ['instructor_dashboard_current_turn'],
      }),
    );
  });

  it('returns a safe validation status when the refreshed route lacks the scoped snapshot', () => {
    const config = createRealtimeRefreshPanelConfig({
      classId,
      currentMonthIndex: 2,
      totalMonths: 12,
      surface: 'student_dashboard_current_turn',
    });

    expect(config.serverQueryResult).toEqual(
      expect.objectContaining({
        kind: 'validation_failed',
        validationErrors: [{ code: 'missing_student_dashboard_result', surface: 'student_dashboard_current_turn' }],
      }),
    );
  });
});
