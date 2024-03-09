"use client"

import { Button } from "@/features/ui/button"
import { MessageSquarePlus } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  CreateChatThread,
  FindChatThreadByTitleAndEmpty,
  UpdateChatThreadCreatedAt,
} from "../chat-services/chat-thread-service"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"

export const NewChat = (): JSX.Element => {
  const router = useRouter()
  const { showError } = useGlobalMessageContext()

  const startNewChat = async (): Promise<void> => {
    const title = "New Chat"

    try {
      const existingThread = await FindChatThreadByTitleAndEmpty(title)

      if (existingThread) {
        await UpdateChatThreadCreatedAt(existingThread.chatThreadId)
        router.push(`/chat/${existingThread.chatThreadId}`)
      } else {
        const newChatThread = await CreateChatThread()
        if (newChatThread && newChatThread.chatThreadId) {
          router.push(`/chat/${newChatThread.chatThreadId}`)
        }
      }
    } catch (_error) {
      showError("Failed to start a new chat. Please try again later.")
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent): Promise<void> => {
    if (e.key === "Enter") {
      await startNewChat()
    }
  }

  return (
    <Button
      className="size-[40px] gap-2 rounded-md p-1"
      variant="default"
      onClick={startNewChat}
      aria-label="Start a new chat"
      onKeyDown={handleKeyDown}
    >
      <MessageSquarePlus size={40} strokeWidth={1.2} />
    </Button>
  )
}
