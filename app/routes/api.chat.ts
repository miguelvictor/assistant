import { type UIMessage, convertToModelMessages } from "ai"

import { anthropicAgent } from "~/lib/agents/claude"
import { geminiAgent } from "~/lib/agents/gemini"
import { openaiAgent } from "~/lib/agents/openai"

import type { Route } from "./+types/api.chat"

interface RequestArgs {
  provider: "openai" | "gemini" | "anthropic"
  messages: UIMessage[]
}

export async function action({ request }: Route.ActionArgs) {
  const payload: RequestArgs = await request.json()
  const messages = await convertToModelMessages(payload.messages)
  const agent =
    payload.provider === "openai"
      ? openaiAgent
      : payload.provider === "anthropic"
        ? anthropicAgent
        : payload.provider === "gemini"
          ? geminiAgent
          : null

  if (!agent) throw new Error(`invalid provider: ${payload.provider}`)
  return await agent.stream({ messages }).then((result) => result.toUIMessageStreamResponse())
}
