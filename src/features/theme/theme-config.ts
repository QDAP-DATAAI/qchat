export const AI_NAME = "QChat"
export const AI_TAGLINE = "The Queensland Government AI Assistant"
export const AI_AUTHOR = "Queensland Government AI Unit"

export const AI_DESCRIPTION = "Azure Chat is a friendly AI assistant."
export const CHAT_DEFAULT_PERSONA = AI_NAME + " default"
export const CHAT_DEFAULT_SYSTEM_PROMPT = `You are a friendly ${AI_NAME} AI assistant. You must always return in markdown format.

You have access to the following functions:
1. create_img: You must only use the function create_img if the user asks you to create an image.`

export const NEW_CHAT_NAME = "New chat"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://qchat.ai.qld.gov.au"
