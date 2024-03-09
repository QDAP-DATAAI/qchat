import { ChatMessageModel, ChatRecordType, ChatThreadModel } from "@/features/chat/models"
import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { DEFAULT_MONTHS_AGO } from "@/features/chat/constants"
import { xMonthsAgo } from "@/features/common/date-helper"
import { HistoryContainer } from "@/features/common/services/cosmos"
import { SqlQuerySpec } from "@azure/cosmos"

function threeMonthsAgo(): string {
  const date = new Date()
  date.setMonth(date.getMonth() - 3)
  return date.toISOString()
}

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
): Promise<{
  resources: ChatThreadModel[]
}> => {
  const container = await CosmosDBContainer.getInstance().getContainer()

  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM root r WHERE .type=@type AND r.userId=@userId AND r.name=@name AND r.isDeleted=@isDeleted AND r.tenantId=@tenantId AND r.createdAt >= @createdAt ORDER BY r.createdAt DESC OFFSET ${
      pageNumber * pageSize
    } LIMIT ${pageSize}`,
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
}

export const FindChatThreadByID = async (chatThreadID: string): Promise<ChatThreadModel[]> => {
  const container = await CosmosDBContainer.getInstance().getContainer()

  const querySpec: SqlQuerySpec = {
    query: "SELECT * FROM root r WHERE r.userId=@userId AND r.tenantId=@tenantId AND r.type=@type AND r.id=@id",
    parameters: [
      {
        name: "@type",
        value: CHAT_THREAD_ATTRIBUTE,
      },
      {
        name: "@id",
        value: chatThreadID,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@tenantId",
        value: await getTenantId(),
      },
    ],
  }
}

export const FindAllChatsInThread = async (chatThreadID: string): Promise<ChatMessageModel[]> => {
  const container = await CosmosDBContainer.getInstance().getContainer()

  const querySpec: SqlQuerySpec = {
    query:
      "SELECT * FROM root r WHERE r.userId=@userId AND r.tenantId=@tenantId AND r.type=@type AND r.chatThreadId = @chatThreadId",
    parameters: [
      {
        name: "@type",
        value: MESSAGE_ATTRIBUTE,
      },
      {
        name: "@chatThreadId",
        value: chatThreadID,
      },
      {
        name: "@userId",
        value: await userHashedId(),
      },
      {
        name: "@tenantId",
        value: await getTenantId(),
      },
    ],
  }
}
