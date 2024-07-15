"use client"

import { FC } from "react"
import { useFormState } from "react-dom"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { Button } from "@/features/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/features/ui/sheet"

import { CitationAction } from "./citation-action"

interface SliderProps {
  name: string
  index: number
  id: string
  tenantId: string
  userId: string
  order: number
  chatThreadId: string
}

export const CitationSlider: FC<SliderProps> = props => {
  const chatContext = useChatContext()
  const { userId, tenantId } = chatContext.chatBody
  const chatThreadId = chatContext.id
  const [node, formAction] = useFormState(CitationAction, null)

  const handleButtonClick = (): void => {
    const formData = new FormData()
    formData.append("index", props.index.toString())
    formData.append("id", props.id)
    formData.append("userId", userId)
    formData.append("tenantId", tenantId)
    formData.append("chatThreadId", chatThreadId)
    formData.append("order", props.order.toString())
    formData.append("name", props.name)
    formAction(formData)
  }

  return (
    <form>
      <input type="hidden" name="id" value={props.order} />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            ariaLabel={`Citation number ${props.order}`}
            variant="outline"
            onClick={handleButtonClick}
            type="button"
            value={props.order}
          >
            {props.order}
          </Button>
        </SheetTrigger>
        <SheetContent aria-modal="true" role="dialog" aria-labelledby={"Section" + props.order}>
          <SheetHeader>
            <SheetTitle id={"Section" + props.order}>Citation for Section {props.order}</SheetTitle>
          </SheetHeader>
          {node}
        </SheetContent>
      </Sheet>
    </form>
  )
}
