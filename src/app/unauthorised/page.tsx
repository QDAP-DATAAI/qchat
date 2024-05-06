"use client"

import { useRouter } from "next/navigation"
import React from "react"

import Typography from "@/components/typography"
import { Button } from "@/features/ui/button"
import { Card } from "@/features/ui/card"

const Home: React.FC = () => {
  const router = useRouter()

  const handleRedirectHome = async (): Promise<void> => {
    try {
      await router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Redirect failed:", error)
    }
  }

  return (
    <Card className="items-top flex size-full flex-1 justify-center p-10">
      <div className="size-full items-center">
        {" "}
        <Typography variant="h3" className="text-xl font-semibold">
          You are not authorised to view this page
        </Typography>
        <Typography variant="p" className="mt-5">
          Please{" "}
          <Button
            onClick={handleRedirectHome}
            className="text-link hover:text-altButton hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Return Home"
          >
            click here
          </Button>{" "}
          to return home.
        </Typography>
      </div>
    </Card>
  )
}

export default Home
