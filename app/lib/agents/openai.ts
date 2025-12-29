import { openai } from "@ai-sdk/openai"
import { ToolLoopAgent, stepCountIs } from "ai"

import { SYSTEM_PROMPT } from "../prompt"

export const openaiAgent = new ToolLoopAgent({
  model: openai("gpt-5.2"),
  instructions: SYSTEM_PROMPT,
  stopWhen: stepCountIs(50),
  tools: {
    web_search: openai.tools.webSearch({
      externalWebAccess: true,
      searchContextSize: "high",
      userLocation: {
        type: "approximate",
        city: "Stockholm",
        region: "Stockholm",
        country: "SE",
      },
    }),
  },
  providerOptions: {
    openai: {
      reasoningEffort: "xhigh",
      reasoningSummary: "auto",
    },
  },
})
