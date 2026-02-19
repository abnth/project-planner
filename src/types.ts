export interface Task {
  id: string;
  name: string;
  laneId: string;
  startDate: string;       // ISO date string "YYYY-MM-DD"
  durationDays: number;    // working days (Mon-Fri only, weekends skipped)
  dependencies: string[];  // task IDs this depends on (finish-to-start)
  color?: string;          // override lane color
  sortOrder?: number;      // position within lane (0 = top row); auto-assigned if missing
}

export interface Lane {
  id: string;
  name: string;
  color: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;            // ISO date string "YYYY-MM-DD"
}

export interface RoadmapData {
  lanes: Lane[];
  tasks: Task[];
  milestones: Milestone[];
  viewStart: string;
  viewEnd: string;
}

export type ZoomLevel = 'day' | 'week' | 'month';

export interface ViewState {
  zoom: ZoomLevel;
  scrollLeft: number;
}
