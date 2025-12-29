import { type AnthropicProviderOptions, anthropic } from "@ai-sdk/anthropic"
import { ToolLoopAgent, stepCountIs } from "ai"

import { SYSTEM_PROMPT } from "../prompt"

export const anthropicAgent = new ToolLoopAgent({
  model: anthropic("claude-opus-4-5-20251101"),
  instructions: SYSTEM_PROMPT,
  stopWhen: stepCountIs(50),
  tools: {
    web_search: anthropic.tools.webSearch_20250305({
      userLocation: {
        type: "approximate",
        country: "SE",
        city: "Stockholm",
      },
    }),
  },
  providerOptions: {
    anthropic: {
      thinking: {
        type: "enabled",
        budgetTokens: 24_000,
      },
    } satisfies AnthropicProviderOptions,
  },
})
