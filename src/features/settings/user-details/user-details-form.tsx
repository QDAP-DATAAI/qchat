"use client"

import * as Form from "@radix-ui/react-form"
import React, { useState, FormEvent } from "react"

import useSmartGen from "@/components/hooks/use-smart-gen"
import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { useSettingsContext } from "@/features/settings/settings-provider"
import { Button } from "@/features/ui/button"
import { CardSkeleton } from "@/features/ui/card-skeleton"
import { SmartGen } from "@/features/ui/smart-gen"
import { UserPreferences } from "@/features/user-management/models"

type UserDetailsFormProps = { preferences: UserPreferences; name: string; email: string }
export const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ preferences, name, email }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [contextPrompt, setContextPrompt] = useState(preferences.contextPrompt)
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
      ? "Your context prompt could not be updated. Please try again later."
      : "Your context prompt could not be cleared. Please try again later."
    try {
      const response = await fetch("/api/user/details", {
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

  const buildInput = ({
    systemPrompt,
    tenantPrompt,
    userPrompt,
  }: {
    systemPrompt: string
    tenantPrompt: string
    userPrompt: string
  }): string => `
===System Prompt===
${systemPrompt}
===End of System Prompt===

===Tenant Prompt===
${tenantPrompt}
===End of Tenant Prompt===

===User Prompt===
${userPrompt}
===End of User Prompt===
`

  const sanitisePrompt = async (): Promise<void> => {
    try {
      const formatInput = buildInput({
        systemPrompt: config.systemPrompt,
        tenantPrompt: config.contextPrompt,
        userPrompt: input,
      })
      const res = await smartGen({
        toolName: "contextPromptSanitiser",
        context: { uiComponent: "UserDetailsForm" },
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
        Your Details
      </Typography>
      <Typography variant="h5" className="mt-4">
        Name:
        <div className="mt-2 rounded-md bg-altBackgroundShade p-4">{name || <CardSkeleton />}</div>
      </Typography>
      <Typography variant="h5" className="mt-4">
        Email:
        <div className="mt-2 rounded-md bg-altBackgroundShade p-4">{email || <CardSkeleton />}</div>
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
            Set Context Prompt:
            <SmartGen onClick={sanitisePrompt} />
          </Form.Label>
          <Form.Control asChild>
            <textarea
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
        <div className="mb-4 flex gap-4">
          <Form.Submit asChild>
            <Button
              type="submit"
              className="w-[14rem]"
              variant="default"
              disabled={isSubmitting}
              ariaLabel="Update context prompt"
            >
              {isSubmitting ? "Updating..." : "Update Context Prompt"}
            </Button>
          </Form.Submit>
          <Button
            type="button"
            className="w-[14rem]"
            variant="destructive"
            onClick={async () => await submit("")}
            disabled={isSubmitting}
            ariaLabel="Clear context prompt"
          >
            {isSubmitting ? "Clearing..." : "Clear Context Prompt"}
          </Button>
        </div>
      </Form.Root>
    </>
  )
}
