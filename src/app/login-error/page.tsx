"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { APP_NAME } from "@/app-global"

import { SignInErrorType } from "@/features/auth/sign-in"
import { INTRANET_NAME, INTRANET_URL } from "@/features/theme/theme-config"
import { Button } from "@/features/ui/button"
import { Card, CardContent, CardHeader, CardDescription } from "@/features/ui/card"

const ErrorPage: React.FC = () => {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")
  const [displaySupportButton, setDisplaySupportButton] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorType = urlParams.get("error") as SignInErrorType | null

    let message = ""
    switch (errorType) {
      case SignInErrorType.NotAuthorised:
        message = `Your Agency may not yet be using ${APP_NAME}, if they are, it appears as if you are not in one of the permitted groups, please contact your agency IT support team to request additional details or how to gain access. `
        setDisplaySupportButton(false)
        break
      case SignInErrorType.SignInFailed:
      default:
        message = `It appears we ran into an error while logging you in to ${APP_NAME} if you believe your agency has been setup and continue to receive these errors, please contact our support team.`
        setDisplaySupportButton(true)
        break
    }

    setErrorMessage(message)
  }, [])

  const handleSupportRedirect = (): void => {
    router.push("/support")
  }

  const handleIntranetRedirect = (): void => {
    window.location.href = INTRANET_URL
  }

  return (
    <div className="flex size-full items-center justify-center">
      <Card className="flex min-w-[300px] max-w-[700px] flex-col gap-2 rounded-md">
        <CardHeader className="items-center justify-center gap-2">
          Uh-oh we ran into an error signing you in!
          <CardDescription className="items-center justify-center">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="grid items-center justify-center gap-4">
          {displaySupportButton && (
            <Button variant="link" className="max-w-[300px]" onClick={handleSupportRedirect}>
              Contact {APP_NAME} Support
            </Button>
          )}
          <Button variant="link" className="max-w-[300px]" onClick={handleIntranetRedirect}>
            Find out more about {APP_NAME} on {INTRANET_NAME}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ErrorPage
