import {
  type ReasoningGroupComponent,
  type ReasoningMessagePartComponent,
  useAssistantState,
  useScrollLock,
} from "@assistant-ui/react"
import { BrainIcon, ChevronRightIcon } from "lucide-react"
import { type FC, type PropsWithChildren, memo, useCallback, useRef, useState } from "react"

import { MarkdownText } from "~/components/assistant-ui/markdown-text"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { cn } from "~/lib/utils"

const ANIMATION_DURATION = 200

/**
 * Root collapsible container that manages open/closed state and scroll lock.
 * Provides animation timing via CSS variable and prevents scroll jumps on collapse.
 */
const ReasoningRoot: FC<
  PropsWithChildren<{
    className?: string
  }>
> = ({ className, children }) => {
  const collapsibleRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const lockScroll = useScrollLock(collapsibleRef, ANIMATION_DURATION)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        lockScroll()
      }
      setIsOpen(open)
    },
    [lockScroll],
  )

  return (
    <Collapsible
      ref={collapsibleRef}
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn("aui-reasoning-root mb-4 w-full", className)}
      style={
        {
          "--animation-duration": `${ANIMATION_DURATION}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </Collapsible>
  )
}

ReasoningRoot.displayName = "ReasoningRoot"

/**
 * Trigger button for the Reasoning collapsible.
 * Composed of icons, label, and text shimmer animation when reasoning is being streamed.
 */
const PATTERN = /^\*\*(.+)\*\*/
const ReasoningTrigger: FC<{ className?: string }> = ({ className }) => {
  const active = useAssistantState(({ message }) => {
    if (message.status?.type !== "running") return false
    const lastIndex = message.parts.length - 1
    if (lastIndex < 0) return false
    return true
  })

  const header = useAssistantState(({ message }) => {
    // find the last reasoning and web search tool-call parts
    const lastReasoningPartIdx = message.parts.findLastIndex((part) => part.type === "reasoning")
    const lastSearchPartIdx = message.parts.findLastIndex(
      (part) => part.type === "tool-call" && part.toolName === "web_search" && part.status.type === "complete",
    )

    // determine which part is later
    const lastPartIdx = Math.max(lastReasoningPartIdx, lastSearchPartIdx)
    if (lastPartIdx === -1) return "Thinking"

    // extract header from the last reasoning part
    const lastPart = message.parts[lastPartIdx]
    if (lastPart.type === "reasoning") {
      const match = PATTERN.exec(lastPart.text)
      if (!match) console.warn("Failed to extract reasoning header", { text: lastPart.text })
      return match ? match[1].trim() : "Thinking"
    }

    // assertion of the web_search tool
    if (lastPart.type !== "tool-call" || lastPart.toolName !== "web_search" || lastPart.status.type !== "complete")
      throw new Error("Unexpected tool-call part status")

    // extract header from the last web search part's reasoning (if available)
    const result = (lastPart.result as any).action as
      | { type: "search"; query: string }
      | { type: "openPage"; url: string }

    if (!result) return "Searching the web"
    if (result.type === "search") return `Searching web for ${result.query}`
    if (result.type === "openPage") return `Reading page at ${result.url}`

    return "Doing something else"
  })

  console.log({ active, header })

  return (
    <CollapsibleTrigger
      className={cn(
        "aui-reasoning-trigger group/trigger text-muted-foreground hover:text-foreground -mb-2 flex max-w-[75%] items-center gap-2 py-2 text-sm transition-colors",
        className,
      )}
    >
      <BrainIcon className="aui-reasoning-trigger-icon size-4 shrink-0" />
      <div className="aui-reasoning-trigger-label-wrapper relative line-clamp-1 inline-block text-left tracking-tighter">
        {active ? header : "Thought for 22s"}
      </div>
      {!active && (
        <ChevronRightIcon
          className={cn(
            "aui-reasoning-trigger-chevron mt-0.5 size-4 shrink-0",
            "transition-transform duration-(--animation-duration) ease-out",
            "group-data-[state=closed]/trigger:-rotate-90",
            "group-data-[state=open]/trigger:rotate-0",
          )}
        />
      )}
    </CollapsibleTrigger>
  )
}

/**
 * Collapsible content wrapper that handles height expand/collapse animation.
 * Animation: Height animates up (collapse) and down (expand).
 * Also provides group context for child animations via data-state attributes.
 */
const ReasoningContent: FC<
  PropsWithChildren<{
    className?: string
    "aria-busy"?: boolean
  }>
> = ({ className, children, "aria-busy": ariaBusy }) => (
  <CollapsibleContent
    className={cn(
      "aui-reasoning-content text-muted-foreground relative overflow-hidden text-sm outline-none",
      "group/collapsible-content ease-out",
      "data-[state=closed]:animate-collapsible-up",
      "data-[state=open]:animate-collapsible-down",
      "data-[state=closed]:fill-mode-forwards",
      "data-[state=closed]:pointer-events-none",
      "data-[state=open]:duration-(--animation-duration)",
      "data-[state=closed]:duration-(--animation-duration)",
      className,
    )}
    aria-busy={ariaBusy}
  >
    {children}
  </CollapsibleContent>
)

ReasoningContent.displayName = "ReasoningContent"

/**
 * Text content wrapper that animates the reasoning text visibility.
 * Animation: Slides in from top + fades in when opening, reverses when closing.
 * Reacts to parent ReasoningContent's data-state via Radix group selectors.
 */
const ReasoningText: FC<
  PropsWithChildren<{
    className?: string
  }>
> = ({ className, children }) => (
  <div
    className={cn(
      "aui-reasoning-text relative z-0 space-y-4 pt-4 pl-6 leading-relaxed",
      "transform-gpu transition-[transform,opacity]",
      "group-data-[state=open]/collapsible-content:animate-in",
      "group-data-[state=closed]/collapsible-content:animate-out",
      "group-data-[state=open]/collapsible-content:fade-in-0",
      "group-data-[state=closed]/collapsible-content:fade-out-0",
      "group-data-[state=open]/collapsible-content:slide-in-from-top-4",
      "group-data-[state=closed]/collapsible-content:slide-out-to-top-4",
      "group-data-[state=open]/collapsible-content:duration-(--animation-duration)",
      "group-data-[state=closed]/collapsible-content:duration-(--animation-duration)",
      "[&_p]:-mb-2",
      className,
    )}
  >
    {children}
  </div>
)

ReasoningText.displayName = "ReasoningText"

/**
 * Renders a single reasoning part's text with markdown support.
 * Consecutive reasoning parts are automatically grouped by ReasoningGroup.
 *
 * Pass Reasoning to MessagePrimitive.Parts in thread.tsx
 *
 * @example:
 * ```tsx
 * <MessagePrimitive.Parts
 *   components={{
 *     Reasoning: Reasoning,
 *     ReasoningGroup: ReasoningGroup,
 *   }}
 * />
 * ```
 */
const ReasoningImpl: ReasoningMessagePartComponent = () => <MarkdownText />

/**
 * Collapsible wrapper that groups consecutive reasoning parts together.
 *  Includes scroll lock to prevent page jumps during collapse animation.
 *
 *  Pass ReasoningGroup to MessagePrimitive.Parts in thread.tsx
 *
 * @example:
 * ```tsx
 * <MessagePrimitive.Parts
 *   components={{
 *     Reasoning: Reasoning,
 *     ReasoningGroup: ReasoningGroup,
 *   }}
 * />
 * ```
 */
const ReasoningGroupImpl: ReasoningGroupComponent = ({ children, startIndex }) => {
  const isFirstReasoning = startIndex === 0 || startIndex === 1
  if (!isFirstReasoning) return null

  return (
    <ReasoningRoot>
      <ReasoningTrigger />
      <ReasoningContent>
        <ReasoningText>{children}</ReasoningText>
      </ReasoningContent>
    </ReasoningRoot>
  )
}

export const Reasoning = memo(ReasoningImpl)
Reasoning.displayName = "Reasoning"

export const ReasoningGroup = memo(ReasoningGroupImpl)
ReasoningGroup.displayName = "ReasoningGroup"
