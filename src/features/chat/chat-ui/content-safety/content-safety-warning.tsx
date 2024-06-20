import { OctagonAlert } from "lucide-react"
import React, { FC } from "react"

import { QGovTextCategoriesAnalysisOutput } from "@/features/chat/chat-services/content-safety"
import {
  categorySeverityMessageMap,
  categoryIconMap,
  ContentSafetyCategory,
} from "@/features/chat/chat-services/content-safety"

export const ContentSafetyWarning: FC<{ QGovTextCategoriesAnalysisOutput: QGovTextCategoriesAnalysisOutput }> = ({
  QGovTextCategoriesAnalysisOutput,
}) => {
  const warningMessages = QGovTextCategoriesAnalysisOutput.categories
    .map(cat => categorySeverityMessageMap[cat.category as ContentSafetyCategory])
    .join(", ")

  const Icons = QGovTextCategoriesAnalysisOutput.categories.map(cat => {
    const IconComponent = categoryIconMap[cat.category as ContentSafetyCategory]
    return <IconComponent size={20} key={`icon-${cat.category}`} />
  })

  return (
    <div
      className="my-2 flex max-w-none justify-center space-x-2 rounded-md bg-alert p-2 text-base text-primary md:text-base"
      tabIndex={0}
      aria-label="Content Safety Warning"
    >
      <div className="flex items-center justify-center">{Icons.length > 0 ? Icons : <OctagonAlert size={20} />}</div>
      <div className="flex flex-grow items-center justify-center text-center">
        This message has triggered our content safety warnings and may {warningMessages}. Please rephrase your message,
        start a new chat or reach out to support if you have concerns.
      </div>
      <div className="flex items-center justify-center">{Icons.length > 0 ? Icons : <OctagonAlert size={20} />}</div>
    </div>
  )
}

export default ContentSafetyWarning
