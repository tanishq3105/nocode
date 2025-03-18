import type { Workflow } from "@/types/workflow"

// Base template for Flask app.py
const baseAppTemplate = `
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from routes import workflow_routes
from utils import workflow_executor

app = Flask(__name__)
CORS(app)

# Register routes
app.register_blueprint(workflow_routes.bp)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
`

// Template for workflow routes
const routesTemplate = `
from flask import Blueprint, request, jsonify
from services import llm_service
from utils import workflow_executor

bp = Blueprint('workflow', __name__, url_prefix='/api')

@bp.route('/execute', methods=['POST'])
def execute_workflow():
    data = request.json
    input_message = data.get('message', '')
    
    # Execute the workflow
    result = workflow_executor.execute_workflow(input_message)
    
    return jsonify(result)

@bp.route('/clear-memory', methods=['POST'])
def clear_memory():
    """Clear the conversation history"""
    result = workflow_executor.clear_conversation_history()
    return jsonify(result)
`

// Update the llmServiceTemplate with memory support
const llmServiceTemplate = `
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_community.llms import HuggingFaceEndpoint
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory
import os
from typing import Dict, Any, Optional, List

class LLMService:
    def __init__(self, model="{model}", api_key="{api_key}", temperature={temperature}, use_memory={use_memory}):
        self.model = model
        self.api_key = api_key
        self.temperature = float(temperature)
        self.use_memory = use_memory
        self._llm = self._initialize_llm()
        
        # Initialize memory if enabled
        if self.use_memory:
            self.memory = ConversationBufferMemory()
            self.chat_history = []
        
    def _initialize_llm(self):
        """Initialize the appropriate LLM based on the model name"""
        if "gpt" in self.model.lower():
            # OpenAI models
            return ChatOpenAI(
                model=self.model,
                openai_api_key=self.api_key,
                temperature=self.temperature
            )
        elif "claude" in self.model.lower():
            # Anthropic models
            return ChatAnthropic(
                model=self.model,
                anthropic_api_key=self.api_key,
                temperature=self.temperature
            )
        elif "gemini" in self.model.lower():
            # Google Gemini models
            return ChatGoogleGenerativeAI(
                model=self.model,
                google_api_key=self.api_key,
                temperature=self.temperature
            )
        elif "llama" in self.model.lower() or "mistral" in self.model.lower():
            # HuggingFace models
            return HuggingFaceEndpoint(
                repo_id=self.model,
                huggingfacehub_api_token=self.api_key,
                temperature=self.temperature
            )
        else:
            # Default to OpenAI if model type can't be determined
            print(f"Model type not recognized: {self.model}. Defaulting to gpt-4o.")
            return ChatOpenAI(
                model="gpt-4o",
                openai_api_key=self.api_key,
                temperature=self.temperature
            )
    
    def generate_response(self, prompt: str) -> Dict[str, Any]:
        """Generate a response from the LLM based on the prompt"""
        try:
            if self.use_memory:
                # Add the new user message to chat history
                self.chat_history.append(HumanMessage(content=prompt))
                
                # Create messages list from chat history
                messages = self.chat_history.copy()
                
                # Generate response
                response = self._llm.invoke(messages)
                
                # Add the AI response to chat history
                self.chat_history.append(AIMessage(content=response.content if hasattr(response, "content") else str(response)))
                
                # Keep chat history to a reasonable size (last 10 messages)
                if len(self.chat_history) > 10:
                    self.chat_history = self.chat_history[-10:]
            else:
                # No memory, just process the current message
                messages = [HumanMessage(content=prompt)]
                response = self._llm.invoke(messages)
            
            return {
                "text": response.content if hasattr(response, "content") else str(response),
                "model": self.model,
                "success": True
            }
        except Exception as e:
            return {
                "error": f"Error generating response: {str(e)}",
                "success": False
            }
    
    def update_model(self, model: str, api_key: Optional[str] = None, temperature: Optional[float] = None):
        """Update the model and reinitialize the LLM"""
        self.model = model
        if api_key:
            self.api_key = api_key
        if temperature is not None:
            self.temperature = float(temperature)
        self._llm = self._initialize_llm()
    
    def clear_memory(self):
        """Clear the conversation history"""
        if self.use_memory:
            self.chat_history = []

# Create a default instance
default_llm = LLMService()
`

// Update the workflowExecutorTemplate to support memory
const workflowExecutorTemplate = `
from services.llm_service import default_llm
from flask import session

def execute_workflow(input_message):
    """
    Execute the workflow with the given input message
    """
    try:
        # Process the input message
        processed_input = input_message.strip()
        
        # Generate response using the LLM
        llm_response = default_llm.generate_response(processed_input)
        
        if not llm_response.get("success", False):
            return {
                "success": False,
                "error": llm_response.get("error", "Unknown error")
            }
        
        # Return the result
        return {
            "success": True,
            "input": processed_input,
            "output": llm_response["text"],
            "model": llm_response["model"],
            "has_memory": default_llm.use_memory
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Workflow execution failed: {str(e)}"
        }

def clear_conversation_history():
    """
    Clear the conversation history in the LLM service
    """
    default_llm.clear_memory()
    return {"success": True, "message": "Conversation history cleared"}
`

