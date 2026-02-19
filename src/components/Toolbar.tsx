import React, { useCallback } from 'react';
import { useRoadmapStore } from '../hooks/useRoadmapStore';
import { ZoomLevel } from '../types';
import { exportToJson, importFromJson, clearLocalStorage, getInitialData } from '../utils/exportImport';
import { roadmapRegistry, getRoadmapById } from '../data/roadmapRegistry';

export const Toolbar: React.FC = () => {
  const { state, dispatch } = useRoadmapStore();

  const handleZoomChange = useCallback((zoom: ZoomLevel) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, [dispatch]);

  const handleExport = useCallback(() => {
    const entry = getRoadmapById(state.activeRoadmapId);
    const filename = `roadmap-${entry?.name.replace(/\s+/g, '-').toLowerCase() || state.activeRoadmapId}.json`;
    exportToJson(state.data, filename);
  }, [state.data, state.activeRoadmapId]);

  const handleImport = useCallback(async () => {
    try {
      const data = await importFromJson();
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (err) {
      console.error('Import failed:', err);
    }
  }, [dispatch]);

  const handleReset = useCallback(() => {
    const entry = getRoadmapById(state.activeRoadmapId);
    const name = entry?.name || 'current roadmap';
    if (window.confirm(`Reset "${name}" to default data? This will clear all changes.`)) {
      clearLocalStorage(state.activeRoadmapId);
      const defaultData = entry?.defaultData;
      if (defaultData) {
        dispatch({ type: 'SET_DATA', payload: { ...defaultData } });
      }
    }
  }, [state.activeRoadmapId, dispatch]);

  const handleSwitchRoadmap = useCallback((newId: string) => {
    if (newId === state.activeRoadmapId) return;
    const data = getInitialData(newId);
    dispatch({ type: 'SWITCH_ROADMAP', payload: { roadmapId: newId, data } });
  }, [state.activeRoadmapId, dispatch]);

  const handleAddTask = useCallback(() => {
    const id = `task-${Date.now()}`;
    const laneId = state.data.lanes[0]?.id || '';
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id,
        name: 'New Task',
        laneId,
        startDate: state.data.viewStart,
        durationDays: 7,
        dependencies: [],
      },
    });
    dispatch({ type: 'SELECT_TASK', payload: id });
  }, [state.data.lanes, state.data.viewStart, dispatch]);

  const handleAddMilestone = useCallback(() => {
    const id = `ms-${Date.now()}`;
    dispatch({
      type: 'ADD_MILESTONE',
      payload: {
        id,
        name: 'New Milestone',
        date: '2026-03-01',
      },
    });
  }, [dispatch]);

  const handleToggleJson = useCallback(() => {
    dispatch({ type: 'TOGGLE_JSON_EDITOR' });
  }, [dispatch]);

  const currentEntry = getRoadmapById(state.activeRoadmapId);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-wrap">
      {/* App title */}
      <h1 className="text-lg font-bold text-gray-800 mr-2">Roadmap Planner</h1>

      {/* Roadmap selector */}
      <select
        value={state.activeRoadmapId}
        onChange={(e) => handleSwitchRoadmap(e.target.value)}
        className="px-2 py-1.5 text-sm font-medium border border-gray-300 rounded bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-w-[220px]"
        title={currentEntry?.description}
      >
        {roadmapRegistry.map(entry => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Add buttons */}
      <button
        onClick={handleAddTask}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
      >
        <span className="text-lg leading-none">+</span> Task
      </button>
      <button
        onClick={handleAddMilestone}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        <span className="text-lg leading-none">+</span> Milestone
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Zoom controls */}
      <span className="text-xs font-medium text-gray-500 uppercase">Zoom:</span>
      {(['day', 'week', 'month'] as ZoomLevel[]).map(z => (
        <button
          key={z}
          onClick={() => handleZoomChange(z)}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            state.zoom === z
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {z.charAt(0).toUpperCase() + z.slice(1)}
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Data management */}
      <button
        onClick={handleToggleJson}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          state.showJsonEditor
            ? 'bg-amber-100 text-amber-800'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {state.showJsonEditor ? 'Hide JSON' : 'JSON Editor'}
      </button>
      <button
        onClick={handleExport}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        Export
      </button>
      <button
        onClick={handleImport}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        Import
      </button>
      <button
        onClick={handleReset}
        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};
