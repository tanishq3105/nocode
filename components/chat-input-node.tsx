"use client"

import type React from "react"

import { useCallback } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Textarea } from "@/components/ui/textarea"
import type { NodeData } from "@/types/workflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function ChatInputNode({ id, data, isConnectable }: NodeProps<NodeData>) {
  const onChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      const message = evt.target.value
      data.onChange?.(id, { message })
    },
    [id, data],
  )

  return (
    <Card className="w-64 border-2 border-blue-200">
      <CardHeader className="bg-blue-50 p-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <MessageSquare className="mr-2 h-4 w-4" />
          Chat Input
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Textarea
          id={`node-${id}`}
          value={data.message || ""}
          onChange={onChange}
          placeholder="Enter your message here..."
          className="h-20 resize-none text-sm"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          isConnectable={isConnectable}
          className="h-3 w-3 bg-blue-500"
        />
      </CardContent>
    </Card>
  )
}

