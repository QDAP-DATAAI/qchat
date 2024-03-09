import { FindAllChats } from "@/features/chat/chat-services/chat-service"
import { FindChatThreadByID } from "@/features/chat/chat-services/chat-thread-service"
import { ChatProvider } from "@/features/chat/chat-ui/chat-context"
import { ChatUI } from "@/features/chat/chat-ui/chat-ui"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Home({ params }: { params: { chatThreadId: string } }): Promise<JSX.Element> {
  const [items, thread] = await Promise.all([
    FindAllChats(params.chatThreadId),
    FindChatThreadByID(params.chatThreadId),
  ])

  if (thread.length === 0) {
    notFound()
  }

  return (
    <ChatProvider chatThreadId={params.chatThreadId} chats={items} chatThread={thread[0]}>
      <ChatUI />
    </ChatProvider>
  )
}
