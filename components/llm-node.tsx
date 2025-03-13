"use client"

import type React from "react"

import { useCallback } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { NodeData } from "@/types/workflow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu } from "lucide-react"
import ModelSelector from "@/components/model-selector"

export default function LLMNode({ id, data, isConnectable }: NodeProps<NodeData>) {
  const onModelChange = useCallback(
    (value: string) => {
      data.onChange?.(id, { model: value })
    },
    [id, data],
  )

  const onApiKeyChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      data.onChange?.(id, { apiKey: evt.target.value })
    },
    [id, data],
  )

  const onTemperatureChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      data.onChange?.(id, { temperature: evt.target.value })
    },
    [id, data],
  )

  return (
    <Card className="w-64 border-2 border-purple-200">
      <CardHeader className="bg-purple-50 p-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <Cpu className="mr-2 h-4 w-4" />
          LLM
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        <div className="space-y-1">
          <Label htmlFor={`model-${id}`} className="text-xs">
            Model
          </Label>
          <ModelSelector
            id={`model-${id}`}
            value={data.model || "gpt-4o"}
            onChange={onModelChange}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`api-key-${id}`} className="text-xs">
            API Key
          </Label>
          <Input
            id={`api-key-${id}`}
            value={data.apiKey || ""}
            onChange={onApiKeyChange}
            placeholder="Enter API key"
            className="h-8 text-xs"
            type="password"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`temperature-${id}`} className="text-xs">
            Temperature
          </Label>
          <Input
            id={`temperature-${id}`}
            value={data.temperature || "0.7"}
            onChange={onTemperatureChange}
            placeholder="0.7"
            className="h-8 text-xs"
          />
        </div>

        <Handle
          type="target"
          position={Position.Left}
          id="input"
          isConnectable={isConnectable}
          className="h-3 w-3 bg-purple-500"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          isConnectable={isConnectable}
          className="h-3 w-3 bg-purple-500"
        />
      </CardContent>
    </Card>
  )
}

