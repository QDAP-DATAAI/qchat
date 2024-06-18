import * as Label from "@radix-ui/react-label"
import React, { useState, useEffect } from "react"

import Typography from "@/components/typography"
import { AssociateReferenceWithChatThread } from "@/features/chat/chat-services/chat-thread-service"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import logger from "@/features/insights/app-insights"
import { TenantPreferences } from "@/features/tenant-management/models"
import { GetTenantById } from "@/features/tenant-management/tenant-service"
import { Button } from "@/features/ui/button"

interface TranscriptFormProps {
  chatThreadId: string
  tenantId: string
}

const defaultPreferences: TenantPreferences = {
  contextPrompt: "Enter reference ID",
  history: [],
}

export const TranscriptForm = ({ chatThreadId, tenantId }: TranscriptFormProps): JSX.Element => {
  const { chatBody, setChatBody } = useChatContext()
  const [submitting, setSubmitting] = useState(false)
  const [isIdSaved, setIsIdSaved] = useState(false)
  const [message, setMessage] = useState("")
  const [preferences, setPreferences] = useState<TenantPreferences>(defaultPreferences)

  useEffect(() => {
    const fetchPreferences = async (): Promise<void> => {
      try {
        const tenant = await GetTenantById(tenantId)
        if (tenant.status !== "OK") throw new Error("Tenant not found")
        setPreferences(tenant.response.preferences || defaultPreferences)
      } catch (error) {
        logger.error("Error fetching tenant preferences: " + error)
        setPreferences(defaultPreferences)
      }
    }

    fetchPreferences().catch(error => logger.error("Error in fetchPreferences: " + error))
  }, [tenantId])

  const handleSubmit = async (event: { preventDefault: () => void }): Promise<void> => {
    event.preventDefault()
    setSubmitting(true)
    setMessage("")

    try {      
      await AssociateReferenceWithChatThread(chatThreadId, chatBody.internalReference)
      setMessage(`Reference ID ${chatBody.internalReference} saved.`)
      setIsIdSaved(true)
    } catch (_error) {
      setMessage("Failed to save reference ID.")
      setIsIdSaved(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    const internalReference = chatBody.internalReference ? value : ""
    setChatBody({ ...chatBody, internalReference })
  }

  const regex = /^[A-Za-z][0-9]{6}$/
  const placeholder = preferences.contextPrompt || "Enter reference ID"
  const title = "ID must start with a letter followed by six digits (e.g., A123456)"

  return (
    <div className="bg-background p-5">
      {isIdSaved ? (
        <Typography variant="p" className="text-muted-foreground">
          Internal Reference ID {chatBody.internalReference} saved.
        </Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex grid-cols-3 flex-wrap items-center gap-[15px]">
            <Label.Root htmlFor="internalReference" className="leading-[35px] text-muted-foreground">
              Internal Reference Number:
            </Label.Root>
            <input
              className="bg-inputBackground shadow-blackA6 inline-flex h-[35px] w-[200px] appearance-none items-center justify-center rounded-[4px] px-[10px] leading-none text-muted-foreground shadow-[0_0_0_1px] outline-none selection:bg-accent selection:text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
              type="text"
              id="internalReference"
              name="internalReference"
              placeholder={placeholder}
              pattern={regex.source}
              title={title}
              required
              autoComplete="off"              
              value={chatBody.internalReference}
              onChange={handleReferenceChange}
            />
            <Button variant="default" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
          {message && (
            <div aria-live="polite" className="text-muted-foreground">
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  )
}
