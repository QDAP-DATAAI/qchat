import { ChatCompletionMessageParam } from "openai/resources"

import { AGENCY_NAME, APP_NAME } from "@/app-global"

import { getTenantAndUser } from "@/features/auth/helpers"
import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { ChatRole, PromptMessage } from "@/features/chat/models"

import { DocumentSearchModel } from "./azure-cog-search/azure-cog-vector-store"
import { AzureCogDocumentIndex, similaritySearchVectorWithScore } from "./azure-cog-search/azure-cog-vector-store"
import { FindAllChatDocumentsForCurrentUser } from "./chat-document-service"

const DEFAULT_SYSTEM_PROMPT = `
- You are ${APP_NAME} who is a helpful AI Assistant developed to assist ${AGENCY_NAME} employees in their day-to-day tasks. \n
- You will provide clear and concise queries, and you will respond with polite and professional answers. \n
- You will answer questions truthfully and accurately. \n
- You will respond to questions in accordance with rules of ${AGENCY_NAME}. \n`.replace(/\s+/g, "^")

const buildSimpleChatSystemPrompt = async (): Promise<string> => {
  const metaPrompt = process.env.NEXT_PUBLIC_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT
  const [tenant, user] = await getTenantAndUser()

  const tenantContextPrompt = (tenant.preferences?.contextPrompt || "").trim()
  const userContextPrompt = (user.preferences?.contextPrompt || "").trim()
  return `${metaPrompt}\n\n${tenantContextPrompt}\n\n${userContextPrompt}`
}

export const getContextPrompts = async (): Promise<{
  metaPrompt: string
  tenantPrompt: string
  userPrompt: string
}> => {
  const [tenant, user] = await getTenantAndUser()
  return {
    metaPrompt: process.env.NEXT_PUBLIC_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
    tenantPrompt: (tenant.preferences?.contextPrompt || "").trim(),
    userPrompt: (user.preferences?.contextPrompt || "").trim(),
  }
}

const buildDataChatSystemPrompt = (): string => `You are ${APP_NAME} who is a helpful AI Assistant.`
const buildDataChatContextPrompt = (context: string, userQuestion: string): string => `
- Given the following extracted parts of a document, create a final answer. \n
- If you don't know the answer, just say that you don't know. Don't try to make up an answer.\n
- You must always include a citation at the end of your answer and don't include full stop.\n
- Use the format for your citation {% citation items=[{name:"filename 1", id:"file id", order:"1"}, {name:"filename 2", id:"file id", order:"2"}] /%}\n
----------------\n
context:\n
${context}
----------------\n
question: ${userQuestion}`

const findRelevantDocuments = async (
  query: string,
  chatThreadId: string
): Promise<(AzureCogDocumentIndex & DocumentSearchModel)[]> => {
  const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
  const relevantDocuments = await similaritySearchVectorWithScore(query, 10, userId, chatThreadId, tenantId)
  return relevantDocuments
}

export const buildSimpleChatMessages = async (
  lastChatMessage: PromptMessage
): Promise<{
  systemMessage: ChatCompletionMessageParam
  userMessage: ChatCompletionMessageParam
}> => {
  return {
    systemMessage: {
      role: ChatRole.System,
      content: await buildSimpleChatSystemPrompt(),
      // name: APP_NAME || "System",
    },
    userMessage: {
      role: ChatRole.User,
      content: lastChatMessage.content,
      // name: lastChatMessage.name || "User",
    },
  }
}

export const buildDataChatMessages = async (
  lastChatMessage: PromptMessage,
  chatThreadId: string
): Promise<{
  systemMessage: ChatCompletionMessageParam
  userMessage: ChatCompletionMessageParam
  context: string
}> => {
  const relevantDocuments = await findRelevantDocuments(lastChatMessage.content, chatThreadId)
  const context = relevantDocuments
    .map((result, index) => {
      const content = result.pageContent.replace(/(\r\n|\n|\r)/gm, "")
      const context = `[${index}]. file name: ${result.fileName} \n file id: ${result.id} \n order: ${result.order} \n ${content}`
      return context
    })
    .join("\n------\n")

  return {
    systemMessage: {
      role: ChatRole.System,
      content: buildDataChatSystemPrompt(),
      // name: APP_NAME || "System",
    },
    userMessage: {
      role: ChatRole.User,
      content: buildDataChatContextPrompt(context, lastChatMessage.content),
      // name: lastChatMessage.name || "User",
    },
    context,
  }
}

export const buildAudioChatMessages = async (
  lastChatMessage: PromptMessage,
  chatThreadId: string
): Promise<{
  systemMessage: ChatCompletionMessageParam
  userMessage: ChatCompletionMessageParam
  context: string
}> => {
  const documents = await FindAllChatDocumentsForCurrentUser(chatThreadId)
  if (documents.status !== "OK") throw documents.errors

  const context = documents.response
    .map((result, index) => {
      const context = `[${index}]. file name: ${result.name} \n file id: ${result.id} \n ${result.contents}`
      return context
    })
    .join("\n------\n")

  return {
    systemMessage: {
      role: ChatRole.System,
      content: buildDataChatSystemPrompt(),
      // name: APP_NAME || "System",
    },
    userMessage: {
      role: ChatRole.User,
      content: buildAudioChatContextPrompt(context, lastChatMessage.content),
      // name: lastChatMessage.name || "User",
    },
    context,
  }
}

const buildAudioChatContextPrompt = (context: string, userQuestion: string): string => `
- You are ${APP_NAME} an AI Assistant. Who must review the below audio transcriptions, then create a final answer. \n
- If you don't know the answer, just say that you don't know. Don't try to make up an answer.\n
- You must always include a citation at the end of your answer and don't include full stop.\n
- Use the format for your citation {% citation items=[{name:"filename 1", id:"file id", order:"1"}, {name:"filename 2", id:"file id", order:"2"}] /%}\n
----------------\n
context:\n
${context}
----------------\n
question: ${userQuestion}`
