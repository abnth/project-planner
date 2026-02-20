import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Task, Lane, Milestone, RoadmapData, ZoomLevel } from '../types';
import { cascadeShift, enforceDependencyConstraints, normalizeSortOrder } from '../utils/dependencyGraph';
import { saveToLocalStorage, getInitialData, getActiveRoadmapId, setActiveRoadmapId, decodeRoadmapFromUrl, clearShareHash } from '../utils/exportImport';

// ---- State ----

export interface RoadmapState {
  data: RoadmapData;
  zoom: ZoomLevel;
  selectedTaskId: string | null;
  showJsonEditor: boolean;
  activeRoadmapId: string;
}

// ---- Actions ----

export type RoadmapAction =
  | { type: 'SET_DATA'; payload: RoadmapData }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStartDate: string } }
  | { type: 'RESIZE_TASK'; payload: { taskId: string; newDuration: number } }
  | { type: 'ADD_LANE'; payload: Lane }
  | { type: 'UPDATE_LANE'; payload: Lane }
  | { type: 'DELETE_LANE'; payload: string }
  | { type: 'ADD_MILESTONE'; payload: Milestone }
  | { type: 'UPDATE_MILESTONE'; payload: Milestone }
  | { type: 'DELETE_MILESTONE'; payload: string }
  | { type: 'SET_ZOOM'; payload: ZoomLevel }
  | { type: 'SELECT_TASK'; payload: string | null }
  | { type: 'TOGGLE_JSON_EDITOR' }
  | { type: 'SET_VIEW_RANGE'; payload: { viewStart: string; viewEnd: string } }
  | { type: 'REORDER_TASK'; payload: { taskId: string; direction: 'up' | 'down' } }
  | { type: 'SWITCH_ROADMAP'; payload: { roadmapId: string; data: RoadmapData } };

// ---- Reducer ----

