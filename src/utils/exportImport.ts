import { RoadmapData } from '../types';
import { getRoadmapById, getDefaultRoadmapId } from '../data/roadmapRegistry';

const STORAGE_PREFIX = 'roadmap-planner-data';
const ACTIVE_ROADMAP_KEY = 'roadmap-planner-active';

function storageKey(roadmapId: string): string {
  return `${STORAGE_PREFIX}-${roadmapId}`;
}

/**
 * Save roadmap data to localStorage for a specific roadmap.
 */
export function saveToLocalStorage(data: RoadmapData, roadmapId?: string): void {
  const id = roadmapId || getActiveRoadmapId();
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Load roadmap data from localStorage for a specific roadmap.
 */
export function loadFromLocalStorage(roadmapId?: string): RoadmapData | null {
  const id = roadmapId || getActiveRoadmapId();
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as RoadmapData;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
}

/**
 * Clear saved data from localStorage for a specific roadmap.
 */
export function clearLocalStorage(roadmapId?: string): void {
  const id = roadmapId || getActiveRoadmapId();
  localStorage.removeItem(storageKey(id));
}

/**
 * Get/set the active roadmap ID.
 */
export function getActiveRoadmapId(): string {
  return localStorage.getItem(ACTIVE_ROADMAP_KEY) || getDefaultRoadmapId();
}

export function setActiveRoadmapId(id: string): void {
  localStorage.setItem(ACTIVE_ROADMAP_KEY, id);
}

/**
 * Export roadmap data as a downloadable JSON file.
 */
export function exportToJson(data: RoadmapData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `roadmap-${getActiveRoadmapId()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import roadmap data from a JSON file.
 */
export function importFromJson(): Promise<RoadmapData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as RoadmapData;
          if (!data.lanes || !data.tasks || !data.milestones) {
            reject(new Error('Invalid roadmap data format'));
            return;
          }
          resolve(data);
        } catch (err) {
          reject(new Error('Failed to parse JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };
    input.click();
  });
}

/**
 * Get initial data for a specific roadmap:
 * from localStorage if available, otherwise from the default data.
 */
export function getInitialData(roadmapId?: string): RoadmapData {
  const id = roadmapId || getActiveRoadmapId();
  const saved = loadFromLocalStorage(id);
  if (saved) return saved;

  const entry = getRoadmapById(id);
  return entry ? { ...entry.defaultData } : { ...getRoadmapById(getDefaultRoadmapId())!.defaultData };
}
