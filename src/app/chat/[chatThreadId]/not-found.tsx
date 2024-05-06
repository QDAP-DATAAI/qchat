import Typography from "@/components/typography"
import { NewChat } from "@/features/chat/chat-menu/new-chat"
import { Card } from "@/features/ui/card"

export default function NotFound(): JSX.Element {
  return (
    <Card className="col-span-6 h-full items-center justify-center gap-4 md:col-span-4">
      <div className="container mx-auto flex size-full max-w-xl items-center justify-center gap-2">
        <div className="flex flex-1 flex-col items-start gap-5">
          <Typography variant="h2" className="text-4xl font-bold">
            {" "}
            Uh-oh! 404
          </Typography>
          <Typography variant="p" className="text-muted-foreground">
            How about we start a new chat?
          </Typography>
          <NewChat />
        </div>
      </div>
    </Card>
  )
}
