"use server"

import "server-only"
import { getTenantId, userHashedId, userSession } from "@/features/auth/helpers"
import { FindAllChats } from "@/features/chat/chat-services/chat-service"
import { uniqueId } from "@/lib/utils"
import { ItemResponse, Resource, SqlQuerySpec } from "@azure/cosmos"
import { CosmosDBContainer } from "../../common/services/cosmos"
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatRole,
  ChatSentiment,
  ChatThreadModel,
  ChatType,
  ConversationSensitivity,
  ConversationStyle,
  PromptGPTProps,
} from "./models"
import { FindAllChatDocuments } from "./chat-document-service"
import { deleteDocuments } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store"

function threeMonthsAgo(): string {
  const date = new Date()
  date.setMonth(date.getMonth() - 3)
  return date.toISOString()
}

export const FindAllChatThreadForCurrentUser = async (): Promise<ChatThreadModel[]> => {
  const container = await CosmosDBContainer.getInstance().getContainer()
  const tenantId = await getTenantId()
  const userId = await userHashedId()

  const partitionKey = [tenantId, userId]

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@isDeleted",
        value: false,
      },
      {
        name: "@userId",
        value: userId,
      },
      {
        name: "@tenantId",
        value: tenantId,
      },
      {
        name: "@createdAt",
        value: threeMonthsAgo(),
      },
    ],
  }

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec, {
      partitionKey,
    })
    .fetchAll()
  return resources
}

export const FindChatThreadByID = async (chatThreadId: string): Promise<ChatThreadModel[]> => {
  const container = await CosmosDBContainer.getInstance().getContainer()
  const tenantId = await getTenantId()
  const userId = await userHashedId()

  const partitionKey = [tenantId, userId]

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.chatThreadId=@chatThreadId AND r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt",
    parameters: [
      { name: "@chatThreadId", value: chatThreadId },
      { name: "@type", value: CHAT_THREAD_ATTRIBUTE },
      { name: "@isDeleted", value: false },
      { name: "@userId", value: userId },
      { name: "@tenantId", value: tenantId },
      { name: "@createdAt", value: threeMonthsAgo() },
    ],
  }

  const { resources } = await container.items
    .query<ChatThreadModel>(querySpec, {
      partitionKey,
    })
    .fetchAll()

  return resources
}

export const RenameChatThreadByID = async (
  chatThreadId: string,
  newTitle: string | Promise<string> | null
): Promise<void> => {
  const resolvedTitle = await Promise.resolve(newTitle)
  const container = await CosmosDBContainer.getInstance().getContainer()
  const threads = await FindChatThreadByID(chatThreadId)

  if (threads.length !== 0) {
    await Promise.all(
      threads.map(async thread => {
        const itemToUpdate = { ...thread, name: resolvedTitle }
        await container.items.upsert(itemToUpdate)
      })
    )
  }
}

export const SoftDeleteChatThreadByID = async (chatThreadId: string): Promise<void> => {
  const tenantId = await getTenantId()
  const userId = await userHashedId()
  const container = await CosmosDBContainer.getInstance().getContainer()
  const threads = await FindChatThreadByID(chatThreadId)

  if (threads.length !== 0) {
    const chats = await FindAllChats(chatThreadId)

    chats.forEach(async chat => {
      const itemToUpdate = {
        ...chat,
      }
      itemToUpdate.isDeleted = true
      await container.items.upsert(itemToUpdate)
    })

    const chatDocuments = await FindAllChatDocuments(chatThreadId)

    if (chatDocuments.length !== 0) {
      await deleteDocuments(chatThreadId, userId, tenantId)
    }

    chatDocuments.forEach(async chatDocument => {
      const itemToUpdate = {
        ...chatDocument,
      }
      itemToUpdate.isDeleted = true
      await container.items.upsert(itemToUpdate)
    })

    threads.forEach(async thread => {
      const itemToUpdate = {
        ...thread,
      }
      itemToUpdate.isDeleted = true
      await container.items.upsert(itemToUpdate)
    })
  }
}

export const EnsureChatThreadIsForCurrentUser = async (chatThreadId: string): Promise<ChatThreadModel> => {
  const modelToSave = await FindChatThreadByID(chatThreadId)
  if (modelToSave.length === 0) {
    throw new Error("Chat thread not found")
  }

  return modelToSave[0]
}

export const UpsertChatThread = async (chatThread: ChatThreadModel): Promise<ItemResponse<ChatThreadModel>> => {
  const container = await CosmosDBContainer.getInstance().getContainer()
  const updatedChatThread = await container.items.upsert<ChatThreadModel>(chatThread)

  if (updatedChatThread === undefined) {
    throw new Error("Chat thread not found")
  }

  return updatedChatThread
}

export const updateChatThreadTitle = async (
  chatThread: ChatThreadModel,
  messages: ChatMessageModel[],
  chatType: ChatType,
  conversationStyle: ConversationStyle,
  conversationSensitivity: ConversationSensitivity,
  chatOverFileName: string,
  _userMessage: string
): Promise<ChatThreadModel> => {
  if (messages.length === 0) {
    const updatedChatThread = await UpsertChatThread({
      ...chatThread,
      chatType: chatType,
      chatCategory: "Uncategorised",
      chatOverFileName: chatOverFileName,
      conversationStyle: conversationStyle,
      conversationSensitivity: conversationSensitivity,
      name: "New Chat",
      previousChatName: "",
    })

    return updatedChatThread.resource!
  }

  return chatThread
}

