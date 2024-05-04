import { Mail, CircleHelp, HeartHandshake } from "lucide-react"
import React from "react"

import { SUPPORT_EMAIL } from "@/app-global"

import Typography from "@/components/typography"
import { APP_URL, APP_VANITY_URL } from "@/features/theme/theme-config"

export const Footer: React.FC = () => {
  return (
    <footer className="h-[30px] min-w-[500px] border-t-4 border-accent bg-background py-5" role="contentinfo">
      <div className="container mx-auto flex size-full items-center justify-between  px-8">
        <div>
          <a href={APP_URL} className="flex items-center" target="_blank" rel="noopener noreferrer">
            <Typography variant="h4">{APP_VANITY_URL}</Typography>
          </a>
        </div>
        <div>
          <a href="/terms" className="flex items-center" target="_blank" rel="noopener noreferrer">
            <HeartHandshake className="mr-2 size-4" />
            <Typography variant="h4">Terms of Use</Typography>
          </a>
        </div>
        <div>
          <a href="/support" className="flex items-center" target="_blank" rel="noopener noreferrer">
            <CircleHelp className="mr-2 size-4" />
            <Typography variant="h4">Request Support</Typography>
          </a>
        </div>
        <div>
          <a
            href={"mailto:" + { SUPPORT_EMAIL }}
            className="flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail className="mr-2 size-4" />
            <Typography variant="h4">Contact us</Typography>
          </a>
        </div>
      </div>
    </footer>
  )
}
