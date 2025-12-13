import { openai } from "@ai-sdk/openai"
import { type UIMessage, convertToModelMessages, streamText } from "ai"

import type { Route } from "./+types/api.chat"

interface RequestArgs {
  messages: UIMessage[]
  system?: string
  tools?: string[]
}

export async function action({ request }: Route.ActionArgs) {
  const payload: RequestArgs = await request.json()
  const result = streamText({
    system: payload.system ?? "You are a helpful assistant.",
    model: "openai/gpt-5-mini",
    messages: convertToModelMessages(payload.messages),
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
        reasoningEffort: "high",
        reasoningSummary: "auto",
      },
    },
  })

  return result.toUIMessageStreamResponse()
}
