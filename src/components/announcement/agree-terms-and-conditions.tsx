import { Loader } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

import { APP_VERSION } from "@/app-global"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import { showError, showSuccess } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { Button } from "@/features/ui/button"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/features/ui/dialog"
import { cn } from "@/lib/utils"

type AgreeTermsAndConditionProps = {
  onClose: () => void
}
export default function AgreeTermsAndConditions({ onClose }: AgreeTermsAndConditionProps): JSX.Element {
  const { update } = useSession()
  const [content, setContent] = useState<string>("Loading terms and conditions...")
  const [loading, setLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/user/terms-and-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await update({ acceptedTerms: true })
      showSuccess({ title: "Terms and conditions agreed" })
      onClose()
    } catch (error) {
      logger.error("Failed to agree with terms and conditions, please try again later.", { error })
      showError("Failed to agree with terms and conditions, please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetch(`${window.location.origin}/terms.md`)
      .then(async response => await response.text())
      .then(data => setContent(data))
      .catch(() => setContent("Failed to load terms and conditions, please try again later."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Dialog>
      <DialogHeader>Terms & Conditions Updates</DialogHeader>
      <DialogContent>
        <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
          <Typography variant="h3">App Version {APP_VERSION}</Typography>
          {loading ? "Loading terms and conditions..." : <Markdown content={content} />}
        </div>
      </DialogContent>
      <DialogFooter>
        {isSubmitting && <Loader className={cn("animate-spin")} size={24} />}
        <Button variant="default" onClick={handleSubmit} disabled={isSubmitting}>
          Agree with terms and conditions
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
