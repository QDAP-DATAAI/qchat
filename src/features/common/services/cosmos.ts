import {
  Container,
  CosmosClient,
  PartitionKeyDefinition,
  PartitionKeyDefinitionVersion,
  PartitionKeyKind,
} from "@azure/cosmos"

import logger from "@/features/insights/app-insights"

let _cosmosAuthToken: string | null = null
const GetCosmosAccessToken = async (): Promise<string> => {
  try {
    if (!process.env.APIM_KEY || !process.env.APIM_BASE)
      throw new Error("Azure API Management is not configured. Please configure it in the .env file.")

    if (_cosmosAuthToken && !isTokenExpired(_cosmosAuthToken)) return _cosmosAuthToken

    const response = await fetch(`${process.env.APIM_BASE}/cosmos`, {
      method: "GET",
      headers: {
        "api-key": process.env.APIM_KEY,
      },
      cache: "reload",
    })

    if (!response.ok) throw new Error(`${response.statusText}`)

    _cosmosAuthToken = await response.text()
    return _cosmosAuthToken
  } catch (error) {
    throw new Error(`Failed to fetch Cosmos Auth Token: ${error}`)
  }
}

const isTokenExpired = (authToken: string | null): boolean => {
  try {
    if (!authToken) return true
    const expiry = JSON.parse(Buffer.from(authToken.split(".")[1], "base64").toString()).exp
    const currentTime = Math.floor(Date.now() / 1000)
    return expiry <= currentTime
  } catch (error) {
    throw new Error(`Failed to check token expiry: ${error}`)
  }
}

async function createCosmosClient(): Promise<CosmosClient> {
  const endpoint = process.env.APIM_BASE
  const authToken = await GetCosmosAccessToken()
  const defaultHeaders = {
    "api-key": process.env.APIM_KEY || "",
    Authorization: `type=aad&ver=1.0&sig=${authToken}`,
  }
  if (!endpoint) throw new Error("Azure Cosmos DB is not configured. Please configure it in the .env file.")
  return new CosmosClient({ endpoint: endpoint, defaultHeaders: defaultHeaders })
}

const _cache: Map<string, Container> = new Map()

async function containerFactory(containerName: string, partitionKey: PartitionKeyDefinition): Promise<Container> {
  if (_cache.has(containerName) && !isTokenExpired(_cosmosAuthToken)) return _cache.get(containerName) as Container
  logger.info(`🚀 > containerFactory > ${containerName}`)

  const dbName = process.env.AZURE_COSMOSDB_DB_NAME || "localdev"
  const client = await createCosmosClient()
  const { database } = await client.databases.createIfNotExists({ id: dbName })
  const { container } = await database.containers.createIfNotExists({
    id: containerName,
    partitionKey,
  })

  _cache.set(containerName, container)
  return container
}

export const HistoryContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_CHAT_CONTAINER_NAME || "history"
  const partitionKey = {
    paths: ["/tenantId", "/userId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

export const UserContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_USER_CONTAINER_NAME || "users"
  const partitionKey = {
    paths: ["/tenantId", "/userId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

export const TenantContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_TENANT_CONTAINER_NAME || "tenants"
  const partitionKey = {
    paths: ["/tenantId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

export const SmartGenContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_SMART_GEN_CONTAINER_NAME || "smart-gen"
  const partitionKey = {
    paths: ["/tenantId", "/userId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}

export const ApplicationContainer = async (): Promise<Container> => {
  const containerName = process.env.AZURE_COSMOSDB_TENANT_CONTAINER_NAME || "applications"
  const partitionKey = {
    paths: ["/applicationId"],
    kind: PartitionKeyKind.MultiHash,
    version: PartitionKeyDefinitionVersion.V2,
  }
  const container = await containerFactory(containerName, partitionKey)
  return container
}
