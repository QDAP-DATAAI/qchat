import { FC } from "react"

import Typography from "@/components/typography"
import { MiniNewChat } from "@/features/chat/chat-menu/mini-new-chat"

import { useChatContext } from "./chat-context"
import { ChatSelectedOptions } from "./chat-header-display/chat-selected-options"

interface Prop {}

export const ChatHeader: FC<Prop> = () => {
  const { chatBody } = useChatContext()
  const files = chatBody.chatOverFileName.split(", ")

  return (
    <div className="flex items-start gap-2">
      <ChatSelectedOptions />
      <div className="flex size-auto flex-col items-center justify-center gap-1 rounded-md bg-white p-2">
        <Typography variant="p" className="items-center font-bold" tabIndex={0}>
          Uploaded Files:
        </Typography>
        {files.map((file, index) => (
          <Typography key={index} variant="span" className="mt-0 items-center" tabIndex={0}>
            {file}
          </Typography>
        ))}
      </div>
      <MiniNewChat />
    </div>
  )
}
