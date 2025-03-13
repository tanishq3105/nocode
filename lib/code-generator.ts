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
`

// Replace the llmServiceTemplate with this Langchain-based version
const llmServiceTemplate = `
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_community.llms import HuggingFaceEndpoint
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
import os
from typing import Dict, Any, Optional

class LLMService:
    def __init__(self, model='{model}', api_key='{api_key}', temperature={temperature}):
        self.model = model
        self.api_key = api_key
        self.temperature = float(temperature)
        self._llm = self._initialize_llm()
        
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

# Create a default instance
default_llm = LLMService()
`

// Replace the workflowExecutorTemplate with this updated version
const workflowExecutorTemplate = `
from services.llm_service import default_llm

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
            "model": llm_response["model"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Workflow execution failed: {str(e)}"
        }
`

// Update the requirementsTemplate to include Langchain
const requirementsTemplate = `
flask
flask-cors
requests
python-dotenv
langchain
langchain-openai
langchain-anthropic
langchain-community
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
  const envFile = envFileTemplate.replace("{openai_api_key}", apiKey).replace("{anthropic_api_key}", apiKey).replace("{gemini_api_key}",apiKey)

  files.push({
    path: ".env",
    content: envFile.trim(),
  })

  // Generate README.md
  files.push({
    path: "README.md",
    content: readmeTemplate.trim(),
  })

  // Generate workflow.json to store the workflow configuration
  files.push({
    path: "workflow.json",
    content: JSON.stringify(workflow, null, 2),
  })

  return files
}

