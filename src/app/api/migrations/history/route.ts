import { SqlQuerySpec } from "@azure/cosmos"

import { UserModel, hashValue } from "@/features/auth/helpers"
import { UserContainer } from "@/features/common/services/cosmos"
import { UserRecord } from "@/features/user-management/models"
import logger from "@/features/insights/app-insights"

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
    const container = await UserContainer()
    let count = 0
    for (const { wrongUserId, correctUserId, tenant } of body) {
      const query: SqlQuerySpec = {
        query: "SELECT * FROM root r WHERE r.id=@id",
        parameters: [{ name: "@id", value: wrongUserId }],
      }
      const { resources } = await container.items
        .query<UserRecord>(query, { partitionKey: [tenant, wrongUserId] })
        .fetchAll()
      for (const resource of resources) {
        const copy = { ...resource, id: correctUserId }
        const del = await container.item(resource.id, [tenant, wrongUserId]).delete()
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
          logger.info(`Resource ${correctUserId} migrated successfully`)
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
    const container = await UserContainer()
    const query: SqlQuerySpec = {
      query: 'SELECT * FROM root r WHERE r.id  LIKE "%@%" ORDER BY r._ts DESC',
    }
    const { resources } = await container.items.query<UserModel & { id: string }>(query).fetchAll()

    const migrationList = resources.map(user => ({
      wrongUserId: user.id,
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
