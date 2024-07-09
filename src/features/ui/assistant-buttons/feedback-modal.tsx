import React, { FC, useCallback } from "react"

import Typography from "@/components/typography"
import { FeedbackType } from "@/features/chat/models"
import { Button } from "@/features/ui/button"
import FeedbackButtons from "@/features/ui/feedback-reasons"
import { FeedbackTextarea } from "@/features/ui/feedback-textarea"
interface FeedbackModalProps {
  chatThreadId: string
  chatMessageId: string
  feedbackType?: FeedbackType
  onFeedbackTypeChange: (FeedbackType: FeedbackType) => void
  feedbackReason?: string
  onFeedbackReasonChange: (text: string) => void
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function FeedbackModal(props: FeedbackModalProps): ReturnType<FC> {
  const {
    chatMessageId,
    feedbackReason,
    onFeedbackReasonChange,
    feedbackType,
    onFeedbackTypeChange,
    open,
    onClose,
    onSubmit,
  } = props

  const handleFeedbackReasonChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onFeedbackReasonChange(event.target.value)
    },
    [onFeedbackReasonChange]
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedbackHeading"
      className={`fixed inset-0 z-90 flex items-center justify-center bg-black/50 ${open ? "block" : "hidden"}`}
    >
      <div className="z-90 mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-background p-4">
        <div className="mb-4">
          <Typography id={`${chatMessageId} feedbackHeading`} variant="h4">
            Submit your feedback
          </Typography>
        </div>
        <div className="mb-4">
          <FeedbackTextarea
            name={chatMessageId + "Feedback text"}
            id={chatMessageId + "Feedback text id"}
            aria-label="Enter your feedback"
            placeholder="Please provide any additional details about the message or your feedback, our team will not reply directly but it will assist us in improving our service."
            rows={4}
            className="w-full rounded border border-gray-300 bg-background p-4"
            value={feedbackReason}
            onChange={handleFeedbackReasonChange}
          />
        </div>

        <FeedbackButtons selectedType={feedbackType ?? FeedbackType.None} onFeedbackTypeChange={onFeedbackTypeChange} />
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="default" onClick={onSubmit} disabled={(feedbackReason || "").trim().length === 0}>
            Submit
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
