import { FilePlus } from "lucide-react"

import { Button } from "@/features/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/features/ui/sheet"

import { ChatFileUI } from "./chat-file-ui"

export const ChatFileSlider = (): JSX.Element => {
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
        </SheetContent>
      </Sheet>
    </div>
  )
}
