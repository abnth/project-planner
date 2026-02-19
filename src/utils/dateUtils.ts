/**
 * Date utility functions for the roadmap planner.
 * All dates are handled as plain "YYYY-MM-DD" strings and Date objects.
 *
 * IMPORTANT: durationDays throughout this application means WORKING DAYS
 * (Monday-Friday only). Weekend days (Sat/Sun) are skipped when computing
 * end dates and bar widths.
 */

export function isWeekend(dateStr: string): boolean {
  const dow = parseDate(dateStr).getDay();
  return dow === 0 || dow === 6;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function diffDays(a: string, b: string): number {
  const da = parseDate(a);
  const db = parseDate(b);
  return Math.round((da.getTime() - db.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Add working days (Mon-Fri) to a date, skipping weekends.
 * The start date counts as the first working day (if it's a weekday).
 * Returns the EXCLUSIVE end date (first day after the last working day).
 *
 * Example: addWorkingDays('2026-01-05' (Mon), 7)
 *   Day 1: Jan 5 (Mon), Day 2: Jan 6, ..., Day 5: Jan 9 (Fri)
 *   Skip Sat/Sun
 *   Day 6: Jan 12 (Mon), Day 7: Jan 13 (Tue)
 *   Returns: '2026-01-14' (Wed, exclusive end)
 */
export function addWorkingDays(dateStr: string, workingDays: number): string {
  const date = parseDate(dateStr);
  let remaining = workingDays;

  while (remaining > 0) {
    const dow = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    if (dow !== 0 && dow !== 6) {
      // It's a weekday — consume one working day (or a fraction)
      if (remaining >= 1) {
        remaining -= 1;
      } else {
        remaining = 0; // fractional working day consumed
      }
    }
    date.setDate(date.getDate() + 1);
  }

  return formatDate(date);
}

/**
 * Count the number of working days (Mon-Fri) between two dates.
 * startStr is inclusive, endStr is exclusive.
 * Example: workingDaysBetween('2026-01-05', '2026-01-14') = 7
 */
export function workingDaysBetween(startStr: string, endStr: string): number {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    const dow = current.getDay();
    if (dow !== 0 && dow !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Calculate the end date by adding WORKING DAYS to a start date.
 * Returns the exclusive end date (first calendar day after the task finishes).
 * This is used for bar width calculation and dependency arrows.
 */
export function getEndDate(startDate: string, durationDays: number): string {
  return addWorkingDays(startDate, durationDays);
}

/**
 * Get the calendar span (in calendar days) for a task.
 * This is the number of calendar days the bar should span on the timeline.
 */
export function calendarSpan(startDate: string, durationWorkingDays: number): number {
  const endDate = addWorkingDays(startDate, durationWorkingDays);
  return diffDays(endDate, startDate);
}

/**
 * Generate an array of dates between start and end (inclusive of start).
 */
export function dateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  let current = parseDate(startStr);
  const end = parseDate(endStr);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Get the Monday of the week containing the given date.
 */
export function getWeekStart(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  date.setDate(date.getDate() + diff);
  return formatDate(date);
}

/**
 * Get the first day of the month containing the given date.
 */
export function getMonthStart(dateStr: string): string {
  const date = parseDate(dateStr);
  return formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

/**
 * Generate week start dates between two dates.
 */
export function weekStarts(startStr: string, endStr: string): string[] {
  const weeks: string[] = [];
  let current = parseDate(getWeekStart(startStr));
  const end = parseDate(endStr);
  while (current <= end) {
    weeks.push(formatDate(current));
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

/**
 * Generate month start dates between two dates.
 */
export function monthStarts(startStr: string, endStr: string): string[] {
  const months: string[] = [];
  let current = parseDate(getMonthStart(startStr));
  const end = parseDate(endStr);
  while (current <= end) {
    months.push(formatDate(current));
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

/**
 * Format a date for display in the timeline header.
 */
export function formatHeaderDate(dateStr: string, zoom: 'day' | 'week' | 'month'): string {
  const date = parseDate(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (zoom === 'day') {
    return `${date.getDate()} ${months[date.getMonth()]}`;
  } else if (zoom === 'week') {
    return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}`;
  } else {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}

/**
 * Snap a pixel offset to the nearest day boundary.
 */
export function snapToDay(pixelOffset: number, dayWidth: number): number {
  return Math.round(pixelOffset / dayWidth) * dayWidth;
}

/**
 * Convert a date to a pixel X position relative to the timeline start.
 */
export function dateToX(dateStr: string, timelineStart: string, dayWidth: number): number {
  return diffDays(dateStr, timelineStart) * dayWidth;
}

/**
 * Convert a pixel X position to a date string.
 */
export function xToDate(x: number, timelineStart: string, dayWidth: number): string {
  const days = Math.round(x / dayWidth);
  return addDays(timelineStart, days);
}
