import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { OpenAIEmbeddingInstance } from "@/services/open-ai"

export interface AzureCogDocumentIndex {
  id: string
  pageContent: string
  embedding?: number[]
  userId: string
  chatThreadId: string
  metadata: string
  tenantId: string
  createdDate: string
  fileName: string
  order: number
}

interface DocumentSearchResponseModel<TModel> {
  value: TModel[]
}

export type DocumentSearchModel = {
  "@search.score": number
}

type DocumentDeleteModel = {
  id: string
  "@search.action": "delete"
}

export interface AzureCogDocument {}

type AzureCogVectorField = {
  vector: number[]
  fields: string
  k: number
  kind: string
}

type AzureCogFilter = {
  search?: string
  facets?: string[]
  filter?: string
  top?: number
}

type AzureCogRequestObject = {
  search: string
  facets: string[]
  filter: string
  top: number
  vectorQueries: AzureCogVectorField[]
}

const constructFilter = (userId: string, chatThreadId: string, tenantId: string, additionalFilter?: string): string => {
  const userFilter = `search.in(userId, '${userId}')`
  const threadFilter = `search.in(chatThreadId, '${chatThreadId}')`
  const tenantFilter = `search.in(tenantId, '${tenantId}')`
  return [additionalFilter, userFilter, threadFilter, tenantFilter].filter(Boolean).join(" and ")
}

const searchDocuments = async (
  url: string,
  searchBody: AzureCogRequestObject
): Promise<Array<AzureCogDocumentIndex & DocumentSearchModel>> => {
  const resultDocuments = await fetcher<DocumentSearchResponseModel<AzureCogDocumentIndex & DocumentSearchModel>>(url, {
    method: "POST",
    body: JSON.stringify(searchBody),
  })

  return resultDocuments.value
}

export const simpleSearch = async (
  userId: string,
  chatThreadId: string,
  tenantId: string,
  indexId: string,
  filter?: AzureCogFilter
): Promise<Array<AzureCogDocumentIndex & DocumentSearchModel>> => {
  const url = `${baseIndexUrl(indexId)}/docs/search?api-version=${process.env.AZURE_SEARCH_API_VERSION}`
  const combinedFilter = constructFilter(userId, chatThreadId, tenantId, filter?.filter)

  const searchBody: AzureCogRequestObject = {
    search: filter?.search || "*",
    facets: filter?.facets || [],
    filter: combinedFilter,
    top: filter?.top || 10,
    vectorQueries: [],
  }

  return await searchDocuments(url, searchBody)
}

export const similaritySearchVectorWithScore = async (
  query: string,
  k: number,
  userId: string,
  chatThreadId: string,
  tenantId: string,
  indexId: string,
  filter?: AzureCogFilter
): Promise<Array<AzureCogDocumentIndex & DocumentSearchModel>> => {
  const openai = OpenAIEmbeddingInstance()
  const embeddings = await openai.embeddings.create({
    input: query,
    model: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
  })

  const url = `${baseIndexUrl(indexId)}/docs/search?api-version=${process.env.AZURE_SEARCH_API_VERSION}`
  const combinedFilter = constructFilter(userId, chatThreadId, tenantId, filter?.filter)

  const searchBody: AzureCogRequestObject = {
    search: filter?.search || "*",
    facets: filter?.facets || [],
    filter: combinedFilter,
    top: filter?.top || k,
    vectorQueries: [{ vector: embeddings.data[0].embedding, fields: "embedding", k: k, kind: "vector" }],
  }

  return await searchDocuments(url, searchBody)
}

export const indexDocuments = async (documents: Array<AzureCogDocumentIndex>, indexId: string): Promise<void> => {
  const url = `${baseIndexUrl(indexId)}/docs/index?api-version=${process.env.AZURE_SEARCH_API_VERSION}`

  await embedDocuments(documents)
  const documentIndexRequest: DocumentSearchResponseModel<AzureCogDocumentIndex> = {
    value: documents,
  }

  await fetcher<void>(url, {
    method: "POST",
    body: JSON.stringify(documentIndexRequest),
  })
}

