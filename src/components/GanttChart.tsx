import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import { useRoadmapStore } from '../hooks/useRoadmapStore';
import { TimelineHeader } from './TimelineHeader';
import { SwimLane, getLaneHeight } from './SwimLane';
import { MilestoneRow } from './MilestoneRow';
import { DependencyArrows } from './DependencyArrows';
import { diffDays, parseDate } from '../utils/dateUtils';

const LANE_LABEL_WIDTH = 150;

export const GanttChart: React.FC = () => {
  const { state, dispatch } = useRoadmapStore();
  const { data, zoom } = state;
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Calculate day width based on zoom
  const dayWidth = zoom === 'day' ? 40 : zoom === 'week' ? 16 : 5;

  const totalDays = diffDays(data.viewEnd, data.viewStart);
  const totalWidth = totalDays * dayWidth;

  // Header height depends on zoom
  const headerHeight = zoom === 'month' ? 28 : 52;

  // Group tasks by lane, sorted by startDate then sortOrder within each lane
  const tasksByLane = useMemo(() => {
    const map = new Map<string, typeof data.tasks>();
    for (const lane of data.lanes) {
      map.set(lane.id, []);
    }
    for (const task of data.tasks) {
      const arr = map.get(task.laneId);
      if (arr) arr.push(task);
    }
    for (const [, laneTasks] of map) {
      laneTasks.sort((a, b) => {
        if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      });
    }
    return map;
  }, [data.lanes, data.tasks]);

  // Calculate lane Y offsets
  const { laneOffsets, totalLanesHeight } = useMemo(() => {
    const offsets = new Map<string, number>();
    let y = 0;
    for (const lane of data.lanes) {
      offsets.set(lane.id, y);
      const tasks = tasksByLane.get(lane.id) || [];
      y += getLaneHeight(tasks.length);
    }
    return { laneOffsets: offsets, totalLanesHeight: y };
  }, [data.lanes, tasksByLane]);

  // Build task index map for arrow positioning
  const laneTaskIndices = useMemo(() => {
    const map = new Map<string, number>();
    for (const lane of data.lanes) {
      const tasks = tasksByLane.get(lane.id) || [];
      tasks.forEach((t, i) => map.set(t.id, i));
    }
    return map;
  }, [data.lanes, tasksByLane]);

  // Sync vertical scroll between sidebar and chart
  const handleChartScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (chartScrollRef.current && sidebarScrollRef.current) {
      sidebarScrollRef.current.scrollTop = chartScrollRef.current.scrollTop;
    }
    requestAnimationFrame(() => { isSyncingRef.current = false; });
  }, []);

  const handleSidebarScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (chartScrollRef.current && sidebarScrollRef.current) {
      chartScrollRef.current.scrollTop = sidebarScrollRef.current.scrollTop;
    }
    requestAnimationFrame(() => { isSyncingRef.current = false; });
  }, []);

  useEffect(() => {
    const chart = chartScrollRef.current;
    const sidebar = sidebarScrollRef.current;
    if (chart) chart.addEventListener('scroll', handleChartScroll);
    if (sidebar) sidebar.addEventListener('scroll', handleSidebarScroll);
    return () => {
      if (chart) chart.removeEventListener('scroll', handleChartScroll);
      if (sidebar) sidebar.removeEventListener('scroll', handleSidebarScroll);
    };
  }, [handleChartScroll, handleSidebarScroll]);

  // Click on empty space to deselect
  const handleBackgroundClick = useCallback(() => {
    dispatch({ type: 'SELECT_TASK', payload: null });
  }, [dispatch]);

  // Today line
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayX = diffDays(todayStr, data.viewStart) * dayWidth;
  const showToday = todayX >= 0 && todayX <= totalWidth;

  return (
    <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Lane labels sidebar */}
      <div
        className="flex-shrink-0 border-r border-gray-300 bg-gray-50 flex flex-col"
        style={{ width: LANE_LABEL_WIDTH }}
      >
        {/* Header spacer - matches timeline header height */}
        <div
          className="border-b border-gray-300 flex items-center px-3 flex-shrink-0"
          style={{ height: headerHeight }}
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lanes</span>
        </div>
        {/* Scrollable lane labels */}
        <div
          ref={sidebarScrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          <div style={{ minHeight: totalLanesHeight + 48 }}>
            {data.lanes.map(lane => {
              const tasks = tasksByLane.get(lane.id) || [];
              const height = getLaneHeight(tasks.length);
              return (
                <div
                  key={lane.id}
                  className="flex items-start px-3 py-2 border-b border-gray-200"
                  style={{ height }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: lane.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 leading-tight">
                      {lane.name}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* Milestone label */}
            <div className="h-[48px] border-t border-gray-300 flex items-center px-3">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Milestones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline area */}
      <div
        ref={chartScrollRef}
        className="flex-1 overflow-auto relative"
        onClick={handleBackgroundClick}
      >
        {/* Timeline header */}
        <TimelineHeader
          viewStart={data.viewStart}
          viewEnd={data.viewEnd}
          dayWidth={dayWidth}
          zoom={zoom}
          totalWidth={totalWidth}
        />

        {/* Chart body */}
        <div className="relative" style={{ width: totalWidth, height: totalLanesHeight + 48 }}>
          {/* Weekend shading + grid lines */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            style={{ width: totalWidth, height: totalLanesHeight }}
          >
            {/* Weekend column stripes */}
            {Array.from({ length: totalDays }, (_, i) => {
              const d = parseDate(data.viewStart);
              d.setDate(d.getDate() + i);
              const dow = d.getDay();
              if (dow === 0 || dow === 6) {
                return (
                  <rect
                    key={`we-${i}`}
                    x={i * dayWidth}
                    y={0}
                    width={dayWidth}
                    height={totalLanesHeight}
                    fill="#f3f4f6"
                    opacity={0.7}
                  />
                );
              }
              return null;
            })}
            {/* Week lines */}
            {Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => {
              const x = i * 7 * dayWidth;
              return (
                <line
                  key={i}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={totalLanesHeight}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              );
            })}
          </svg>

          {/* Today line */}
          {showToday && (
            <div
              className="absolute top-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
              style={{ left: todayX, height: totalLanesHeight }}
            >
              <div className="absolute -top-1 -left-[9px] bg-blue-500 text-white text-[9px] px-1 rounded">
                Today
              </div>
            </div>
          )}

          {/* Swim lanes */}
          {data.lanes.map(lane => {
            const tasks = tasksByLane.get(lane.id) || [];
            const yOffset = laneOffsets.get(lane.id) || 0;
            return (
              <SwimLane
                key={lane.id}
                lane={lane}
                tasks={tasks}
                timelineStart={data.viewStart}
                dayWidth={dayWidth}
                yOffset={yOffset}
                totalWidth={totalWidth}
              />
            );
          })}

          {/* Dependency arrows */}
          <DependencyArrows
            tasks={data.tasks}
            lanes={data.lanes}
            timelineStart={data.viewStart}
            dayWidth={dayWidth}
            laneOffsets={laneOffsets}
            laneTaskIndices={laneTaskIndices}
          />

          {/* Milestones */}
          <MilestoneRow
            milestones={data.milestones}
            timelineStart={data.viewStart}
            dayWidth={dayWidth}
            totalWidth={totalWidth}
            totalHeight={totalLanesHeight}
          />
        </div>
      </div>
    </div>
  );
};
