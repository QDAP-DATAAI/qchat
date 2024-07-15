"use client"
import { SaveIcon } from "lucide-react"
import React, { useState } from "react"

import { UpdateChatDocument } from "@/features/chat/chat-services/chat-document-service"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import { useButtonStyles } from "@/features/ui/assistant-buttons/use-button-styles"
import { Button } from "@/features/ui/button"

type ChangeTranscriptButtonProps = {
  documentId: string
  chatThreadId: string
  updatedContents: string
  onSave: () => void
}

export const ChangeTranscriptButton: React.FC<ChangeTranscriptButtonProps> = ({
  documentId,
  chatThreadId,
  updatedContents,
  onSave,
}) => {
  const { iconSize, buttonClass } = useButtonStyles()
  const [saveClicked, setSaveClicked] = useState(false)

  const handleSaveButton = async (): Promise<void> => {
    setSaveClicked(true)
    try {
      const response = await UpdateChatDocument(documentId, chatThreadId, updatedContents)
      if (response.status !== "OK") {
        throw new Error("Failed to save document.")
      }
      showSuccess({ title: "Document saved successfully" })
      onSave()
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
      ariaLabel="Save changes"
      variant={"default"}
      size={"default"}
      className={`${buttonClass} ${saveClicked ? "mr-2 bg-button text-buttonText" : ""}`}
      title="Save changes"
      onClick={handleSaveButton}
    >
      Save Changes
      <SaveIcon className="ml-2" size={iconSize} />
    </Button>
  )
}
