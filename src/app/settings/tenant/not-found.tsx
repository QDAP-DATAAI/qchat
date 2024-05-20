"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import Typography from "@/components/typography"
import { showError } from "@/features/globals/global-message-store"
import { TenantDetails } from "@/features/tenant-management/models"
import { Button } from "@/features/ui/button"

const Home: React.FC = () => {
  const router = useRouter()
  const [administrators, setAdministrators] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDetails(): Promise<TenantDetails> {
      const res = await fetch("/api/tenant/details", { method: "GET" })
      return (await res.json()).data as TenantDetails
    }
    fetchDetails()
      .then(res => {
        setAdministrators(res.administrators)
      })
      .catch(err => {
        console.error("Failed to fetch tenant preferences:", err)
        showError("Tenant administrators couldn't be loaded, please try again.")
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleRedirectHome = async (): Promise<void> => {
    try {
      await router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Redirect failed:", error)
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-w-[300px] flex-col rounded-md bg-altBackground p-8 text-foreground">
        <Typography variant="h3" className="text-xl font-semibold">
          This page is not yet available, and will only be available to Global Admins or Agency Leds.
          <br />
        </Typography>
        {isLoading && <Typography variant="p">Loading...</Typography>}
        <Typography variant="p" className="mt-4">
          If you believe this is an error, please contact one of the below or a Global Admin.
          <br />
        </Typography>
        <Typography variant="h4" className="mt-4">
          <strong>Agency Leads:</strong>
        </Typography>
        <div className="mt-2">
          {administrators.map(admin => (
            <Typography variant="p" key={admin} className="mt-2 hover:underline">
              <a href={`mailto:${admin}`}>{admin}</a>
            </Typography>
          ))}
          <br />
        </div>
        <Button onClick={handleRedirectHome} variant="link" ariaLabel="Return Home">
          Please click here to return home.
        </Button>
      </div>
    </div>
  )
}

export default Home
