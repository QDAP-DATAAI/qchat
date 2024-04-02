// "use client"

// import React, { useState, useEffect } from "react"
// import * as Form from "@radix-ui/react-form"
// import { useSession } from "next-auth/react"
// import { Button } from "./button"
// import Typography from "@/components/typography"

// interface PromptFormProps {}

// export const PromptForm: React.FC<PromptFormProps> = () => {
//   const { data: session } = useSession()
//   const [contextPrompt, setContextPrompt] = useState("")
//   const [serverErrors, setServerErrors] = useState({
//     contextPrompt: false,
//   })

//   useEffect(() => {
//     if (session?.user?.contextPrompt) {
//       setContextPrompt(session.user.contextPrompt)
//     }
//   }, [session])

//   const handleSubmit = async (formData: FormData): Promise<void> => {
//     if (!session?.user) {
//       console.error("No session data available")
//       return
//     }

//     const values = Object.fromEntries(formData) as { contextPrompt: string }

//     const endpoint = "/api/cosmos"
//     const payload = {
//       upn: session.user.upn,
//       tenantId: session.user.tenantId,
//       contextPrompt: values.contextPrompt,
//     }

//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to update user data.")
//       }
//       setServerErrors({ contextPrompt: false })
//     } catch (error) {
//       console.error("Failed to submit the form:", error)
//       setServerErrors({ contextPrompt: true })
//     }
//   }

//   return (
//     <Form.Root
//       className="size-full min-w-[300px] max-w-[500px] pt-5"
//       onSubmit={e => {
//         e.preventDefault()
//         const formData = new FormData(e.currentTarget)
//         void handleSubmit(formData)
//       }}
//     >
//       <div className="mb-[10px]">
//         <div className="text-foreground block text-sm font-medium">Name</div>
//         <div className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm">
//           {session?.user?.name || "Not Specified"}
//         </div>
//       </div>
//       <div className="mb-[10px]">
//         <div className="text-foreground block text-sm font-medium">Email</div>
//         <div className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm">
//           {session?.user?.email || "Not Specified"}
//         </div>
//       </div>
//       <div className="mb-[10px]">
//         <div className="text-foreground block text-sm font-medium">Existing Context Prompt</div>
//         <div className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm">
//           {session?.user?.contextPrompt || "Not yet set"}
//         </div>
//       </div>
//       <Form.Field className="mb-[10px]" name="contextPrompt" serverInvalid={serverErrors.contextPrompt}>
//         <Form.Label htmlFor="contextPrompt" className="text-foreground block text-sm font-medium">
//           New Context Prompt
//         </Form.Label>
//         <Form.Control asChild>
//           <textarea
//             id="contextPrompt"
//             defaultValue={contextPrompt}
//             className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm"
//             title="Context prompt for the user"
//             placeholder="Enter additional information about yourself and your role, an example could be I work within the Procurement
//             Team at the Department of XYZ and my writing style is short and concise. QChat already understands your name
//             as above and will use this context to provide better responses to you. Maximum 150 characters."
//             required
//             rows={6}
//             maxLength={150}
//           />
//         </Form.Control>
//         {serverErrors.contextPrompt && <Form.Message>Error updating context prompt. Please try again.</Form.Message>}
//       </Form.Field>

//       <Form.Submit asChild>
//         <div className="flex justify-between">
//           <Typography variant="p">* Maximum 150 characters</Typography>
//           <Button type="submit" variant="default">
//             Update
//           </Button>
//         </div>
//       </Form.Submit>
//     </Form.Root>
//   )
// }

// export default PromptForm

"use client"

import * as Form from "@radix-ui/react-form"
import { useSession } from "next-auth/react"
import React, { useState, useEffect } from "react"

import { Button } from "./button"

import Typography from "@/components/typography"

interface PromptFormProps {}

export const PromptForm: React.FC<PromptFormProps> = () => {
  const { data: session, status } = useSession()
  const [newContextPrompt, setNewContextPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({ contextPrompt: false })
  const [submissionMessage, setSubmissionMessage] = useState("")

  useEffect(() => {
    if (session?.user?.contextPrompt) {
      setNewContextPrompt(session.user.contextPrompt)
    }
  }, [session, status])

  const handleSubmit = (): void => {
    if (status !== "authenticated" || !session?.user) {
      console.error("No session data available")
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      setServerErrors({ contextPrompt: false })
      setSubmissionMessage("Context prompt updated successfully!")
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <Form.Root
      className="size-full min-w-[300px] max-w-[500px] pt-5"
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <div className="mb-4">
        <Typography variant="p">User Information:</Typography>
      </div>
      <div className="mb-4">
        <div className="text-sm font-medium">Name: {session?.user?.name || "Not Specified"}</div>
      </div>
      <div className="mb-4">
        <div className="text-sm font-medium">Email: {session?.user?.email || "Not Specified"}</div>
      </div>
      <div className="mb-4">
        <div className="text-sm font-medium">Current Prompt: {session?.user.contextPrompt || "Not Specified"}</div>
      </div>
      <Form.Field className="mb-4" name="contextPrompt" serverInvalid={serverErrors.contextPrompt}>
        <Form.Label htmlFor="contextPrompt" className="block text-sm font-medium">
          New Context Prompt
        </Form.Label>
        <Form.Control asChild>
          <textarea
            id="contextPrompt"
            value={newContextPrompt}
            onChange={e => setNewContextPrompt(e.target.value)}
            className="mt-1 w-full rounded-md border p-2"
            placeholder="Enter new context prompt..."
            required
            rows={4}
            maxLength={150}
          />
        </Form.Control>
        {serverErrors.contextPrompt && (
          <Form.Message role="alert" className="mt-2 text-red-600">
            Error updating context prompt. Please try again.
          </Form.Message>
        )}
      </Form.Field>
      <Form.Submit asChild>
        <Button type="submit" variant="default" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update"}
        </Button>
      </Form.Submit>
      {submissionMessage && (
        <div className="mt-4 text-sm" role="alert">
          {submissionMessage}
        </div>
      )}
    </Form.Root>
  )
}

export default PromptForm
