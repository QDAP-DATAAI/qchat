import { ToastAction } from "@radix-ui/react-toast"
import { useSession } from "next-auth/react"
import { createContext, useContext, useEffect } from "react"

import AgreeTermsAndConditions from "@/components/announcement/agree-terms-and-conditions"
import { toast } from "@/features/ui/use-toast"

import { announcement } from "./announcements"
import { useApplication } from "./application-provider"

interface GlobalMessageProps {
  showError: (error: string, reload?: () => void) => void
  showSuccess: (message: MessageProp) => void
}

const GlobalMessageContext = createContext<GlobalMessageProps | null>(null)

interface MessageProp {
  title: string
  description: string
}

export const GlobalMessageProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const application = useApplication()
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user || !application?.appSettings?.termsAndConditionsDate) return
    if (
      new Date(application.appSettings.termsAndConditionsDate).getTime() <
      new Date(session.user.acceptedTermsDate).getTime()
    )
      return

    let unsubscribe = false
    announcement.newsflash(<AgreeTermsAndConditions onClose={() => !unsubscribe && announcement.dismiss()} />)
    return () => {
      unsubscribe = true
    }
  }, [session?.user, application])

  const showError = (error: string, reload?: () => void): void => {
    toast({
      variant: "destructive",
      description: error,
      action: reload ? (
        <ToastAction
          altText="Try again"
          onClick={() => {
            reload()
          }}
        >
          Try again
        </ToastAction>
      ) : undefined,
    })
  }

  const showSuccess = (message: MessageProp): void => {
    toast(message)
  }

  return (
    <GlobalMessageContext.Provider
      value={{
        showSuccess,
        showError,
      }}
    >
      {children}
    </GlobalMessageContext.Provider>
  )
}

export const useGlobalMessageContext = (): GlobalMessageProps => {
  const context = useContext(GlobalMessageContext)
  if (!context) throw new Error("GlobalErrorContext hasn't been provided!")
  return context
}
