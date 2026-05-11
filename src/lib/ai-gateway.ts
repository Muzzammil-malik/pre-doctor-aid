import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Groq provider (OpenAI-compatible).
 * Get your API key at https://console.groq.com/keys
 * and put it in `.env` as GROQ_API_KEY=...
 */
export function createGroqProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}