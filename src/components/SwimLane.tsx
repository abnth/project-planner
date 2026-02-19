import React from 'react';
import { Task, Lane } from '../types';
import { TaskBar } from './TaskBar';

interface SwimLaneProps {
  lane: Lane;
  tasks: Task[];
  timelineStart: string;
  dayWidth: number;
  yOffset: number;
  totalWidth: number;
}

const TASK_HEIGHT = 28;
const TASK_GAP = 4;
const LANE_PADDING = 16;
const MIN_LANE_HEIGHT = 60;

export function getLaneHeight(taskCount: number): number {
  if (taskCount === 0) return MIN_LANE_HEIGHT;
  return Math.max(MIN_LANE_HEIGHT, taskCount * (TASK_HEIGHT + TASK_GAP) + LANE_PADDING);
}

export const SwimLane: React.FC<SwimLaneProps> = ({
  lane,
  tasks,
  timelineStart,
  dayWidth,
  yOffset,
  totalWidth,
}) => {
  const height = getLaneHeight(tasks.length);

  return (
    <div
      className="absolute left-0 border-b border-gray-200"
      style={{
        top: yOffset,
        width: totalWidth,
        height,
      }}
    >
      {/* Background stripe */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundColor: lane.color }}
      />

      {/* Task bars */}
      {tasks.map((task, index) => (
        <TaskBar
          key={task.id}
          task={task}
          lane={lane}
          timelineStart={timelineStart}
          dayWidth={dayWidth}
          rowY={0}
          rowHeight={height}
          taskIndex={index}
          taskCount={tasks.length}
        />
      ))}
    </div>
  );
};
