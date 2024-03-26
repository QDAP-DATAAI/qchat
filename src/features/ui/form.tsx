import React, { useState, useEffect } from "react"
import * as Form from "@radix-ui/react-form"
import { useSession } from "next-auth/react"
import { useUserData } from "@/components/hooks/user-data"

export const PromptForm: React.FC = () => {
  const { data: session } = useSession()
  const { userData, loading, error } = useUserData()
  const [contextPrompt, setContextPrompt] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    // Here, implement your logic to handle the submission, such as updating the user's record
    console.log(`Submitting: ${contextPrompt}`)
    // Remember to handle the submission result properly (e.g., user feedback)
  }

  useEffect(() => {
    if (userData && userData.name) {
      setContextPrompt(userData.name) // Or any other user data property you'd like to preset in the form
    }
  }, [userData])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Form.Root className="w-full" onSubmit={handleSubmit}>
      <div className="mb-[10px]">
        <Form.Label htmlFor="userName" className="text-foreground block text-sm font-medium">
          Name
        </Form.Label>
        <input
          id="userName"
          type="text"
          value={session?.user?.name || "Not Specified"}
          disabled
          className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm"
          title="User's name"
          placeholder="Name"
        />
      </div>

      <div className="mb-[10px]">
        <Form.Label htmlFor="userEmail" className="text-foreground block text-sm font-medium">
          Email
        </Form.Label>
        <input
          id="userEmail"
          type="email"
          value={session?.user?.email || "Not Specified"}
          disabled
          className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm"
          title="User's email"
          placeholder="Email"
        />
      </div>

      <div className="mb-[10px]">
        <Form.Label htmlFor="contextPrompt" className="text-foreground block text-sm font-medium">
          Context Prompt
        </Form.Label>
        <input
          id="contextPrompt"
          type="text"
          value={contextPrompt}
          onChange={e => setContextPrompt(e.target.value)}
          className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm"
          title="Context prompt for the user"
          placeholder="Enter context prompt"
          required
        />
      </div>

      <Form.Submit asChild>
        <button type="submit" className="border-altBackground bg-background mt-1 w-full rounded-md p-2 shadow-sm">
          Update
        </button>
      </Form.Submit>
    </Form.Root>
  )
}

export default PromptForm
