import { CosmosClient, Container, PartitionKeyDefinitionVersion, PartitionKeyKind } from "@azure/cosmos"

import { GetCosmosAccessToken, getTokenExpiry } from "./cosmos-auth"

interface AuthToken {
  token: string
  expiry: number
}

let _cosmosClient: CosmosClient | null = null
let _authToken: AuthToken | null = null

const fetchAndSetAuthToken = async (): Promise<void> => {
  const token = await GetCosmosAccessToken()
  const expiry = await getTokenExpiry(token)
  _authToken = { token, expiry }
  _cosmosClient = createCosmosClient(token)
}

const createCosmosClient = (authToken: string): CosmosClient => {
  const endpoint = process.env.APIM_BASE
  const defaultHeaders = {
    "api-key": process.env.APIM_KEY || "",
    Authorization: `type=aad&ver=1.0&sig=${authToken}`,
  }
  if (!endpoint) throw new Error("Azure Cosmos DB is not configured. Please configure it in the .env file.")

  return new CosmosClient({ endpoint: endpoint, defaultHeaders: defaultHeaders })
}

const CosmosInstance = async (): Promise<CosmosClient> => {
  //If token is not expired, return the client
  if (_cosmosClient && _authToken && _authToken.expiry < Date.now()) {
    return _cosmosClient
  }
  await fetchAndSetAuthToken()
  return _cosmosClient!
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
