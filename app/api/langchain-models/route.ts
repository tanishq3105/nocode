import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // This endpoint provides information about available Langchain-supported models
  const models = [
    {
      provider: "OpenAI",
      models: [
        { id: "gpt-4o", name: "GPT-4o" },
        { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
        { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
      ],
      apiKeyEnv: "OPENAI_API_KEY",
    },
    {
      provider: "Anthropic",
      models: [
        { id: "claude-3-opus", name: "Claude 3 Opus" },
        { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
        { id: "claude-3-haiku", name: "Claude 3 Haiku" },
      ],
      apiKeyEnv: "ANTHROPIC_API_KEY",
    },
    {
      provider: "Google",
      models: [
        { id: "gemini-2.0-flash", name: "Gemini" },
        
      ],
      apiKeyEnv: "ANTHROPIC_API_KEY",
    },
    {
      provider: "Hugging Face",
      models: [
        { id: "meta-llama/Llama-2-70b-chat-hf", name: "Meta Llama 2 70B" },
        { id: "mistralai/Mistral-7B-Instruct-v0.2", name: "Mistral 7B Instruct" },
        { id: "google/gemma-7b-it", name: "Google Gemma 7B" },
      ],
      apiKeyEnv: "HUGGINGFACEHUB_API_TOKEN",
    },
  ]

  return NextResponse.json({
    success: true,
    models,
  })
}

