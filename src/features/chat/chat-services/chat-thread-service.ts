"use server"
import "server-only"

import { SqlQuerySpec } from "@azure/cosmos"

import { getTenantId, userHashedId, userSession } from "@/features/auth/helpers"
import { deleteDocuments } from "@/features/chat/chat-services/azure-cog-search/azure-cog-vector-store"
import { DEFAULT_MONTHS_AGO } from "@/features/chat/constants"
import {
  ChatRecordType,
  ChatThreadModel,
  ChatType,
  ConversationSensitivity,
  ConversationStyle,
  PromptProps,
} from "@/features/chat/models"
import { xMonthsAgo } from "@/features/common/date-helper"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { HistoryContainer } from "@/features/common/services/cosmos-service"
import logger from "@/features/insights/app-insights"
import { uniqueId } from "@/lib/utils"

import { FindAllChatDocumentsForCurrentThread } from "./chat-document-service"
import { FindAllChatMessagesForCurrentThread } from "./chat-message-service"

export const FindAllChatThreadForCurrentUser = async (): ServerActionResponseAsync<ChatThreadModel[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items
      .query<ChatThreadModel>(query, {
        partitionKey: [tenantId, userId],
      })
      .fetchAll()
    return {
      status: "OK",
      response: resources,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindChatThreadById = async (chatThreadId: string): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.id=@id AND r.type=@type AND r.isDeleted=@isDeleted AND r.userId=@userId AND r.tenantId=@tenantId AND r.createdAt >= @createdAt",
      parameters: [
        { name: "@id", value: chatThreadId },
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const { resources } = await container.items
      .query<ChatThreadModel>(query, {
        partitionKey: [tenantId, userId],
      })
      .fetchAll()

    if (!resources.length)
      return {
        status: "NOT_FOUND",
        errors: [{ message: "Chat thread not found" }],
      }

    return {
      status: "OK",
      response: resources[0],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpdateChatThreadTitle = async (
  chatThreadId: string,
  newTitle: string
): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    logger.event("UpdateChatThreadTitle", { chatThreadId, newTitle })
    const response = await FindChatThreadById(chatThreadId)
    if (response.status !== "OK") return response
    const chatThread = response.response
    chatThread.previousChatName = chatThread.name
    chatThread.name = newTitle.substring(0, 30)
    return await UpsertChatThread(chatThread)
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpdateChatThreadToFileDetails = async (
  chatThreadId: string,
  newType: ChatType,
  indexId: string,
  chatOverFileName: string
): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    logger.event("UpdateChatThreadToFileDetails", { chatThreadId, newType, chatOverFileName })
    const response = await FindChatThreadById(chatThreadId)
    if (response.status !== "OK") return response
    const chatThread = response.response
    chatThread.name = `Chat with ${chatOverFileName}`
    chatThread.chatType = newType
    chatThread.chatOverFileName = chatOverFileName
    chatThread.indexId = indexId
    return await UpsertChatThread(chatThread)
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const SoftDeleteChatThreadForCurrentUser = async (
  chatThreadId: string
): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    logger.event("SoftDeleteChatThreadForCurrentUser", { chatThreadId })

    const chatThreadResponse = await FindChatThreadById(chatThreadId)
    if (chatThreadResponse.status !== "OK") return chatThreadResponse

    const chatMessagesResponse = await FindAllChatMessagesForCurrentThread(chatThreadId)
    if (chatMessagesResponse.status !== "OK") return chatMessagesResponse

    const container = await HistoryContainer()

    const chatMessagesPromises = chatMessagesResponse.response.map(
      async chat => await container.items.upsert({ ...chat, isDeleted: true })
    )
    await Promise.all(chatMessagesPromises)

    const chatDocumentsResponse = await FindAllChatDocumentsForCurrentThread(chatThreadId)
    if (chatDocumentsResponse.status !== "OK") return chatDocumentsResponse
    if (chatDocumentsResponse.response.length) {
      const indexId = chatDocumentsResponse.response[0].indexId
      const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
      await deleteDocuments(chatThreadId, userId, tenantId, indexId)
      const chatDocumentsPromises = chatDocumentsResponse.response.map(
        async chat => await container.items.upsert({ ...chat, isDeleted: true })
      )
      await Promise.all(chatDocumentsPromises)
    }

    await container.items.upsert({ ...chatThreadResponse.response, isDeleted: true })
    return {
      status: "OK",
      response: chatThreadResponse.response,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpsertChatThread = async (chatThread: ChatThreadModel): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    logger.event("UpsertChatThread", { chatThreadId: chatThread.id })
    if (chatThread.id) {
      const response = await EnsureChatThreadOperation(chatThread.id)
      if (response.status !== "OK") return response
    }

    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatThreadModel>(chatThread)

    if (resource) {
      return {
        status: "OK",
        response: resource,
      }
    }

    return {
      status: "ERROR",
      errors: [{ message: "Chat thread not found" }],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

const EnsureChatThreadOperation = async (chatThreadId: string): ServerActionResponseAsync<ChatThreadModel> => {
  const response = await FindChatThreadById(chatThreadId)
  if (response.status !== "OK") return response

  const [currentUser, hashedId] = await Promise.all([userSession(), userHashedId()])
  if (!currentUser?.admin && response.response.userId !== hashedId)
    return {
      status: "ERROR",
      errors: [{ message: "Unauthorized access" }],
    }
  return response
}

export const CreateChatThread = async (title?: string): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const [userId, tenantId, session] = await Promise.all([userHashedId(), getTenantId(), userSession()])
    if (!session)
      return {
        status: "ERROR",
        errors: [{ message: "No active user session" }],
      }

    logger.event("CreateChatThread", { userId, tenantId })

    const id = uniqueId()
    const modelToSave: ChatThreadModel = {
      name: title || "New Chat",
      previousChatName: "",
      chatCategory: "None",
      useName: session.name,
      userId,
      id,
      chatThreadId: id,
      tenantId,
      createdAt: new Date(),
      isDeleted: false,
      isDisabled: false,
      chatType: ChatType.Simple,
      conversationStyle: ConversationStyle.Precise,
      conversationSensitivity: ConversationSensitivity.Official,
      type: ChatRecordType.Thread,
      indexId: "",
      chatOverFileName: "",
    }

    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatThreadModel>(modelToSave)
    if (!resource) {
      return {
        status: "ERROR",
        errors: [{ message: "Chat thread not created" }],
      }
    }

    return {
      status: "OK",
      response: resource,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export type InitChatSessionResponse = {
  chatThread: ChatThreadModel
}

export const InitThreadSession = async (props: PromptProps): ServerActionResponseAsync<InitChatSessionResponse> => {
  const { id: chatThreadId, chatType, conversationStyle, conversationSensitivity, chatOverFileName, indexId } = props

  logger.event("InitThreadSession", {
    chatThreadId,
    chatType,
    conversationStyle,
    conversationSensitivity,
    chatOverFileName,
    indexId,
  })

  const currentChatThreadResponse = await EnsureChatThreadOperation(chatThreadId)
  if (currentChatThreadResponse.status !== "OK") return currentChatThreadResponse

  const chatMessagesResponse = await FindAllChatMessagesForCurrentThread(chatThreadId)
  if (chatMessagesResponse.status !== "OK") return chatMessagesResponse

  const user = await userSession()
  if (!user)
    return {
      status: "ERROR",
      errors: [{ message: "No active user session" }],
    }

  const updatedChatThreadResponse = await UpsertChatThread({
    ...currentChatThreadResponse.response,
    chatType: chatType,
    indexId: indexId,
    chatOverFileName: chatOverFileName,
    conversationStyle: conversationStyle,
    conversationSensitivity: conversationSensitivity,
  })
  if (updatedChatThreadResponse.status !== "OK") return updatedChatThreadResponse

  return {
    status: "OK",
    response: {
      chatThread: updatedChatThreadResponse.response,
    },
  }
}

export const FindChatThreadByTitleAndEmpty = async (
  title: string
): ServerActionResponseAsync<ChatThreadModel | undefined> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.userId=@userId AND r.name=@name AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC",
      parameters: [
        { name: "@type", value: ChatRecordType.Thread },
        { name: "@name", value: title },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@createdAt", value: xMonthsAgo(DEFAULT_MONTHS_AGO) },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<ChatThreadModel>(query).fetchAll()

    if (!result.resources.length)
      return {
        status: "OK",
        response: undefined,
      }

    for (const chatThread of result.resources) {
      const messageResponse = await FindAllChatMessagesForCurrentThread(chatThread.chatThreadId)
      if (messageResponse.status !== "OK") return messageResponse

      const docs = await FindAllChatDocumentsForCurrentThread(chatThread.chatThreadId)
      if (docs.status !== "OK") return docs

      if (messageResponse.response.length === 0 && docs.response.length === 0)
        return {
          status: "OK",
          response: chatThread,
        }
    }

    return {
      status: "OK",
      response: undefined,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const UpdateChatThreadCreatedAt = async (chatThreadId: string): ServerActionResponseAsync<ChatThreadModel> => {
  try {
    const threadResponse = await FindChatThreadById(chatThreadId)
    if (threadResponse.status !== "OK") return threadResponse

    const threadToUpdate = {
      ...threadResponse.response,
      createdAt: new Date(),
      chatType: ChatType.Simple,
      conversationStyle: ConversationStyle.Precise,
      conversationSensitivity: ConversationSensitivity.Official,
      chatOverFileName: "",
      internalReference: "",
    }

    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<ChatThreadModel>(threadToUpdate)
    if (!resource)
      return {
        status: "NOT_FOUND",
        errors: [{ message: "Chat thread could not be updated" }],
      }

    return {
      status: "OK",
      response: resource,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const AssociateReferenceWithChatThread = async (
  chatThreadId: string,
  internalReference: string | undefined
): ServerActionResponseAsync<ChatThreadModel> => {
  logger.event("AssociateReferenceWithChatThread", { chatThreadId, internalReference })
  const threadResponse = await FindChatThreadById(chatThreadId)
  if (threadResponse.status !== "OK") return threadResponse

  const threadToUpdate = {
    ...threadResponse.response,
    internalReference: internalReference,
  }
  const container = await HistoryContainer()
  const { resource } = await container.items.upsert<ChatThreadModel>(threadToUpdate)
  if (!resource)
    return {
      status: "NOT_FOUND",
      errors: [{ message: "Failed to associate reference with chat thread" }],
    }
  return {
    status: "OK",
    response: resource,
  }
}
