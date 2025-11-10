"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  glowColor?: string
  animated?: boolean
  glass?: boolean
  gradient?: boolean
  shimmer?: boolean
  borderAnimated?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    glow = false, 
    glowColor, 
    animated = false, 
    glass = false, 
    gradient = false, 
    shimmer = false,
    borderAnimated = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow transition-all duration-300",
          {
            "card-enhanced hover-glow-primary": animated,
            "glow-primary": glow && !glowColor,
            "glass backdrop-blur-md": glass,
            "bg-gradient-card": gradient,
            "shimmer": shimmer,
            "border-animated": borderAnimated,
            "hover:scale-[1.02] hover:-translate-y-1": animated,
          },
          className
        )}
        style={{
          ...(glowColor && {
            boxShadow: `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`,
          })
        }}
        {...props}
      >
        {/* Background Glow Effect */}
        {(glow || glowColor) && (
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${glowColor || 'var(--color-primary)'}15, transparent 70%)`
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Hover Overlay */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-primary opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-xl pointer-events-none" />
        )}
      </div>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { neon?: boolean }
>(({ className, neon = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight transition-all duration-300",
      {
        "text-neon": neon,
        "hover:scale-105": neon,
      },
      className
    )}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground transition-colors duration-300", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0 relative z-10", className)} 
    {...props} 
  />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 relative z-10", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
}
