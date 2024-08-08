"use server"

import { SqlQuerySpec } from "@azure/cosmos"

import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { MESSAGE_COUNT } from "@/features/chat/constants"
import {
  AssistantChatMessageModel,
  ChatRecordType,
  ChatSentiment,
  FeedbackType,
  UserChatMessageModel,
} from "@/features/chat/models"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { HistoryContainer } from "@/features/common/services/cosmos-service"

export const FindAllChatMessagesForCurrentThread = async (
  chatThreadId: string
): ServerActionResponseAsync<(UserChatMessageModel | AssistantChatMessageModel)[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId=@chatThreadId AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
      parameters: [
        { name: "@type", value: ChatRecordType.Message },
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<UserChatMessageModel | AssistantChatMessageModel>(query).fetchAll()
    return {
      status: "OK",
      response: result.resources,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindTopChatMessagesForCurrentUser = async (
  chatThreadId: string,
  top = MESSAGE_COUNT
): ServerActionResponseAsync<(UserChatMessageModel | AssistantChatMessageModel)[]> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT TOP @top * FROM root r WHERE r.type=@type AND r.chatThreadId=@chatThreadId AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
      parameters: [
        { name: "@type", value: ChatRecordType.Message },
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
        { name: "@top", value: top },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<UserChatMessageModel | AssistantChatMessageModel>(query).fetchAll()
    return {
      status: "OK",
      response: result.resources,
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const FindChatMessageForCurrentUser = async (
  chatThreadId: string,
  messageId: string
): ServerActionResponseAsync<UserChatMessageModel | AssistantChatMessageModel> => {
  try {
    const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
    const query: SqlQuerySpec = {
      query:
        "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId=@chatThreadId AND r.id=@id AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.userId=@userId",
      parameters: [
        { name: "@type", value: ChatRecordType.Message },
        { name: "@chatThreadId", value: chatThreadId },
        { name: "@id", value: messageId },
        { name: "@isDeleted", value: false },
        { name: "@userId", value: userId },
        { name: "@tenantId", value: tenantId },
      ],
    }
    const container = await HistoryContainer()
    const result = await container.items.query<UserChatMessageModel | AssistantChatMessageModel>(query).fetchAll()
    return {
      status: "OK",
      response: result.resources[0],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export type ChatCompletionMessageTranslated = AssistantChatMessageModel & {
  originalCompletion?: string
  contentFilterResult?: unknown
}

export const UpsertChatMessage = async (
  message: UserChatMessageModel | AssistantChatMessageModel
): ServerActionResponseAsync<UserChatMessageModel | AssistantChatMessageModel> => {
  try {
    const container = await HistoryContainer()
    const { resource } = await container.items.upsert<UserChatMessageModel | AssistantChatMessageModel>(message)

    if (!resource) {
      return {
        status: "ERROR",
        errors: [{ message: "Failed to save chat message" }],
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

export const CreateUserFeedback = async (
  messageId: string,
  feedback: FeedbackType,
  sentiment: ChatSentiment,
  reason: string,
  chatThreadId: string
): ServerActionResponseAsync<AssistantChatMessageModel> => {
  const message = await FindChatMessageForCurrentUser(chatThreadId, messageId)
  if (message.status !== "OK") return message

  const messageFeedback: AssistantChatMessageModel = {
    ...(message.response as AssistantChatMessageModel),
    feedback,
    sentiment,
    reason,
  }
  const container = await HistoryContainer()
  const { resource } = await container.items.upsert<AssistantChatMessageModel>(messageFeedback)
  if (!resource)
    return {
      status: "ERROR",
      errors: [{ message: "Failed to save feedback" }],
    }

  return {
    status: "OK",
    response: resource,
  }
}
