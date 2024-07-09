"use client"

import { ChatRequestOptions, JSONValue } from "ai"
import { UseChatHelpers, useChat } from "ai/react"
import React, { FC, createContext, useContext, useRef, useState, useMemo, useCallback } from "react"

import { MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED } from "@/features/chat/chat-services/chat-api"
import {
  ChatThreadModel,
  ChatType,
  ConversationStyle,
  ConversationSensitivity,
  PromptBody,
  PromptMessage,
  ChatRole,
  AssistantChatMessageModel,
  UserChatMessageModel,
  ChatDocumentModel,
} from "@/features/chat/models"
import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import { TenantPreferences } from "@/features/tenant-management/models"
import { uniqueId } from "@/lib/utils"

import { FileState, useFileState } from "./chat-file/use-file-state"
interface ChatContextProps extends UseChatHelpers {
  id: string
  setChatBody: (body: PromptBody) => void
  chatBody: PromptBody
  fileState: FileState
  onChatTypeChange: (value: ChatType) => void
  onConversationStyleChange: (value: ConversationStyle) => void
  onConversationSensitivityChange: (value: ConversationSensitivity) => void
  isModalOpen?: boolean
  openModal?: () => void
  closeModal?: () => void
  chatThreadLocked: boolean
  messages: PromptMessage[]
  documents: ChatDocumentModel[]
  tenantPreferences?: TenantPreferences
}
const ChatContext = createContext<ChatContextProps | null>(null)
interface Prop {
  children: React.ReactNode
  id: string
  chats: Array<UserChatMessageModel | AssistantChatMessageModel>
  chatThread: ChatThreadModel
  documents: ChatDocumentModel[]
  chatThreadName?: ChatThreadModel["name"]
  tenantPreferences?: TenantPreferences
}
export const ChatProvider: FC<Prop> = props => {
  const { showError } = useGlobalMessageContext()
  const fileState = useFileState()
  const [chatBody, setChatBody] = useState<PromptBody>({
    id: props.chatThread.id,
    chatType: props.chatThread.chatType,
    conversationStyle: props.chatThread.conversationStyle,
    conversationSensitivity: props.chatThread.conversationSensitivity,
    chatOverFileName: props.chatThread.chatOverFileName,
    tenantId: props.chatThread.tenantId,
    userId: props.chatThread.userId,
    internalReference: props.chatThread.internalReference,
    chatThreadName: props.chatThread.name,
  })

  const onError = useCallback((error: Error): void => showError(error.message), [showError])

  const [nextId, setNextId] = useState<string | undefined>(undefined)
  const nextIdRef = useRef(nextId)
  nextIdRef.current = nextId
  const response = useChat({
    onError,
    id: props.id,
    body: chatBody,
    initialMessages: props.chats,
    generateId: () => {
      if (nextIdRef.current) {
        const returnValue = nextIdRef.current
        setNextId(undefined)
        return returnValue
      }
      return uniqueId()
    },
    sendExtraMessageFields: true,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = useCallback((): void => setIsModalOpen(true), [])
  const closeModal = useCallback((): void => setIsModalOpen(false), [])

  const onChatTypeChange = useCallback(
    (value: ChatType): void => {
      fileState.setIsFileNull(true)
      setChatBody(prev => ({ ...prev, chatType: value }))
    },
    [fileState]
  )

  const onConversationStyleChange = useCallback(
    (value: ConversationStyle): void => setChatBody(prev => ({ ...prev, conversationStyle: value })),
    []
  )
  const onConversationSensitivityChange = useCallback(
    (value: ConversationSensitivity): void => setChatBody(prev => ({ ...prev, conversationSensitivity: value })),

    []
  )

  const memoizedMessages = useMemo(
    () =>
      response.messages.map<PromptMessage>(message => {
        const dataItem = (response.data as (JSONValue & PromptMessage)[])?.find(
          data => data?.id === message.id
        ) as PromptMessage
        return {
          ...message,
          ...dataItem,
        }
      }),
    [response.messages, response.data]
  )

  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }, options: ChatRequestOptions = {}): Promise<void> => {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (!response.input) return

      const nextCompletionId = uniqueId()
      setNextId(nextCompletionId)

      await response.append(
        {
          id: uniqueId(),
          content: response.input,
          role: ChatRole.User,
        },
        { ...options, data: { completionId: nextCompletionId } }
      )

      response.setInput("")
    },
    [response]
  )

  const providerValue = useMemo(
    () => ({
      ...response,
      messages: memoizedMessages,
      documents: props.documents,
      tenantPreferences: props.tenantPreferences,
      chatThreadLocked: (props.chatThread?.contentFilterTriggerCount || 0) >= MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED,
      handleSubmit,
      setChatBody,
      chatBody,
      onChatTypeChange,
      onConversationStyleChange,
      onConversationSensitivityChange,
      fileState,
      id: props.id,
      isModalOpen,
      openModal,
      closeModal,
    }),
    [
      response,
      memoizedMessages,
      props.documents,
      props.tenantPreferences,
      props.chatThread?.contentFilterTriggerCount,
      handleSubmit,
      setChatBody,
      chatBody,
      onChatTypeChange,
      onConversationStyleChange,
      onConversationSensitivityChange,
      fileState,
      props.id,
      isModalOpen,
      openModal,
      closeModal,
    ]
  )

  return <ChatContext.Provider value={providerValue}>{props.children}</ChatContext.Provider>
}

export const useChatContext = (): ChatContextProps => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("ChatContext is null")
  }
  return context
}
