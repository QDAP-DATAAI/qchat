"use client"

import { Loader, Send, StopCircle } from "lucide-react"
import { getSession } from "next-auth/react"
import React, { FC, FormEvent, useRef, useMemo, useCallback } from "react"

import { APP_NAME } from "@/app-global"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatFileSlider } from "@/features/chat/chat-ui/chat-file/chat-file-slider"
import { convertMarkdownToWordDocument } from "@/features/common/file-export"
import { Button } from "@/features/ui/button"
import { Textarea } from "@/features/ui/textarea"

import ChatInputMenu from "./chat-input-menu"

interface Props {}

const ChatInput: FC<Props> = () => {
  const { setInput, handleSubmit, isLoading, input, chatBody, isModalOpen, messages, fileState, stop } =
    useChatContext()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDataChat = useMemo(() => chatBody.chatType === "data" || chatBody.chatType === "audio", [chatBody.chatType])
  const fileChatVisible = useMemo(
    () => (chatBody.chatType === "data" || chatBody.chatType === "audio") && chatBody.chatOverFileName,
    [chatBody.chatType, chatBody.chatOverFileName]
  )

  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Brisbane", [])

  const getNameInline = useCallback(async (): Promise<string> => {
    const session = await getSession()
    return session?.user?.name || "You"
  }, [])

  const getFormattedDateTime = useCallback((): string => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timeZone,
    }
    const formattedDate = new Intl.DateTimeFormat("en-AU", options).format(date)
    return formattedDate.split(",").join("_").split(" ").join("_").split(":").join("_")
  }, [timeZone])

  const exportDocument = useCallback(async (): Promise<void> => {
    const fileName = APP_NAME + ` Export_${getFormattedDateTime()}.docx`
    const userName = await getNameInline()
    const chatThreadName = chatBody.chatThreadName || APP_NAME + ` Export_${getFormattedDateTime()}.docx`
    await convertMarkdownToWordDocument(messages, fileName, APP_NAME, userName, chatThreadName)
  }, [getFormattedDateTime, getNameInline, chatBody.chatThreadName, messages])

  const submit = useCallback(
    (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault()
      if (isLoading) {
        stop()
      } else if (!isModalOpen && !fileState.isUploadingFile) {
        handleSubmit(e)
        setInput("")
      }
    },
    [isLoading, isModalOpen, fileState.isUploadingFile, handleSubmit, setInput, stop]
  )

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setInput(event.target.value)
    },
    [setInput]
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (event.key === "Enter" && !event.shiftKey && !isModalOpen) {
        event.preventDefault()
        if (!isLoading && !fileState.isUploadingFile) {
          handleSubmit(event as unknown as FormEvent<HTMLFormElement>)
          setInput("")
        }
      }
    },
    [isLoading, isModalOpen, fileState.isUploadingFile, handleSubmit, setInput]
  )

  if (isModalOpen) {
    return null
  }

  return (
    <form onSubmit={submit} className="absolute bottom-0 z-70 flex w-full items-center">
      <div className="container relative mx-auto flex items-end gap-2 py-2">
        <div className="absolute -z-10 h-[calc(100%-1rem)] w-[calc(100%-4rem)] rounded-md border-2 bg-background opacity-80" />
        <Textarea
          id="chatMessage"
          name="chatMessage"
          value={input}
          placeholder="Send a message, or use the right hand menu to export your chat to document, add another document or more."
          aria-label="Send a message"
          className="max-h-[50rem] min-h-[10rem] py-4 pr-[40px]"
          onChange={onChange}
          onKeyDown={onKeyDown}
          rows={4}
          disabled={isLoading || fileState.isUploadingFile}
        />
        {!!(!isDataChat || (isDataChat && fileChatVisible)) && (
          <div className="absolute right-14 flex flex-col pb-4">
            <Button
              size="icon"
              type="submit"
              variant="ghost"
              ref={buttonRef}
              disabled={isLoading && fileState.isUploadingFile}
              ariaLabel={isLoading ? "Cancel the reply" : "Submit your message"}
              aria-busy={isLoading && fileState.isUploadingFile ? "true" : "false"}
            >
              {isLoading && fileState.isUploadingFile ? (
                <Loader className="animate-spin" aria-hidden="true" size={16} />
              ) : isLoading ? (
                <StopCircle aria-hidden="true" className="text-error" size={16} />
              ) : (
                <Send aria-hidden="true" size={16} />
              )}
            </Button>
            {fileChatVisible && <ChatFileSlider />}
            {!isLoading && !fileState.isUploadingFile && (
              <ChatInputMenu onDocExport={exportDocument} messageCopy={messages} />
            )}
          </div>
        )}
      </div>
    </form>
  )
}

export default ChatInput
