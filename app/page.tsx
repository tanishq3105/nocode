"use client"

import { useState } from "react"
import WorkflowEditor from "@/components/workflow-editor"
import { Button } from "@/components/ui/button"
import type { Workflow } from "@/types/workflow"
import { generateBackend } from "@/lib/api"
import { Loader2, Download, Play, Trash2, Cloud } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [executionResult, setExecutionResult] = useState<string | null>(null)
  const [testInput, setTestInput] = useState<string>("")
  const [testOutput, setTestOutput] = useState<string | null>(null)
  const [sessionId] = useState<string>(`session-${Date.now()}`)
  const [hasMemory, setHasMemory] = useState<boolean>(false)

  const handleExportWorkflow = async (workflowData: Workflow) => {
    setWorkflow(workflowData)
    setIsGenerating(true)
    setDownloadUrl(null)
    setExecutionResult(null)

    // Check if any LLM node has memory enabled
    const llmNodes = workflowData.nodes.filter((node) => node.type === "llm")
    const memoryEnabled = llmNodes.some((node) => node.data.memory)
    setHasMemory(memoryEnabled)

    try {
      const result = await generateBackend(workflowData)
      if (result.downloadUrl) {
        setDownloadUrl(result.downloadUrl)
      }
      if (result.executionResult) {
        setExecutionResult(result.executionResult)
      }
    } catch (error) {
      console.error("Error generating backend:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExecuteWorkflow = async () => {
    if (!workflow || !testInput) return

    setIsExecuting(true)
    setTestOutput(null)

    try {
      const response = await fetch("/api/execute-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow,
          input: testInput,
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.success && data.result) {
        setTestOutput(data.result.output)
        setHasMemory(data.result.hasMemory || false)
      } else {
        setTestOutput(`Error: ${data.error || "Failed to execute workflow"}`)
      }
    } catch (error) {
      console.error("Error executing workflow:", error)
      setTestOutput("Error: Failed to execute workflow")
    } finally {
      setIsExecuting(false)
    }
  }

  const handleClearMemory = async () => {
    if (!workflow) return

    setIsClearing(true)

    try {
      const response = await fetch("/api/execute-workflow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTestOutput("Conversation history has been cleared. You can start a new conversation.")
      } else {
        setTestOutput(`Error: ${data.error || "Failed to clear conversation history"}`)
      }
    } catch (error) {
      console.error("Error clearing conversation history:", error)
      setTestOutput("Error: Failed to clear conversation history")
    } finally {
      setIsClearing(false)
    }
  }

  const handleDeploy = async (platform: "aws" | "gcp") => {
    if (!workflow) return

    setIsDeploying(true)
    setTestOutput(`Deploying to ${platform === "aws" ? "AWS" : "Google Cloud"}...`)

    try {
      const response = await fetch("/api/deploy-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow,
          platform,
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTestOutput(`Successfully deployed to ${platform === "aws" ? "AWS" : "Google Cloud"}!\n${data.deploymentUrl ? `Deployment URL: ${data.deploymentUrl}` : ""}`)
      } else {
        setTestOutput(`Error: ${data.error || `Failed to deploy to ${platform === "aws" ? "AWS" : "Google Cloud"}`}`)
      }
    } catch (error) {
      console.error(`Error deploying to ${platform}:`, error)
      setTestOutput(`Error: Failed to deploy to ${platform === "aws" ? "AWS" : "Google Cloud"}`)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Workflow Builder</h1>
          <div className="flex gap-2">
            {isGenerating ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </Button>
            ) : (
              <>
                {downloadUrl && (
                  <Button asChild>
                    <a href={downloadUrl} download="ai-workflow-backend.zip">
                      <Download className="mr-2 h-4 w-4" />
                      Download Backend
                    </a>
                  </Button>
                )}
                {workflow && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={isDeploying}>
                        {isDeploying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Cloud className="mr-2 h-4 w-4" />
                            Deploy
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeploy("aws")}>
                        Deploy to AWS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeploy("gcp")}>
                        Deploy to Google Cloud
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container flex-1 p-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card shadow">
              <div className="p-4">
                <h2 className="text-xl font-semibold">Workflow Editor</h2>
                <p className="text-sm text-muted-foreground">Drag and drop nodes to create your AI workflow</p>
              </div>
              <div className="h-[600px] border-t">
                <WorkflowEditor onExport={handleExportWorkflow} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Test Your Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasMemory && (
                  <Alert className="bg-blue-50">
                    <AlertDescription className="text-xs">
                      Memory is enabled. The LLM will remember your conversation history.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="test-input">Input Message</Label>
                  <Textarea
                    id="test-input"
                    placeholder="Enter a message to test your workflow..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="h-20 resize-none"
                  />
                </div>
                <Button
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting || !workflow || !testInput}
                  className="w-full"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Workflow
                    </>
                  )}
                </Button>
                {hasMemory && (
                  <Button
                    onClick={handleClearMemory}
                    disabled={isClearing || !workflow}
                    variant="outline"
                    className="w-full"
                  >
                    {isClearing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Conversation History
                      </>
                    )}
                  </Button>
                )}
                {testOutput && (
                  <div className="mt-4">
                    <Label>Output</Label>
                    <div className="mt-2 rounded-md bg-muted p-3 text-sm">
                      <pre className="whitespace-pre-wrap">{testOutput}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Generated Backend</CardTitle>
              </CardHeader>
              <CardContent>
                {executionResult ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-xs">
                    {executionResult}
                  </pre>
                ) : (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">
                    {isGenerating ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                        <p>Generating backend code...</p>
                      </div>
                    ) : (
                      <p>Export your workflow to generate backend code</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Workflow JSON</CardTitle>
              </CardHeader>
              <CardContent>
                {workflow ? (
                  <pre className="max-h-80 overflow-auto rounded-md bg-muted p-4 text-xs">
                    {JSON.stringify(workflow, null, 2)}
                  </pre>
                ) : (
                  <div className="flex h-40 items-center justify-center text-muted-foreground">
                    <p>Export your workflow to see the JSON configuration</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}