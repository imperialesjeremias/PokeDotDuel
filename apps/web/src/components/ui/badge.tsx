import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border-2 px-2 py-1 text-xs font-pixel transition-transform focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-orange-600 bg-orange-400 text-orange-900 shadow-[2px_2px_0px_0px_theme('colors.orange.800')]",
        secondary:
          "border-orange-800 bg-orange-600 text-orange-50 shadow-[2px_2px_0px_0px_black]",
        destructive:
          "border-red-600 bg-red-400 text-white shadow-[2px_2px_0px_0px_theme('colors.red.700')]",
        outline: "border-orange-600 text-orange-900",
        pixel: "border-orange-600 bg-orange-400 text-orange-900 shadow-[2px_2px_0px_0px_theme('colors.orange.800')]",
        type: "border-orange-600 bg-orange-400 text-orange-900 shadow-[2px_2px_0px_0px_theme('colors.orange.800')]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
