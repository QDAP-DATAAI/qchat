const buildSimpleChatSystemPrompt = async (): Promise<string> => {
  const { systemPrompt, tenantPrompt, userPrompt } = await getContextPrompts()

  const prompts = [systemPrompt, tenantPrompt, userPrompt].filter(Boolean).join("\n\n")

  return prompts
}

import { ChatCompletionMessageParam, ChatCompletionSystemMessageParam } from "openai/resources"

import { APP_NAME } from "@/app-global"

import { GetApplicationSettings } from "@/features/application/application-service"
import { getTenantAndUser, getTenantId, userHashedId } from "@/features/auth/helpers"
import { PromptMessage } from "@/features/chat/models"

import { DocumentSearchModel } from "./azure-cog-search/azure-cog-vector-store"
import { AzureCogDocumentIndex, similaritySearchVectorWithScore } from "./azure-cog-search/azure-cog-vector-store"
import { FindAllChatDocumentsForCurrentThread } from "./chat-document-service"

const DEFAULT_SYSTEM_PROMPT = `
- You are ${APP_NAME}, a helpful AI Assistant developed to assist Queensland government employees in their day-to-day tasks.\n
- You will provide clear and concise queries, and you will respond with polite and professional answers.\n
- You will answer questions truthfully and accurately.\n
- You will respond to questions in accordance with rules of Queensland government.\n
`.replace(/\s+/g, " ")

export const getContextPrompts = async (): Promise<{
  systemPrompt: string
  tenantPrompt: string
  userPrompt: string
}> => {
  const [tenant, user] = await getTenantAndUser()
  return {
    systemPrompt: process.env.NEXT_PUBLIC_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
    tenantPrompt: (tenant.preferences?.contextPrompt || "").trim(),
    userPrompt: (user.preferences?.contextPrompt || "").trim(),
  }
}

const buildDataChatSystemPrompt = async (context: string, indexId: string): Promise<string> => {
  const appSettingsResponse = await GetApplicationSettings()

  if (appSettingsResponse.status !== "OK") {
    throw new Error("Failed to get application settings")
  }

  const appSettings = appSettingsResponse.response
  const index = appSettings.indexes.find(idx => idx.id === indexId)
  const instructions = index
    ? index.description
    : `
- Given the following extracted parts of a document, create a final answer.\n
- If the answer is not apparent from the retrieved documents you can respond but let the user know your answer is not based on the documents.\n
- You must always include a citation at the end of your answer and don't include full stop.\n
- Use the format for your citation {% citation items=[{name:"filename 1", id:"file id", order:"1"}, {name:"filename 2", id:"file id", order:"2"}] /%}\n
----------------\n
context:\n`

  return `${instructions}
${context}`
}

const findRelevantDocuments = async (
  query: string,
  chatThreadId: string,
  indexId: string
): Promise<(AzureCogDocumentIndex & DocumentSearchModel)[]> => {
  const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
  const relevantDocuments = await similaritySearchVectorWithScore(query, 10, userId, chatThreadId, tenantId, indexId)
  return relevantDocuments
}

export const buildSimpleChatMessages = async (
  lastChatMessage: PromptMessage
): Promise<{
  systemMessage: ChatCompletionSystemMessageParam
  userMessage: ChatCompletionMessageParam
}> => {
  return {
    systemMessage: {
      role: "system",
      content: await buildSimpleChatSystemPrompt(),
      name: APP_NAME || "System",
    },
    userMessage: {
      role: "user",
      content: lastChatMessage.content,
    },
  }
}

export const buildDataChatMessages = async (
  lastChatMessage: PromptMessage,
  chatThreadId: string,
  indexId: string
): Promise<{
  systemMessage: ChatCompletionSystemMessageParam
  userMessage: ChatCompletionMessageParam
  context: string
}> => {
  const relevantDocuments = await findRelevantDocuments(lastChatMessage.content, chatThreadId, indexId)
  const context = relevantDocuments
    .map((result, index) => {
      const content = result.pageContent.replace(/(\r\n|\n|\r)/gm, "")
      return `[${index}]. file name: ${result.fileName} \n file id: ${result.id} \n order: ${result.order} \n ${content}`
    })
    .join("\n------\n")

  return {
    systemMessage: {
      content: await buildDataChatSystemPrompt(context, indexId),
      role: "system",
      name: APP_NAME || "System",
    },
    userMessage: {
      role: "user",
      content: lastChatMessage.content,
    },
    context,
  }
}

export const buildAudioChatMessages = async (
  lastChatMessage: PromptMessage,
  chatThreadId: string,
  indexId: string
): Promise<{
  systemMessage: ChatCompletionSystemMessageParam
  userMessage: ChatCompletionMessageParam
  context: string
}> => {
  const documents = await FindAllChatDocumentsForCurrentThread(chatThreadId)
  if (documents.status !== "OK") throw documents.errors

  const context = documents.response
    .map((result, index) => {
      return `[${index}]. file name: ${result.name} \n file id: ${result.id} \n ${result.contents}`
    })
    .join("\n------\n")

  return {
    systemMessage: {
      role: "system",
      content: await buildDataChatSystemPrompt(context, indexId),
      name: APP_NAME || "System",
    },
    userMessage: {
      role: "user",
      content: buildAudioChatContextPrompt(context, lastChatMessage.content),
    },
    context,
  }
}

const buildAudioChatContextPrompt = (context: string, userQuestion: string): string => `
- You are ${APP_NAME} an AI Assistant. Who must review the below audio transcriptions, then create a final answer. \n
- If the answer is not apparent from the retrieved documents you can respond but let the user know your answer is not based on the transcript.\n
- You must always include a citation at the end of your answer and don't include full stop.\n
- Use the format for your citation {% citation items=[{name:"filename 1", id:"file id", order:"1"}, {name:"filename 2", id:"file id", order:"2"}] /%}\n
----------------\n
context:\n
${context}
----------------\n
question: ${userQuestion}`
