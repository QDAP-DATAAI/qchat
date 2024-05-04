import { FC } from "react"

import Typography from "@/components/typography"
import { MiniNewChat } from "@/features/chat/chat-menu/mini-new-chat"

import { useChatContext } from "./chat-context"
import { ChatSelectedOptions } from "./chat-header-display/chat-selected-options"

interface Prop {}

export const ChatHeader: FC<Prop> = () => {
  const { chatBody } = useChatContext()

  return (
    <div className="flex flex-col gap-2">
      <ChatSelectedOptions />
      <div className="flex h-2 justify-center gap-2">
        <Typography variant="p" className="items-center" tabIndex={0}>
          {chatBody.chatOverFileName}
        </Typography>
      </div>
      <MiniNewChat />
    </div>
  )
}
