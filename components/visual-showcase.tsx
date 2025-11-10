"use client"

import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Zap, Sparkles, Rocket, Star } from "lucide-react"

export function VisualShowcase() {
  return (
    <div className="space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neon mb-4">✨ Visual Effects Showcase</h2>
        <p className="text-muted-foreground">Experience the enhanced Sphira platform with glowing effects and smooth animations</p>
      </div>

      {/* Enhanced Buttons */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Enhanced Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <EnhancedButton variant="default" icon={<Zap />}>
            Primary Button
          </EnhancedButton>
          <EnhancedButton variant="glow" icon={<Sparkles />}>
            Glowing Button
          </EnhancedButton>
          <EnhancedButton variant="neon" icon={<Star />}>
            Neon Button
          </EnhancedButton>
          <EnhancedButton variant="glass" icon={<Rocket />}>
            Glass Button
          </EnhancedButton>
        </div>
      </div>

      {/* Enhanced Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Enhanced Cards</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <EnhancedCard animated glow className="p-6">
            <EnhancedCardHeader>
              <EnhancedCardTitle neon>Animated Card</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <p>This card has hover animations and glowing effects.</p>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard glass shimmer className="p-6">
            <EnhancedCardHeader>
              <EnhancedCardTitle>Glass Card</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <p>Glass morphism effect with shimmer animation.</p>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard borderAnimated glowColor="#10b981" className="p-6">
            <EnhancedCardHeader>
              <EnhancedCardTitle>Border Animated</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <p>Animated rainbow border with custom glow color.</p>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>

      {/* CSS Classes Demo */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">CSS Effect Classes</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="card-enhanced p-4 text-center">
            <div className="text-2xl mb-2">💎</div>
            <p className="text-sm">card-enhanced</p>
          </div>
          
          <div className="glass p-4 text-center hover-scale">
            <div className="text-2xl mb-2">🔮</div>
            <p className="text-sm">glass + hover-scale</p>
          </div>
          
          <div className="border-animated p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm">border-animated</p>
          </div>
          
          <div className="shimmer p-4 text-center bg-card rounded-lg">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm">shimmer</p>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Floating Animations</h3>
        <div className="flex justify-center space-x-8">
          <div className="float glow-primary p-4 rounded-full bg-primary text-primary-foreground">
            <Zap size={24} />
          </div>
          <div className="float glow-success p-4 rounded-full bg-green-500 text-white" style={{ animationDelay: '0.5s' }}>
            <Sparkles size={24} />
          </div>
          <div className="float glow-warning p-4 rounded-full bg-yellow-500 text-white" style={{ animationDelay: '1s' }}>
            <Star size={24} />
          </div>
        </div>
      </div>

      {/* Text Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Text Effects</h3>
        <div className="text-center space-y-4">
          <p className="text-neon text-2xl font-bold">Neon Glowing Text</p>
          <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Gradient Text Effect
          </p>
        </div>
      </div>
    </div>
  )
}
