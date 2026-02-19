import React, { useState, useCallback, useEffect } from 'react';
import { useRoadmapStore } from '../hooks/useRoadmapStore';
import { RoadmapData } from '../types';

export const JsonEditor: React.FC = () => {
  const { state, dispatch } = useRoadmapStore();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      setJsonText(JSON.stringify(state.data, null, 2));
    }
  }, [state.data, isDirty]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setIsDirty(true);
    setError(null);
  }, []);

  const handleApply = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText) as RoadmapData;
      if (!parsed.lanes || !parsed.tasks || !parsed.milestones) {
        setError('Invalid data: must have lanes, tasks, and milestones arrays.');
        return;
      }
      dispatch({ type: 'SET_DATA', payload: parsed });
      setError(null);
      setIsDirty(false);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
    }
  }, [jsonText, dispatch]);

  const handleRevert = useCallback(() => {
    setJsonText(JSON.stringify(state.data, null, 2));
    setIsDirty(false);
    setError(null);
  }, [state.data]);

  if (!state.showJsonEditor) return null;

  return (
    <div className="w-[480px] flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">JSON Editor</h3>
        <div className="flex gap-2">
          {isDirty && (
            <>
              <button
                onClick={handleRevert}
                className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Revert
              </button>
              <button
                onClick={handleApply}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-xs text-red-600">
          {error}
        </div>
      )}
      <textarea
        value={jsonText}
        onChange={handleChange}
        className="flex-1 p-4 font-mono text-xs text-gray-700 bg-white border-none outline-none resize-none"
        spellCheck={false}
      />
    </div>
  );
};
