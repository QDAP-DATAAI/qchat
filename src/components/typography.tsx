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
          "scroll-m-20 text-sm tracking-wide sm:text-xl md:text-2xl lg:text-3xl": variant === "h1",
          "scroll-m-20 text-sm tracking-wide transition-colors first:mt-0 sm:text-lg md:text-xl lg:text-2xl":
            variant === "h2",
          "scroll-m-20 text-sm tracking-wide sm:text-base md:text-lg lg:text-xl": variant === "h3",
          "scroll-m-20 text-sm tracking-wide md:text-base lg:text-lg": variant === "h4" || variant === "h5",
          "scroll-m-20 text-sm font-light sm:text-base md:text-lg": variant === "span",
          "text-sm font-light leading-7 sm:text-lg md:text-xl [&:not(:first-child)]:mt-6": variant === "p",
        },
        className
      )}
      {...props}
    />
  )
})

export default Typography
