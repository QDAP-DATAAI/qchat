import { ChatCompletionMessageParam, ChatCompletionRole } from "openai/resources"

import { ChatMessageModel, ChatRole } from "@/features/chat/models"

export function mapOpenAIChatMessages(messages: ChatMessageModel[]): ChatCompletionMessageParam[] {
  return messages.map(mapOpenAIChatMessage)
}

export function mapOpenAIChatMessage(message: ChatMessageModel): ChatCompletionMessageParam {
  return {
    role: message.role,
    content: message.content,
    name: message.name,
  } as ChatCompletionMessageParam
}

export function mapChatCompletionRoleToChatRole(role: ChatCompletionRole): ChatRole {
  return role as unknown as ChatRole
}
