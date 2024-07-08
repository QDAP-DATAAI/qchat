import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accept?: string
  label?: string
  multiple?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, multiple, accept = type === "file" ? ".pdf" : undefined, ...props }, ref) => {
    return (
      <input
        type={type}
        accept={accept}
        multiple={multiple}
        className={cn(
          "flex size-full rounded-md border-2 px-3 py-2 text-base placeholder:text-muted-foreground focus:border-text focus:outline-none disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
