import React from 'react';
import { Button } from './ui/Button';
import { PlusCircle, Settings, Save } from 'lucide-react';

const nodeTypes = [
  { id: 'llm', label: 'Language Model', icon: '🤖' },
  { id: 'prompt', label: 'Prompt Template', icon: '📝' },
  { id: 'data', label: 'Data Source', icon: '📊' },
  { id: 'process', label: 'Data Process', icon: '⚙️' },
  { id: 'output', label: 'Output', icon: '📤' },
];

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/node-data', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Components</h2>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1">
            <PlusCircle className="w-4 h-4 mr-2" />
            New
          </Button>
          <Button variant="secondary" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {nodeTypes.map((type) => (
            <div
              key={type.id}
              draggable
              onDragStart={(e) => onDragStart(e, type.id, type)}
              className="flex items-center p-3 rounded-lg border border-gray-200 cursor-move hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl mr-3">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};