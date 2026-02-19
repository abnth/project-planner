import { RoadmapData } from '../types';
import { initialData } from './initialData';
import { checkpoint1Data } from './checkpoint1Data';
import { mergedData } from './mergedData';

export interface RoadmapEntry {
  id: string;
  name: string;
  description: string;
  defaultData: RoadmapData;
}

export const roadmapRegistry: RoadmapEntry[] = [
  {
    id: 'original',
    name: 'Product Launch',
    description: 'Full product launch roadmap across Design, Engineering, QA, and Marketing',
    defaultData: initialData,
  },
  {
    id: 'checkpoint-1',
    name: 'Accelerated Launch',
    description: 'Compressed timeline with parallel work streams and reduced scope',
    defaultData: checkpoint1Data,
  },
  {
    id: 'merged',
    name: 'Consolidated Plan',
    description: 'Merged view: accelerated early phases with full feature coverage',
    defaultData: mergedData,
  },
];

export function getRoadmapById(id: string): RoadmapEntry | undefined {
  return roadmapRegistry.find(r => r.id === id);
}

export function getDefaultRoadmapId(): string {
  return 'original';
}
