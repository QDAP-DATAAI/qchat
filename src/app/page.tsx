import { redirect } from "next/navigation"

import { LogIn } from "@/components/login/login"
import { userSession } from "@/features/auth/helpers"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const user = await userSession()
  if (user) {
    redirect("/chat")
  }
  return (
    <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden">
      <LogIn />
    </div>
  )
}
