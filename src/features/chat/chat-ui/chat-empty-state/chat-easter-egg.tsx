"use client"

import { Heart } from "lucide-react"
import { getSession } from "next-auth/react"
import React, { useState, useEffect } from "react"

import Typography from "@/components/typography"

export const EasterEgg = (): React.JSX.Element => {
  const [isEasterEggDay, setIsEasterEggDay] = useState(false)

  useEffect(() => {
    const checkEasterEggDay = async (): Promise<boolean> => {
      const session = await getSession()
      return session?.user?.tenantId === "c8b3c81f-0928-458f-a835-a74452e3b706"
    }

    checkEasterEggDay()
      .then(isEggDay => setIsEasterEggDay(isEggDay))
      .catch(_ => setIsEasterEggDay(false))
  }, [])

  const textColorClass = isEasterEggDay ? "text-altButton" : "text-altBackground"

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <div className={`flex items-center justify-center ${textColorClass}`}>
          <Heart className="size-4" fill="currentColor" />
          <Typography variant="p" className="mx-2">
            Made with love by Keith Oak, Rahul Shokeen, Ella Salehi, Fred Delage, Bruno Piovan and Jay Sindorff
          </Typography>
          <Heart className="size-4" fill="currentColor" />
        </div>
      </div>
    </>
  )
}

export default EasterEgg
