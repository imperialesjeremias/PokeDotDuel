import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-pixel ring-offset-background transition-transform focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-orange-400 text-orange-900 border-4 border-orange-600 shadow-[4px_4px_0px_0px_theme('colors.orange.800')] hover:bg-orange-300 hover:-translate-y-1 hover:shadow-[4px_5px_0px_0px_theme('colors.orange.800')] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_theme('colors.orange.800')]",
        destructive:
          "bg-red-400 text-white border-4 border-red-600 shadow-[4px_4px_0px_0px_theme('colors.red.700')] hover:bg-red-500 hover:-translate-y-1 hover:shadow-[4px_5px_0px_0px_theme('colors.red.700')] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_theme('colors.red.700')]",
        outline:
          "border-4 border-orange-600 bg-orange-50 text-orange-900 shadow-[4px_4px_0px_0px_theme('colors.orange.800')] hover:bg-orange-100 hover:-translate-y-1 hover:shadow-[4px_5px_0px_0px_theme('colors.orange.800')] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_theme('colors.orange.800')]",
        secondary:
          "bg-orange-600 text-orange-50 border-4 border-orange-800 shadow-[4px_4px_0px_0px_black] hover:bg-orange-500 hover:text-orange-900 hover:-translate-y-1 hover:shadow-[4px_5px_0px_0px_black] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_black]",
        ghost: "hover:bg-orange-100 hover:text-orange-900",
        link: "text-orange-600 underline-offset-4 hover:underline",
        pixel: "bg-orange-400 text-orange-900 border-4 border-orange-600 shadow-[4px_4px_0px_0px_theme('colors.orange.800')] hover:bg-orange-300 hover:-translate-y-1 hover:shadow-[4px_5px_0px_0px_theme('colors.orange.800')] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_theme('colors.orange.800')]",
      },
      size: {
        default: "h-12 px-4 py-2",
        sm: "h-10 px-3 py-1",
        lg: "h-14 px-8 py-3",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
