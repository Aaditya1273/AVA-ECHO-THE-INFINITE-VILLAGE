"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow hover:shadow-lg hover:-translate-y-0.5 glow-primary hover-glow-accent",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 glow-error",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover-glow-primary glass",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover-glow-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground hover-scale",
        link: "text-primary underline-offset-4 hover:underline text-neon",
        glow: "bg-gradient-primary text-white shadow-lg glow-accent hover-glow-accent hover:-translate-y-1 pulse-glow",
        neon: "bg-transparent border-2 border-primary text-neon hover:bg-primary/10 glow-primary hover-glow-accent shimmer",
        glass: "glass backdrop-blur-md border border-white/20 text-foreground hover:border-primary/50 hover-glow-primary",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  glowColor?: string
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, children, glowColor, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        style={{
          ...(glowColor && {
            '--glow-color': glowColor,
            boxShadow: `0 0 20px ${glowColor}40`
          })
        }}
        {...props}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Content */}
        <div className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {icon && <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>}
          {children}
        </div>
        
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-md opacity-0 group-active:opacity-100 transition-opacity duration-150 bg-white/20" />
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants }
