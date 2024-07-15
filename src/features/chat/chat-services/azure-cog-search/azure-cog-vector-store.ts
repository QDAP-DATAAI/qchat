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

export const simpleSearch = async (
  userId: string,
  chatThreadId: string,
  tenantId: string,
  filter?: AzureCogFilter
): Promise<Array<AzureCogDocumentIndex & DocumentSearchModel>> => {
  const url = `${baseIndexUrl()}/docs/search?api-version=${process.env.AZURE_SEARCH_API_VERSION}`

  const userFilter = `search.in(userId, '${userId}')`
  const threadFilter = `search.in(chatThreadId, '${chatThreadId}')`
  const tenantFilter = `search.in(tenantId, '${tenantId}')`
  const combinedFilter = [filter?.filter, userFilter, threadFilter, tenantFilter].filter(Boolean).join(" and ")

  const searchBody: AzureCogRequestObject = {
    search: filter?.search || "*",
    facets: filter?.facets || [],
    filter: combinedFilter,
    top: filter?.top || 10,
    vectorQueries: [],
  }

  const resultDocuments = await fetcher<DocumentSearchResponseModel<AzureCogDocumentIndex & DocumentSearchModel>>(url, {
    method: "POST",
    body: JSON.stringify(searchBody),
  })

  return resultDocuments.value
}

export const similaritySearchVectorWithScore = async (
  query: string,
  k: number,
  userId: string,
  chatThreadId: string,
  tenantId: string,
  filter?: AzureCogFilter
): Promise<Array<AzureCogDocumentIndex & DocumentSearchModel>> => {
  const openai = OpenAIEmbeddingInstance()

  const embeddings = await openai.embeddings.create({
    input: query,
    model: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
  })

  const url = `${baseIndexUrl()}/docs/search?api-version=${process.env.AZURE_SEARCH_API_VERSION}`

  const userFilter = `search.in(userId, '${userId}')`
  const threadFilter = `search.in(chatThreadId, '${chatThreadId}')`
  const tenantFilter = `search.in(tenantId, '${tenantId}')`
  const combinedFilter = [filter?.filter, userFilter, threadFilter, tenantFilter].filter(Boolean).join(" and ")

  const searchBody: AzureCogRequestObject = {
    search: filter?.search || "*",
    facets: filter?.facets || [],
    filter: combinedFilter,
    top: filter?.top || k,
    vectorQueries: [{ vector: embeddings.data[0].embedding, fields: "embedding", k: k, kind: "vector" }],
  }

  const resultDocuments = await fetcher<DocumentSearchResponseModel<AzureCogDocumentIndex & DocumentSearchModel>>(url, {
    method: "POST",
    body: JSON.stringify(searchBody),
  })

  return resultDocuments.value
}

export const indexDocuments = async (documents: Array<AzureCogDocumentIndex>): Promise<void> => {
  const url = `${baseIndexUrl()}/docs/index?api-version=${process.env.AZURE_SEARCH_API_VERSION}`

  await embedDocuments(documents)
  const documentIndexRequest: DocumentSearchResponseModel<AzureCogDocumentIndex> = {
    value: documents,
  }

  await fetcher<void>(url, {
    method: "POST",
    body: JSON.stringify(documentIndexRequest),
  })
}

export const deleteDocuments = async (chatThreadId: string, userId: string, tenantId: string): Promise<void> => {
  const filter: AzureCogFilter = {
    filter: `search.in(chatThreadId, '${chatThreadId}') and search.in(userId, '${userId}') and search.in(tenantId, '${tenantId}')`,
  }
  const documentsInChat = await simpleSearch(userId, chatThreadId, tenantId, filter)
  const documentsToDelete: DocumentDeleteModel[] = []
  documentsInChat.forEach(document => {
    const doc: DocumentDeleteModel = {
      "@search.action": "delete",
      id: document.id,
    }
    documentsToDelete.push(doc)
  })

  await fetcher<void>(`${baseIndexUrl()}/docs/index?api-version=${process.env.AZURE_SEARCH_API_VERSION}`, {
    method: "POST",
    body: JSON.stringify({ value: documentsToDelete }),
  })
}

export const deleteDocumentById = async (
  documentId: string,
  chatThreadId: string,
  userId: string,
  tenantId: string
): ServerActionResponseAsync<void> => {
  const filter: AzureCogFilter = {
    filter: `search.in(metadata, '${documentId}') and search.in(chatThreadId, '${chatThreadId}') and search.in(userId, '${userId}') and search.in(tenantId, '${tenantId}')`,
  }

  try {
    const documents = await simpleSearch(userId, chatThreadId, tenantId, filter)

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
      `${baseIndexUrl()}/docs/index?api-version=${process.env.AZURE_SEARCH_API_VERSION}`,
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

const baseIndexUrl = (): string => {
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
