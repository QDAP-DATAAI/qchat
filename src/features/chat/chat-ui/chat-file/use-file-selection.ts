import { useGlobalMessageContext } from "@/features/globals/global-message-context"
import { IndexDocuments, UploadDocument } from "../../chat-services/chat-document-service"
import { useChatContext } from "../chat-context"

interface Props {
  chatThreadId: string
}

export const useFileSelection = (
  props: Props
): { onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> } => {
  const { setChatBody, chatBody, fileState } = useChatContext()
  const { setIsUploadingFile, setUploadButtonLabel } = fileState

  const { showError, showSuccess } = useGlobalMessageContext()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    await onFileChange(formData)
  }

  const onFileChange = async (formData: FormData): Promise<void> => {
    try {
      setIsUploadingFile(true)
      setUploadButtonLabel("Uploading file...")
      const chatType = fileState.showFileUpload
      formData.append("chatType", chatType)
      formData.append("chatThreadId", props.chatThreadId)
      const file: File | null = formData.get(chatType) as unknown as File
      const uploadResponse = await UploadDocument(formData)

      if (uploadResponse.success) {
        let index = 0

        for (const doc of uploadResponse.response) {
          setUploadButtonLabel(`Indexing file [${index + 1}]/[${uploadResponse.response.length}]`)
          try {
            const indexResponse = await IndexDocuments(file.name, [doc], props.chatThreadId, index + 1)

            if (!indexResponse.success) {
              showError(indexResponse.error)
              break
            }
          } catch (e) {
            alert(e)
          }

          index++
        }

        if (index === uploadResponse.response.length) {
          showSuccess({
            title: "File upload",
            description: `${file.name} uploaded successfully.`,
          })
          setUploadButtonLabel("")
          setChatBody({ ...chatBody, chatOverFileName: file.name })
        } else {
          showError("Looks like not all documents were indexed. Please try again.")
        }
      } else {
        showError(uploadResponse.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      showError(errorMessage)
    } finally {
      setIsUploadingFile(false)
      setUploadButtonLabel("")
    }
  }

  return { onSubmit }
}
