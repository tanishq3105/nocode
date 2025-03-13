import { Handle, Position, type NodeProps } from "reactflow"
import type { NodeData } from "@/types/workflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileOutput } from "lucide-react"

export default function OutputNode({ id, data, isConnectable }: NodeProps<NodeData>) {
  return (
    <Card className="w-64 border-2 border-green-200">
      <CardHeader className="bg-green-50 p-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <FileOutput className="mr-2 h-4 w-4" />
          Output
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="rounded-md bg-muted p-2 text-xs">{data.output || "No output yet"}</div>
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          isConnectable={isConnectable}
          className="h-3 w-3 bg-green-500"
        />
      </CardContent>
    </Card>
  )
}

