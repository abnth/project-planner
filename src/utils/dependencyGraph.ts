import { Task } from '../types';
import { addDays, diffDays, getEndDate } from './dateUtils';

/**
 * Build an adjacency list mapping task ID -> IDs of tasks that depend on it.
 */
export function buildDependentsMap(tasks: Task[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const task of tasks) {
    if (!map.has(task.id)) {
      map.set(task.id, []);
    }
    for (const depId of task.dependencies) {
      if (!map.has(depId)) {
        map.set(depId, []);
      }
      map.get(depId)!.push(task.id);
    }
  }
  return map;
}

/**
 * Topological sort of tasks based on dependencies.
 * Returns task IDs in dependency order.
 */
export function topologicalSort(tasks: Task[]): string[] {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const task = taskMap.get(id);
    if (task) {
      for (const depId of task.dependencies) {
        visit(depId);
      }
    }
    result.push(id);
  }

  for (const task of tasks) {
    visit(task.id);
  }
  return result;
}

/**
 * When a task is moved or resized, cascade-shift all downstream dependents.
 * Returns a new array of tasks with updated start dates.
 *
 * Logic: For each dependent task, its start date must be >= end date of all its dependencies.
 * If a dependency's end date has moved later, shift the dependent forward.
 * If it moved earlier, only shift backward if the task was "pinned" to the old end date
 * (i.e., the gap was 0).
 */
export function cascadeShift(
  tasks: Task[],
  movedTaskId: string,
  newStartDate: string,
  newDuration?: number
): Task[] {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]));
  const movedTask = taskMap.get(movedTaskId);
  if (!movedTask) return tasks;

  // Before the move: identify tasks "pinned" to their dependency end (zero gap).
  // Pinned tasks follow their dependencies in both directions.
  const pinnedTasks = new Set<string>();
  for (const [taskId, task] of taskMap) {
    if (task.dependencies.length === 0) continue;
    let latestDepEnd = '1970-01-01';
    for (const depId of task.dependencies) {
      const dep = taskMap.get(depId);
      if (dep) {
        const depEnd = getEndDate(dep.startDate, dep.durationDays);
        if (depEnd > latestDepEnd) latestDepEnd = depEnd;
      }
    }
    if (task.startDate === latestDepEnd) {
      pinnedTasks.add(taskId);
    }
  }

  // Apply the move
  movedTask.startDate = newStartDate;
  if (newDuration !== undefined) {
    movedTask.durationDays = newDuration;
  }
  taskMap.set(movedTaskId, movedTask);

  const sorted = topologicalSort(tasks);

  for (const taskId of sorted) {
    const task = taskMap.get(taskId)!;
    if (task.dependencies.length === 0) continue;
    if (taskId === movedTaskId) continue;

    let earliestStart = '1970-01-01';
    for (const depId of task.dependencies) {
      const dep = taskMap.get(depId);
      if (dep) {
        const depEnd = getEndDate(dep.startDate, dep.durationDays);
        if (depEnd > earliestStart) {
          earliestStart = depEnd;
        }
      }
    }

    // Push forward if the task starts before its earliest possible start
    if (task.startDate < earliestStart) {
      task.startDate = earliestStart;
      taskMap.set(taskId, task);
    } else if (pinnedTasks.has(taskId) && task.startDate > earliestStart) {
      // Pull back pinned tasks when their dependency moved earlier
      task.startDate = earliestStart;
      taskMap.set(taskId, task);
    }
  }

  return Array.from(taskMap.values());
}

/**
 * Enforce all dependency constraints across the entire task set.
 * Topological-sort the tasks, then push each task forward so it starts
 * no earlier than the latest end date of its dependencies.
 */
export function enforceDependencyConstraints(tasks: Task[]): Task[] {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]));
  const sorted = topologicalSort(tasks);

  for (const taskId of sorted) {
    const task = taskMap.get(taskId)!;
    if (task.dependencies.length === 0) continue;

    let earliestStart = '1970-01-01';
    for (const depId of task.dependencies) {
      const dep = taskMap.get(depId);
      if (dep) {
        const depEnd = getEndDate(dep.startDate, dep.durationDays);
        if (depEnd > earliestStart) {
          earliestStart = depEnd;
        }
      }
    }

    if (task.startDate < earliestStart) {
      task.startDate = earliestStart;
      taskMap.set(taskId, task);
    }
  }

  return Array.from(taskMap.values());
}

/**
 * Normalize sortOrder for all tasks.
 * Groups tasks by lane, sorts each group by existing sortOrder (falling back
 * to array position for tasks without one), then assigns clean sequential
 * sortOrders 0, 1, 2, ... within each lane.
 */
export function normalizeSortOrder(tasks: Task[]): Task[] {
  const laneGroups = new Map<string, { task: Task; arrayIdx: number }[]>();
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (!laneGroups.has(t.laneId)) {
      laneGroups.set(t.laneId, []);
    }
    laneGroups.get(t.laneId)!.push({ task: t, arrayIdx: laneGroups.get(t.laneId)!.length });
  }

  const orderMap = new Map<string, number>();
  for (const [, items] of laneGroups) {
    items.sort((a, b) => (a.task.sortOrder ?? a.arrayIdx) - (b.task.sortOrder ?? b.arrayIdx));
    items.forEach(({ task }, newOrder) => {
      orderMap.set(task.id, newOrder);
    });
  }

  return tasks.map(t => ({ ...t, sortOrder: orderMap.get(t.id) ?? 0 }));
}

/**
 * Check for circular dependencies.
 * Returns true if adding a dependency from sourceId -> targetId would create a cycle.
 */
export function wouldCreateCycle(
  tasks: Task[],
  sourceId: string,
  targetId: string
): boolean {
  // sourceId depends on targetId (targetId must finish before sourceId starts)
  // Check if targetId already (transitively) depends on sourceId
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const visited = new Set<string>();

  function hasPath(from: string, to: string): boolean {
    if (from === to) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    const task = taskMap.get(from);
    if (!task) return false;
    for (const depId of task.dependencies) {
      if (hasPath(depId, to)) return true;
    }
    return false;
  }

  // If targetId can reach sourceId through dependencies, adding sourceId->targetId creates a cycle
  return hasPath(targetId, sourceId);
}
