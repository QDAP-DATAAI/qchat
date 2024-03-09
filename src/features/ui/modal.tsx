import React, { FC, useState, useRef } from "react"
import Typography from "@/components/typography"
import { FeedbackTextarea } from "./feedback-textarea"
import FeedbackButtons from "./feedback-reasons"
import { Button } from "./button"
import { CreateUserFeedbackChatId } from "@/features/chat/chat-services/chat-service"
import { ChatSentiment } from "@/features/chat/chat-services/models"

interface ModalProps {
  chatThreadId: string
  chatMessageId: string
  open: boolean
  onClose: () => void
  onSubmit: (chatMessageId: string, feedback: string, reason: string, chatThreadId: string) => void
}

export default function Modal(props: ModalProps): ReturnType<FC> {
  const [feedback, setFeedback] = useState<string>("")
  const [reason, setReason] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [areTabsEnabled, setTabsEnabled] = useState<boolean>(false)

  const textareaId = `chatMessageFeedback-${props.chatThreadId}`
  const textareaName = `chatMessageFeedback-${props.chatThreadId}`

  async function handleFeedbackChange(): Promise<void> {
    const textareaValue = textAreaRef.current?.value || ""
    if (!areTabsEnabled) {
      setTabsEnabled(true)
    }
    setFeedback(textareaValue)
  }

  const handleReasonChange = (reason: string): void => {
    setReason(reason)
  }

  async function handleSubmit(): Promise<void> {
    props.onSubmit(props.chatMessageId, feedback, reason, props.chatThreadId)
    setFeedback("")
    await CreateUserFeedbackChatId(props.chatMessageId, feedback, ChatSentiment.Negative, reason, props.chatThreadId)
    props.onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedbackHeading"
      className={`fixed inset-0 flex items-center justify-center bg-black ${props.open ? "block" : "hidden"}`}
    >
      <div className="bg-background mx-auto w-full max-w-lg overflow-hidden rounded-lg p-4">
        <div className="mb-4">
          <Typography id="feedbackHeading" variant="h4" className="text-primary">
            Submit your feedback
          </Typography>
        </div>
        <div className="mb-4">
          <FeedbackTextarea
            id={textareaId}
            name={textareaName}
            aria-label="Enter your feedback"
            placeholder="Please provide any additional details about the message or your feedback, our team will not reply directly but it will assist us in improving our service."
            ref={textAreaRef}
            rows={6}
            className="bg-background w-full rounded border border-gray-300 p-4"
            onChange={async () => handleFeedbackChange()}
          />
        </div>
        <FeedbackButtons areTabsEnabled={areTabsEnabled} onReasonChange={handleReasonChange} />
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="default" onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="secondary" onClick={props.onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