// Update the requirementsTemplate to ensure memory dependencies
const requirementsTemplate = `
flask==2.3.3
flask-cors==4.0.0
requests==2.31.0
python-dotenv==1.0.0
langchain==0.1.12
langchain-openai==0.1.5
langchain-anthropic==0.1.1
langchain-community==0.2.0
langchain-google-genai==0.0.6
`

// Template for .env file
const envFileTemplate = `
# API Keys
OPENAI_API_KEY={openai_api_key}
ANTHROPIC_API_KEY={anthropic_api_key}

# Server Configuration
PORT=5000
`

// Template for README.md
const readmeTemplate = `
# AI Workflow Backend

This is an automatically generated Flask backend for an AI workflow.

## Setup

1. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

2. Run the application:
   \`\`\`
   python app.py
   \`\`\`

## API Endpoints

- POST /api/execute
  - Executes the workflow with the provided input
  - Request body: \`{ "message": "Your input message" }\`
  - Response: \`{ "success": true, "input": "...", "output": "..." }\`

## Configuration

You can modify the .env file to update API keys and other configuration.
`

export interface GeneratedFile {
  path: string
  content: string
}

export function generateBackendCode(workflow: Workflow): GeneratedFile[] {
  const files: GeneratedFile[] = []

  // Find nodes by type
  const chatInputNodes = workflow.nodes.filter((node) => node.type === "chatInput")
  const llmNodes = workflow.nodes.filter((node) => node.type === "llm")

  // Get LLM configuration
  const llmNode = llmNodes.length > 0 ? llmNodes[0] : null
  const model = llmNode?.data.model || "gemini-2.0-flash"
  const apiKey = llmNode?.data.apiKey || "${GEMINI_API_KEY}"
  const temperature = llmNode?.data.temperature || "0.7"
  const useMemory = llmNode?.data.memory || false

  // Generate app.py
  files.push({
    path: "app.py",
    content: baseAppTemplate.trim(),
  })

  // Generate routes/workflow_routes.py
  files.push({
    path: "routes/workflow_routes.py",
    content: routesTemplate.trim(),
  })

  // Generate routes/__init__.py
  files.push({
    path: "routes/__init__.py",
    content: "# Routes package",
  })

  // Generate services/llm_service.py with the correct model and API key
  const llmService = llmServiceTemplate
    .replace("{model}", model)
    .replace("{api_key}", apiKey)
    .replace("{temperature}", temperature)
    .replace("{use_memory}", useMemory.toString().toLowerCase())

  files.push({
    path: "services/llm_service.py",
    content: llmService.trim(),
  })

  // Generate services/__init__.py
  files.push({
    path: "services/__init__.py",
    content: "# Services package",
  })

  // Generate utils/workflow_executor.py
  files.push({
    path: "utils/workflow_executor.py",
    content: workflowExecutorTemplate.trim(),
  })

  // Generate utils/__init__.py
  files.push({
    path: "utils/__init__.py",
    content: "# Utils package",
  })

  // Generate requirements.txt
  files.push({
    path: "requirements.txt",
    content: requirementsTemplate.trim(),
  })

  // Generate .env file
  const envFile = envFileTemplate
    .replace("{openai_api_key}", apiKey)
    .replace("{anthropic_api_key}", apiKey)
    .replace("{gemini_api_key}", apiKey)

  files.push({
    path: ".env",
    content: envFile.trim(),
  })

  // Generate README.md with memory information
  const readmeContent =
    readmeTemplate.trim() +
    `

## Memory Context

This backend ${useMemory ? "includes" : "can include"} conversation memory, allowing the LLM to remember previous interactions in a conversation.

${useMemory ? "Memory is currently **enabled**." : "Memory is currently **disabled**. To enable it, update the `use_memory` parameter in the LLMService class."}

### Memory API Endpoints

- POST /api/clear-memory
  - Clears the conversation history
  - No request body needed
  - Response: \`{ "success": true, "message": "Conversation history cleared" }\`

### How Memory Works

When memory is enabled:
1. The LLM keeps track of the conversation history
2. Each new message is added to the history
3. The full conversation context is sent with each request
4. The LLM can reference previous messages in its responses

This is useful for:
- Maintaining context in multi-turn conversations
- Building chatbots that can remember user information
- Creating assistants that can refer back to previous questions
`

  files.push({
    path: "README.md",
    content: readmeContent,
  })

  // Generate workflow.json to store the workflow configuration
  files.push({
    path: "workflow.json",
    content: JSON.stringify(workflow, null, 2),
  })

  return files
}

