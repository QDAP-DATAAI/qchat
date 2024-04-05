import { AI_NAME } from "@/features/theme/theme-config"

export const dynamic = "force-dynamic"

export const metadata = {
  title: AI_NAME + " Terms",
  description: AI_NAME + " - Terms",
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="flex size-full flex-1 overflow-hidden bg-card/70">{children}</div>
}
