import React from "react"

import Typography from "@/components/typography"
import { MiniMenu } from "@/features/main-menu/mini-menu"
import { AI_NAME, AI_TAGLINE, APP_VANITY_URL } from "@/features/theme/theme-config"
import { QgovSvg } from "@/features/ui/qldgovlogo"
import { QgovMiniSvg } from "@/features/ui/qldgovminilogo"
import { UserComponent } from "@/features/ui/user-login-logout"

const Sidebar: React.FC = () => {
  return (
    <>
      <div className="grid h-full grid-cols-12 items-center gap-2 md:grid-cols-6">
        <div className="col-span-2 hidden border-r-2 border-accent pr-3 md:col-span-2 md:block md:scale-75">
          <QgovSvg />
        </div>
        <div className="font-nums col-span-4 m-0 flex flex-col p-0 font-meta text-xl font-bold leading-snug antialiased md:col-span-3">
          <Typography variant="h1" className="tracking-wider text-siteTitle">
            {AI_NAME}
          </Typography>
          <Typography variant="h2" className="hidden whitespace-nowrap pb-0 tracking-normal text-textMuted sm:block">
            {AI_TAGLINE}
          </Typography>
        </div>
        <div className="col-span-6 hidden md:col-span-2 md:block"></div>
      </div>
    </>
  )
}

export const Header: React.FC = () => {
  return (
    <header className="xs:h-[50px] flex w-full flex-col sm:h-[140px]">
      <div className="h-[50px] bg-darkbackground text-white">
        <div className="mx-auto flex h-full items-center justify-between px-8 py-2">
          <div className="block scale-75 md:hidden lg:hidden">
            <QgovMiniSvg />
          </div>
          <div className="container mx-auto hidden h-[50px] w-full grid-cols-3 items-center md:grid">
            <Typography variant="span" aria-label={"Site domain:" + APP_VANITY_URL} className="col-span-2">
              {APP_VANITY_URL}
            </Typography>
            <div className="justify-self-end">
              <UserComponent />
            </div>
          </div>
          <div className="block md:hidden ">
            <MiniMenu />
          </div>
        </div>
      </div>
      <div className="block bg-altBackground py-2 sm:h-[80px]">
        <div className="container mx-auto flex items-center">
          <Sidebar />
        </div>
      </div>
    </header>
  )
}
