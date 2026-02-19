import { RoadmapData } from '../types';

/**
 * Sample Roadmap: Product Launch
 * All durationDays values are WORKING DAYS (Mon-Fri).
 */
export const initialData: RoadmapData = {
  viewStart: '2026-01-05',
  viewEnd: '2026-07-31',
  lanes: [
    { id: 'design', name: 'Design', color: '#8B5CF6' },
    { id: 'engineering', name: 'Engineering', color: '#2563EB' },
    { id: 'qa', name: 'QA', color: '#DC2626' },
    { id: 'marketing', name: 'Marketing', color: '#059669' },
  ],
  tasks: [
    // ===== Design Lane =====
    {
      id: 'design-research',
      name: 'User Research & Personas',
      laneId: 'design',
      startDate: '2026-01-05',
      durationDays: 10,
      dependencies: [],
    },
    {
      id: 'design-wireframes',
      name: 'Wireframes & Prototypes',
      laneId: 'design',
      startDate: '2026-01-19',
      durationDays: 12,
      dependencies: ['design-research'],
    },
    {
      id: 'design-ui-kit',
      name: 'UI Kit & Design System',
      laneId: 'design',
      startDate: '2026-02-04',
      durationDays: 8,
      dependencies: ['design-wireframes'],
    },
    {
      id: 'design-review',
      name: 'Design Review & Sign-off',
      laneId: 'design',
      startDate: '2026-02-16',
      durationDays: 3,
      dependencies: ['design-ui-kit'],
    },

    // ===== Engineering Lane =====
    {
      id: 'eng-architecture',
      name: 'Architecture & Tech Design',
      laneId: 'engineering',
      startDate: '2026-01-12',
      durationDays: 8,
      dependencies: [],
    },
    {
      id: 'eng-api',
      name: 'API Development',
      laneId: 'engineering',
      startDate: '2026-01-26',
      durationDays: 20,
      dependencies: ['eng-architecture'],
    },
    {
      id: 'eng-frontend',
      name: 'Frontend Implementation',
      laneId: 'engineering',
      startDate: '2026-02-19',
      durationDays: 25,
      dependencies: ['design-review', 'eng-api'],
    },
    {
      id: 'eng-integrations',
      name: 'Third-Party Integrations',
      laneId: 'engineering',
      startDate: '2026-03-02',
      durationDays: 10,
      dependencies: ['eng-api'],
    },
    {
      id: 'eng-perf',
      name: 'Performance Optimization',
      laneId: 'engineering',
      startDate: '2026-04-06',
      durationDays: 8,
      dependencies: ['eng-frontend'],
    },
    {
      id: 'eng-deploy-infra',
      name: 'Deployment & Infrastructure',
      laneId: 'engineering',
      startDate: '2026-04-16',
      durationDays: 7,
      dependencies: ['eng-perf'],
    },

    // ===== QA Lane =====
    {
      id: 'qa-plan',
      name: 'Test Strategy & Planning',
      laneId: 'qa',
      startDate: '2026-01-26',
      durationDays: 5,
      dependencies: ['eng-architecture'],
    },
    {
      id: 'qa-api-tests',
      name: 'API Test Suite',
      laneId: 'qa',
      startDate: '2026-02-23',
      durationDays: 10,
      dependencies: ['qa-plan', 'eng-api'],
    },
    {
      id: 'qa-e2e',
      name: 'End-to-End Testing',
      laneId: 'qa',
      startDate: '2026-04-06',
      durationDays: 12,
      dependencies: ['eng-frontend'],
    },
    {
      id: 'qa-regression',
      name: 'Regression & Load Testing',
      laneId: 'qa',
      startDate: '2026-04-22',
      durationDays: 7,
      dependencies: ['qa-e2e'],
    },
    {
      id: 'qa-signoff',
      name: 'QA Sign-off',
      laneId: 'qa',
      startDate: '2026-05-01',
      durationDays: 3,
      dependencies: ['qa-regression'],
    },

    // ===== Marketing Lane =====
    {
      id: 'mkt-strategy',
      name: 'Go-to-Market Strategy',
      laneId: 'marketing',
      startDate: '2026-01-12',
      durationDays: 10,
      dependencies: [],
    },
    {
      id: 'mkt-content',
      name: 'Content & Copy Creation',
      laneId: 'marketing',
      startDate: '2026-02-16',
      durationDays: 15,
      dependencies: ['mkt-strategy', 'design-review'],
    },
    {
      id: 'mkt-landing',
      name: 'Landing Page & Assets',
      laneId: 'marketing',
      startDate: '2026-03-09',
      durationDays: 10,
      dependencies: ['mkt-content'],
    },
    {
      id: 'mkt-beta',
      name: 'Beta Program & Early Access',
      laneId: 'marketing',
      startDate: '2026-04-06',
      durationDays: 15,
      dependencies: ['mkt-landing', 'eng-frontend'],
    },
    {
      id: 'mkt-launch-campaign',
      name: 'Launch Campaign',
      laneId: 'marketing',
      startDate: '2026-05-04',
      durationDays: 10,
      dependencies: ['mkt-beta', 'qa-signoff'],
    },
  ],
  milestones: [
    { id: 'ms-design-complete', name: 'Design Complete', date: '2026-02-19' },
    { id: 'ms-api-ready', name: 'API Ready', date: '2026-02-23' },
    { id: 'ms-feature-freeze', name: 'Feature Freeze', date: '2026-04-06' },
    { id: 'ms-beta-launch', name: 'Beta Launch', date: '2026-04-06' },
    { id: 'ms-qa-complete', name: 'QA Complete', date: '2026-05-06' },
    { id: 'ms-launch', name: 'Product Launch', date: '2026-05-18' },
  ],
};
