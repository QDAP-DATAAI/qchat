import { AI_NAME } from "@/features/theme/theme-config"

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
}

export default async function RootLayout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <>
      <div className="size-full flex-1">{children}</div>
    </>
  )
}
