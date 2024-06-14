"use client"

import { Sparkles, Sparkle } from "lucide-react"
import { useState } from "react"

import useSmartGen from "@/components/hooks/use-smart-gen"
import { PromptMessage } from "@/features/chat/models"
import logger from "@/features/insights/app-insights"
import { useSettingsContext } from "@/features/settings/settings-provider"
import { SmartGenToolName } from "@/features/smart-gen/models"
import { Button } from "@/features/ui/button"

import { useButtonStyles } from "./use-button-styles"

export type RewriteMessageButtonProps = {
  fleschScore: number
  message: PromptMessage
  onAssistantButtonClick: (result: string) => void
}
export const RewriteMessageButton: React.FC<RewriteMessageButtonProps> = ({
  fleschScore,
  message,
  onAssistantButtonClick,
}) => {
  const { iconSize, buttonClass } = useButtonStyles()
  const { config } = useSettingsContext()

  const { smartGen } = useSmartGen(config.tools || [])

  const [rewriteClicked, setRewriteClicked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRewriteWithSuggestions = async (): Promise<void> => {
    setRewriteClicked(true)
    setIsLoading(true)

    try {
      const response = await smartGen({
        toolName: getRewriterAction(fleschScore, !!message.contentFilterResult),
        context: { message, uiComponent: "RewriteMessageButton" },
        input: message.content,
      })
      if (!response) throw new Error("Failed to save smart-gen output")
      onAssistantButtonClick(response)
    } catch (error) {
      logger.error(error instanceof Error ? error.message : JSON.stringify(error))
    } finally {
      setIsLoading(false)
      setTimeout(() => setRewriteClicked(false), 2000)
    }
  }

  return (
    <Button
      ariaLabel="Rewrite with suggestions"
      variant={"ghost"}
      size={"default"}
      className={`${buttonClass} ${rewriteClicked ? "bg-button text-buttonText" : ""}`}
      title="Rewrite with suggestions"
      onClick={handleRewriteWithSuggestions}
    >
      {rewriteClicked ? (
        <Sparkles size={iconSize} className={isLoading ? "animate-spin" : ""} />
      ) : (
        <Sparkle size={iconSize} />
      )}
    </Button>
  )
}

const getRewriterAction = (score: number, contentFilter: boolean): SmartGenToolName => {
  if (contentFilter) return "formatToExplain"
  if (score > 8) return "formatToSimplify"
  if (score <= 8) return "formatToImprove"
  return "formatToImprove"
}
