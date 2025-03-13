"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Model {
  id: string
  name: string
}

interface ModelProvider {
  provider: string
  models: Model[]
  apiKeyEnv: string
}

interface ModelSelectorProps {
  value: string
  onChange: (value: string) => void
  id?: string
  className?: string
}

export default function ModelSelector({ value, onChange, id, className }: ModelSelectorProps) {
  const [providers, setProviders] = useState<ModelProvider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/langchain-models")
        const data = await response.json()
        if (data.success && data.models) {
          setProviders(data.models)
        }
      } catch (error) {
        console.error("Error fetching models:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={loading ? "Loading models..." : "Select a model"} />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => (
          <SelectGroup key={provider.provider}>
            <SelectLabel>{provider.provider}</SelectLabel>
            {provider.models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

