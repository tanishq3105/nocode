export interface NodeData {
  label?: string
  message?: string
  model?: string
  apiKey?: string
  temperature?: string
  output?: string
  memory?: boolean
  onChange?: (nodeId: string, data: Partial<NodeData>) => void
}

export interface WorkflowNode {
  id: string
  type: string
  data: NodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

export interface Workflow {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