export const CreateChatThread = async (): Promise<(ChatThreadModel & Resource) | undefined> => {
  const id = uniqueId()
  const modelToSave: ChatThreadModel = {
    name: "New Chat",
    previousChatName: "",
    chatCategory: "Uncategorised",
    useName: (await userSession())!.name,
    userId: await userHashedId(),
    id: id,
    chatThreadId: id,
    tenantId: await getTenantId(),
    createdAt: new Date(),
    isDeleted: false,
    isDisabled: false,
    contentSafetyWarning: "",
    chatType: ChatType.Simple,
    conversationStyle: ConversationStyle.Precise,
    conversationSensitivity: ConversationSensitivity.Official,
    type: CHAT_THREAD_ATTRIBUTE,
    systemPrompt: "",
    contextPrompt: "",
    metaPrompt: "",
    chatOverFileName: "",
    prompts: [],
    selectedPrompt: "",
    lastMessageAt: new Date(),
  }

  const container = await CosmosDBContainer.getInstance().getContainer()
  const response = await container.items.create<ChatThreadModel>(modelToSave)
  return response.resource
}

export const initAndGuardChatSession = async (
  props: PromptGPTProps
): Promise<{
  chatThreadId: string
  updatedLastHumanMessage: ChatMessageModel
  chats: ChatMessageModel[]
  chatThread: ChatThreadModel
}> => {
  const { messages, chatThreadId, chatType, conversationStyle, conversationSensitivity, chatOverFileName } = props

  const lastHumanMessage = messages[messages.length - 1]

  const currentChatThread = await EnsureChatThreadIsForCurrentUser(chatThreadId)
  const chats = await FindAllChats(chatThreadId)

  const chatThread = await updateChatThreadTitle(
    currentChatThread,
    chats,
    chatType,
    conversationStyle,
    conversationSensitivity,
    chatOverFileName,
    lastHumanMessage.content
  )

  const updatedLastHumanMessage: ChatMessageModel = {
    ...lastHumanMessage,
    isDeleted: false,
    chatThreadId: chatThreadId,
    userId: currentChatThread.userId,
    tenantId: currentChatThread.tenantId,
    context: "",
    type: "CHAT_MESSAGE",
    feedback: "",
    sentiment: ChatSentiment.Neutral,
    reason: "",
    systemPrompt: "",
    contentSafetyWarning: "",
    createdAt: new Date(),
    role: ChatRole.User,
  }

  return {
    chatThreadId,
    updatedLastHumanMessage,
    chats,
    chatThread,
  }
}

export const FindChatThreadByTitleAndEmpty = async (title: string): Promise<ChatThreadModel | undefined> => {
  const container = await CosmosDBContainer.getInstance().getContainer()

  const querySpec = {
    query:
      "SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.name=@name AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@name",
        value: title,
      },
      {
        name: "@isDeleted",
        value: false,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@tenantId",
        value: await getTenantId(),
      },
      {
        name: "@createdAt",
        value: threeMonthsAgo(),
      },
    ],
  }
  const { resources } = await container.items.query<ChatThreadModel>(querySpec).fetchAll()

  for (const chatThread of resources) {
    const messages = await FindAllChats(chatThread.chatThreadId)

    if (messages.length === 0) {
      return chatThread
    }
  }

  return undefined
}

export const UpdateChatThreadCreatedAt = async (chatThreadId: string): Promise<ChatThreadModel> => {
  const container = await CosmosDBContainer.getInstance().getContainer()
  const threads = await FindChatThreadByID(chatThreadId)

  if (threads.length !== 0) {
    const threadToUpdate = threads[0]
    threadToUpdate.createdAt = new Date()
    threadToUpdate.chatType = ChatType.Simple
    threadToUpdate.conversationStyle = ConversationStyle.Precise
    threadToUpdate.conversationSensitivity = ConversationSensitivity.Official
    threadToUpdate.chatOverFileName = ""
    threadToUpdate.offenderId = ""

    await container.items.upsert(threadToUpdate)
    return threadToUpdate
  } else {
    throw new Error("Chat thread not found")
  }
}

export const AssociateOffenderWithChatThread = async (
  chatThreadId: string,
  offenderId: string | undefined
): Promise<(ChatThreadModel & Resource) | undefined> => {
  const container = await CosmosDBContainer.getInstance().getContainer()
  const threads = await FindChatThreadByID(chatThreadId)
  if (threads.length === 0) {
    throw new Error("Chat thread not found")
  }
  const threadToUpdate = threads[0]
  threadToUpdate.offenderId = offenderId
  const updatedThread = await container.items.upsert<ChatThreadModel>(threadToUpdate)
  if (!updatedThread) {
    throw new Error("Failed to associate offender with chat thread")
  }
  return updatedThread.resource
}
