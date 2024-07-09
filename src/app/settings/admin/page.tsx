import { redirect } from "next/navigation"
import { useMemo } from "react"

import { APP_VERSION } from "@/app-global"

import Typography from "@/components/typography"
import { isAdmin } from "@/features/auth/helpers"

export const dynamic = "force-dynamic"

export default async function Home(): Promise<JSX.Element> {
  const admin = await isAdmin()
  if (!admin) return redirect("/")

  return (
    <div className="flex size-full flex-col items-center gap-4 bg-altBackground text-center text-foreground">
      <Typography variant="h3">
        <b>App Version {APP_VERSION}</b>
      </Typography>
      <Typography variant="h4">
        Welcome to the admin settings page. Here you can manage tenants, users, and other settings.
      </Typography>
      <Typography variant="h4" className="mt-[9rem]">
        <FancyQuote />
      </Typography>
    </div>
  )
}

type FancyQuoteProps = {
  quote?: string
  author?: string
  initialDelay?: number
}

function FancyQuote({
  quote = "With great power comes great responsibility.",
  author = " ~ Uncle Ben",
  initialDelay = 2,
}: FancyQuoteProps): JSX.Element {
  const quoteWords = useMemo(() => quote.split(" "), [quote])
  const authorWords = useMemo(() => author.split(" "), [author])

  const renderWords = (words: string[], baseDelay: number): JSX.Element[] =>
    words.map((word, index) => (
      <span
        key={index}
        className="animate-blurOut opacity-0 blur-sm"
        style={{ animationDelay: `${((index + 1) / 10 + baseDelay).toFixed(1)}s` }}
      >
        {word + " "}
      </span>
    ))

  const memoizedQuoteWords = useMemo(() => renderWords(quoteWords, initialDelay), [quoteWords, initialDelay])

  const memoizedAuthorWords = useMemo(
    () => renderWords(authorWords, initialDelay + (quoteWords.length * 2) / 10),
    [authorWords, initialDelay, quoteWords.length]
  )

  return (
    <div className="scale-95 animate-scale italic">
      <b>{memoizedQuoteWords}</b>
      <i>{memoizedAuthorWords}</i>
    </div>
  )
}
