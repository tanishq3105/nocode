import type { Workflow } from "@/types/workflow"
import { generateBackendCode } from "./code-generator"
import { createZipFile, createObjectURL } from "./zip-generator"

export async function generateBackend(workflow: Workflow) {
  try {
    // Generate the backend code files
    const files = generateBackendCode(workflow)

    // Create a zip file containing the generated files
    const zipBlob = await createZipFile(files)

    // Create a URL for the zip file
    const downloadUrl = createObjectURL(zipBlob)

    // Simulate execution result
    const executionResult = await simulateExecution(workflow)

    return {
      downloadUrl,
      executionResult,
    }
  } catch (error) {
    console.error("Error generating backend:", error)
    throw error
  }
}

// Update the simulateExecution function to mention memory
async function simulateExecution(workflow: Workflow): Promise<string> {
  // Find chat input nodes
  const chatInputNodes = workflow.nodes.filter((node) => node.type === "chatInput")

  // Find LLM nodes
  const llmNodes = workflow.nodes.filter((node) => node.type === "llm")

  // Check if memory is enabled
  const memoryEnabled = llmNodes.some((node) => node.data.memory)

  // Generate a simulated response
  let result = "# Workflow Execution Results\n\n"

  if (chatInputNodes.length === 0) {
    result += "No chat input nodes found in the workflow.\n"
  } else {
    result += "## Input Messages:\n"
    chatInputNodes.forEach((node) => {
      result += `- "${node.data.message || "Empty message"}"\n`
    })
  }

  if (llmNodes.length === 0) {
    result += "\nNo LLM nodes found in the workflow.\n"
  } else {
    result += "\n## LLM Configuration:\n"
    llmNodes.forEach((node) => {
      result += `- Model: ${node.data.model || "Not specified"}\n`
      result += `- Temperature: ${node.data.temperature || "Default"}\n`
      result += `- API Key: ${node.data.apiKey ? "********" : "Not provided"}\n`
      result += `- Memory: ${node.data.memory ? "Enabled" : "Disabled"}\n`
    })

    // Simulate LLM response
    if (chatInputNodes.length > 0 && chatInputNodes[0].data.message) {
      const userMessage = chatInputNodes[0].data.message
      result += "\n## Generated Response:\n"
      result += `"This is a simulated response to: "${userMessage}"\n\n`
      result += `In a real implementation, this would be the actual response from the LLM API using Langchain ${memoryEnabled ? "with memory enabled" : "without memory"}.\n`
    } else {
      result += "\n## Generated Response:\n"
      result += "No input message provided to generate a response.\n"
    }
  }

  // Add information about code generation
  result += "\n## Backend Code Generation:\n"
  result += "The following files have been generated and included in the ZIP file:\n"
  result += "- app.py: Main Flask application\n"
  result += "- routes/workflow_routes.py: API endpoints for the workflow\n"
  result += "- services/llm_service.py: Service for LLM API calls using Langchain\n"
  result += "- utils/workflow_executor.py: Utility for executing the workflow\n"
  result += "- requirements.txt: Python dependencies including Langchain\n"
  result += "- .env: Environment variables (API keys)\n"
  result += "- README.md: Setup and usage instructions\n"
  result += "- workflow.json: Your workflow configuration\n"

  result += "\n## Langchain Integration:\n"
  result += "The backend uses Langchain to provide a consistent interface for working with different language models:\n"
  result += "- OpenAI models (GPT-4o, GPT-3.5-turbo)\n"
  result += "- Anthropic models (Claude)\n"
  result += "- Google models (Gemini)\n"
  result += "- Open source models via Hugging Face (Llama, Mistral)\n"
  result += "- And many more!\n\n"
  result += "This allows you to easily switch between models without changing your code.\n"

  // Add information about memory if enabled
  if (memoryEnabled) {
    result += "\n## Memory Context:\n"
    result += "Memory is **enabled** in this workflow. This means:\n"
    result += "- The LLM will remember previous messages in the conversation\n"
    result += "- Each new message will be added to the conversation history\n"
    result += "- The full conversation context will be sent with each request\n"
    result += "- The LLM can reference previous messages in its responses\n\n"
    result += "The backend includes an API endpoint to clear the conversation history:\n"
    result += "- POST /api/clear-memory\n"
  } else {
    result += "\n## Memory Context:\n"
    result += "Memory is **disabled** in this workflow. This means:\n"
    result += "- Each message will be processed independently\n"
    result += "- No conversation history will be maintained\n"
    result += "- The LLM will not have context from previous messages\n\n"
    result += "You can enable memory by toggling the Memory Context switch in the LLM node.\n"
  }

  return result
}

