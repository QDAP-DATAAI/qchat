"use client"

import { Textarea } from "@/features/ui/textarea"
import { useState, useEffect } from "react"

type TranscriptionTextEditorProps = {
  initialContent: string
  onChange: (value: string) => void
  reset: boolean
}
export const TranscriptionTextEditor = ({ initialContent, onChange, reset }: TranscriptionTextEditorProps) => {
  const [content, setContent] = useState(initialContent)
  useEffect(() => setContent(initialContent), [reset])

  return (
    <Textarea
      className="size-full min-h-full rounded-md border-2 p-2"
      value={content}
      onChange={e => setContent(e.target.value)}
      onBlur={() => onChange(content)}
    />
  )
}
