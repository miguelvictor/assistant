import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk"

import { Thread } from "~/components/assistant-ui/thread"

export function meta() {
  return [{ title: "New React Router App" }, { name: "description", content: "Welcome to React Router!" }]
}

export default function Home() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: "/api/chat" }),
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-svh">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  )
}
