"use client"
import { SaveIcon } from "lucide-react"
import React from "react"

import { UpdateChatDocument } from "@/features/chat/chat-services/chat-document-service"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import { useButtonStyles } from "@/features/ui/assistant-buttons/use-button-styles"
import { Button } from "@/features/ui/button"

type ChangeTranscriptButtonProps = {
  documentId: string
  chatThreadId: string
  updatedContents: string
  accuracy: number
  onSave: () => void
}

export const ChangeTranscriptButton: React.FC<ChangeTranscriptButtonProps> = ({
  documentId,
  chatThreadId,
  updatedContents,
  accuracy,
  onSave,
}) => {
  const { iconSize, buttonClass } = useButtonStyles()

  const handleSaveButton = async (): Promise<void> => {
    try {
      const response = await UpdateChatDocument(documentId, chatThreadId, updatedContents, accuracy)
      if (response.status !== "OK") {
        throw new Error("Failed to save document.")
      }
      showSuccess({ title: "Document saved successfully" })
      onSave()
    } catch (err) {
      const error = err instanceof Error ? err.message : "Something went wrong and the document has not been saved."
      showError(error)
    }
  }

  return (
    <Button
      ariaLabel="Save changes"
      variant={"default"}
      size={"default"}
      className={`${buttonClass}`}
      title="Save changes"
      onClick={handleSaveButton}
    >
      Save Changes
      <SaveIcon className="ml-2" size={iconSize} />
    </Button>
  )
}
