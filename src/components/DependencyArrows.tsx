import React from 'react';
import { Task, Lane } from '../types';
import { dateToX, getEndDate } from '../utils/dateUtils';
import { getLaneHeight } from './SwimLane';

interface DependencyArrowsProps {
  tasks: Task[];
  lanes: Lane[];
  timelineStart: string;
  dayWidth: number;
  laneOffsets: Map<string, number>;
  laneTaskIndices: Map<string, number>;
}

const TASK_HEIGHT = 28;
const TASK_GAP = 4;
const ARROW_OFFSET_Y = TASK_HEIGHT / 2;

export const DependencyArrows: React.FC<DependencyArrowsProps> = ({
  tasks,
  lanes,
  timelineStart,
  dayWidth,
  laneOffsets,
  laneTaskIndices,
}) => {
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  const arrows: { fromX: number; fromY: number; toX: number; toY: number }[] = [];

  for (const task of tasks) {
    for (const depId of task.dependencies) {
      const dep = taskMap.get(depId);
      if (!dep) continue;

      // Source: right edge of dependency task
      const depEndDate = getEndDate(dep.startDate, dep.durationDays);
      const fromX = dateToX(depEndDate, timelineStart, dayWidth);
      const depLaneOffset = laneOffsets.get(dep.laneId) || 0;
      const depTaskIndex = laneTaskIndices.get(dep.id) || 0;
      const fromY = depLaneOffset + 8 + depTaskIndex * (TASK_HEIGHT + TASK_GAP) + ARROW_OFFSET_Y;

      // Target: left edge of this task
      const toX = dateToX(task.startDate, timelineStart, dayWidth);
      const taskLaneOffset = laneOffsets.get(task.laneId) || 0;
      const taskIndex = laneTaskIndices.get(task.id) || 0;
      const toY = taskLaneOffset + 8 + taskIndex * (TASK_HEIGHT + TASK_GAP) + ARROW_OFFSET_Y;

      arrows.push({ fromX, fromY, toX, toY });
    }
  }

  return (
    <svg className="absolute top-0 left-0 pointer-events-none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>
      {arrows.map((arrow, i) => {
        const midX = (arrow.fromX + arrow.toX) / 2;
        // Bezier control points for a smooth curve
        const path = `M ${arrow.fromX} ${arrow.fromY} C ${midX} ${arrow.fromY}, ${midX} ${arrow.toY}, ${arrow.toX} ${arrow.toY}`;
        return (
          <path
            key={i}
            d={path}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={1.5}
            markerEnd="url(#arrowhead)"
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
};
