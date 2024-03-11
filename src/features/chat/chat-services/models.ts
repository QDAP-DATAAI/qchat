import { Message } from "ai"

export const CHAT_DOCUMENT_ATTRIBUTE = "CHAT_DOCUMENT"
export const CHAT_THREAD_ATTRIBUTE = "CHAT_THREAD"
export const MESSAGE_ATTRIBUTE = "CHAT_MESSAGE"
export const CHAT_UTILITY_ATTRIBUTE = "CHAT_UTILITY"

export enum ConversationStyle {
  Creative = "creative",
  Balanced = "balanced",
  Precise = "precise",
}

export enum ConversationSensitivity {
  Official = "official",
  Sensitive = "sensitive",
  Protected = "protected",
}

export enum ChatType {
  Simple = "simple",
  Data = "data",
  MSSQL = "mssql",
  Audio = "audio",
}

export enum FeedbackType {
  HarmfulUnsafe = "harmful / unsafe",
  Untrue = "untrue",
  Unhelpful = "unhelpful",
}

export enum ChatRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
  Function = "function",
}

export enum ChatSentiment {
  Neutral = "neutral",
  Positive = "positive",
  Negative = "negative",
}

export interface ChatMessageModel {
  id: string
  createdAt: Date
  isDeleted: boolean
  chatThreadId: string
  userId: string | undefined
  tenantId: string | undefined
  content: string
  role: ChatRole
  context: string
  type: "CHAT_MESSAGE"
  feedback: string
  sentiment: ChatSentiment
  reason: string
  systemPrompt: string
  contentSafetyWarning: string
}

export interface ChatThreadModel {
  id: string
  name: string
  previousChatName: string
  chatCategory: string
  createdAt: Date
  userId: string
  tenantId: string
  useName: string
  chatThreadId: string
  isDeleted: boolean
  chatType: ChatType
  conversationSensitivity: ConversationSensitivity
  conversationStyle: ConversationStyle
  chatOverFileName: string
  type: "CHAT_THREAD"
  offenderId?: string
  isDisabled: boolean
  systemPrompt?: string
  contextPrompt?: string
  metaPrompt?: string
  contentSafetyWarning?: string
  prompts?: string[]
  selectedPrompt?: string
  lastMessageAt: Date
}

export interface PromptGPTBody {
  chatThreadId: string
  chatType: ChatType
  conversationStyle: ConversationStyle
  conversationSensitivity: ConversationSensitivity
  chatOverFileName: string
  tenantId: string
  userId: string
  offenderId?: string
  contextPrompt?: string
  chatThreadName?: string
}

export interface PromptGPTProps extends PromptGPTBody {
  messages: Message[]
}

// export function preparePromptGPTProps(
//   props: Omit<PromptGPTProps, "messages"> & { messages: (Omit<Message, "id"> & { id?: string })[] }
// ): PromptGPTProps {
//   const messagesWithId: Message[] = props.messages.map(message => ({
//     ...message,
//     id: uniqueId(),
//   }))

//   return { ...props, messages: messagesWithId }
// }

export interface ChatDocumentModel {
  id: string
  name: string
  chatThreadId: string
  userId: string
  tenantId: string
  isDeleted: boolean
  createdAt: Date
  type: "CHAT_DOCUMENT"
}

export interface ChatUtilityModel {
  id: string
  name: string
  chatThreadId: string
  userId: string
  tenantId: string
  isDeleted: boolean
  createdAt: Date
  content: string
  role: ChatRole
  type: "CHAT_UTILITY"
}

export interface ServerActionResponse<T> {
  success: boolean
  error: string
  response: T
}
