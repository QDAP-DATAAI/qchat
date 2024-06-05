"use client"

import { useRouter } from "next/navigation"
import React from "react"

import Typography from "@/components/typography"
// import { useAppInsightsContext } from "@/features/insights/app-insights-context"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"
import logger from "@/features/insights/app-insights"

const Home: React.FC = () => {
  const router = useRouter()
  // const { logError } = useAppInsightsContext()

  const handleRedirectHome = async (): Promise<void> => {
    try {
      await router.push("/")
      router.refresh()
    } catch (error) {
      logger.error("Redirect failed", { error: error instanceof Error ? error.message : "Unknown error" })
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="flex min-w-[300px] flex-col rounded-md bg-altBackground p-8 text-foreground">
        <Typography variant="h3" className="text-xl font-semibold">
          You are not authorised to view this page
        </Typography>
        <Button onClick={handleRedirectHome} variant="link" ariaLabel="Return Home">
          Please click here to return home.
        </Button>
      </Card>
    </div>
  )
}

export default Home