export const deleteDocuments = async (
  chatThreadId: string,
  userId: string,
  tenantId: string,
  indexId: string
): Promise<void> => {
  const filter: AzureCogFilter = {
    filter: constructFilter(userId, chatThreadId, tenantId),
  }
  const documentsInChat = await simpleSearch(userId, chatThreadId, tenantId, indexId, filter)
  const documentsToDelete: DocumentDeleteModel[] = documentsInChat.map(document => ({
    "@search.action": "delete",
    id: document.id,
  }))

  await fetcher<void>(`${baseIndexUrl(indexId)}/docs/index?api-version=${process.env.AZURE_SEARCH_API_VERSION}`, {
    method: "POST",
    body: JSON.stringify({ value: documentsToDelete }),
  })
}

export const deleteDocumentById = async (
  documentId: string,
  chatThreadId: string,
  userId: string,
  tenantId: string,
  indexId: string
): ServerActionResponseAsync<void> => {
  const filter: AzureCogFilter = {
    filter: constructFilter(userId, chatThreadId, tenantId, `search.in(metadata, '${documentId}')`),
  }

  try {
    const documents = await simpleSearch(userId, chatThreadId, tenantId, indexId, filter)

    if (documents.length === 0) {
      return {
        status: "NOT_FOUND",
        errors: [{ message: "No documents found to delete." }],
      }
    }

    const documentsToDelete: DocumentDeleteModel[] = documents.map(document => ({
      "@search.action": "delete",
      id: document.id,
    }))

    const response = await fetcher<DocumentSearchResponseModel<{ status: boolean; key: string; errorMessage: string }>>(
      `${baseIndexUrl(indexId)}/docs/index?api-version=${process.env.AZURE_SEARCH_API_VERSION}`,
      {
        method: "POST",
        body: JSON.stringify({ value: documentsToDelete }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    const failedDeletions = response.value.filter(result => !result.status)
    if (failedDeletions.length > 0) {
      return {
        status: "ERROR",
        errors: failedDeletions.map(result => ({
          message: `Failed to delete document with key: ${result.key}, error: ${result.errorMessage}`,
        })),
      }
    }

    return {
      status: "OK",
      response: undefined,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: "ERROR",
        errors: [{ message: `Error deleting documents: ${error.message}` }],
      }
    }
    return {
      status: "ERROR",
      errors: [{ message: `Error deleting documents: ${String(error)}` }],
    }
  }
}

export const embedDocuments = async (documents: Array<AzureCogDocumentIndex>): Promise<void> => {
  const openai = OpenAIEmbeddingInstance()

  try {
    const contentsToEmbed = documents.map(d => d.pageContent)
    const embeddings = await openai.embeddings.create({
      input: contentsToEmbed,
      model: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
    })

    embeddings.data.forEach((embedding, index) => {
      documents[index].embedding = embedding.embedding
    })
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`${e.message}`)
    } else {
      throw new Error(`Unknown error: ${String(e)}`)
    }
  }
}

// const baseIndexUrl = (indexId: string): string => {
//   return `${process.env.APIM_BASE}/indexes/${indexId}`
// }

//TODO: Switch to dynamically assigning the index value after data fix

const baseIndexUrl = (_indexId: string): string => {
  return `${process.env.APIM_BASE}/indexes/${process.env.AZURE_SEARCH_INDEX_NAME}`
}

const fetcher = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.APIM_KEY,
    },
  })

  if (!response.ok) {
    if (response.status === 400) {
      const err = await response.json()
      throw new Error(err.error.message)
    } else {
      throw new Error(`Azure Cog Search Error: ${response.statusText}`)
    }
  }
  return await response.json()
}
