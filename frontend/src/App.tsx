import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Canvas } from './components/Canvas';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
}

export default App;