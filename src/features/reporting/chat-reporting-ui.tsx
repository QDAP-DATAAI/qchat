import ChatRow from "@/components/chat/chat-row"
import { Card } from "@/features/ui/card"
import { FC } from "react"
import { AI_NAME } from "../theme/theme-config"
import { FindAllChatsInThread, FindChatThreadByID } from "./reporting-service"
import { ChatMessageModel, ChatRole } from "../chat/chat-services/models"

interface Props {
  chatThreadId: string
}

export const ChatReportingUI: FC<Props> = async props => {
  const chatThreads = await FindChatThreadByID(props.chatThreadId)
  const chats = await FindAllChatsInThread(props.chatThreadId)
  const chatThread = chatThreads[0]

  return (
    <Card className="relative h-full">
      <div className="h-full overflow-y-auto rounded-md">
        <div className="flex justify-center p-4"></div>
        <div className=" pb-[80px] ">
          {chats.map((message, index) => {
            return (
              <ChatRow
                chatMessageId={message.id}
                name={message.role === ChatRole.User ? chatThread.useName : AI_NAME}
                message={message.content}
                type={message.role as ChatRole}
                key={index}
                chatThreadId={props.chatThreadId}
                contentSafetyWarning={message as unknown as ChatMessageModel["contentSafetyWarning"]}
                feedback={message as unknown as ChatMessageModel["feedback"]}
                sentiment={message as unknown as ChatMessageModel["sentiment"]}
                reason={message as unknown as ChatMessageModel["reason"]}
              />
            )
          })}
        </div>
      </div>
    </Card>
  )
}
