"use client"

import * as Form from "@radix-ui/react-form"
import { Trash } from "lucide-react"
import React, { useState, FormEvent, useEffect } from "react"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import { useAppInsightsContext } from "@/features/insights/app-insights-context"
import { TenantDetails } from "@/features/tenant-management/models"
import SystemPrompt from "@/features/theme/readable-systemprompt"
import { Button } from "@/features/ui/button"
import { CardSkeleton } from "@/features/ui/card-skeleton"

interface PromptFormProps {}

interface ErrorResponse {
  error?: string | { errors: string[] }
  message?: string
}

export const TenantDetailsForm: React.FC<PromptFormProps> = () => {
  const { logError, logEvent } = useAppInsightsContext()
  const [tenant, setTenant] = useState<TenantDetails>()
  const [isSubmittingContextPrompt, setIsSubmittingContextPrompt] = useState(false)
  const [isSubmittingGroups, setIsSubmittingGroups] = useState(false)
  const [serverErrors, setServerErrors] = useState({ contextPrompt: false, groups: false })
  const [isLoading, setIsLoading] = useState(true)
  const [contextPrompt, setContextPrompt] = useState("")
  const [deleteGroupId, setDeleteGroupId] = useState("")

  const fetchDetails = async (): Promise<TenantDetails> => {
    const res = await fetch("/api/tenant/details", { method: "GET" })
    return (await res.json()).data as TenantDetails
  }

  useEffect(() => {
    fetchDetails()
      .then(res => {
        setTenant(res)
        setContextPrompt(res.preferences.contextPrompt)
      })
      .catch(err => {
        showError(
          "Tenant settings couldn't be loaded, please try again. Error Details: " + (err.message || "Unknown Error"),
          logError
        )
      })
      .finally(() => setIsLoading(false))
  }, [logError])

  const extractErrorMessage = (data: ErrorResponse): string => {
    if (typeof data.error === "string") {
      return data.error
    }
    if (data.error && Array.isArray(data.error.errors)) {
      return data.error.errors.join(", ")
    }
    return data.message || "An unexpected error occurred"
  }

  const parseJSON = async (response: Response): Promise<ErrorResponse> => {
    const text = await response.text()
    if (!text) {
      return {}
    }
    try {
      return JSON.parse(text)
    } catch (error) {
      logError(new Error("Error parsing JSON response"), { error })
      return {}
    }
  }

  const handleSubmitContextPrompt = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const newContextPrompt = new FormData(e.currentTarget).get("contextPrompt") as string

    setIsSubmittingContextPrompt(true)
    setServerErrors({ ...serverErrors, contextPrompt: false })

    const temp = tenant?.preferences.contextPrompt || ""
    setContextPrompt(newContextPrompt)

    const response = await fetch("/api/tenant/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contextPrompt: newContextPrompt,
      }),
    })

    const data: ErrorResponse = await parseJSON(response)

    if (!response.ok) {
      showError(extractErrorMessage(data), logError)
      setContextPrompt(temp)
      setServerErrors({ ...serverErrors, contextPrompt: true })
    } else {
      showSuccess({ title: "Success", description: "Context prompt updated successfully!" }, logEvent)
      await fetchDetails().then(res => setTenant(res))
      ;(e.target as HTMLFormElement)?.reset()
    }

    setIsSubmittingContextPrompt(false)
  }

  const handleSubmitGroups = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const newGroupGuids = new FormData(e.currentTarget).get("newGroups") as string

    setIsSubmittingGroups(true)
    setServerErrors({ ...serverErrors, groups: false })

    const response = await fetch("/api/tenant/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groups: newGroupGuids.split(",").map(guid => guid.trim()),
      }),
    })

    const data: ErrorResponse = await parseJSON(response)

    if (!response.ok) {
      showError(extractErrorMessage(data), logError)
      setServerErrors({ ...serverErrors, groups: true })
    } else {
      showSuccess({ title: "Success", description: "Groups updated successfully!" }, logEvent)
      await fetchDetails().then(res => setTenant(res))
      ;(e.target as HTMLFormElement)?.reset()
    }

    setIsSubmittingGroups(false)
  }

  const handleDeleteGroup = async (group: string): Promise<void> => {
    setIsSubmittingGroups(true)
    setServerErrors({ ...serverErrors, groups: false })

    const response = await fetch("/api/tenant/groups", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupGuids: [group],
      }),
    })

    const data: ErrorResponse = await parseJSON(response)

    if (!response.ok) {
      showError(extractErrorMessage(data), logError)
      setServerErrors({ ...serverErrors, groups: true })
    } else {
      showSuccess({ title: "Success", description: "Group deleted successfully!" }, logEvent)
      setDeleteGroupId("")
      await fetchDetails().then(res => setTenant(res))
    }

    setIsSubmittingGroups(false)
  }

  return (
    <>
      {deleteGroupId && (
        <DeleteGroupDialog
          group={deleteGroupId}
          loading={isSubmittingGroups}
          onConfirm={handleDeleteGroup}
          onClose={() => setDeleteGroupId("")}
        />
      )}
      <div className="grid size-full w-full grid-cols-1 gap-8 p-4 pt-5 md:grid-cols-2">
        <div className="mb-4">
          <Typography variant="h4" className="font-bold underline underline-offset-2">
            Department Information
          </Typography>
          <Typography variant="h5" className="mt-2">
            <strong>Notice:</strong> Updating the context prompt here will append the message to the global system
            message. This setting is regularly audited by the Queensland Government AI Unit.
          </Typography>
          <Typography variant="h5">Current Prompt:</Typography>
          <div className="mt-2 rounded-md bg-altBackgroundShade p-4">
            {isLoading ? <CardSkeleton /> : <Markdown content={contextPrompt || "Not set"} />}
          </div>
          <Form.Root className="mb-4 mt-2" onSubmit={handleSubmitContextPrompt}>
            <Form.Field name="contextPrompt" serverInvalid={serverErrors.contextPrompt}>
              <Form.Label htmlFor="contextPrompt" className="block">
                New Context Prompt:
              </Form.Label>
              <Form.Control asChild>
                <textarea
                  id="contextPrompt"
                  className="my-4 w-full rounded-md border-2 p-2"
                  placeholder="Enter new context prompt..."
                  rows={8}
                  maxLength={500}
                  required
                />
              </Form.Control>
              {serverErrors.contextPrompt && (
                <Form.Message role="alert" className="text-QLD-alert mt-2">
                  Error updating context prompt. Please try again.
                </Form.Message>
              )}
            </Form.Field>
            {!isLoading && (
              <Form.Submit asChild>
                <Button type="submit" variant="default" disabled={isSubmittingContextPrompt}>
                  {isSubmittingContextPrompt ? "Updating..." : "Update Context Prompt"}
                </Button>
              </Form.Submit>
            )}
          </Form.Root>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <>
              <Typography variant="h5" className="mt-4">
                Current System Prompt:
              </Typography>
              <SystemPrompt />
            </>
          )}
        </div>
        <div>
          <Typography variant="h5" className="mb-4">
            Domain:
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <div>
                <b>{tenant?.primaryDomain}</b>
              </div>
            )}
          </Typography>
          <Typography variant="h5" className="mb-4">
            Support Email:
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <div className="mt-2 rounded-md bg-altBackgroundShade p-4">
                <b>{tenant?.supportEmail}</b>
              </div>
            )}
          </Typography>
          <Typography variant="h5" className="mb-4">
            Department Name:
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <div className="mt-2 rounded-md bg-altBackgroundShade p-4">
                <b>{tenant?.departmentName}</b>
              </div>
            )}
          </Typography>
          <Typography variant="h5" className="mb-4">
            Administrators:
            {isLoading ? (
              <CardSkeleton />
            ) : (
              tenant?.administrators?.map(admin => (
                <div className="mt-2 rounded-md bg-altBackgroundShade p-4" key={admin}>
                  <b>{admin}</b>
                </div>
              ))
            )}
          </Typography>
          <Typography variant="h5" className="mb-4">
            Current Groups:
            {isLoading ? (
              <CardSkeleton />
            ) : (
              tenant?.groups?.map(group => (
                <div className="mt-2 flex justify-between rounded-md bg-altBackgroundShade p-4" key={group}>
                  <b>{group}</b>
                  <Button
                    size="sm"
                    variant="destructive"
                    ariaLabel={`Delete ${group}`}
                    onClick={() => setDeleteGroupId(group)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))
            )}
          </Typography>
          <Form.Root className="my-4" onSubmit={handleSubmitGroups}>
            <Form.Field name="newGroups" serverInvalid={serverErrors.groups}>
              <Form.Label htmlFor="newGroups" className="block">
                Add New Group GUIDs (comma-separated):
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  id="newGroups"
                  className="my-4 w-full rounded-md border-2 p-2"
                  placeholder="Enter new group GUIDs..."
                />
              </Form.Control>
              {serverErrors.groups && (
                <Form.Message role="alert" className="text-QLD-alert my-4">
                  Error updating groups. Please try again.
                </Form.Message>
              )}
            </Form.Field>
            {!isLoading && (
              <Form.Submit asChild>
                <Button type="submit" variant="default" className="my-4 justify-end" disabled={isSubmittingGroups}>
                  {isSubmittingGroups ? "Updating..." : "Update Groups"}
                </Button>
              </Form.Submit>
            )}
          </Form.Root>
        </div>
      </div>
    </>
  )
}

const DeleteGroupDialog: React.FC<{
  group: string
  loading: boolean
  onConfirm: (group: string) => void
  onClose: () => void
}> = ({ group, loading, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg bg-background p-4">
        <div className="mb-4">
          <Typography variant="h4" className="text-foreground">
            Are you sure you want to delete this group?
          </Typography>
        </div>
        <div className="mb-4">
          <Typography variant="h5" className="text-foreground">
            Group GUID: <b>{group}</b>
          </Typography>
        </div>
        <div className="mb-5">
          <Typography variant="h4" className="text-foreground">
            Sessions are valid for up-to 8 hours and this will not revoke the users access. Reach out to support for
            urgent assistance
          </Typography>
        </div>
        <div className="flex justify-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" className="ml-2" onClick={() => onConfirm(group)} disabled={loading}>
            Delete Group
          </Button>
        </div>
      </div>
    </div>
  )
}

//TODO: Add a call to API tenant groups to validate the groups exist.
// Reminder groups locally are different from the groups returned from TUO - see authapi.
// Add a clear prompt button
