"use client"
import { SaveIcon } from "lucide-react"
import React, { useState } from "react"

import { UpdateChatDocument } from "@/features/chat/chat-services/chat-document-service"
import { showError } from "@/features/globals/global-message-store"
import { useButtonStyles } from "@/features/ui/assistant-buttons/use-button-styles"
import { Button } from "@/features/ui/button"

type SaveButtonProps = {
  documentId: string
  updatedContents: string
}

export const SaveButton: React.FC<SaveButtonProps> = ({ documentId, updatedContents }) => {
  const { iconSize, buttonClass } = useButtonStyles()
  const [saveClicked, setSaveClicked] = useState(false)

  const handleSaveButton = async (): Promise<void> => {
    setSaveClicked(true)
    try {
      const response = await UpdateChatDocument(documentId, updatedContents)
      if (response.status !== "OK") {
        throw new Error("Failed to save document.")
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Something went wrong and the document has not been saved."
      showError(error)
    } finally {
      setTimeout(() => {
        setSaveClicked(false)
      }, 2000)
    }
  }

  return (
    <Button
      ariaLabel="Save document"
      variant={"ghost"}
      size={"default"}
      className={`${buttonClass} ${saveClicked ? "bg-button text-buttonText" : ""}`}
      title="Save document"
      onClick={handleSaveButton}
    >
      <SaveIcon size={iconSize} />
    </Button>
  )
}
