import { AI_NAME } from "@/features/theme/theme-config"
import { Theme, ThemeProvider } from "@/features/theme/theme-provider"
import { Toaster } from "@/features/ui/toaster"
import { GlobalConfigProvider } from "@/features/globals/global-client-config-context"
import { Providers } from "@/features/globals/providers"
import { cn } from "@/lib/utils"
import { Noto_Sans } from "next/font/google"
import "./globals.css"
import { Header } from "./header"
import { NavBar } from "@/features/ui/navbar"
import { Footer } from "./footer"

const notoSans = Noto_Sans({ subsets: ["latin"] })

export const metadata = {
  metadataBase: new URL("https://qchat.ai.qld.gov.au"),
  title: AI_NAME,
  description: AI_NAME + "the Queensland Government's AI Chatbot",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/pple-icon.png",
    apple: "/apple-icon.png",
  },
}

export const dynamic = "force-dynamic"

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" className="size-full overflow-hidden text-sm" suppressHydrationWarning>
      <body className={cn(notoSans.className, "flex size-full min-w-[400px] flex-col bg-background")}>
        <GlobalConfigProvider>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme={Theme.Light} enableSystem disableTransitionOnChange>
              <header className="header background xs:h-full flex w-full flex-col sm:h-1/6">
                <Header />
              </header>
              <nav className="nav background flex w-full flex-col">
                <NavBar />
              </nav>
              {/* <main className="main grid grid-cols-6 w-full h-5/6 bg-background"> */}
              <main className="main h-5/6 w-full bg-background">
                {children}
                {/* <div className={cn("col-span-6 w-full gap-2 bg-primary h-full")}>
            
            </div> */}
              </main>
              <Footer />
              <Toaster />
            </ThemeProvider>
          </Providers>
        </GlobalConfigProvider>
      </body>
    </html>
  )
}