import { Message } from "ai"
import { Menu, File, Clipboard } from "lucide-react"
import { getSession } from "next-auth/react"
import React, { useEffect, useRef, useCallback } from "react"

import { APP_NAME } from "@/app-global"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/features/ui/dropdown-menu"

interface ChatInputMenuProps {
  onDocExport: () => void
  messageCopy: Message[]
}
const ChatInputMenu: React.FC<ChatInputMenuProps> = ({ onDocExport }) => {
  const { messages } = useChatContext()
  const firstMenuItemRef = useRef<HTMLDivElement>(null)
  const { showError, showSuccess } = useGlobalMessageContext()
  useEffect(() => {
    if (firstMenuItemRef.current) {
      firstMenuItemRef.current.focus()
    }
  }, [])

  const copyToClipboard = useCallback(async (): Promise<void> => {
    try {
      const session = await getSession()
      const name = session?.user?.name || "You"
      const formattedMessages = messages
        .map(message => {
          const author = message.role === "system" || message.role === "assistant" ? APP_NAME : name
          return `${author}: ${message.content}`
        })
        .join("\n")
      const formattedMessagesWithAttribution = `${formattedMessages}\n\nChat generated by ${APP_NAME}`
      await navigator.clipboard.writeText(formattedMessagesWithAttribution)
      showSuccess({ title: "Copied", description: "Conversation copied to clipboard" })
    } catch (_error) {
      showError("Failed to copy messages to clipboard. Click to download the chat document.", onDocExport)
    }
  }, [messages, showError, showSuccess, onDocExport])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu aria-hidden="true" focusable="false" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        id="chat-input-options"
        role="menu"
        aria-label="Chat input options"
        className="z-90 min-w-[220px] rounded-md p-[5px] shadow-lg"
        sideOffset={5}
      >
        <DropdownMenuItem onSelect={onDocExport} className="flex cursor-pointer items-center rounded-md p-2">
          <File size={20} className="mr-2" aria-hidden="true" />
          Export your Chat to File
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2 h-px bg-primary" />
        <DropdownMenuItem onSelect={copyToClipboard} className="flex cursor-pointer items-center rounded-md p-2">
          <Clipboard size={20} className="mr-2" aria-hidden="true" />
          Copy Chat to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ChatInputMenu
