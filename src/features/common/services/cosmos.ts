import { CosmosClient, Database, Container, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos"
import { handleCosmosError } from "@/services/cosmos-error"

export class CosmosDBCore {
  private static client: CosmosClient
  private static database: Database
  private static instance: CosmosDBCore

  private constructor() {}

  public static getInstance(): CosmosDBCore {
    if (!CosmosDBCore.instance) {
      CosmosDBCore.instance = new CosmosDBCore()
      CosmosDBCore.initClient()
    }
    return CosmosDBCore.instance
  }

  private static initClient(): void {
    const ENDPOINT = process.env.AZURE_COSMOSDB_URI
    const KEY = process.env.AZURE_COSMOSDB_KEY
    const DB_NAME = process.env.AZURE_COSMOSDB_DB_NAME || "defaultDBName"

    if (!CosmosDBCore.client) {
      CosmosDBCore.client = new CosmosClient({
        endpoint: ENDPOINT,
        key: KEY,
      })
      CosmosDBCore.database = CosmosDBCore.client.database(DB_NAME)
    }
  }

  public async getContainer(containerName: string, partitionKeyPaths: string[]): Promise<Container> {
    try {
      const partitionKey = {
        paths: partitionKeyPaths,
        kind: PartitionKeyKind.MultiHash,
        version: PartitionKeyDefinitionVersion.V2,
      }

      const { container } = await CosmosDBCore.database.containers.createIfNotExists({
        id: containerName,
        partitionKey,
      })

      return container
    } catch (error) {
      handleCosmosError(error as Error)
      throw error
    }
  }
}
