import * as React from "react"

import { cn } from "@/lib/utils"

type TypographyProps = {
  variant: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span"
  ariaLabel?: string
} & React.HTMLAttributes<HTMLElement>

const Typography = React.forwardRef<HTMLHeadingElement, TypographyProps>(function Typography(
  { variant, className, ariaLabel, ...props },
  ref
) {
  const Component = variant
  return (
    <Component
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        {
          "scroll-m-20 text-xl lg:text-2xl ": variant === "h1",
          "scroll-m-20 pb-2 text-lg transition-colors first:mt-0 lg:text-xl": variant === "h2",
          "scroll-m-20 text-base lg:text-lg": variant === "h3",
          "scroll-m-20": variant === "h4" || variant === "h5" || variant === "span",
          "leading-7 [&:not(:first-child)]:mt-6": variant === "p",
        },
        className
      )}
      {...props}
    />
  )
})

export default Typography
