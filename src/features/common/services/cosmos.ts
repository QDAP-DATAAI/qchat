import { Container, CosmosClient, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos"

import { GetCosmosAccessToken, isTokenExpired } from "./cosmos-auth"
import logger from "@/features/insights/app-insights"

interface AuthToken {
  token: string
  expiry: number
}

let _cosmosClient: CosmosClient | null = null
let _cosmosAuthToken: string | null = null

const createCosmosClient = async (authToken: string): Promise<CosmosClient> => {
  const endpoint = process.env.APIM_BASE
  const defaultHeaders = {
    "api-key": process.env.APIM_KEY || "",
    Authorization: `type=aad&ver=1.0&sig=${authToken}`,
  }
  if (!endpoint) throw new Error("Azure Cosmos DB is not configured. Please configure it in the .env file.")
  return new CosmosClient({ endpoint: endpoint, defaultHeaders: defaultHeaders })
}

const CosmosInstance = async (): Promise<CosmosClient> => {
  if (_cosmosAuthToken && _cosmosClient && !isTokenExpired(_cosmosAuthToken)) return _cosmosClient

  console.log("🚀 > CosmosInstance > isTokenExpired")
  const token = await GetCosmosAccessToken()
  _cosmosAuthToken = token
  _cosmosClient = await createCosmosClient(token)
  return _cosmosClient
}

let _historyContainer: Container | null = null
export const HistoryContainer = async (): Promise<Container> => {
  if (_historyContainer) return _historyContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_CHAT_CONTAINER_NAME || "history"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/tenantId", "/userId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _historyContainer = container
  return _historyContainer
}

let _userContainer: Container | null = null
export const UserContainer = async (): Promise<Container> => {
  if (_userContainer) return _userContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_USER_CONTAINER_NAME || "users"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/tenantId", "/userId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _userContainer = container
  return _userContainer
}

let _tenantContainer: Container | null = null
export const TenantContainer = async (): Promise<Container> => {
  if (_tenantContainer) return _tenantContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_TENANT_CONTAINER_NAME || "tenants"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/tenantId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _tenantContainer = container
  return _tenantContainer
}

let _smartGenContainer: Container | null = null
export const SmartGenContainer = async (): Promise<Container> => {
  if (_smartGenContainer) return _smartGenContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_SMART_GEN_CONTAINER_NAME || "smart-gen"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/tenantId", "/userId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _smartGenContainer = container
  return _smartGenContainer
}

let _applicationContainer: Container | null = null
export const ApplicationContainer = async (): Promise<Container> => {
  if (_applicationContainer) return _applicationContainer

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const containerName = process.env.AZURE_COSMOSDB_APPLICATION_CONTAINER_NAME || "applications"

  const client = await CosmosInstance()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: ["/applicationId"],
      kind: PartitionKeyKind.MultiHash,
      version: PartitionKeyDefinitionVersion.V2,
    },
  })

  _applicationContainer = container
  return _applicationContainer
}
