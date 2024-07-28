import { APP_NAME } from "@/app-global"
export const dynamic = "force-dynamic"

export const metadata = {
  title: `${APP_NAME} Training`,
  description: `${APP_NAME} Training`,
}

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="col-span-12 size-full">{children}</div>
}
