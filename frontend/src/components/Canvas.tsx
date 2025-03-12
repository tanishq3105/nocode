import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useReactFlow,
  Node,
  Connection,
  Edge,
  OnNodesChange,
  applyNodeChanges,
} from 'reactflow';
import { useFlowStore } from '../store/flowStore';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { Button } from './ui/Button';
import { CustomNode } from './CustomNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  default: CustomNode,
  llm: CustomNode,
  prompt: CustomNode,
  data: CustomNode,
  process: CustomNode,
  output: CustomNode,
};

export const Canvas = () => {
  const { nodes, edges, addNode, addEdge, removeEdge, updateNodes } = useFlowStore();
  const { project } = useReactFlow();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      updateNodes(updatedNodes);
    },
    [nodes, updateNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const nodeData = JSON.parse(event.dataTransfer.getData('application/node-data'));
      const position = project({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: nodeData.label,
          icon: nodeData.icon,
          description: `${nodeData.label} node configuration`,
        },
      };

      addNode(newNode);
    },
    [project, addNode]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      addEdge({
        id: `edge-${Date.now()}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle!,
        targetHandle: params.targetHandle!,
      });
    },
    [addEdge]
  );

  const onEdgesDelete = useCallback(
    (edges: Edge[]) => {
      edges.forEach((edge) => removeEdge(edge.id));
    },
    [removeEdge]
  );

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background gap={15} />
        <Controls />
        <Panel position="top-right" className="flex gap-2">
          <Button variant="secondary" size="sm">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm">
            <Maximize className="w-4 h-4" />
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};