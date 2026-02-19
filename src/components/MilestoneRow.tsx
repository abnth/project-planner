import React, { useRef, useCallback, useState } from 'react';
import { Milestone } from '../types';
import { dateToX, xToDate } from '../utils/dateUtils';
import { useRoadmapStore } from '../hooks/useRoadmapStore';

interface MilestoneRowProps {
  milestones: Milestone[];
  timelineStart: string;
  dayWidth: number;
  totalWidth: number;
  totalHeight: number;
}

/* ---------- Single draggable milestone ---------- */

const MilestoneLine: React.FC<{
  milestone: Milestone;
  timelineStart: string;
  dayWidth: number;
  totalHeight: number;
}> = ({ milestone, timelineStart, dayWidth, totalHeight }) => {
  const { dispatch } = useRoadmapStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(milestone.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef({ clientX: 0, origDate: '' });
  const didDragRef = useRef(false);

  const x = dateToX(milestone.date, timelineStart, dayWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      didDragRef.current = false;
      dragStartRef.current = { clientX: e.clientX, origDate: milestone.date };

      const origX = dateToX(milestone.date, timelineStart, dayWidth);

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - dragStartRef.current.clientX;
        if (Math.abs(dx) > 2) didDragRef.current = true;
        const newDate = xToDate(origX + dx, timelineStart, dayWidth);
        if (newDate !== milestone.date) {
          dispatch({
            type: 'UPDATE_MILESTONE',
            payload: { ...milestone, date: newDate },
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
    },
    [milestone, timelineStart, dayWidth, dispatch, isEditing],
  );

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditValue(milestone.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [milestone.name]);

  const commitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== milestone.name) {
      dispatch({
        type: 'UPDATE_MILESTONE',
        payload: { ...milestone, name: trimmed },
      });
    }
    setIsEditing(false);
  }, [editValue, milestone, dispatch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setIsEditing(false);
  }, [commitEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'DELETE_MILESTONE', payload: milestone.id });
  }, [milestone.id, dispatch]);

  return (
    <>
      {/* Draggable hit area spanning the full chart height */}
      <div
        className={`absolute top-0 cursor-ew-resize group ${isDragging ? 'z-50' : 'z-30'}`}
        style={{
          left: x - 6,
          width: 12,
          height: totalHeight,
        }}
        onMouseDown={handleMouseDown}
        title={`${milestone.name}\n${milestone.date}\nDrag to move`}
      >
        {/* Visible dashed line (centred in the 12px hit area) */}
        <div
          className={`absolute left-1/2 top-0 h-full -translate-x-1/2 border-l-[1.5px] border-dashed transition-opacity ${
            isDragging
              ? 'border-red-600 opacity-80'
              : 'border-red-500 opacity-50 group-hover:opacity-80'
          }`}
        />
      </div>

      {/* Label + diamond at the bottom */}
      <div
        className={`absolute flex flex-col items-center select-none group/label ${isDragging ? 'z-50' : 'z-30'} ${isEditing ? '' : 'cursor-ew-resize'}`}
        style={{ left: x - 50, top: totalHeight + 4, width: 100 }}
        onMouseDown={isEditing ? undefined : handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={isEditing ? undefined : `${milestone.name}\n${milestone.date}\nDrag to move · Double-click to rename`}
      >
        {/* Diamond marker */}
        <div className="relative">
          <div
            className={`w-3 h-3 bg-red-500 rotate-45 mb-1 transition-transform ${
              isDragging ? 'scale-125' : ''
            }`}
            style={{ flexShrink: 0 }}
          />
          {/* Delete button on hover */}
          <button
            className="absolute -top-1.5 -right-4 w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px] leading-none font-bold opacity-0 group-hover/label:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
            onClick={handleDelete}
            title="Delete milestone"
          >
            &times;
          </button>
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            className="text-[9px] text-gray-800 text-center leading-tight font-medium bg-white border border-blue-400 rounded px-1 py-0.5 w-full outline-none shadow-sm"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="text-[9px] text-gray-600 text-center leading-tight font-medium">
            {milestone.name}
          </span>
        )}
      </div>
    </>
  );
};

/* ---------- Milestone row container ---------- */

export const MilestoneRow: React.FC<MilestoneRowProps> = ({
  milestones,
  timelineStart,
  dayWidth,
  totalWidth,
  totalHeight,
}) => {
  return (
    <>
      {/* Background for the bottom milestone-label strip */}
      <div
        className="absolute left-0 border-t border-gray-300 bg-gray-50 pointer-events-none"
        style={{ top: totalHeight, width: totalWidth, height: 48 }}
      />

      {/* One interactive line + label per milestone */}
      {milestones.map((ms) => (
        <MilestoneLine
          key={ms.id}
          milestone={ms}
          timelineStart={timelineStart}
          dayWidth={dayWidth}
          totalHeight={totalHeight}
        />
      ))}
    </>
  );
};
