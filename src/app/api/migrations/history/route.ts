import { SqlQuerySpec } from "@azure/cosmos"

import { UserModel, hashValue } from "@/features/auth/helpers"
import { ChatMessageModel, ChatRecordType, ChatThreadModel } from "@/features/chat/models"
import { HistoryContainer, UserContainer } from "@/features/common/services/cosmos"

export type MigrationItem = {
  wrongUserId: string
  correctUserId: string
  upn: string
  name: string
  tenant: string
}
export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()).items as MigrationItem[]
    const container = await HistoryContainer()
    const count = {
      messages: 0,
      threads: 0,
    }
    for (const { wrongUserId, correctUserId, tenant } of body) {
      const query: SqlQuerySpec = {
        query: "SELECT * FROM root r WHERE r.userId=@userId",
        parameters: [{ name: "@userId", value: wrongUserId }],
      }
      const { resources } = await container.items
        .query<ChatThreadModel | ChatMessageModel>(query, { partitionKey: [tenant, wrongUserId] })
        .fetchAll()

      for (const resource of resources) {
        const copy = { ...resource, userId: correctUserId }
        await container.item(resource.id, [tenant, wrongUserId]).delete()
        const res = await container.items.upsert(copy)

        if (!res.statusCode.toString().startsWith("2")) {
          // console.error(`Resource ${resource.id} failed to migrate`)
          await container.items.upsert(resource)
        } else {
          count[resource.type === ChatRecordType.Thread ? "threads" : "messages"]++
          // console.info(`Resource ${resource.id} migrated successfully`)
        }
      }
    }
    return new Response(
      JSON.stringify({
        status: "OK",
        data: `Migration completed. Threads: ${count.threads}, Messages: ${count.messages}`,
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

const startDate = "2024-05-26T08:46:00.000Z"
export async function GET(): Promise<Response> {
  try {
    const container = await UserContainer()
    const query: SqlQuerySpec = {
      query: "SELECT * FROM root r WHERE LOWER(r.upn) != r.upn AND r.last_login >= @startDate",
      parameters: [{ name: "@startDate", value: startDate }],
    }
    const { resources } = await container.items.query<UserModel>(query).fetchAll()

    const migrationList = resources.map(user => ({
      wrongUserId: hashValue(user.upn.toLowerCase()),
      correctUserId: hashValue(user.upn),
      upn: user.upn,
      name: user.name,
      tenant: user.tenantId,
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
