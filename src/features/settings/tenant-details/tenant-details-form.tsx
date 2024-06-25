"use client"

import * as Form from "@radix-ui/react-form"
import React, { useState, FormEvent } from "react"

import useSmartGen from "@/components/hooks/use-smart-gen"
import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { useSettingsContext } from "@/features/settings/settings-provider"
import { TenantDetails } from "@/features/tenant-management/models"
import SystemPrompt from "@/features/theme/readable-systemprompt"
import { Button } from "@/features/ui/button"
import { SmartGen } from "@/features/ui/smart-gen"
import { Textarea } from "@/features/ui/textarea"

export const TenantDetailsForm: React.FC<{ tenant: TenantDetails }> = ({ tenant }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [contextPrompt, setContextPrompt] = useState(tenant.preferences.contextPrompt)
  const [input, setInput] = useState<string>("")
  const { config } = useSettingsContext()
  const { smartGen } = useSmartGen(config.tools || [])

  const handleSubmitContextPrompt = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const newContextPrompt = form.get("contextPrompt") as string
    try {
      await submit(newContextPrompt)
      ;(e.target as HTMLFormElement)?.reset()
    } catch (error) {
      logger.error("Error submitting context prompt", { error })
    }
  }

  async function submit(newContextPrompt: string): Promise<void> {
    setIsSubmitting(true)
    if (contextPrompt === newContextPrompt) {
      setIsSubmitting(false)
      return
    }
    const temp = contextPrompt
    setContextPrompt(newContextPrompt)
    const defaultErrorMessage = contextPrompt
      ? "Context prompt could not be updated. Please try again later."
      : "Context prompt could not be cleared. Please try again later."
    try {
      const response = await fetch(`/api/tenant/${tenant.id}/details`, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextPrompt: newContextPrompt }),
      })
      if (!response.ok) throw new Error(defaultErrorMessage)
      showSuccess({ title: "Success", description: "Context prompt updated successfully!" })
    } catch (error) {
      setContextPrompt(temp)
      setError(true)
      showError(defaultErrorMessage)
      logger.error("Error updating context prompt", { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const buildInput = ({ systemPrompt, tenantPrompt }: { systemPrompt: string; tenantPrompt: string }): string => `
===System Prompt===
${systemPrompt}
===End of System Prompt===

===Tenant Prompt===
${tenantPrompt}
===End of Tenant Prompt===
`

  const sanitisePrompt = async (): Promise<void> => {
    if (input?.length < 1) return

    try {
      const formatInput = buildInput({ systemPrompt: config.systemPrompt, tenantPrompt: input })
      const res = await smartGen({
        toolName: "contextPromptSanitiser",
        context: { uiComponent: "TenantDetailsForm" },
        input: formatInput,
      })
      if (res === null) throw new Error("Error sanitising context prompt. Please try again.")
      const newContextPrompt = res
      setInput(newContextPrompt)
    } catch (error) {
      showError(error instanceof Error ? error.message : JSON.stringify(error))
    }
  }

  return (
    <>
      <Typography variant="h4" className="font-bold underline underline-offset-2">
        Department Information
      </Typography>
      <Typography variant="h5" className="mt-4">
        <strong>Notice:</strong> Updating the context prompt here will append the message to the global system message.
        This setting is regularly audited by the Queensland Government AI Unit.
      </Typography>
      <Typography variant="h5" className="mt-4">
        Current Prompt:
      </Typography>
      <div className="mt-4 rounded-md bg-altBackgroundShade p-4">
        <Markdown content={contextPrompt || "Not set"} />
      </div>
      <Form.Root onSubmit={handleSubmitContextPrompt} className="mt-4 flex flex-col gap-2">
        <Form.Field name="contextPrompt" serverInvalid={error}>
          <Form.Label htmlFor="contextPrompt" className="flex items-center gap-2">
            New Context Prompt:
            <SmartGen onClick={sanitisePrompt} disabled={!input} />
          </Form.Label>
          <Form.Control asChild>
            <Textarea
              id="contextPrompt"
              name="contextPrompt"
              className="mt-4 w-full rounded-md border-2 p-2"
              placeholder="Enter new context prompt..."
              rows={8}
              maxLength={500}
              required
              aria-label="New context prompt"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </Form.Control>
          {error && (
            <Form.Message role="alert" className="my-2 text-alert">
              Error updating context prompt. Please try again.
            </Form.Message>
          )}
        </Form.Field>
        <div className="mb-4 flex justify-end gap-4">
          <Form.Submit asChild>
            <Button
              type="submit"
              className="w-[14rem]"
              variant="default"
              disabled={isSubmitting}
              ariaLabel="Save prompt"
            >
              {isSubmitting ? "Saving..." : "Save prompt"}
            </Button>
          </Form.Submit>
          <Button
            type="button"
            className="w-[14rem] overflow-hidden text-ellipsis whitespace-nowrap"
            variant="destructive"
            onClick={async () => await submit("")}
            disabled={isSubmitting}
            ariaLabel="Clear prompt"
          >
            {isSubmitting ? "Clearing..." : "Clear prompt"}
          </Button>
        </div>
      </Form.Root>
      <Typography variant="h5" className="my-2">
        Current System Prompt:
      </Typography>
      <SystemPrompt />
    </>
  )
}
