import { GenericChatAPI } from "@/features/chat/chat-services/generic-chat-api"
import logger from "@/features/insights/app-insights"

const inputRegex = /{{\s*input\s*}}/g

export function contextPromptSanitiser(template: string): (input: string) => Promise<string> {
  return async (input: string) => {
    try {
      const isValid = template.match(inputRegex)
      if (!isValid) throw new Error("Invalid template")

      const result = await GenericChatAPI("contextPromptSanitiser", {
        messages: [
          {
            role: "system",
            content: template.replace(inputRegex, input),
          },
        ],
      })

      if (result === null || result === undefined) throw new Error("Error sanitising context prompt. Please try again.")
      // eslint-disable-next-line
      console.log({ result })
      return result
    } catch (error) {
      // eslint-disable-next-line
      console.error({ error })
      logger.error("Error sanitising context prompt", { error })
      throw error
    }
  }
}

export function formatToImprove(template: string): (input: string) => Promise<string> {
  return async (input: string) => {
    const combinedInput = template.replace(inputRegex, input)
    const result = await Promise.resolve(combinedInput)
    return result
  }
}

export function formatToSimplify(template: string): (input: string) => Promise<string> {
  return async (input: string) => {
    const combinedInput = template.replace(inputRegex, input)
    const result = await Promise.resolve(combinedInput)
    return result
  }
}

export function formatToExplain(template: string): (input: string) => Promise<string> {
  return async (input: string) => {
    const combinedInput = template.replace(inputRegex, input)
    const result = await Promise.resolve(combinedInput)
    return result
  }
}
