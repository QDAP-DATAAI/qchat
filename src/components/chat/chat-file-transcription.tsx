import { DownloadIcon, CaptionsIcon, FileTextIcon } from "lucide-react"
import { FC, useState, useEffect } from "react"

import { APP_NAME } from "@/app-global"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import {
  convertTranscriptionToWordDocument,
  convertTranscriptionReportToWordDocument,
} from "@/features/common/file-export"
import { CopyButton } from "@/features/ui/assistant-buttons"
import { CheckTranscriptionButton } from "@/features/ui/assistant-buttons/rewrite-message-button"
import { Button } from "@/features/ui/button"
import { Textarea } from "@/features/ui/textarea"
import { useWindowSize } from "@/features/ui/windowsize"

import { ChangeTranscriptButton } from "./chat-transcript-change"

interface ChatFileTranscriptionProps {
  chatThreadId: string
  documentId: string
  name: string
  contents: string
  updatedContents: string
  vtt: string
}

export const ChatFileTranscription: FC<ChatFileTranscriptionProps> = props => {
  const { chatBody, setInput } = useChatContext()
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [editorContents, setEditorContents] = useState(props.updatedContents || props.contents)
  const [displayedContents, setDisplayedContents] = useState(props.updatedContents || props.contents)
  const fileTitle = props.name.replace(/[^a-zA-Z0-9]/g, " ").trim()

  useEffect(() => {
    setEditorContents(props.updatedContents || props.contents)
    setDisplayedContents(props.updatedContents || props.contents)
  }, [props.updatedContents, props.contents])

  const onDownloadTranscription = async (): Promise<void> => {
    const fileName = `${fileTitle}-transcription.docx`
    const chatThreadName = chatBody.chatThreadName || `${APP_NAME} ${fileName}`
    await convertTranscriptionToWordDocument([displayedContents], props.name, fileName, APP_NAME, chatThreadName)
  }

  const onDownloadReport = async (): Promise<void> => {
    const fileName = `${fileTitle}-report.docx`
    await convertTranscriptionReportToWordDocument([displayedContents], fileName)
  }

  const onDownloadVttFile = (): void => {
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/plain;base64,${toBinaryBase64(props.vtt ?? "")}`)
    element.setAttribute("download", `${fileTitle}-transcription.vtt`)

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const { width } = useWindowSize()
  let iconSize = 10
  let buttonClass = "h-9"

  if (width < 768) {
    buttonClass = "h-7"
  } else if (width >= 768 && width < 1024) {
    iconSize = 12
  } else if (width >= 1024) {
    iconSize = 16
  }

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setEditorContents(e.target.value)
  }

  const handleSave = (): void => {
    setDisplayedContents(editorContents)
  }

  return (
    <div className="container mx-auto flex flex-col py-1 pb-4">
      <div className="flex-col gap-4 overflow-hidden rounded-md bg-background p-4">
        <div className="flex w-full items-center justify-between">
          <Typography variant="h3">{fileTitle}</Typography>
          <div className="container flex w-full gap-4 p-2">
            <Button
              ariaLabel="Download Transcription"
              variant={"ghost"}
              size={"default"}
              className={buttonClass}
              title="Download Transcription"
              onClick={onDownloadTranscription}
            >
              <DownloadIcon size={iconSize} />
            </Button>
            <Button
              ariaLabel="Download Report"
              variant={"ghost"}
              size={"default"}
              className={buttonClass}
              title="Download Report"
              onClick={onDownloadReport}
            >
              <FileTextIcon size={iconSize} />
            </Button>
            {props.vtt.length > 0 && (
              <Button
                ariaLabel="Download WebVTT subtitles file"
                variant={"ghost"}
                size={"default"}
                className={buttonClass}
                title="Download WebVTT subtitles file"
                onClick={onDownloadVttFile}
              >
                <CaptionsIcon size={iconSize} />
              </Button>
            )}
            <CheckTranscriptionButton transcription={editorContents} onAssistantButtonClick={setInput} />
            <CopyButton message={editorContents} onFeedbackChange={setFeedbackMessage} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Textarea
            title="Editor Contents"
            value={editorContents}
            onChange={handleEditorChange}
            className="h-64 w-full rounded border border-gray-300 p-2"
          />
        </div>
        <div className="m-4 flex justify-end p-2">
          <ChangeTranscriptButton
            documentId={props.documentId}
            chatThreadId={props.chatThreadId}
            updatedContents={editorContents}
            onSave={handleSave}
          />
        </div>
        <div className="flex gap-4">
          <div className="prose prose-slate w-1/2 max-w-none break-words text-base italic text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base">
            <Typography variant="h4">Original Transcription</Typography>
            <Markdown content={props.contents.replace(/\n/g, "\n\n")} />
          </div>
          <div className="prose prose-slate w-1/2 max-w-none break-words text-base italic text-text dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 md:text-base">
            <Typography variant="h4">Updated Transcription with Speaker Preview</Typography>
            <Markdown content={"**Speaker:** " + displayedContents.replace(/\n/g, "\n\n**Speaker:** ")} />
          </div>
          <div className="sr-only" aria-live="assertive">
            {feedbackMessage}
          </div>
        </div>
      </div>
    </div>
  )
}

const toBinaryBase64 = (text: string): string => {
  const codeUnits = new Uint16Array(text.length)
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = text.charCodeAt(i)
  }

  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)))
}
