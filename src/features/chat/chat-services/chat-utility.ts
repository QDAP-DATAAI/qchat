"use server"
import "server-only"
import { ChatThreadModel } from "./models"
import { UpsertChatThread } from "./chat-thread-service"
import { GenericChatAPI } from "./generic-chat-api"

async function generateChatName(chatMessage: string): Promise<string> {
  const apiName = "generateChatName"
  try {
    const name = await GenericChatAPI(apiName, {
      messages: [
        {
          role: "system",
          content: `- create a succinct title, limited to five words and 20 characters, for the following chat """${chatMessage}""" conversation with a generative AI assistant:
                - this title should effectively summarise the main topic or theme of the chat.
                - it will be used in the app's navigation interface, so it should be easily understandable and reflective of the chat's content 
                to help users quickly grasp what the conversation was about.`,
        },
      ],
    })

    if (name) {
      return name.replace(/^"+|"+$/g, "")
    } else {
      console.log("Error: Unexpected response structure from OpenAI API.")
    }

    return name || "New Chat by Error"
  } catch (e) {
    console.error("Error generating chat name:", e)
    return "New Chat by Error"
  }
}

export async function generateChatCategory(chatMessage: string): Promise<string> {
  const apiName = "generateChatCategory"
  const categories = [
    "Information Processing and Management",
    "Communication and Interaction",
    "Decision Support and Advisory",
    "Educational and Training Services",
    "Operational Efficiency and Automation",
    "Public Engagement and Services",
    "Innovation and Development",
    "Creative Assistance",
    "Lifestyle and Personal Productivity",
    "Entertainment and Engagement",
    "Emotional and Mental Support",
  ]

  try {
    const category = await GenericChatAPI(apiName, {
      messages: [
        {
          role: "user",
          content: `Categorise this chat session inside double quotes ""${chatMessage}"" into only one of the following 
                categories: ${categories.join(", ")} based on my query`,
        },
      ],
    })

    return category || "Uncategorised"
  } catch (_e) {
    return "Uncategorised"
  }
}

export async function updateChatThreadIfUncategorised(
  chatThread: ChatThreadModel,
  content: string
): Promise<ChatThreadModel> {
  try {
    if (chatThread.chatCategory === "Uncategorised") {
      chatThread.chatCategory = await generateChatCategory(content)
      chatThread.name = await generateChatName(content)
      chatThread.previousChatName = await StoreOriginalChatName(chatThread.name)
      await UpsertChatThread(chatThread)
    }
    return chatThread
  } catch (e) {
    console.error("Failed to update chat thread due to an error:", e)
    throw e
  }
}

export async function StoreOriginalChatName(currentChatName: string): Promise<string> {
  let previousChatName: string = ""
  if (currentChatName !== previousChatName) {
    previousChatName = currentChatName
  }
  return previousChatName
}
