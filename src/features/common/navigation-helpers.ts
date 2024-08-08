"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { showError } from "@/features/globals/global-message-store"

type Page = "extensions" | "persona" | "prompt" | "chat" | "settings"

interface RevalidateCacheProps {
  page: Page
  params?: string
  type?: "layout" | "page"
}

/**
 * Revalidate the cache for a specific page and optional parameters.
 *
 * @param {RevalidateCacheProps} props - Properties for cache revalidation
 * @param {Page} props.page - The page to revalidate
 * @param {string} [props.params] - Optional parameters for the page
 * @param {"layout" | "page"} [props.type] - Type of revalidation
 */
export const RevalidateCache = async ({ page, params, type }: RevalidateCacheProps): Promise<void> => {
  try {
    if (params) {
      await revalidatePath(`/${page}/${params}`, type)
    } else {
      await revalidatePath(`/${page}`, type)
    }
  } catch (error) {
    showError("Error revalidating cache:" + error)
  }
}

/**
 * Redirect to a specific page.
 *
 * @param {Page} path - The page to redirect to
 */
export const RedirectToPage = async (path: Page): Promise<void> => {
  try {
    await redirect(`/${path}`)
  } catch (error) {
    showError("Error redirecting to page:" + error)
  }
}

/**
 * Redirect to a specific chat thread.
 *
 * @param {string} chatThreadId - The ID of the chat thread to redirect to
 */
export const RedirectToChatThread = async (chatThreadId: string): Promise<void> => {
  try {
    await redirect(`/chat/${chatThreadId}`)
  } catch (error) {
    showError("Error redirecting to chat thread:" + error)
  }
}
