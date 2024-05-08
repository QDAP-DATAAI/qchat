"use client"

import { useRouter } from "next/navigation"
import { FC } from "react"

import Typography from "@/components/typography"
import { NewChat } from "@/features/chat/chat-menu/new-chat"
import { AI_NAME, AI_TAGLINE } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"

export const StartNewChat: FC<object> = () => {
  const router = useRouter()
  return (
    <section
      className="container mx-auto grid size-full max-w-3xl grid-cols-3 items-center justify-center gap-9"
      aria-labelledby="startChatTitle"
    >
      <Card className="col-span-3 flex flex-col gap-5 p-5">
        <Typography variant="h4" className="text-2xl text-siteTitle" id="startChatTitle">
          {AI_NAME}
          <br />
          {AI_TAGLINE}
        </Typography>
        <div className="flex flex-col gap-2">
          <Typography variant="p">
            {AI_NAME}, your text-based virtual assistant, is equipped with cutting-edge Generative AI technology to
            empower you. Let {AI_NAME} assist you in accomplishing remarkable outcomes.
          </Typography>
          <Typography variant="p" className="hidden lg:block">
            Press the plus button below to get started or select one of your existing chats from the left-hand panel.
          </Typography>
          <Typography variant="p" className="lg:hidden">
            Press the plus button below to get started.
          </Typography>
        </div>
        <div className="-mx-5 -mb-5 inline-flex items-center justify-center border-t bg-muted p-5">
          <NewChat />
          <Button
            onClick={() => router.push("/terms")}
            variant="link"
            className="text-foreground"
            ariaLabel="Terms and Conditions"
          >
            By starting a new chat you agree to the {AI_NAME} <br /> Terms and Conditions, click here to view them.
          </Button>
        </div>
      </Card>
    </section>
  )
}
