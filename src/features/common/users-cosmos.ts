import { Container, CosmosClient, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos"
import { handleCosmosError } from "@/services/cosmos-error"

const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
const USER_PREFS_CONTAINER_NAME = process.env.AZURE_COSMOSDB_USER_CONTAINER_NAME || "userprefs"

export const initUserPrefsContainer = async (): Promise<Container> => {
  try {
    const endpoint = process.env.AZURE_COSMOSDB_URI
    const key = process.env.AZURE_COSMOSDB_KEY
    const defaultHeaders = { "api-key": process.env.AZURE_SEARCH_API_KEY }

    const client = new CosmosClient({ endpoint, key, defaultHeaders })

    const databaseResponse = await client.databases.createIfNotExists({
      id: DB_NAME,
    })

    const containerResponse = await databaseResponse.database.containers.createIfNotExists({
      id: USER_PREFS_CONTAINER_NAME,
      partitionKey: {
        paths: ["/tenantId", "/userId"],
        kind: PartitionKeyKind.MultiHash,
        version: PartitionKeyDefinitionVersion.V2,
      },
    })

    return containerResponse.container
  } catch (error) {
    handleCosmosError(error as Error)
    throw error
  }
}
