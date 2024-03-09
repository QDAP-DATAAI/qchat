import { FindAllChats } from "@/features/chat/chat-services/chat-service"
import { ChatMessageModel, ChatRole, ChatSentiment, MESSAGE_ATTRIBUTE } from "@/features/chat/chat-services/models"
import { CosmosDBContainer } from "@/features/common/services/cosmos"
import { uniqueId } from "@/lib/utils"
import { ChatCompletionMessage, ChatCompletionRole } from "openai/resources"

export interface CosmosDBChatMessageHistoryFields {
  chatThreadId: string
  userId: string
  tenantId: string
}

export class CosmosDBChatMessageHistory {
  private chatThreadId: string
  private userId: string
  private tenantId: string

  constructor({ chatThreadId, userId, tenantId }: CosmosDBChatMessageHistoryFields) {
    this.chatThreadId = chatThreadId
    this.userId = userId
    this.tenantId = tenantId
  }

  async getMessages(): Promise<ChatCompletionMessage[]> {
    const chats = await FindAllChats(this.chatThreadId)
    return mapOpenAIChatMessages(chats)
  }

  async clear(): Promise<void> {
    const container = await CosmosDBContainer.getInstance().getContainer()
    await container.delete()
  }

  async addMessage(message: ChatCompletionMessage, citations: string = ""): Promise<void> {
    try {
      const modelToSave: ChatMessageModel = {
        id: uniqueId(),
        createdAt: new Date(),
        type: MESSAGE_ATTRIBUTE,
        isDeleted: false,
        content: message.content ?? "",
        role: mapChatCompletionRoleToChatRole(message.role),
        chatThreadId: this.chatThreadId,
        userId: this.userId,
        tenantId: this.tenantId,
        context: citations,
        systemPrompt: process.env.SYSTEM_PROMPT ?? "",
        feedback: "",
        sentiment: ChatSentiment.Neutral,
        reason: "",
        contentSafetyWarning: "",
      }
      console.log("Adding message", modelToSave)
      await UpsertChat(modelToSave)
      return Promise.resolve()
    } catch (error) {
      console.error("Failed to add message", error)
      throw error
    }
  }
}

async function UpsertChat(chatModel: ChatMessageModel): Promise<ChatMessageModel> {
  const container = await CosmosDBContainer.getInstance().getContainer()
  await container.items.upsert(chatModel)
  return Promise.resolve(chatModel)
}

function mapOpenAIChatMessages(messages: ChatMessageModel[]): ChatCompletionMessage[] {
  return messages.map(message => {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
    }
  })
}

function mapChatCompletionRoleToChatRole(role: ChatCompletionRole): ChatRole {
  return role as unknown as ChatRole
}
