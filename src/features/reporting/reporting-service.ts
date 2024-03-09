// Import statements for necessary dependencies
import { SqlQuerySpec } from "@azure/cosmos"
import {
  CHAT_THREAD_ATTRIBUTE,
  ChatMessageModel,
  ChatThreadModel,
  MESSAGE_ATTRIBUTE,
} from "../chat/chat-services/models"
import { CosmosDBContainer } from "../common/services/cosmos"
import { getTenantId } from "@/features/auth/helpers"

// export const FindAllChatThreadsForReporting = async (
//   pageSize = 10,
//   pageNumber = 0
// ) => {
//   try {
//     const container = await CosmosDBContainer.getInstance().getContainer();
//     const tenantId = await getTenantId();

//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//     const sevenDaysAgoIso = sevenDaysAgo.toISOString();

//     const querySpec: SqlQuerySpec = {
//       // query: `SELECT
//       //           r.id,
//       //           r.name,
//       //           r.useName,
//       //           r.chatType,
//       //           r.conversationStyle,
//       //           r.conversationSensitivity,
//       //           r.createdAt
//       query: `SELECT *
//               FROM root r
//               WHERE r.type=@type AND r.tenantId=@tenantId AND r.createdAt >= @sevenDaysAgo
//               ORDER BY r.createdAt DESC
//               OFFSET ${pageNumber * pageSize} LIMIT ${pageSize}`,
//       parameters: [
//         {
//           name: "@type",
//           value: CHAT_THREAD_ATTRIBUTE,
//         },
//         {
//           name: "@tenantId",
//           value: tenantId,
//         },
//         {
//           name: "@sevenDaysAgo",
//           value: sevenDaysAgoIso,
//         },
//       ],
//     };

//     const { resources } = await container.items
//       .query<ChatThreadModel>(querySpec, {
//         maxItemCount: pageSize,
//       })
//       .fetchNext();
//     return { resources };
//   } catch (error) {
//     return { resources: [] };
//   }
// };

// export const FindChatThreadByID = async (chatThreadId: string) => {
//   const container = await CosmosDBContainer.getInstance().getContainer();
//   const tenantId = await getTenantId();

//   const querySpec: SqlQuerySpec = {
//     query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id AND r.tenantId=@tenantId",
//     parameters: [
//       {
//         name: "@type",
//         value: CHAT_THREAD_ATTRIBUTE,
//       },
//       {
//         name: "@id",
//         value: chatThreadId,
//       },
//       {
//         name: "@tenantId",
//         value: tenantId,
//       },
//     ],
//   };

//   const { resources } = await container.items
//     .query<ChatThreadModel>(querySpec)
//     .fetchAll();

//   return resources;
// };

// export const FindAllChatsInThread = async (chatThreadId: string) => {
//   const container = await CosmosDBContainer.getInstance().getContainer();
//   const tenantId = await getTenantId();

//   const querySpec: SqlQuerySpec = {
//     query: "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId = @chatThreadId AND r.tenantId=@tenantId",
//     parameters: [
//       {
//         name: "@type",
//         value: MESSAGE_ATTRIBUTE,
//       },
//       {
//         name: "@chatThreadId",
//         value: chatThreadId,
//       },
//       {
//         name: "@tenantId",
//         value: tenantId,
//       },
//     ],
//   };

//   const { resources } = await container.items
//     .query<ChatMessageModel>(querySpec)
//     .fetchAll();
//   return resources;
// };

export const FindAllChatThreadsForReporting = async (
  pageSize = 10,
  pageNumber = 0
): Promise<{ resources: ChatThreadModel[] }> => {
  try {
    const container = await CosmosDBContainer.getInstance().getContainer()
    const tenantId = await getTenantId()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoIso = sevenDaysAgo.toISOString()

    const querySpec: SqlQuerySpec = {
      query: `SELECT *
              FROM root r 
              WHERE r.type=@type AND r.tenantId=@tenantId AND r.createdAt >= @sevenDaysAgo 
              AND r.isDeleted=@isDeleted
              ORDER BY r.createdAt DESC 
              OFFSET ${pageNumber * pageSize} LIMIT ${pageSize}`,
      parameters: [
        {
          name: "@type",
          value: CHAT_THREAD_ATTRIBUTE,
        },
        {
          name: "@tenantId",
          value: tenantId,
        },
        {
          name: "@sevenDaysAgo",
          value: sevenDaysAgoIso,
        },
        {
          name: "@isDeleted",
          value: false,
        },
      ],
    }

    const { resources } = await container.items
      .query<ChatThreadModel>(querySpec, {
        maxItemCount: pageSize,
      })
      .fetchNext()
    return { resources }
  } catch (error) {
    console.log(error)
    return { resources: [] }
  }
}

export const FindChatThreadByID = async (chatThreadId: string): Promise<ChatThreadModel[]> => {
  try {
    const container = await CosmosDBContainer.getInstance().getContainer()
    const tenantId = await getTenantId()

    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.id=@id AND r.tenantId=@tenantId",
      parameters: [
        {
          name: "@type",
          value: CHAT_THREAD_ATTRIBUTE,
        },
        {
          name: "@id",
          value: chatThreadId,
        },
        {
          name: "@tenantId",
          value: tenantId,
        },
        {
          name: "@isDeleted",
          value: false,
        },
      ],
    }
    const { resources } = await container.items.query<ChatThreadModel>(querySpec).fetchAll()
    return resources
  } catch (error) {
    console.log(error)
    return []
  }
}

export const FindAllChatsInThread = async (chatThreadId: string): Promise<ChatMessageModel[]> => {
  try {
    const container = await CosmosDBContainer.getInstance().getContainer()
    const tenantId = await getTenantId()

    const querySpec: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId = @chatThreadId AND r.tenantId=@tenantId",
      parameters: [
        {
          name: "@type",
          value: MESSAGE_ATTRIBUTE,
        },
        {
          name: "@chatThreadId",
          value: chatThreadId,
        },
        {
          name: "@tenantId",
          value: tenantId,
        },
      ],
    }

    const { resources } = await container.items.query<ChatMessageModel>(querySpec).fetchAll()
    return resources
  } catch (error) {
    console.log(error)
    return []
  }
}

// export const FindAllChatsInThread = async (chatThreadId: string) => {
//   try {
//     const container = await CosmosDBContainer.getInstance().getContainer();
//     const tenantId = await getTenantId();

//     const querySpec: SqlQuerySpec = {
//       query: "SELECT * FROM root r WHERE r.type=@type AND r.chatThreadId = @chatThreadId AND r.tenantId=@tenantId",
//       parameters: [
//         {
//           name: "@type",
//           value: MESSAGE_ATTRIBUTE,
//         },
//         {
//           name: "@chatThreadId",
//           value: chatThreadId,
//         },
//         {
//           name: "@tenantId",
//           value: tenantId,
//         },
//       ],
//     };

//     const { resources } = await container.items
//       .query<ChatMessageModel>(querySpec)
//       .fetchAll();
//     return resources;
//   } catch (error) {
//     return [];
//   }
// };
