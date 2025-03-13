"use client"

import { useCallback, useRef, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type NodeTypes,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import type { Workflow } from "@/types/workflow"
import ChatInputNode from "@/components/nodes/chat-input-node"
import LLMNode from "@/components/nodes/llm-node"
import OutputNode from "@/components/nodes/output-node"
import type { NodeData } from "@/types/workflow"
import { Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const nodeTypes: NodeTypes = {
  chatInput: ChatInputNode,
  llm: LLMNode,
  output: OutputNode,
}

const initialNodes: Node<NodeData>[] = [
  {
    id: "1",
    type: "chatInput",
    position: { x: 100, y: 100 },
    data: { label: "Chat Input", message: "" },
  },
]

interface WorkflowEditorProps {
  onExport: (workflow: Workflow) => void
}

export default function WorkflowEditor({ onExport }: WorkflowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeDataChange = useCallback(
    (nodeId: string, newData: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
                onChange: onNodeDataChange,
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  // Initialize nodes with the onChange handler
  useState(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: onNodeDataChange,
        },
      })),
    )
  })

  const handleExport = () => {
    const workflow: Workflow = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type as string,
        data: {
          ...node.data,
          onChange: undefined, // Remove the function before serializing
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
    }
    onExport(workflow)
  }

  const addNewNode = (type: string) => {
    const newNode: Node<NodeData> = {
      id: `node_${Date.now()}`,
      type,
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: type === "llm" ? "LLM" : type === "output" ? "Output" : "Chat Input",
        onChange: onNodeDataChange,
      },
    }

    setNodes((nds) => [...nds, newNode])
  }

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={setReactFlowInstance}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right" className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => addNewNode("chatInput")}>Chat Input</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNewNode("llm")}>LLM</DropdownMenuItem>
              <DropdownMenuItem onClick={() => addNewNode("output")}>Output</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleExport}>
            Export Workflow
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  )
}

