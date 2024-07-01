import { SqlQuerySpec } from "@azure/cosmos"

import { ChatMessageModel } from "@/features/chat/models"
import { HistoryContainer } from "@/features/common/services/cosmos"
import logger from "@/features/insights/app-insights"

export type MigrationItem = {
  id: string
  user: string
  tenant: string
  threadId: string
}
export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()).items as MigrationItem[]
    const container = await HistoryContainer()
    let count = 0
    for (const { id, user, tenant } of body) {
      const query: SqlQuerySpec = {
        query: "SELECT * FROM root r WHERE r.id=@id",
        parameters: [{ name: "@id", value: id }],
      }
      const { resources } = await container.items
        .query<ChatMessageModel>(query, { partitionKey: [tenant, user] })
        .fetchAll()
      for (const resource of resources) {
        const copy = { ...resource }
        delete copy.threadId
        const del = await container.item(resource.id, [tenant, user]).delete()
        if (!del.statusCode.toString().startsWith("2")) {
          logger.error(`Resource ${resource.id} failed to delete.`)
          logger.warning(JSON.stringify(resource))
          continue
        }
        const res = await container.items.upsert(copy)

        if (!res.statusCode.toString().startsWith("2")) {
          logger.error(`Resource ${resource.id} failed to migrate.`)
          logger.warning(JSON.stringify(copy))
          await container.items.upsert(resource)
        } else {
          count++
          logger.info(`Resource ${id} migrated successfully`)
        }
      }
    }
    return new Response(
      JSON.stringify({
        status: "OK",
        data: `Migration completed. Total ${count}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ status: "ERROR", error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function GET(): Promise<Response> {
  try {
    const container = await HistoryContainer()
    const query: SqlQuerySpec = {
      query: "SELECT * FROM c WHERE IS_DEFINED(c.threadId)",
    }
    const { resources } = await container.items.query<ChatMessageModel>(query).fetchAll()

    const migrationList = resources.map(history => ({
      id: history.id,
      user: history.userId,
      tenant: history.tenantId,
      threadId: history.threadId,
    }))
    return new Response(
      JSON.stringify({
        status: "OK",
        data: migrationList,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ status: "ERROR", error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
