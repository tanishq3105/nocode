import { Handle, Position, NodeProps } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useFlowStore } from '../store/flowStore';

export const CustomNode = ({ data, id }: NodeProps) => {
  const removeNode = useFlowStore((state) => state.removeNode);

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    removeNode(id);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] group">
      <div className="drag-handle p-3 cursor-move bg-gray-50 rounded-t-lg border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{data.icon}</span>
          <span className="font-medium text-gray-700">{data.label}</span>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-red-500"
          title="Delete node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        <div className="text-sm text-gray-600">
          {data.description || 'Configure this node'}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};