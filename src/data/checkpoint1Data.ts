import { RoadmapData } from '../types';

/**
 * Accelerated Launch Roadmap
 * Compressed timeline with overlapping phases and reduced scope.
 * All durationDays values are WORKING DAYS (Mon-Fri).
 */
export const checkpoint1Data: RoadmapData = {
  viewStart: '2026-01-05',
  viewEnd: '2026-05-31',
  lanes: [
    { id: 'design', name: 'Design', color: '#8B5CF6' },
    { id: 'engineering', name: 'Engineering', color: '#2563EB' },
    { id: 'qa', name: 'QA', color: '#DC2626' },
    { id: 'marketing', name: 'Marketing', color: '#059669' },
  ],
  tasks: [
    // ===== Design Lane (compressed) =====
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
      name: 'Core UI Components',
      laneId: 'design',
      startDate: '2026-01-22',
      durationDays: 5,
      dependencies: ['design-wireframes'],
    },

    // ===== Engineering Lane (accelerated, parallel work) =====
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
      name: 'Core API Development',
      laneId: 'engineering',
      startDate: '2026-01-12',
      durationDays: 15,
      dependencies: ['eng-architecture'],
    },
    {
      id: 'eng-frontend',
      name: 'Frontend MVP',
      laneId: 'engineering',
      startDate: '2026-01-29',
      durationDays: 20,
      dependencies: ['design-ui-kit', 'eng-api'],
    },
    {
      id: 'eng-perf',
      name: 'Performance & Polish',
      laneId: 'engineering',
      startDate: '2026-02-26',
      durationDays: 5,
      dependencies: ['eng-frontend'],
    },
    {
      id: 'eng-deploy-infra',
      name: 'Deployment Setup',
      laneId: 'engineering',
      startDate: '2026-03-05',
      durationDays: 5,
      dependencies: ['eng-perf'],
    },

    // ===== QA Lane (streamlined) =====
    {
      id: 'qa-plan',
      name: 'Test Planning',
      laneId: 'qa',
      startDate: '2026-01-12',
      durationDays: 3,
      dependencies: ['eng-architecture'],
    },
    {
      id: 'qa-api-tests',
      name: 'API Tests',
      laneId: 'qa',
      startDate: '2026-02-02',
      durationDays: 7,
      dependencies: ['eng-api'],
    },
    {
      id: 'qa-e2e',
      name: 'E2E Testing',
      laneId: 'qa',
      startDate: '2026-02-26',
      durationDays: 8,
      dependencies: ['eng-frontend'],
    },
    {
      id: 'qa-signoff',
      name: 'QA Sign-off',
      laneId: 'qa',
      startDate: '2026-03-10',
      durationDays: 2,
      dependencies: ['qa-e2e'],
    },

    // ===== Marketing Lane (lean) =====
    {
      id: 'mkt-strategy',
      name: 'Launch Strategy',
      laneId: 'marketing',
      startDate: '2026-01-05',
      durationDays: 5,
      dependencies: [],
    },
    {
      id: 'mkt-content',
      name: 'Content Creation',
      laneId: 'marketing',
      startDate: '2026-01-29',
      durationDays: 10,
      dependencies: ['mkt-strategy', 'design-ui-kit'],
    },
    {
      id: 'mkt-launch-campaign',
      name: 'Launch Campaign',
      laneId: 'marketing',
      startDate: '2026-03-12',
      durationDays: 7,
      dependencies: ['mkt-content', 'qa-signoff'],
    },
  ],
  milestones: [
    { id: 'ms-design-complete', name: 'Design Complete', date: '2026-01-29' },
    { id: 'ms-mvp-ready', name: 'MVP Ready', date: '2026-02-26' },
    { id: 'ms-qa-complete', name: 'QA Complete', date: '2026-03-12' },
    { id: 'ms-launch', name: 'Product Launch', date: '2026-03-23' },
  ],
};
