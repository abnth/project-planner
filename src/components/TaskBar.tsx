import React, { useRef, useCallback, useState } from 'react';
import { Task, Lane } from '../types';
import { dateToX, getEndDate, calendarSpan, addDays, workingDaysBetween } from '../utils/dateUtils';
import { useRoadmapStore } from '../hooks/useRoadmapStore';

interface TaskBarProps {
  task: Task;
  lane: Lane;
  timelineStart: string;
  dayWidth: number;
  rowY: number;
  rowHeight: number;
  taskIndex: number;
  taskCount: number;
}

const TASK_HEIGHT = 28;
const TASK_GAP = 4;

export const TaskBar: React.FC<TaskBarProps> = ({
  task,
  lane,
  timelineStart,
  dayWidth,
  rowY,
  rowHeight,
  taskIndex,
  taskCount,
}) => {
  const { state, dispatch } = useRoadmapStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, startDate: '', duration: 0 });

  const x = dateToX(task.startDate, timelineStart, dayWidth);
  const calDays = calendarSpan(task.startDate, task.durationDays);
  const width = calDays * dayWidth;
  const color = task.color || lane.color;
  const isSelected = state.selectedTaskId === task.id;

  const taskY = rowY + 8 + taskIndex * (TASK_HEIGHT + TASK_GAP);

  // --- Drag to move (horizontal only, real-time dispatch so arrows follow) ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    hasDraggedRef.current = false;

    const startX = e.clientX;
    const origStartDate = task.startDate;

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 3) {
        hasDraggedRef.current = true;
      }

      const daysDelta = Math.round(dx / dayWidth);
      if (daysDelta !== 0 && hasDraggedRef.current) {
        const newStart = new Date(
          new Date(origStartDate + 'T00:00:00').getTime() + daysDelta * 86400000
        );
        const yr = newStart.getFullYear();
        const mo = String(newStart.getMonth() + 1).padStart(2, '0');
        const da = String(newStart.getDate()).padStart(2, '0');
        dispatch({
          type: 'MOVE_TASK',
          payload: { taskId: task.id, newStartDate: `${yr}-${mo}-${da}` },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [task.id, task.startDate, dayWidth, dispatch]);

  // --- Drag to resize ---
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    hasDraggedRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      startDate: task.startDate,
      duration: task.durationDays,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragStartRef.current.x;
      const calendarDaysDelta = Math.round(dx / dayWidth);
      const currentEndDate = getEndDate(dragStartRef.current.startDate, dragStartRef.current.duration);
      const newEndDate = addDays(currentEndDate, calendarDaysDelta);
      const newDuration = Math.max(1, workingDaysBetween(dragStartRef.current.startDate, newEndDate));
      dispatch({
        type: 'RESIZE_TASK',
        payload: { taskId: task.id, newDuration },
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [task.id, task.startDate, task.durationDays, dayWidth, dispatch]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    dispatch({ type: 'SELECT_TASK', payload: task.id });
  }, [task.id, dispatch]);

  const handleReorder = useCallback((direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch({ type: 'REORDER_TASK', payload: { taskId: task.id, direction } });
  }, [task.id, dispatch]);

  const canMoveUp = taskIndex > 0;
  const canMoveDown = taskIndex < taskCount - 1;

  return (
    <div
      className={`group absolute flex items-center rounded shadow-sm cursor-grab select-none transition-shadow ${
        isDragging ? 'cursor-grabbing shadow-lg z-50 opacity-90' : ''
      } ${isResizing ? 'z-50' : ''} ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
      style={{
        left: x,
        top: taskY,
        width: Math.max(width, dayWidth),
        height: TASK_HEIGHT,
        backgroundColor: color,
        zIndex: isDragging || isResizing ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      title={`${task.name}\n${task.durationDays}d: ${task.startDate} → ${getEndDate(task.startDate, task.durationDays)}`}
    >
      {/* Reorder buttons (inside bar, visible on hover) */}
      {(canMoveUp || canMoveDown) && (
        <div className="absolute left-0.5 top-0 bottom-0 flex flex-col justify-center gap-px opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {canMoveUp && (
            <button
              className="w-4 h-3 flex items-center justify-center bg-black/30 hover:bg-black/60 text-white rounded-sm text-[8px] leading-none"
              onClick={(e) => handleReorder('up', e)}
              onMouseDown={(e) => e.stopPropagation()}
              title="Move up in lane"
            >
              ▲
            </button>
          )}
          {canMoveDown && (
            <button
              className="w-4 h-3 flex items-center justify-center bg-black/30 hover:bg-black/60 text-white rounded-sm text-[8px] leading-none"
              onClick={(e) => handleReorder('down', e)}
              onMouseDown={(e) => e.stopPropagation()}
              title="Move down in lane"
            >
              ▼
            </button>
          )}
        </div>
      )}

      <span
        className="text-white text-xs font-medium px-2 truncate pointer-events-none"
        style={{ maxWidth: width - 12, marginLeft: (canMoveUp || canMoveDown) ? 16 : 0 }}
      >
        {task.durationDays}d {task.name}
      </span>

      {/* Resize handle on right edge */}
      <div
        className="resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 rounded-r"
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
};
