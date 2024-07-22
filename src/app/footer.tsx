import { Mail, CircleHelp, HeartHandshake } from "lucide-react"

import { SUPPORT_EMAIL } from "@/app-global"

import Typography from "@/components/typography"
import { APP_URL, APP_VANITY_URL } from "@/features/theme/theme-config"

export const Footer: React.FC = () => {
  return (
    <footer
      className="min-w-[400px] border-t-4 border-transparent bg-background py-2"
      role="contentinfo"
      style={{
        borderImageSource:
          "linear-gradient(90deg, #0f2d52 0%, #0f2d52 25%, #ffcf01 25%, #ffcf01 33%, #65cbe6 33%, #65cbe6 59%, #f6861f 59%, #f6861f 72%, #00babe 72%, #00babe 83%, #a6ce39 83%, #a6ce39 100%)",
        borderImageSlice: 1,
      }}
    >
      <div className="container mx-auto flex size-full items-center justify-between px-8">
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
          <a href={"mailto:" + SUPPORT_EMAIL} className="flex items-center" target="_blank" rel="noopener noreferrer">
            <Mail className="mr-2 size-4" />
            <Typography variant="h4">Contact us</Typography>
          </a>
        </div>
      </div>
    </footer>
  )
}
