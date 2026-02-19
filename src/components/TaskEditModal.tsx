import React, { useState, useEffect, useCallback } from 'react';
import { useRoadmapStore } from '../hooks/useRoadmapStore';
import { Task } from '../types';
import { wouldCreateCycle } from '../utils/dependencyGraph';

export const TaskEditModal: React.FC = () => {
  const { state, dispatch } = useRoadmapStore();
  const { data, selectedTaskId } = state;

  const task = data.tasks.find(t => t.id === selectedTaskId);

  const [name, setName] = useState('');
  const [laneId, setLaneId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationInput, setDurationInput] = useState('1');
  const [dependencies, setDependencies] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setLaneId(task.laneId);
      setStartDate(task.startDate);
      setDurationInput(String(task.durationDays));
      setDependencies([...task.dependencies]);
    }
  }, [task]);

  const handleSave = useCallback(() => {
    if (!task) return;
    const parsed = parseFloat(durationInput);
    const finalDuration = (!isNaN(parsed) && parsed > 0) ? parsed : 0.5;
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        ...task,
        name,
        laneId,
        startDate,
        durationDays: finalDuration,
        dependencies,
      },
    });
  }, [task, name, laneId, startDate, durationInput, dependencies, dispatch]);

  const handleDelete = useCallback(() => {
    if (!task) return;
    if (window.confirm(`Delete task "${task.name}"?`)) {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
    }
  }, [task, dispatch]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'SELECT_TASK', payload: null });
  }, [dispatch]);

  const handleAddDependency = useCallback((depId: string) => {
    if (!task) return;
    if (depId === task.id) return;
    if (dependencies.includes(depId)) return;
    if (wouldCreateCycle(data.tasks, task.id, depId)) {
      alert('Cannot add this dependency — it would create a circular dependency.');
      return;
    }
    setDependencies([...dependencies, depId]);
  }, [task, dependencies, data.tasks]);

  const handleRemoveDependency = useCallback((depId: string) => {
    setDependencies(dependencies.filter(d => d !== depId));
  }, [dependencies]);

  if (!task) return null;

  const availableDeps = data.tasks.filter(
    t => t.id !== task.id && !dependencies.includes(t.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={handleClose}>
      <div
        className="w-96 h-full bg-white shadow-2xl border-l border-gray-200 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-gray-800">Edit Task</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Task name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Task Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Lane */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Lane</label>
            <select
              value={laneId}
              onChange={e => setLaneId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {data.lanes.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (working days)</label>
            <input
              type="text"
              inputMode="decimal"
              value={durationInput}
              onChange={e => setDurationInput(e.target.value)}
              placeholder="e.g. 1.5"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {(() => {
              const v = parseFloat(durationInput);
              if (durationInput !== '' && (isNaN(v) || v <= 0)) {
                return <p className="text-xs text-red-500 mt-1">Enter a positive number (decimals allowed)</p>;
              }
              return null;
            })()}
          </div>

          {/* Dependencies */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Dependencies (tasks that must finish first)
            </label>
            <div className="space-y-1 mb-2">
              {dependencies.length === 0 && (
                <p className="text-xs text-gray-400 italic">No dependencies</p>
              )}
              {dependencies.map(depId => {
                const dep = data.tasks.find(t => t.id === depId);
                return (
                  <div key={depId} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded">
                    <span className="text-xs text-gray-700">{dep?.name || depId}</span>
                    <button
                      onClick={() => handleRemoveDependency(depId)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
            {availableDeps.length > 0 && (
              <select
                value=""
                onChange={e => {
                  if (e.target.value) handleAddDependency(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">+ Add dependency...</option>
                {availableDeps.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Task ID (readonly info) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Task ID</label>
            <div className="px-3 py-2 bg-gray-50 rounded text-xs text-gray-400 font-mono">
              {task.id}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