function roadmapReducer(state: RoadmapState, action: RoadmapAction): RoadmapState {
  switch (action.type) {
    case 'SET_DATA': {
      const normalized = normalizeSortOrder(action.payload.tasks);
      const enforcedTasks = enforceDependencyConstraints(normalized);
      return { ...state, data: { ...action.payload, tasks: enforcedTasks } };
    }

    case 'ADD_TASK': {
      let newTask = action.payload;
      if (newTask.sortOrder === undefined) {
        const maxOrder = state.data.tasks
          .filter(t => t.laneId === newTask.laneId)
          .reduce((max, t) => Math.max(max, t.sortOrder ?? 0), -1);
        newTask = { ...newTask, sortOrder: maxOrder + 1 };
      }
      const tasksWithNew = [...state.data.tasks, newTask];
      return {
        ...state,
        data: { ...state.data, tasks: enforceDependencyConstraints(tasksWithNew) },
      };
    }

    case 'UPDATE_TASK': {
      const updatedTasks = state.data.tasks.map(t =>
        t.id === action.payload.id ? action.payload : t
      );
      return {
        ...state,
        data: { ...state.data, tasks: enforceDependencyConstraints(updatedTasks) },
      };
    }

    case 'DELETE_TASK': {
      const deletedId = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          tasks: state.data.tasks
            .filter(t => t.id !== deletedId)
            .map(t => ({
              ...t,
              dependencies: t.dependencies.filter(d => d !== deletedId),
            })),
        },
        selectedTaskId: state.selectedTaskId === deletedId ? null : state.selectedTaskId,
      };
    }

    case 'MOVE_TASK': {
      const { taskId, newStartDate } = action.payload;
      const newTasks = cascadeShift(state.data.tasks, taskId, newStartDate);
      return {
        ...state,
        data: { ...state.data, tasks: newTasks },
      };
    }

    case 'RESIZE_TASK': {
      const { taskId, newDuration } = action.payload;
      const task = state.data.tasks.find(t => t.id === taskId);
      if (!task) return state;
      const newTasks = cascadeShift(state.data.tasks, taskId, task.startDate, Math.max(1, newDuration));
      return {
        ...state,
        data: { ...state.data, tasks: newTasks },
      };
    }

    case 'ADD_LANE':
      return {
        ...state,
        data: { ...state.data, lanes: [...state.data.lanes, action.payload] },
      };

    case 'UPDATE_LANE':
      return {
        ...state,
        data: {
          ...state.data,
          lanes: state.data.lanes.map(l =>
            l.id === action.payload.id ? action.payload : l
          ),
        },
      };

    case 'DELETE_LANE': {
      const laneId = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          lanes: state.data.lanes.filter(l => l.id !== laneId),
          tasks: state.data.tasks.filter(t => t.laneId !== laneId),
        },
      };
    }

    case 'ADD_MILESTONE':
      return {
        ...state,
        data: { ...state.data, milestones: [...state.data.milestones, action.payload] },
      };

    case 'UPDATE_MILESTONE':
      return {
        ...state,
        data: {
          ...state.data,
          milestones: state.data.milestones.map(m =>
            m.id === action.payload.id ? action.payload : m
          ),
        },
      };

    case 'DELETE_MILESTONE':
      return {
        ...state,
        data: {
          ...state.data,
          milestones: state.data.milestones.filter(m => m.id !== action.payload),
        },
      };

    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };

    case 'SELECT_TASK':
      return { ...state, selectedTaskId: action.payload };

    case 'TOGGLE_JSON_EDITOR':
      return { ...state, showJsonEditor: !state.showJsonEditor };

    case 'SET_VIEW_RANGE':
      return {
        ...state,
        data: {
          ...state.data,
          viewStart: action.payload.viewStart,
          viewEnd: action.payload.viewEnd,
        },
      };

    case 'REORDER_TASK': {
      const { taskId, direction } = action.payload;
      const targetTask = state.data.tasks.find(t => t.id === taskId);
      if (!targetTask) return state;

      const laneTasks = state.data.tasks
        .filter(t => t.laneId === targetTask.laneId)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

      const currentIdx = laneTasks.findIndex(t => t.id === taskId);
      const swapIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;

      if (swapIdx < 0 || swapIdx >= laneTasks.length) return state;

      const currentOrder = laneTasks[currentIdx].sortOrder ?? currentIdx;
      const swapOrder = laneTasks[swapIdx].sortOrder ?? swapIdx;

      const newTasks = state.data.tasks.map(t => {
        if (t.id === laneTasks[currentIdx].id) return { ...t, sortOrder: swapOrder };
        if (t.id === laneTasks[swapIdx].id) return { ...t, sortOrder: currentOrder };
        return t;
      });

      return { ...state, data: { ...state.data, tasks: newTasks } };
    }

    case 'SWITCH_ROADMAP': {
      const normalizedTasks = normalizeSortOrder(action.payload.data.tasks);
      return {
        ...state,
        data: { ...action.payload.data, tasks: normalizedTasks },
        activeRoadmapId: action.payload.roadmapId,
        selectedTaskId: null,
        showJsonEditor: false,
      };
    }

    default:
      return state;
  }
}

// ---- Context ----

interface RoadmapContextValue {
  state: RoadmapState;
  dispatch: React.Dispatch<RoadmapAction>;
}

const RoadmapContext = createContext<RoadmapContextValue | null>(null);

export function useRoadmapStore() {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmapStore must be used within a RoadmapProvider');
  }
  return context;
}

// ---- Provider ----

export function createRoadmapProvider() {
  const sharedData = decodeRoadmapFromUrl();
  const isSharedView = !!sharedData;

  const activeId = isSharedView ? 'shared' : getActiveRoadmapId();
  const initData = sharedData || getInitialData(activeId);
  const initialState: RoadmapState = {
    data: { ...initData, tasks: normalizeSortOrder(initData.tasks) },
    zoom: 'week',
    selectedTaskId: null,
    showJsonEditor: false,
    activeRoadmapId: activeId,
  };

  if (isSharedView) {
    clearShareHash();
  }

  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(roadmapReducer, initialState);

    useEffect(() => {
      if (state.activeRoadmapId !== 'shared') {
        saveToLocalStorage(state.data, state.activeRoadmapId);
      }
    }, [state.data, state.activeRoadmapId]);

    useEffect(() => {
      if (state.activeRoadmapId !== 'shared') {
        setActiveRoadmapId(state.activeRoadmapId);
      }
    }, [state.activeRoadmapId]);

    const value = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return React.createElement(RoadmapContext.Provider, { value }, children);
  };

  return Provider;
}
