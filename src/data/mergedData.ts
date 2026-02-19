import { RoadmapData } from '../types';

/**
 * Consolidated Roadmap
 * Merges the full Product Launch plan with the Accelerated timeline.
 * Early phases use the accelerated schedule; later phases follow the full plan.
 * All durationDays values are WORKING DAYS (Mon-Fri).
 */
export const mergedData: RoadmapData = {
  viewStart: '2026-01-05',
  viewEnd: '2026-06-30',
  lanes: [
    { id: 'design', name: 'Design', color: '#8B5CF6' },
    { id: 'engineering', name: 'Engineering', color: '#2563EB' },
    { id: 'qa', name: 'QA', color: '#DC2626' },
    { id: 'marketing', name: 'Marketing', color: '#059669' },
  ],
  tasks: [
    // ===== Design Lane (accelerated early, full review later) =====
    {
      id: 'design-research',
      name: 'Rapid User Research',
      laneId: 'design',
      startDate: '2026-01-05',
      durationDays: 5,
      dependencies: [],
    },
    {
      id: 'design-wireframes',
      name: 'Wireframes & Quick Prototypes',
      laneId: 'design',
      startDate: '2026-01-12',
      durationDays: 8,
      dependencies: ['design-research'],
    },
    {
      id: 'design-ui-kit',
      name: 'UI Kit & Design System',
      laneId: 'design',
      startDate: '2026-01-22',
      durationDays: 8,
      dependencies: ['design-wireframes'],
    },
    {
      id: 'design-review',
      name: 'Design Review & Sign-off',
      laneId: 'design',
      startDate: '2026-02-03',
      durationDays: 3,
      dependencies: ['design-ui-kit'],
    },

    // ===== Engineering Lane (accelerated start, full feature set) =====
    {
      id: 'eng-architecture',
      name: 'Architecture Sprint',
      laneId: 'engineering',
      startDate: '2026-01-05',
      durationDays: 5,
      dependencies: [],
    },
    {
      id: 'eng-api',
      name: 'API Development',
      laneId: 'engineering',
      startDate: '2026-01-12',
      durationDays: 18,
      dependencies: ['eng-architecture'],
    },
    {
      id: 'eng-frontend',
      name: 'Frontend Implementation',
      laneId: 'engineering',
      startDate: '2026-02-05',
      durationDays: 25,
      dependencies: ['design-review', 'eng-api'],
    },
    {
      id: 'eng-integrations',
      name: 'Third-Party Integrations',
      laneId: 'engineering',
      startDate: '2026-02-09',
      durationDays: 10,
      dependencies: ['eng-api'],
    },
    {
      id: 'eng-perf',
      name: 'Performance Optimization',
      laneId: 'engineering',
      startDate: '2026-03-16',
      durationDays: 8,
      dependencies: ['eng-frontend'],
    },
    {
      id: 'eng-deploy-infra',
      name: 'Deployment & Infrastructure',
      laneId: 'engineering',
      startDate: '2026-03-26',
      durationDays: 7,
      dependencies: ['eng-perf'],
    },

    // ===== QA Lane (full coverage) =====
    {
      id: 'qa-plan',
      name: 'Test Strategy & Planning',
      laneId: 'qa',
      startDate: '2026-01-12',
      durationDays: 4,
      dependencies: ['eng-architecture'],
    },
    {
      id: 'qa-api-tests',
      name: 'API Test Suite',
      laneId: 'qa',
      startDate: '2026-02-05',
      durationDays: 10,
      dependencies: ['qa-plan', 'eng-api'],
    },
    {
      id: 'qa-e2e',
      name: 'End-to-End Testing',
      laneId: 'qa',
      startDate: '2026-03-16',
      durationDays: 10,
      dependencies: ['eng-frontend'],
    },
    {
      id: 'qa-regression',
      name: 'Regression & Load Testing',
      laneId: 'qa',
      startDate: '2026-03-30',
      durationDays: 7,
      dependencies: ['qa-e2e'],
    },
    {
      id: 'qa-signoff',
      name: 'QA Sign-off',
      laneId: 'qa',
      startDate: '2026-04-08',
      durationDays: 3,
      dependencies: ['qa-regression'],
    },

    // ===== Marketing Lane (full campaign) =====
    {
      id: 'mkt-strategy',
      name: 'Go-to-Market Strategy',
      laneId: 'marketing',
      startDate: '2026-01-05',
      durationDays: 8,
      dependencies: [],
    },
    {
      id: 'mkt-content',
      name: 'Content & Copy Creation',
      laneId: 'marketing',
      startDate: '2026-02-03',
      durationDays: 12,
      dependencies: ['mkt-strategy', 'design-review'],
    },
    {
      id: 'mkt-landing',
      name: 'Landing Page & Assets',
      laneId: 'marketing',
      startDate: '2026-02-19',
      durationDays: 8,
      dependencies: ['mkt-content'],
    },
    {
      id: 'mkt-beta',
      name: 'Beta Program & Early Access',
      laneId: 'marketing',
      startDate: '2026-03-16',
      durationDays: 12,
      dependencies: ['mkt-landing', 'eng-frontend'],
    },
    {
      id: 'mkt-launch-campaign',
      name: 'Launch Campaign',
      laneId: 'marketing',
      startDate: '2026-04-13',
      durationDays: 10,
      dependencies: ['mkt-beta', 'qa-signoff'],
    },
  ],
  milestones: [
    { id: 'ms-design-complete', name: 'Design Complete', date: '2026-02-06' },
    { id: 'ms-api-ready', name: 'API Ready', date: '2026-02-05' },
    { id: 'ms-feature-freeze', name: 'Feature Freeze', date: '2026-03-16' },
    { id: 'ms-beta-launch', name: 'Beta Launch', date: '2026-03-16' },
    { id: 'ms-qa-complete', name: 'QA Complete', date: '2026-04-13' },
    { id: 'ms-launch', name: 'Product Launch', date: '2026-04-27' },
  ],
};
