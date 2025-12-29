import { type GoogleGenerativeAIProviderOptions, google } from "@ai-sdk/google"
import { ToolLoopAgent, stepCountIs } from "ai"

import { SYSTEM_PROMPT } from "../prompt"

export const geminiAgent = new ToolLoopAgent({
  model: google("gemini-3-pro-preview"),
  instructions: SYSTEM_PROMPT,
  stopWhen: stepCountIs(50),
  tools: {
    google_search: google.tools.googleSearch({}),
  },
  providerOptions: {
    google: {
      thinkingConfig: {
        thinkingLevel: "high",
        includeThoughts: true,
      },
    } satisfies GoogleGenerativeAIProviderOptions,
  },
})
