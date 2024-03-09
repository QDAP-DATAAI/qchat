import { ChatMenu } from "@/features/chat/chat-menu/chat-menu"
import { ChatMenuContainer } from "@/features/chat/chat-menu/chat-menu-container"
import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <>
      <div className="bg-card/100 grid h-full grid-cols-6 overflow-hidden">
        <ChatMenuContainer>
          <ChatMenu />
        </ChatMenuContainer>
        {children}
      </div>
    </>
  )
}
