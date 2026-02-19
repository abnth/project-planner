import React from 'react';
import { createRoadmapProvider, useRoadmapStore } from './hooks/useRoadmapStore';
import { GanttChart } from './components/GanttChart';
import { Toolbar } from './components/Toolbar';
import { TaskEditModal } from './components/TaskEditModal';
import { JsonEditor } from './components/JsonEditor';

const RoadmapProvider = createRoadmapProvider();

const AppContent: React.FC = () => {
  const { state } = useRoadmapStore();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <GanttChart />
        </div>
        <JsonEditor />
      </div>
      {state.selectedTaskId && <TaskEditModal />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <RoadmapProvider>
      <AppContent />
    </RoadmapProvider>
  );
};

export default App;
