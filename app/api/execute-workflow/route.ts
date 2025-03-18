import { type NextRequest, NextResponse } from "next/server"
import type { Workflow } from "@/types/workflow"

// Store conversation history for the demo
const conversationHistory: Record<string, { role: string; content: string }[]> = {}

export async function POST(request: NextRequest) {
  try {
    const { workflow, input, sessionId = "default" } = await request.json()

    // In a real implementation, this would:
    // 1. Execute the workflow with the provided input
    // 2. Make actual API calls to LLM providers
    // 3. Return the results

    // For this demo, we'll simulate the execution
    const result = await simulateWorkflowExecution(workflow, input, sessionId)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Error executing workflow:", error)
    return NextResponse.json({ success: false, error: "Failed to execute workflow" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId = "default" } = await request.json()

    // Clear conversation history for the session
    if (conversationHistory[sessionId]) {
      conversationHistory[sessionId] = []
    }

    return NextResponse.json({
      success: true,
      message: "Conversation history cleared",
    })
  } catch (error) {
    console.error("Error clearing conversation history:", error)
    return NextResponse.json({ success: false, error: "Failed to clear conversation history" }, { status: 500 })
  }
}

// Update the simulateWorkflowExecution function to handle memory
async function simulateWorkflowExecution(workflow: Workflow, input: string, sessionId: string) {
  // Find LLM nodes
  const llmNodes = workflow.nodes.filter((node) => node.type === "llm")

  // If there's no LLM node, return an error
  if (llmNodes.length === 0) {
    return {
      success: false,
      error: "No LLM node found in the workflow",
    }
  }

  // Get the LLM configuration
  const llmNode = llmNodes[0]
  const model = llmNode.data.model || "gpt-4o"
  const useMemory = llmNode.data.memory || false

  // Initialize conversation history for this session if it doesn't exist
  if (!conversationHistory[sessionId] && useMemory) {
    conversationHistory[sessionId] = []
  }

  // Add user message to history if memory is enabled
  if (useMemory) {
    conversationHistory[sessionId].push({ role: "user", content: input })
  }

  // Simulate a delay for the API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Create a response that references previous messages if memory is enabled
  let response = `This is a simulated response from ${model} to your input: "${input}".\n\n`

  if (useMemory && conversationHistory[sessionId].length > 1) {
    response += `I notice this is message #${conversationHistory[sessionId].length / 2} in our conversation. `

    // Reference a previous message if available
    if (conversationHistory[sessionId].length >= 3) {
      const previousUserMessage = conversationHistory[sessionId][conversationHistory[sessionId].length - 3].content
      response += `Earlier you asked about "${previousUserMessage.substring(0, 30)}...". `
    }

    response += `\n\nWith memory enabled, I'm maintaining the full conversation context.`
  } else if (!useMemory) {
    response += `\n\nMemory is currently disabled, so I'm treating this as an independent message without conversation context.`
  }

  response += `\n\nIn a real implementation, this would be the actual response from the LLM API using Langchain with ${useMemory ? "memory enabled" : "no memory"}.
  
The workflow execution would:
1. Take your input message
2. ${useMemory ? "Add it to the conversation history" : "Process it independently"}
3. ${useMemory ? "Send the full conversation context to the LLM" : "Send only the current message to the LLM"}
4. Return the generated response

${useMemory ? "With memory enabled, the LLM can reference previous messages and maintain context throughout the conversation." : "Without memory, each message is treated independently, which can be more efficient for stateless applications."}

You can download the generated backend code to see the Langchain implementation with ${useMemory ? "memory support" : "optional memory support"}.`

  // Add AI response to history if memory is enabled
  if (useMemory) {
    conversationHistory[sessionId].push({ role: "assistant", content: response })

    // Keep history to a reasonable size
    if (conversationHistory[sessionId].length > 20) {
      conversationHistory[sessionId] = conversationHistory[sessionId].slice(-20)
    }
  }

  return {
    success: true,
    input,
    output: response,
    model,
    hasMemory: useMemory,
  }
}

