"use client"

import { MessageSquarePlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

import {
  CreateChatThread,
  FindChatThreadByTitleAndEmpty,
  UpdateChatThreadCreatedAt,
} from "@/features/chat/chat-services/chat-thread-service"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import { Button } from "@/features/ui/button"

const useStartNewChat = (): (() => Promise<void>) => {
  const router = useRouter()
  const { showError } = useGlobalMessageContext()

  return useCallback(async (): Promise<void> => {
    const title = "New Chat"

    try {
      const existingThread = await FindChatThreadByTitleAndEmpty(title)
      if (existingThread.status !== "OK") {
        showError("Failed to start a new chat. Please try again later.")
        return
      }

      if (!existingThread.response) {
        const newChatThread = await CreateChatThread()
        if (newChatThread.status !== "OK") throw newChatThread
        router.push(`/chat/${newChatThread.response.chatThreadId}`)
        return
      }

      await UpdateChatThreadCreatedAt(existingThread.response.chatThreadId)
      router.push(`/chat/${existingThread.response.chatThreadId}`)
    } catch (_error) {
      showError("Failed to start a new chat. Please try again later.")
    }
  }, [router, showError])
}

const NewChatButton = (): JSX.Element => {
  const startNewChat = useStartNewChat()

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        await startNewChat()
      }
    },
    [startNewChat]
  )

  return (
    <Button
      className="h-max-[40px] size-full gap-2 rounded-md p-4"
      variant="default"
      onClick={startNewChat}
      ariaLabel="Start a new chat"
      onKeyDown={handleKeyDown}
    >
      New Chat
      <MessageSquarePlus size={30} strokeWidth={1.2} className="hidden sm:block" />
    </Button>
  )
}

// const MiniNewChatButton = (): JSX.Element => {
//   const startNewChat = useStartNewChat()

//   const handleKeyDown = useCallback(
//     async (e: React.KeyboardEvent) => {
//       if (e.key === "Enter") {
//         await startNewChat()
//       }
//     },
//     [startNewChat]
//   )

//   return (
//     <div className="absolute right-4 top-4 z-50 lg:hidden">
//       <Button
//         className="size-[40px] gap-2 rounded-md p-1"
//         variant="default"
//         onClick={startNewChat}
//         ariaLabel="Start a new chat"
//         onKeyDown={handleKeyDown}
//       >
//         <MessageSquarePlus size={40} strokeWidth={1.2} aria-hidden="true" />
//       </Button>
//     </div>
//   )
// }

export const NewChat = (): JSX.Element => {
  return <NewChatButton />
}

// export const MiniNewChat = (): JSX.Element => {
//   return <MiniNewChatButton />
// }
