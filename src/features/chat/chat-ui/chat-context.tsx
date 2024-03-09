"use client"

import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import { Message } from "ai"
import { UseChatHelpers, useChat } from "ai/react"
import React, { FC, createContext, useContext, useState } from "react"
import {
  ChatMessageModel,
  ChatThreadModel,
  ChatType,
  ConversationStyle,
  ConversationSensitivity,
  PromptGPTBody,
} from "../chat-services/models"
import { transformCosmosToAIModel } from "../chat-services/utils"
import { FileState, useFileState } from "./chat-file/use-file-state"
import { SpeechToTextProps, useSpeechToText } from "./chat-speech/use-speech-to-text"
import { TextToSpeechProps, useTextToSpeech } from "./chat-speech/use-text-to-speech"
import { usePathname, useRouter } from "next/navigation"

interface ChatContextProps extends UseChatHelpers {
  chatThreadId: string
  setChatBody: (body: PromptGPTBody) => void
  chatBody: PromptGPTBody
  fileState: FileState
  onChatTypeChange: (value: ChatType) => void
  onConversationStyleChange: (value: ConversationStyle) => void
  onConversationSensitivityChange: (value: ConversationSensitivity) => void
  speech: TextToSpeechProps & SpeechToTextProps
  isModalOpen?: boolean
  openModal?: () => void
  closeModal?: () => void
  offenderId?: string
}

const ChatContext = createContext<ChatContextProps | null>(null)

interface Prop {
  children: React.ReactNode
  chatThreadId: string
  chats: Array<ChatMessageModel>
  chatThread: ChatThreadModel
  offenderId?: string
  chatThreadName?: ChatThreadModel["name"]
}

export const ChatProvider: FC<Prop> = props => {
  const { showError } = useGlobalMessageContext()
  const Router = useRouter()
  const path = usePathname()
  const speechSynthesizer = useTextToSpeech()
  const speechRecognizer = useSpeechToText({
    onSpeech(value) {
      response.setInput(value)
    },
  })

  const fileState = useFileState()

  const [chatBody, setBody] = useState<PromptGPTBody>({
    chatThreadId: props.chatThreadId,
    chatType: props.chatThread.chatType,
    conversationStyle: props.chatThread.conversationStyle,
    conversationSensitivity: props.chatThread.conversationSensitivity,
    chatOverFileName: props.chatThread.chatOverFileName,
    tenantId: props.chatThread.tenantId,
    userId: props.chatThread.userId,
    offenderId: props.chatThread.offenderId,
    chatThreadName: props.chatThread.name,
  })

  const { textToSpeech } = speechSynthesizer
  const { isMicrophoneUsed, resetMicrophoneUsed } = speechRecognizer

  const response = useChat({
    onError,
    id: props.chatThreadId,
    body: chatBody,
    initialMessages: transformCosmosToAIModel(props.chats),
    onFinish: async (lastMessage: Message) => {
      if (isMicrophoneUsed) {
        textToSpeech(lastMessage.content)
        resetMicrophoneUsed()
      }
      if (!path.includes("chat")) {
        window.history.pushState({}, "", `/chat/${props.chatThreadId}`)
      }
    },
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = (): void => setIsModalOpen(true)
  const closeModal = (): void => setIsModalOpen(false)

  const validateChatBody = (newBody: PromptGPTBody): boolean => {
    return newBody.chatThreadId !== undefined && newBody.chatType !== undefined
  }

  const setChatBody = (body: PromptGPTBody): void => {
    if (!validateChatBody(body)) {
      showError("Invalid chat body")
      Router.refresh()
      return
    }
    if (JSON.stringify(body) === JSON.stringify(chatBody)) {
      return
    }
    setBody(body)
  }

  const onChatTypeChange = (value: ChatType): boolean => {
    if (value === chatBody.chatType) {
      return false
    }
    try {
      fileState.setShowFileUpload(value)
      fileState.setIsFileNull(true)
      setChatBody({ ...chatBody, chatType: value })
    } catch (error) {
      showError((error as Error).message)
      return false
    }
    return true
  }

  const onConversationStyleChange = (value: ConversationStyle): boolean => {
    if (value === chatBody.conversationStyle) {
      return false
    }
    setChatBody({ ...chatBody, conversationStyle: value })
    return true
  }

  const onConversationSensitivityChange = (value: ConversationSensitivity): boolean => {
    if (value === chatBody.conversationSensitivity) {
      return false
    }
    setChatBody({ ...chatBody, conversationSensitivity: value })
    return true
  }

  function onError(error: Error): void {
    showError(error.message, response.reload)
  }

  return (
    <ChatContext.Provider
      value={{
        ...response,
        setChatBody,
        chatBody,
        onChatTypeChange,
        onConversationStyleChange,
        onConversationSensitivityChange,
        fileState,
        chatThreadId: props.chatThreadId,
        speech: {
          ...speechSynthesizer,
          ...speechRecognizer,
        },
        isModalOpen,
        openModal,
        closeModal,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  )
}

export const useChatContext = (): ChatContextProps => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("Chat context must be used within a ChatProvider")
  }
  return context
}
