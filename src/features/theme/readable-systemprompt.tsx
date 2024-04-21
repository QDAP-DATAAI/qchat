import React, { useEffect, useState, FC } from "react"

const SystemPrompt: FC = () => {
  const [readableSystemPrompt, setReadableSystemPrompt] = useState("")

  useEffect(() => {
    const fetchPrompt = async (): Promise<string | undefined> => {
      try {
        const response = await fetch("/api/prompt")
        const data = await response.json()
        if (response.ok) {
          setReadableSystemPrompt(data.prompt)
          return data.prompt
        }
        throw new Error("Failed to fetch the system prompt")
      } catch (error) {
        console.error("Error fetching system prompt:", error)
      }
    }

    fetchPrompt().catch(error => console.error("Error in fetchPrompt:", error))
  }, [])

  return <p>{readableSystemPrompt}</p>
}

export default SystemPrompt
