import { FilePlus } from "lucide-react"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { Button } from "@/features/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/features/ui/sheet"

import { ChatFilesDisplay } from "./chat-file-list"
import { ChatFileUI } from "./chat-file-ui"

export const ChatFileSlider = (): JSX.Element => {
  const { chatBody } = useChatContext()
  const files = chatBody.chatOverFileName.split(", ")
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant={"ghost"}>
            <FilePlus size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Upload File</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <ChatFileUI />
          </div>
          {files.length > 0 && <ChatFilesDisplay files={files} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}
