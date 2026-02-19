import React from 'react';
import { ZoomLevel } from '../types';
import { weekStarts, monthStarts, dateRange, formatHeaderDate, dateToX, diffDays, isWeekend } from '../utils/dateUtils';

interface TimelineHeaderProps {
  viewStart: string;
  viewEnd: string;
  dayWidth: number;
  zoom: ZoomLevel;
  totalWidth: number;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  viewStart,
  viewEnd,
  dayWidth,
  zoom,
  totalWidth,
}) => {
  let ticks: { date: string; label: string; x: number; width: number; weekend?: boolean }[] = [];

  if (zoom === 'day') {
    const days = dateRange(viewStart, viewEnd);
    ticks = days.map((d, i) => ({
      date: d,
      label: formatHeaderDate(d, 'day'),
      x: i * dayWidth,
      width: dayWidth,
      weekend: isWeekend(d),
    }));
  } else if (zoom === 'week') {
    const weeks = weekStarts(viewStart, viewEnd);
    ticks = weeks.map(w => ({
      date: w,
      label: formatHeaderDate(w, 'week'),
      x: dateToX(w, viewStart, dayWidth),
      width: 7 * dayWidth,
    }));
  } else {
    const months = monthStarts(viewStart, viewEnd);
    ticks = months.map((m, i) => {
      const nextMonth = i < months.length - 1 ? months[i + 1] : viewEnd;
      const days = diffDays(nextMonth, m);
      return {
        date: m,
        label: formatHeaderDate(m, 'month'),
        x: dateToX(m, viewStart, dayWidth),
        width: days * dayWidth,
      };
    });
  }

  // Month grouping for the top row
  const monthGroups: { label: string; x: number; width: number }[] = [];
  const months = monthStarts(viewStart, viewEnd);
  for (let i = 0; i < months.length; i++) {
    const nextMonth = i < months.length - 1 ? months[i + 1] : viewEnd;
    const days = diffDays(nextMonth, months[i]);
    const d = new Date(months[i] + 'T00:00:00');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthGroups.push({
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      x: dateToX(months[i], viewStart, dayWidth),
      width: days * dayWidth,
    });
  }

  // In month zoom, skip the bottom tick row since it would duplicate the top row
  const showTickRow = zoom !== 'month';

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-300" style={{ width: totalWidth }}>
      {/* Month row */}
      <div className="relative h-7 border-b border-gray-200" style={{ width: totalWidth }}>
        {monthGroups.map((mg, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center text-xs font-semibold text-gray-700 border-r border-gray-200 bg-gray-50"
            style={{
              left: mg.x,
              width: mg.width,
              height: 28,
            }}
          >
            {mg.label}
          </div>
        ))}
      </div>
      {/* Tick row (hidden in month zoom) */}
      {showTickRow && (
        <div className="relative h-6" style={{ width: totalWidth }}>
          {ticks.map((tick, i) => (
            <div
              key={i}
              className={`absolute flex items-center justify-center text-[10px] border-r border-gray-100 ${
                tick.weekend
                  ? 'bg-gray-100 text-gray-400 font-normal'
                  : 'text-gray-500'
              }`}
              style={{
                left: tick.x,
                width: tick.width,
                height: 24,
              }}
            >
              {tick.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
