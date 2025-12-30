import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk"
import { useQueryState } from "nuqs"

import { Thread } from "~/components/assistant-ui/thread"
import { ProviderSelector } from "~/components/provider-selector"

export function meta() {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }]
}

export default function Home() {
  const [provider, setProvider] = useQueryState("provider", { defaultValue: "gemini" })
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: { provider },
    }),
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ProviderSelector value={provider} onChange={setProvider} />
      <div className="h-svh pt-8">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}
