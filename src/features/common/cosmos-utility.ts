import "server-only"
import { getTenantId, userHashedId } from "@/features/auth/helpers"
import { CosmosDBContainer } from "./services/cosmos"
import { ChatRole, ChatUtilityModel } from "../chat/chat-services/models"
import { uniqueId } from "@/features/common/util"
import { handleCosmosError } from "./cosmos-error"

interface UtilityFunctionParams {
  [key: string]: unknown
}

export const SaveUtilityFunctionUsage = async <ParamsType extends UtilityFunctionParams, ResultType>(
  chatThreadId: string,
  utilityFunctionName: string,
  utilityFunctionParams: ParamsType,
  utilityFunctionResult: ResultType
): Promise<ChatUtilityModel> => {
  try {
    const container = await CosmosDBContainer.getInstance().getContainer()
    const [tenantId, userId] = await Promise.all([getTenantId(), userHashedId()])

    const chatUtilityMessage: ChatUtilityModel = {
      id: "uf-" + uniqueId(),
      name: utilityFunctionName,
      chatThreadId: chatThreadId,
      userId: userId,
      tenantId: tenantId,
      isDeleted: false,
      createdAt: new Date(),
      content: `Parameters: ${JSON.stringify(utilityFunctionParams)}, Result: ${JSON.stringify(utilityFunctionResult)}`,
      role: ChatRole.System,
      type: "CHAT_UTILITY",
    }
    const { resource } = await container.items.create<ChatUtilityModel>(chatUtilityMessage)
    if (!resource) {
      throw new Error("Failed to save utility function usage")
    }
    return resource
  } catch (error) {
    handleCosmosError(error as Error & { code?: number })
    throw error
  }
}

export const UseUtilityFunctionAndLog = async (chatThreadId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const utilityFunctionName = "ExampleUtilityFunction"
    const utilityFunctionParams = { param1: "value1", param2: "value2" }
    const utilityFunctionResult = "Result of the utility function"

    await SaveUtilityFunctionUsage(chatThreadId, utilityFunctionName, utilityFunctionParams, utilityFunctionResult)

    return { success: true }
  } catch (error) {
    console.error("Error saving utility function usage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred saving utility usage to cosmos",
    }
  }
}
