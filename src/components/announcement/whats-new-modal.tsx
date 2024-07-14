import { Loader } from "lucide-react"
import { useSession } from "next-auth/react"
import React, { useState, useEffect, useCallback, useMemo } from "react"

import { APP_VERSION } from "@/app-global"

import { Markdown } from "@/components/markdown/markdown"
import Typography from "@/components/typography"
import logger from "@/features/insights/app-insights"
import { Button } from "@/features/ui/button"
import { DialogHeader, DialogFooter, Dialog, DialogContent } from "@/features/ui/dialog"
import { cn } from "@/lib/utils"

type WhatsNewModalProps = {
  targetVersion: string
  onClose: () => void
}
export default function WhatsNewModal({ targetVersion, onClose }: WhatsNewModalProps): JSX.Element {
  const { update } = useSession()
  const [content, setContent] = useState<string>("Loading the latest news...")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/user/version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: targetVersion }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      await update({ lastVersionSeen: targetVersion })
    } catch (error) {
      logger.error("Failed to update to the latest version seen, please try again later.", { error })
    } finally {
      setIsSubmitting(false)
      onClose()
    }
  }, [onClose, targetVersion, update])

  const handleClickOutside = useCallback((): void => {
    sessionStorage.setItem("whats-new-dismissed", new Date().toISOString())
    onClose()
  }, [onClose])

  useEffect(() => {
    fetch("/api/application/whats-new")
      .then(async response => await response.text())
      .then(data => setContent(data))
      .catch(() => {
        logger.error("Failed to load the latest news, please try again later.")
        onClose()
      })
      .finally(() => setIsLoading(false))
  }, [onClose])

  const loadingMessage = useMemo(() => "Loading terms and conditions...", [])

  return (
    <Dialog onClose={handleClickOutside}>
      <DialogHeader>What&apos;s new</DialogHeader>
      <DialogContent>
        <div className="prose prose-slate max-w-4xl break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
          <Typography variant="h3">App Version {APP_VERSION}</Typography>
          {isLoading ? loadingMessage : <Markdown content={content} />}
        </div>
      </DialogContent>
      <DialogFooter>
        {isSubmitting && <Loader className={cn("animate-spin")} size={24} />}
        <Button variant="default" onClick={handleSubmit} disabled={isLoading}>
          Got it!
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
