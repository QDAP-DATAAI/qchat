"use client"

import { ToastAction } from "@radix-ui/react-toast"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { createContext, useContext, useEffect, useCallback, useMemo } from "react"

import AgreeTermsAndConditions from "@/components/announcement/agree-terms-and-conditions"
import WhatsNewModal from "@/components/announcement/whats-new-modal"
import { toast } from "@/features/ui/use-toast"

import { announcement } from "./announcements"
import { useApplication } from "./application-provider"

interface GlobalMessageProps {
  showError: (error: string, reload?: () => void) => void
  showSuccess: (message: MessageProp) => void
}

const GlobalMessageContext = createContext<GlobalMessageProps | null>(null)
const DELAY_ANNOUNCEMENTS = 3000

interface MessageProp {
  title: string
  description: string
}

export const GlobalMessageProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const application = useApplication()
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleDismiss = useCallback(() => {
    announcement.dismiss()
  }, [])

  const showError = useCallback((error: string, reload?: () => void): void => {
    const action = reload ? (
      <ToastAction altText="Try again" onClick={reload}>
        Try again
      </ToastAction>
    ) : undefined

    toast({
      variant: "destructive",
      description: error,
      action,
    })
  }, [])

  const showSuccess = useCallback((message: MessageProp): void => {
    toast(message)
  }, [])

  useEffect(() => {
    if (!session?.user || !application?.appSettings) return

    const timeoutId = setTimeout(() => {
      const tAndCs = application.appSettings.termsAndConditionsDate
      if (
        (tAndCs && !session.user.acceptedTermsDate) ||
        new Date(tAndCs).getTime() > new Date(session.user.acceptedTermsDate).getTime()
      ) {
        announcement.newsflash(<AgreeTermsAndConditions onClose={handleDismiss} />)
        return
      }

      if (
        !sessionStorage.getItem("whats-new-dismissed") &&
        !pathname.endsWith("/whats-new") &&
        application.appSettings.version !== session.user.lastVersionSeen
      ) {
        announcement.newsflash(
          <WhatsNewModal targetVersion={application.appSettings.version} onClose={handleDismiss} />
        )
        return
      }
    }, DELAY_ANNOUNCEMENTS)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [session?.user, application?.appSettings, pathname, handleDismiss])

  const value = useMemo(
    () => ({
      showSuccess,
      showError,
    }),
    [showSuccess, showError]
  )

  return <GlobalMessageContext.Provider value={value}>{children}</GlobalMessageContext.Provider>
}

export const useGlobalMessageContext = (): GlobalMessageProps => {
  const context = useContext(GlobalMessageContext)
  if (!context) throw new Error("GlobalErrorContext hasn't been provided!")
  return context
}
