import { type NextRequest, NextResponse } from "next/server"
import type { Workflow } from "@/types/workflow"
import { generateBackendCode } from "@/lib/code-generator"

export async function POST(request: NextRequest) {
  try {
    const workflow: Workflow = await request.json()

    // Generate the backend code files
    const files = generateBackendCode(workflow)

    // In a real server implementation, we would:
    // 1. Create the zip file
    // 2. Save it to a temporary location or cloud storage
    // 3. Return a URL to download it

    // For this demo, we'll return the files as JSON
    // The frontend will handle creating the zip file

    // Generate a simulated execution result
    const executionResult = simulateExecution(workflow)

    return NextResponse.json({
      success: true,
      files: files,
      executionResult,
    })
  } catch (error) {
    console.error("Error generating backend:", error)
    return NextResponse.json({ success: false, error: "Failed to generate backend" }, { status: 500 })
  }
}

function simulateExecution(workflow: Workflow): string {
  // Find chat input nodes
  const chatInputNodes = workflow.nodes.filter((node) => node.type === "chatInput")

  // Find LLM nodes
  const llmNodes = workflow.nodes.filter((node) => node.type === "llm")

  // Generate a simulated response
  let result = "# Workflow Execution Results\n\n"

  if (chatInputNodes.length > 0 && chatInputNodes[0].data.message) {
    const userMessage = chatInputNodes[0].data.message
    result += `Input: "${userMessage}"\n\n`

    if (llmNodes.length > 0) {
      result += `Model: ${llmNodes[0].data.model || "Not specified"}\n`
      result += `Generated Response: "This is a simulated response to your input."\n`
    } else {
      result += "No LLM node connected to process the input.\n"
    }
  } else {
    result += "No input message provided.\n"
  }

  return result
}

